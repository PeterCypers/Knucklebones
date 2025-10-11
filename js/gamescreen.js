const returnBtn = document.getElementById("gamescreen_back_arrow");
const playerSelectPath = "../playerselectscreen.html"; // ./playerselectscreen.html
const p1Name = document.getElementById("p1_name_container");
const p2Name = document.getElementById("p2_name_container");
const p1Victories = document.getElementById("p1_gameswon_container");
const p2Victories = document.getElementById("p2_gameswon_container");
const p1TotalScore = document.getElementById("total_score_p1"); //TODO: check if it is needed here
const p2TotalScore = document.getElementById("total_score_p2"); //TODO: check if it is needed here
const playBtn = document.getElementById("play_replay_btn");
const resetBtn = document.getElementById("resetgame_btn");
const gameFeedback = document.getElementById("game_feedback");
// const p1RollBtn = document.getElementById("p1_diceroll_btn");
// const p2RollBtn = document.getElementById("p2_diceroll_btn");
const p1Screen = document.getElementById("p1_screen");
const p2Screen = document.getElementById("p2_screen");
const p1DiceRollContainer = document.getElementById("p1_diceroll_container");
const p2DiceRollContainer = document.getElementById("p2_diceroll_container");
const staticDiceImages = {
  1: "img/dice/red/red-dice-number-one-20204.svg",
  2: "img/dice/red/red-dice-number-two-20203.svg",
  3: "img/dice/red/red-dice-number-three-20202.svg",
  4: "img/dice/red/red-dice-number-four-20201.svg",
  5: "img/dice/red/red-dice-number-five-20200.svg",
  6: "img/dice/red/red-dice-number-six-20199.svg"
};

// called at: Dice.rollDiceAnimated() & 
function setColsSelectVisibility(playerNr, isVisible) {
  const col1 = document.getElementById(`p${playerNr}_col1_select`);
  const col2 = document.getElementById(`p${playerNr}_col2_select`);
  const col3 = document.getElementById(`p${playerNr}_col3_select`);
  if (isVisible){
    col1.classList.remove("hidden");
    col2.classList.remove("hidden");
    col3.classList.remove("hidden");
  } else {
    col1.classList.add("hidden");
    col2.classList.add("hidden");
    col3.classList.add("hidden");
  }
}

// Class Code borrowed from my "Dice Roll" app and adapted
class Dice {
  #imageList = new Map([
    ['red', ["img/dice/red/red-dice-number-one-20204.svg", "img/dice/red/red-dice-number-two-20203.svg", "img/dice/red/red-dice-number-three-20202.svg", "img/dice/red/red-dice-number-four-20201.svg", "img/dice/red/red-dice-number-five-20200.svg", "img/dice/red/red-dice-number-six-20199.svg"]]
  ]);
  eyes;
  color;
  image;
  playerNr;

  constructor(eyes, color, playerNr) {
    this.eyes = eyes;
    this.playerNr = playerNr;
    
    this.setColor(color);
    this.setImage(eyes, color);
  }

  setColor(color) {
    this.color = color;
  }

  setImage(eyes, color) {
    this.image = this.#imageList.get(color)[eyes-1]; //convert eyes to array-index-position with -1
  }

  roll() {
      let newEyes = Math.floor(Math.random() * 6 + 1);
      this.eyes = newEyes;
      this.setImage(newEyes, this.color);
  }

  rollDiceAnimated() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.roll();
        this.toHtml();
      }, i * 200)
    }
    setTimeout(() => {
      // after roll is completed, show col-select arrows:
      setColsSelectVisibility(this.playerNr, true);
    }, 10 * 200)
  }

  toHtml() {
    const imgPath = this.#imageList.get(this.color)[this.eyes-1];
    // <img src="img/dice/red/red-dice-number-five-20200.svg" alt="">
    document.getElementById(`p${this.playerNr}_diceroll_container`).innerHTML = `<img src=${imgPath} alt="Player${this.playerNr} rollable dice">`;
  }
}

class Board {
  grid = new Map();
  totalScore = 0;
  col1Total = { html: "", score: 0 };
  col2Total = { html: "", score: 0 };
  col3Total = { html: "", score: 0 };
  diceCount = 0; // the amount of dice on this board: 9 = endgame
  playerNr;
  columnsLocked = true;
  colmap = {
    1: [1,4,7],
    2: [2,5,8],
    3: [3,6,9]
  }

  constructor(playerNr) {
    this.playerNr = playerNr;
    this.initBoard(playerNr);
    this.toHtml();
  }

