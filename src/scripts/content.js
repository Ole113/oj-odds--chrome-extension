const BUTTON_ID = "odds-button-style";
let PLAYER_STATS = {};
const ODDS_URLS = {
  nfl: "https://oddsjam.com/nfl/odds",
  nba: "https://oddsjam.com/nba/odds",
  ncaab: "https://oddsjam.com/ncaab/odds",
  ncaaf: "https://oddsjam.com/ncaaf/odds",
};

const LINK_STYLES = `
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
      }`;

// Inject CSS Styles
function injectStyles() {
  if (!document.getElementById(BUTTON_ID)) {
    const style = document.createElement("style");
    style.id = BUTTON_ID;
    style.innerHTML = LINK_STYLES;
    document.head.appendChild(style);
  }
}

/**
 * Puts the buttons below the player picture on every row
 */
function applyButtons() {
  document.querySelectorAll("tr").forEach((trElem) => {
    let pictureTd;
    let button = trElem.querySelector(".odds-button");

    if (!button) {
      button = document.createElement("button");
      button.className = "odds-button";
      button.textContent = "Odds";
      button.addEventListener("click", oddsButtonClicked);
    }

    Array.from(trElem.querySelectorAll("td"))
      .slice(1, 6)
      .forEach((tdElem, tdIndex) => {
        if (tdIndex === 0) pictureTd = tdElem;

        if (tdIndex === 1) {
          tdElem.querySelectorAll("div p").forEach((pElem, pIndex) => {
            if (pIndex === 0) PLAYER_STATS.name = pElem.innerHTML.trim();
            else if (pIndex === 1)
              PLAYER_STATS.team =
                pElem.querySelector("span")?.innerHTML.trim() || "";
            else if (pIndex === 2)
              PLAYER_STATS.sport = pElem.innerHTML.split("•")[0].trim();
          });
        } else if (tdIndex === 2)
          PLAYER_STATS.ou =
            tdElem.querySelector("div p")?.innerHTML.trim() || "";
        else if (tdIndex === 3)
          PLAYER_STATS.stat =
            tdElem.querySelector("div p div")?.innerText || "";
        else if (tdIndex === 4) {
          PLAYER_STATS.line =
            tdElem.querySelector("div p")?.innerHTML.trim() || "";
          button.dataset.player = JSON.stringify(PLAYER_STATS);
          if (pictureTd && !pictureTd.contains(button))
            pictureTd.appendChild(button);
        }
      });
  });
}

/**
 * Called when the Odds button is clicked
 *
 * @param {any} event
 */
async function oddsButtonClicked(event) {
  PLAYER_STATS = JSON.parse(event.srcElement.dataset.player);
  const sportURL = getSportURL(PLAYER_STATS.sport);
  chrome.runtime.sendMessage(
    { action: "fetch_odds", url: sportURL },
    (response) => {
      if (response && response.data) {
        findGameDiv(response.data, sportURL);
      } else {
        console.error("Fetch Error:", response.error);
      }
    }
  );
}

/**
 * Converts sport name in the url for the sports odds
 *
 * @param {String} sport
 * @returns The url
 */
function getSportURL(sport) {
  switch (sport) {
    case "NBA":
      return ODDS_URLS.nba;
    case "NCAAB":
      return ODDS_URLS.ncaab;
    case "NFL":
      return ODDS_URLS.nfl;
  }
}

/**
 * Finds the link of the card for the game
 *
 * @param {String} response String response of the odds link
 */
function findGameDiv(response, sportURL) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    const gameCards = doc.querySelectorAll("main div div div div");

    outerLoop: for (let i = 0; i < gameCards.length; i++) {
      const gameCard = gameCards[i];
      const aTags = gameCard.querySelectorAll("a");

      for (let j = 0; j < aTags.length; j++) {
        const aTag = aTags[j];
        console.log(aTag.href);
        const pTags = aTag.querySelectorAll("div p");

        for (let k = 0; k < pTags.length; k++) {
          const pTag = pTags[k];
          if (isNaN(Number(pTag.innerHTML))) {
            if (pTag.innerHTML == PLAYER_STATS.team) {
              const formattedPlayerStat = PLAYER_STATS.stat
                .toLowerCase()
                .replaceAll(" ", "_");

              const encodedMarket = encodeURIComponent(
                `player_${formattedPlayerStat}`
              );

              const url =
                aTag.href.replace("fantasy.", "") + `?market=${encodedMarket}`;
              window.open(url, "_blank");

              break outerLoop;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching or modifying HTML:", error);
  }
}

injectStyles();
applyButtons();

// MutationObserver for React Updates so the buttons will re applied after every DOM refresh
const observer = new MutationObserver(() => applyButtons());
observer.observe(document.body, { childList: true, subtree: true });
