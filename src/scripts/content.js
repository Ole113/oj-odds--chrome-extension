const styleId = "odds-button-style";

const ODDS_URLS = {
  nfl: "https://oddsjam.com/nfl/odds",
  nba: "https://oddsjam.com/nba/odds",
  ncaab: "https://oddsjam.com/ncaab/odds",
  ncaaf: "https://oddsjam.com/ncaaf/odds",
};

// Inject CSS Styles
function injectStyles() {
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .odds-button {
        width: fit-content;
        height: 30px;
        background-color: transparent;
        color: white;
        font-size: 0.85em;
        cursor: pointer;
        border-radius: 5px;
        text-decoration: none;
        transition: background 0.3s ease;
        display: block;
        margin: 0 auto;
      }

      .odds-button:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }
}

// Attach Buttons to Table Rows
function applyButtons() {
  document.querySelectorAll("tr").forEach((trElem) => {
    const player = {};
    let pictureTd;
    let button = trElem.querySelector(".odds-button");

    if (!button) {
      button = document.createElement("button");
      button.className = "odds-button";
      button.textContent = "Odds";
      button.dataset.url = "https://www.hello.com";
      button.addEventListener("click", onButtonClick);
    }

    Array.from(trElem.querySelectorAll("td"))
      .slice(1, 6)
      .forEach((tdElem, tdIndex) => {
        if (tdIndex === 0) pictureTd = tdElem;

        if (tdIndex === 1) {
          tdElem.querySelectorAll("div p").forEach((pElem, pIndex) => {
            if (pIndex === 0) player.name = pElem.innerHTML;
            else if (pIndex === 1)
              player.team = pElem.querySelector("span")?.innerHTML || "";
            else if (pIndex === 2) player.sport = pElem.innerHTML.split("•")[0];
          });
        } else if (tdIndex === 2)
          player.ou = tdElem.querySelector("div p")?.innerHTML || "";
        else if (tdIndex === 3)
          player.stat = tdElem.querySelector("div p div")?.innerText || "";
        else if (tdIndex === 4) {
          player.line = tdElem.querySelector("div p")?.innerHTML || "";
          button.dataset.player = JSON.stringify(player);
          if (pictureTd && !pictureTd.contains(button))
            pictureTd.appendChild(button);
        }
      });
  });
}

// Button Click Handler
async function onButtonClick(event) {
  const button = event.target;
  const url = button.dataset.url;
  const playerData = button.dataset.player;

  //   console.log(await fetchToHTML(ODDS_URLS.nba));
  //   if (playerData) {
  //     const player = JSON.parse(playerData);
  //     alert(
  //       `Player Info:\nName: ${player.name}\nTeam: ${player.team}\nSport: ${player.sport}\nOU: ${player.ou}\nStat: ${player.stat}\nLine: ${player.line}`
  //     );
  //   }

  //   if (url) {
  //     window.open(url, "_blank");
  //   }
}

chrome.runtime.sendMessage({ action: "fetch_odds" }, async (response) => {
  if (response.data) {
    await responseToHTML(response.data);
    console.log("Fetched HTML:", response.data);
  } else {
    console.error("Fetch failed:", response.error);
  }
});

async function responseToHTML(response) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    const firstDiv = doc.querySelector("main div div div div");
    if (firstDiv) {
      console.log("First Div Content:", firstDiv.textContent.trim());
    } else {
      console.error("firstDiv not found!");
    }
  } catch (error) {
    console.error("Error fetching or modifying HTML:", error);
  }
}

// Run on Load
injectStyles();
applyButtons();

// MutationObserver for React Updates
const observer = new MutationObserver(() => applyButtons());
observer.observe(document.body, { childList: true, subtree: true });