  initBoard(playerNr) {
    for (let i = 1; i <= 9; i++) {
      this.grid.set(i, {
        id: `p${playerNr}_td_${i}`,
        html: "",
        score: 0
      });
    }
    this.col1Total.html = `p${playerNr}_col1`;
    this.col2Total.html = `p${playerNr}_col2`;
    this.col3Total.html = `p${playerNr}_col3`;

    console.log(this.grid);
  }

  //setCol & setTotal & setDiceCount
  //player MUST add dice if !isGameOver() -> return true if dice added, false (meaning player tries to add to full column)
  addDiceToColumn(colNr, diceValue){
    const diceImgPath = staticDiceImages[`${diceValue}`];
    const columnCells = this.colmap[`${colNr}`];
    let diceAdded = false;

    //nothing happens outside this case
    if(!this.columnsLocked && !this.isColumnFull(colNr)){
      const cellHtml = `<img src=${diceImgPath} alt="dice in column ${colNr}">`;
      console.log(`adding Dice with value: ${diceValue} to column nr: ${colNr}`);
      if (this.grid.get(columnCells[2]).html === "") { //bottom
        const bottom = this.grid.get(columnCells[2]);
        bottom.html = cellHtml;
        bottom.score = diceValue;
      } else if (this.grid.get(columnCells[1]).html === "") { //middle
        const middle = this.grid.get(columnCells[1]);
        middle.html = cellHtml;
        middle.score = diceValue;
      } else { //top
        const top = this.grid.get(columnCells[0]);
        top.html = cellHtml;
        top.score = diceValue;
      }
      diceAdded = true;
      // IMPORTANT order: totalscore is based on col-score
      this.setColTotal(colNr);
      this.setTotalScore();
      this.setDiceCount();
      this.lockColumns(); //locked after adding die, only able to add 1 die per roll (unlock before player roll)
      setTimeout(() => {
        // after dice is added, remove col-select arrows:
        setColsSelectVisibility(this.playerNr, false);
      }, 200)
      this.toHtml();
    }
    return diceAdded;
  }

  unlockColumns() {
    this.columnsLocked = false;
  }

  lockColumns() {
    this.columnsLocked = true;
  }

  isColumnFull(colNr) {
    let count = 0;
    const columns = this.colmap[`${colNr}`];
    [...columns].forEach((col) => {
      if(this.grid.get(col).html !== "") {
        count++;
      }
    })
    return count === 3;
  }

  // check this boards col == enemy board col
  // if this board's col contains dice of that value -> delete
  // here we add the temp class (timed by settimeout) to show dice shrinking
  // after which it's innerHTML = '' (better than display: none)
  checkToDelete(enemyColNr, enemyDiceValue){
    let deleted = false;
    const columnCells = this.colmap[`${enemyColNr}`];
    const boardColumnsToCheck = [
      this.grid.get(columnCells[0]),
      this.grid.get(columnCells[1]),
      this.grid.get(columnCells[2])
    ];

    for (let i = 0; i < boardColumnsToCheck.length; i++) {
      const element = boardColumnsToCheck[i];
      if(element.score === enemyDiceValue) {
        const htmlElement = document.getElementById(`${element.id}`);
        // TODO: wip: figure out animation, the many timeouts maybe causing issues...
        // htmlElement.classList.add("scaling-down");
        // setTimeout(() => {
          // htmlElement.classList.remove("scaling-down");
          element.html = '';
          element.score = 0;
          deleted = true;
        // }, 200)
      }
    }
    if(deleted) {
      // setTimeout(() => {
        this.setColTotal(enemyColNr);
        this.setTotalScore();
        this.setDiceCount();
        this.reshuffle(enemyColNr); // needs the same delay as the animation duration
        this.toHtml(); // needs the same delay as the animation duration, wrap both with delay
      // }, 200)
    }
    //  else {
    //   this.toHtml();
    // }
  }

  reshuffle(colNr) {
    const columnCells = this.colmap[`${colNr}`];
    // Be mindful, this is reversed from the usual, logically I'm now considering the lowest value = bottom of col-stack
    // 1: bottom, 2:middle, 3: top
    const cell1Value = this.grid.get(columnCells[2]);
    const cell2Value = this.grid.get(columnCells[1]);
    const cell3Value = this.grid.get(columnCells[0]);
    // moving values from top of col to bottom: check bottom vs middle, move, then middle vs top, move
    // edgecase: all dice got deleted -> do nothing
    if(cell1Value.html === '' && cell2Value.html === '' && cell3Value.html === '') {
      return;
    }
    // edgecase: bottom + mid empty, top has dice
    if(cell1Value.html === '' && cell2Value.html === '' && cell3Value.html !== '') {
      // move cell3 to cell1
      cell1Value.html = cell3Value.html;
      cell1Value.score = cell3Value.score;
      cell3Value.html = '';
      cell3Value.score = 0;
      return;
    }
    // bottom: empty, mid: dice -> move mid to bottom
    if(cell1Value.html === '' && cell2Value.html !== '') {
      cell1Value.html = cell2Value.html;
      cell1Value.score = cell2Value.score;
      cell2Value.html = '';
      cell2Value.score = 0;
    }
    // now, move top to mid (if top exists)
    if(cell2Value.html === '' && cell3Value !== '') {
      cell2Value.html = cell3Value.html;
      cell2Value.score = cell3Value.score;
      cell3Value.html = '';
      cell3Value.score = 0;
    }
  }

