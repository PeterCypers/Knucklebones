function navigateTo(relpath) {
  window.location.href = relpath;
}

function init() {
  const returnBtn = document.getElementById("gamerules_back_arrow");
  const homePath = "./index.html";

  returnBtn.onclick = () => {
    navigateTo(homePath);
  }
}

window.onload = init;