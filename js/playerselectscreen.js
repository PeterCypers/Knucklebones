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

function addPlayer(name) {
  if (!name || name.length === 0) {
    alert("Please fill in a name");
    return false;
  }
  const savedState = getFromStorage();
  const playerList = savedState.players;
  console.log(playerList);
  // if name is not already in the list, add to list and save to storage:
  if (playerList.indexOf(name) === -1) {
    playerList.push(name);
    savedState["players"] = playerList;
    setToStorage(savedState);
    return true;
  }
  return false;
}

function navigateTo(relpath) {
  window.location.href = relpath;
}

function init() {
  const playerOneSelect = document.getElementById("player_one_select");
  const playerTwoSelect = document.getElementById("player_two_select");
  const gamePath = "../gamescreen.html";

  const playerInputContainer = document.getElementById("add_player_input_container");
  const playerInput = document.getElementById("add_player_input");
  const toggleInputBtn = document.getElementById("toggle_input_btn")
  const addButton = document.getElementById("add_player_btn");
  const playBtn = document.getElementById("player_select_play_btn");

  if (!getFromStorage()) { // Init localstorage
    const STORAGE_OBJECT = {};
    STORAGE_OBJECT["game_mode"] = "multiplayer";
    STORAGE_OBJECT["players"] = [];
    setToStorage(STORAGE_OBJECT);
  }
  const savedState = getFromStorage();
  // if no players yet, best to have a valid list in storage
  if (!savedState.players) {
    savedState["players"] = [];
    setToStorage(savedState);
  }
  // if implementing singleplayer, check if works
  if (!savedState.game_mode || savedState.game_mode === "singleplayer") {
    playerTwoSelect.style.display = "none";
  }

  // if players exist init the playerselects
  // TODO: a bug happens when you click on add new player that double-populates everything here, 
  // find a way to clear the options before going through the for loop again here
  function populateOptionListWithPlayers() {
    const savedState = getFromStorage();

    if (savedState.players.length > 0) {
      for (let i = 0; i < savedState.players.length; i++) {
        const option_p1 = document.createElement("option");
        const option_p2 = document.createElement("option");
        option_p1.value = savedState.players[i];
        option_p1.innerHTML = savedState.players[i];
        option_p2.value = savedState.players[i];
        option_p2.innerHTML = savedState.players[i];

        playerOneSelect.insertAdjacentElement("beforeend", option_p1);
        playerTwoSelect.insertAdjacentElement("beforeend", option_p2);
      }
    }
  }
  populateOptionListWithPlayers(); // init

  toggleInputBtn.onclick = () => {
      playerInputContainer.classList.replace("hidden", "shown");
      toggleInputBtn.classList.replace("shown", "hidden");
      playerInput.value = '';
      playerInput.focus();
  }

  playerInput.onkeydown = (event) => {
    if (event.key === "Enter" || event.key === "NumpadEnter"){
        event.preventDefault();
        addButton.click();
    }
  }

  addButton.onclick = () => {
    if (addPlayer(playerInput.value)) {
      playerInputContainer.classList.replace("shown", "hidden");
      toggleInputBtn.classList.replace("hidden", "shown");

    populateOptionListWithPlayers();
    }
  }

  // inelegant but effective solution
  playerOneSelect.onchange = () => {
    if (playerOneSelect.value === playerTwoSelect.value){
      playerTwoSelect.value = '';
    }
  }

  playerTwoSelect.onchange = () => {
    if (playerTwoSelect.value === playerOneSelect.value){
      playerOneSelect.value = '';
    }
  }

  function setChosenPlayersInStorage() {
    const savedState = getFromStorage();
    savedState["player_1"] = playerOneSelect.value;
    savedState["player_2"] = playerTwoSelect.value;
    setToStorage(savedState);
  }

  playBtn.onclick = () => {
    if (playerOneSelect.value === '' || playerTwoSelect.value === '') {
      alert("You must choose 2 players to start the game.")
    } else if (playerOneSelect.value === playerTwoSelect.value) {
      alert("You can't have 2 players with the same name.")
    } else {
      setChosenPlayersInStorage();
      navigateTo(gamePath);
    }
  }



  // add player and select-opt on change have to repopulate options (no duple players)


}

window.onload = init;