  setColTotal(colNr) {
    const columnCells = this.colmap[`${colNr}`];
    let total = 0;
    const singles = [];
    const doubles = [];
    const tripples = [];
    const cell1Value = this.grid.get(columnCells[0]).score;
    const cell2Value = this.grid.get(columnCells[1]).score;
    const cell3Value = this.grid.get(columnCells[2]).score;
    // case tripple
    if (cell1Value === cell2Value && cell1Value === cell3Value){
      for (let i = 1; i <= 3; i++) { tripples.push(cell1Value); }
    }
    // case double(a)
    else if (cell1Value !== cell2Value && cell1Value === cell3Value) {
      doubles.push(cell1Value);
      singles.push(cell2Value);
      doubles.push(cell3Value);
    }
    // case double(b)
    else if (cell1Value === cell2Value && cell2Value !== cell3Value) {
      doubles.push(cell1Value);
      doubles.push(cell2Value);
      singles.push(cell3Value);
    }
    // case double(c)
    else if (cell1Value !== cell2Value && cell2Value === cell3Value) {
      singles.push(cell1Value);
      doubles.push(cell2Value);
      doubles.push(cell3Value);
    }
    // case singles
    else if (cell1Value !== cell2Value && cell2Value !== cell3Value) {
      singles.push(cell1Value);
      singles.push(cell2Value);
      singles.push(cell3Value);
    }

    // lambda callback to safely sum arrays (works on empty arrays)
    const sum = arr => arr.reduce((a, b) => a + b, 0);

    // calculate total
    total += sum(tripples) * 3;
    total += sum(doubles) * 2;
    total += sum(singles);

    // set the totalscore of the given col
    switch (colNr) { 
      case 1: this.col1Total.score = total;
        break; 
      case 2: this.col2Total.score = total;
        break;
      case 3: this.col3Total.score = total;
        break; 
      }
  }

  // must be based on the column-total (because double/tripple scores in cols)
  setTotalScore() {
    this.totalScore = this.col1Total.score + this.col2Total.score + this.col3Total.score;
  }

  setDiceCount() {
    let diceCount = 0; // the amount of dice on the board
    for (const cell of this.grid.values()) {
      if(cell.html !== "") {
        diceCount++;
      }
    }
    this.diceCount = diceCount;
  }

  // probably called at checkToDelete (if delete = true)
  toHtml() {
    for (const cell of this.grid.values()) {
      document.getElementById(`${cell.id}`).innerHTML = `${cell.html}`;
    }

    document.getElementById(`${this.col1Total.html}`).innerHTML = `${this.col1Total.score}`;
    document.getElementById(`${this.col2Total.html}`).innerHTML = `${this.col2Total.score}`;
    document.getElementById(`${this.col3Total.html}`).innerHTML = `${this.col3Total.score}`;
    document.getElementById(`total_score_p${this.playerNr}`).innerHTML = this.totalScore;
  }
}

class KnucklebonesMultiplayer {
  player1;
  player2;
  p1Dice = new Dice(1, "red", 1);
  p2Dice = new Dice(1, "red", 2);
  p1board = new Board(1);
  p2board = new Board(2);
  turnplayer = 1;
  isGameOver = false;
  p1SelectCol1 = document.getElementById("p1_col1_select");
  p1SelectCol2 = document.getElementById("p1_col2_select");
  p1SelectCol3 = document.getElementById("p1_col3_select");

  p2SelectCol1 = document.getElementById("p2_col1_select");
  p2SelectCol2 = document.getElementById("p2_col2_select");
  p2SelectCol3 = document.getElementById("p2_col3_select");

