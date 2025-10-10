
// Class Code borrowed from my "Dice Roll" app and adapted
class Dice {
  #imageList = new Map([
    ['red', ["img/dice/red/red-dice-number-one-20204.svg", "img/dice/red/red-dice-number-two-20203.svg", "img/dice/red/red-dice-number-three-20202.svg", "img/dice/red/red-dice-number-four-20201.svg", "img/dice/red/red-dice-number-five-20200.svg", "img/dice/red/red-dice-number-six-20199.svg"]]
  ]);
  eyes;
  color;
  image;

  constructor(eyes, color) {
    this.eyes = eyes;
    
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
}

class KnucklebonesMultiplayer {
  player1;
  player2;
  p1board = []; // 0-8 repr. the 3x3 p1 grid
  p2board = []; // 0-8 repr. the 3x3 p2 grid
  p1col1 = [];
  p1col2 = [];
  p1col3 = [];
  p2col1 = [];
  p2col2 = [];
  p2col3 = [];
  isGameOver = false;

  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.initBoards();
    this.initCols();
  }

  initBoards() {
    // 1-9
    for (let i = 1; i <= 9; i++) {
      const p1Element = document.getElementById(`p1_td_${i}`);
      p1Element.innerHTML = '';
      this.p1board.push(p1Element);

      const p2Element = document.getElementById(`p2_td_${i}`);
      p2Element.innerHTML = '';
      this.p2board.push(p2Element);
    }
  }

  initCols() {
    const colSetup = [[1,4,7],[2,5,8],[3,6,9]];
    // this.p1col1 = 
    for (let i = 0; i < colSetup.length; i++) {
        // console.log(colSetup[i]);
        for (let j = 0; j < colSetup[i].length; j++) {
            if(colSetup[i].includes(1)) {
              this.p1col1.push(document.getElementById(`p1_td_${colSetup[i][j]}`));
              this.p2col1.push(document.getElementById(`p2_td_${colSetup[i][j]}`));
            }
            if(colSetup[i].includes(2)) {
              this.p1col2.push(document.getElementById(`p1_td_${colSetup[i][j]}`));
              this.p2col2.push(document.getElementById(`p2_td_${colSetup[i][j]}`));
            }
            if(colSetup[i].includes(3)) {
              this.p1col3.push(document.getElementById(`p1_td_${colSetup[i][j]}`));
              this.p2col3.push(document.getElementById(`p2_td_${colSetup[i][j]}`));
            }
        }
    }
  }

  // test-function to check correct col-population
  printCols() {
    console.log(`Col 1`);
    console.log("*******");
    console.log("p1", this.p1col1);
    console.log("p2", this.p2col1);
    console.log(`Col 2`);
    console.log("*******");
    console.log("p1", this.p1col2);
    console.log("p2", this.p2col2);
    console.log(`Col 3`);
    console.log("*******");
    console.log("p1", this.p1col3);
    console.log("p2", this.p2col3);
  }

  // happens after the active player sets a die in a col
  // playerNr(1||2) is the opposing player of the active player
  // colNr is the same as the active players chosen col
  checkColForDoublesAndDeleteDice(playerNr, colNr) {

  }

  // in init: new Knucklebones, while !Knucklebones.isGameOver -> knucklebones.play
  // set "play" btn to "replay" -> replay.onclick = new Knucklebones(), knucklebones.play
  play() {

  }

  resetGame() {

  }

  p1_roll() {

  }
  p2_roll() {

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
  const returnBtn = document.getElementById("gamescreen_back_arrow");
  const playerSelectPath = "../playerselectscreen.html"; // ./playerselectscreen.html
  const p1Name = document.getElementById("p1_name_container");
  const p2Name = document.getElementById("p2_name_container");
  const p1Victories = document.getElementById("p1_gameswon_container");
  const p2Victories = document.getElementById("p2_gameswon_container");
  const p1TotalScore = document.getElementById("total_score_p1");
  const p2TotalScore = document.getElementById("total_score_p2");
  const resetBtn = document.getElementById("resetgame_btn");

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

  let game = new KnucklebonesMultiplayer(player_1, player_2);

  returnBtn.onclick = () => {
    navigateTo(playerSelectPath);
  }

  // dice.classList.add("scaling-down"); //while dice is being deleted, after delete, set display: none and remove scaling-down from classlist

  resetBtn.onclick = resetGameScreen;

}

window.onload = init;