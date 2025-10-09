
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
    this.setImage(eyes, color)
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
  const testDie = document.getElementById("scaledown-test");
  const testBtn = document.getElementById("p2_diceroll_btn");


  //TODO: check how this should work
  if(!getFromStorage()) { // Init localstorage
    const STORAGE_OBJECT = {};
    setToStorage(STORAGE_OBJECT);
  }

  returnBtn.onclick = () => {
    navigateTo(playerSelectPath);
  }

  testBtn.onclick = () => {
    testDie.classList.toggle("scaling-down");
  }

}

window.onload = init;