  p1RollBtn = document.getElementById("p1_diceroll_btn");
  p2RollBtn = document.getElementById("p2_diceroll_btn");

  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.setStarterPlayer();
    this.setClickActions();
    this.initColSelectVisibility();
  }

  setClickActions() {
    // diceroll
    this.p1RollBtn.onclick = () => {
      this.p1board.unlockColumns();
      this.p1Dice.rollDiceAnimated();
      this.p1RollBtn.disabled = true;
    }
    this.p2RollBtn.onclick = () => {
      this.p2board.unlockColumns();
      this.p2Dice.rollDiceAnimated();
      this.p2RollBtn.disabled = true;
    }
    // column select
    // player 1
    this.p1SelectCol1.onclick = () => { 
      // condition: true when dice added to the board
      if(this.p1board.addDiceToColumn(1, this.p1Dice.eyes) === true) {
        this.p2board.checkToDelete(1, this.p1Dice.eyes);
        this.checkGameOver();
        if(!this.isGameOver){
          setTimeout(() => {
            // give turn to other player
            this.giveTurnTo(2);
          }, 200)
        }
      }
    }
    this.p1SelectCol2.onclick = () => {
      if(this.p1board.addDiceToColumn(2, this.p1Dice.eyes)){
        this.p2board.checkToDelete(2, this.p1Dice.eyes);
        this.checkGameOver();
        if(!this.isGameOver){
          setTimeout(() => {
            // give turn to other player
            this.giveTurnTo(2);
          }, 200)
        }
      }
    }
    this.p1SelectCol3.onclick = () => {
      if(this.p1board.addDiceToColumn(3, this.p1Dice.eyes)) {
        this.p2board.checkToDelete(3, this.p1Dice.eyes);
        this.checkGameOver();
        if(!this.isGameOver){
          setTimeout(() => {
            // give turn to other player
            this.giveTurnTo(2);
          }, 200)
        }
      }
    }
    // player 2
    this.p2SelectCol1.onclick = () => {
      if(this.p2board.addDiceToColumn(1, this.p2Dice.eyes)) {
        this.p1board.checkToDelete(1, this.p2Dice.eyes);
        this.checkGameOver();
        if(!this.isGameOver){
          setTimeout(() => {
            // give turn to other player
            this.giveTurnTo(1);
          }, 200)
        }
      }
    }
    this.p2SelectCol2.onclick = () => {
      if(this.p2board.addDiceToColumn(2, this.p2Dice.eyes)) {
        this.p1board.checkToDelete(2, this.p2Dice.eyes);
        this.checkGameOver();
        if(!this.isGameOver){
          setTimeout(() => {
            // give turn to other player
            this.giveTurnTo(1);
          }, 200)
        }
      }
    }
    this.p2SelectCol3.onclick = () => {
      if(this.p2board.addDiceToColumn(3, this.p2Dice.eyes)) {
        this.p1board.checkToDelete(3, this.p2Dice.eyes);
        this.checkGameOver();
        if(!this.isGameOver){
          setTimeout(() => {
            // give turn to other player
            this.giveTurnTo(1);
          }, 200)
        }
      }
    }
  }

  setStarterPlayer() {
    const random = Math.random() * 2; // range 0.01 - 1.99

    if (random > 1) { //p1
      this.p2RollBtn.disabled = true;
      this.turnplayer = 1;
      this.giveTurnTo(1);
    } else { //p2
      this.p1RollBtn.disabled = true;
      this.turnplayer = 2;
      this.giveTurnTo(2);
    }
  }

  // case: resetgame after roll & before dice-set-in-column else col-select remains visible for previous active player
  initColSelectVisibility() {
    setColsSelectVisibility(1, false);
    setColsSelectVisibility(2, false);
  }

  //col totals & totalscore for both players
  calculateAndDisplayTotals() {

  }

  giveTurnTo(playerNr) {
    gameFeedback.innerHTML = playerNr === 1? `Turn: ${this.player1}`: `Turn: ${this.player2}`;
    
    if(playerNr === 1) {
      p1Screen.classList.add("active");
      p2Screen.classList.remove("active");
      this.p1RollBtn.disabled = false;
    }
    if(playerNr === 2) {
      p2Screen.classList.add("active");
      p1Screen.classList.remove("active");
      this.p2RollBtn.disabled = false;
    }
  }

  displayWinner() {
    const scorePlayer1 = this.p1board.totalScore;
    const scorePlayer2 = this.p2board.totalScore;

    if (scorePlayer1 === scorePlayer2) {
      gameFeedback.innerHTML = `Game Over, it ended in a DRAW !!!`;

      p1Victories.innerHTML = Number(p1Victories.innerHTML) + 1;
      p2Victories.innerHTML = Number(p2Victories.innerHTML) + 1;
    }
    else {
      const winner = scorePlayer1 > scorePlayer2 ? this.player1 : this.player2;
      gameFeedback.innerHTML = `Game Over, ${winner} is the Winner !!!`;

      if(winner === this.player1) {
        p1Victories.innerHTML = Number(p1Victories.innerHTML) + 1;
      } else if (winner === this.player2) {
        p2Victories.innerHTML = Number(p2Victories.innerHTML) + 1;
      }
    }
  }

  // happens after the active player sets a die in a col
  // playerNr(1||2) is the opposing player of the active player
  // colNr is the same as the active players chosen col
  checkColForDoublesAndDeleteDice(playerNr, colNr) {

  }

  // in init: new Knucklebones, while !Knucklebones.isGameOver -> knucklebones.play
  // set "play" btn to "replay" -> replay.onclick = new Knucklebones(), knucklebones.play
  playRound() {
    if(this.turnplayer === 1) {
      p1_roll();
    }


    // this.checkGameOver();
  }

  checkGameOver() {
    if (this.p1board.diceCount === 9 || this.p2board.diceCount === 9) {
      this.endGame();
    }
  }

  endGame() {
    this.isGameOver = true;
    playBtn.innerHTML = "Replay";
    this.displayWinner();
  }

  resetGame() {

  }

  p1_roll() {

  }

  p2_roll() {

  }

  p1_setDiceInColumn(colNr) {
    //...

    
    this.checkColForDoublesAndDeleteDice(2, colNr);
  }

  p2_setDiceInColumn(colNr) {
    //...
    
    this.checkColForDoublesAndDeleteDice(1, colNr);
    // calculate col total & all total
    this.gameFeedback.innerHTML = `Turn: ${player1}`;
    this.checkGameOver();
  }

  isInProgress() {
    // Number(document.getElementById("p1_gameswon_container").innerHTML);
    const p1Score = this.p1board.totalScore;
    const p2Score = this.p2board.totalScore;
    return (p1Score + p2Score) > 0;
  }

  toHtml() {
    // p1board and p2board to html
  }
}


