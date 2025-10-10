const returnBtn = document.getElementById("gamescreen_back_arrow");
const playerSelectPath = "../playerselectscreen.html"; // ./playerselectscreen.html
const p1Name = document.getElementById("p1_name_container");
const p2Name = document.getElementById("p2_name_container");
const p1Victories = document.getElementById("p1_gameswon_container");
const p2Victories = document.getElementById("p2_gameswon_container");
const p1TotalScore = document.getElementById("total_score_p1");
const p2TotalScore = document.getElementById("total_score_p2");
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
  addDiceToColumn(colNr, diceValue){
    const diceImgPath = staticDiceImages[`${diceValue}`];
    const columnCells = this.colmap[`${colNr}`];

    if(!this.columnsLocked && !this.isColumnFull(colNr)){
      const cellHtml = `<img src=${diceImgPath} alt="dice in column ${colNr}">`;
      console.log(`adding Dice with value: ${diceValue} to column nr: ${colNr}`);
      if (this.grid.get(columnCells[2]).html === "") { //bottom
        const bottom = this.grid.get(columnCells[2]);
        bottom.html = cellHtml;
      } else if (this.grid.get(columnCells[1]).html === "") { //middle
        const middle = this.grid.get(columnCells[1]);
        middle.html = cellHtml;
      } else { //top
        const top = this.grid.get(columnCells[0]);
        top.html = cellHtml;
      }
      this.lockColumns(); //locked after adding die, only able to add 1 die per roll (unlock before player roll)
      this.toHtml();
    }
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

  }

  setColTotal(colNr) {

  }

  setTotalScore() {

  }

  setDiceCount() {
    let diceCount = 0; // the amount of dice on the board
    for (const cell of this.grid.values()) {
      if(cell.html === "") {
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
  }

  setClickActions() {
    // diceroll
    this.p1RollBtn.onclick = () => {
      this.p1board.unlockColumns();
      this.p1Dice.rollDiceAnimated();
    }
    this.p2RollBtn.onclick = () => {
      this.p2board.unlockColumns();
      this.p2Dice.rollDiceAnimated();
    }
    // column select
    // player 1
    this.p1SelectCol1.onclick = () => { this.p1board.addDiceToColumn(1, this.p1Dice.eyes); }
    this.p1SelectCol2.onclick = () => { this.p1board.addDiceToColumn(2, this.p1Dice.eyes); }
    this.p1SelectCol3.onclick = () => { this.p1board.addDiceToColumn(3, this.p1Dice.eyes); }
    // player 2
    this.p2SelectCol1.onclick = () => { this.p2board.addDiceToColumn(1, this.p2Dice.eyes); }
    this.p2SelectCol2.onclick = () => { this.p2board.addDiceToColumn(2, this.p2Dice.eyes); }
    this.p2SelectCol3.onclick = () => { this.p2board.addDiceToColumn(3, this.p2Dice.eyes); }
  }

  setStarterPlayer() {
    const random = Math.random() * 2; // range 0.01 - 1.99

    if (random > 1) { //p1
      this.turnplayer = 1;
      this.giveTurnTo(1);
    } else { //p2
      this.turnplayer = 2;
      this.giveTurnTo(2);
    }
  }

  //col totals & totalscore for both players
  calculateAndDisplayTotals() {

  }

  giveTurnTo(playerNr) {
    gameFeedback.innerHTML = playerNr === 1? `Turn: ${this.player1}`: `Turn: ${this.player2}`;
    
    if(playerNr === 1) {
      p1Screen.classList.add("active");
      p2Screen.classList.remove("active");
    }
    if(playerNr === 2) {
      p2Screen.classList.add("active");
      p1Screen.classList.remove("active");
    }

  }

  getWinner() {

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

  checkGameOver(){
    if (this.p1dicecount === 9 || this.p2dicecount === 9) {
      this.endGame();
    }
  }

  endGame() {
    this.isGameOver = true;
    playBtn.innerHTML = "Replay";
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
    const p1Score = Number(this.p1TotalScore.innerHTML);
    const p2Score = Number(this.p2TotalScore.innerHTML);
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
    p1TotalScore.innerHTML = 0;
    p2TotalScore.innerHTML = 0;
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
  }

  function checkGameOver() {
    // if(game)
  }
  // TODO: move all id's that are used in various places to top lvl / binary random selection of the starting player (on game constr?)

  returnBtn.onclick = () => {
    navigateTo(playerSelectPath);
  }

  playBtn.onclick = () => {
    if(game.isInProgress()){
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
    }
  }

}

window.onload = init;