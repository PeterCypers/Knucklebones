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
  const multiplayerBtn = document.getElementById("multiplayer_btn");
  const playerselectpath = "./playerselectscreen.html";
  // singleplayer equivalent

  if(!getFromStorage()) { // Init localstorage
    const STORAGE_OBJECT = {};
    setToStorage(STORAGE_OBJECT);
  }
  const savedState = getFromStorage();

  multiplayerBtn.onclick = () => {
    savedState["game_mode"] = "multiplayer";
    setToStorage(savedState);

    navigateTo(playerselectpath);
  };
  // singleplayer onclick equivalent


}

window.onload = init;