function getFromStorage() {
  const STORAGE_KEY = "knucklebones";
  const STORAGE = localStorage;
  return JSON.parse(STORAGE.getItem(STORAGE_KEY));
}

function setToStorage(savestate) {
  const STORAGE_KEY = "knucklebones";
  const STORAGE = localStorage;
  STORAGE.setItem(STORAGE_KEY, JSON.stringify(savestate));
}

function navigateTo(relpath) {
  window.location.href = relpath;
}

function init() {

  if(!getFromStorage()) { // Init localstorage
    const STORAGE_OBJECT = {};
    STORAGE_OBJECT["game_mode"] = "multiplayer";
    STORAGE_OBJECT["players"] = [];
    STORAGE_OBJECT["player_1"] = "Player 1";
    STORAGE_OBJECT["player_2"] = "Player 2";
    setToStorage(STORAGE_OBJECT);
  }
  const savedState = getFromStorage();
  const player_1 = savedState.player_1;
  const player_2 = savedState.player_2;

  // init/reset gamescreen
  function resetGameScreen() {
    p1Name.innerHTML = player_1;
    p2Name.innerHTML = player_2;
    p1Victories.innerHTML = 0;
    p2Victories.innerHTML = 0;
    // p1TotalScore.innerHTML = 0;
    // p2TotalScore.innerHTML = 0;
  }
  resetGameScreen();

  // init gameboards
  let game = new KnucklebonesMultiplayer(player_1, player_2);

  // really just resets the gameboard
  function playKnucklebonesMultiplayer() {
    // playBtn.disabled = true;
    game = new KnucklebonesMultiplayer(player_1, player_2);
    // while (not game over){
    // game.roll(), game.addcolumn(), game.checkgameover()}

    // playBtn.disabled = false;

    // note: initially I had underestimated the complexity and wanted to put most/all game logic here
    // game.playRound, game.endTurn, etc
  }

  function checkGameOver() {
    // if(game)
  }
  // TODO: move all id's that are used in various places to top lvl / binary random selection of the starting player (on game constr?)

  returnBtn.onclick = () => {
    navigateTo(playerSelectPath);
  }

  playBtn.onclick = () => {
    if(game.isGameOver) {
      playKnucklebonesMultiplayer();
    } else if(game.isInProgress()){
        if(confirm("Sure you want to end current game?")){
          playKnucklebonesMultiplayer();
        }
    } else {
      playKnucklebonesMultiplayer();
    }

  }

  // dice.classList.add("scaling-down"); //while dice is being deleted, after delete, set display: none and remove scaling-down from classlist

  resetBtn.onclick = () => {
    if (confirm("Reset game?")) {
      resetGameScreen();
      playKnucklebonesMultiplayer();
    }
  }

}

window.onload = init;