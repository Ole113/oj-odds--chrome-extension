const styleId = "odds-button-style";

// Inject styles globally
function injectStyles() {
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
            .odds-button {
                width: 50px;
                height: 50px;
                background-color: red !important;
                color: white !important;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                margin-left: 10px;
                border-radius: 5px;
                text-decoration: none;
                border: none;
                outline: none;
                transition: background 0.3s ease;
            }
            .odds-button:hover {
                background-color: darkred !important;
            }
        `;
    document.head.appendChild(style);
  }
}

// Function to apply buttons next to each `td`
function applyButtons() {
  document.querySelectorAll("tr").forEach((trElem) => {
    Array.from(trElem.querySelectorAll("td"))
      .slice(2, 6)
      .forEach((tdElem, tdIndex) => {
        if (tdIndex === 0) {
          // Check if button already exists to prevent duplication
          if (!tdElem.querySelector(".odds-button")) {
            const button = document.createElement("button");
            button.className = "odds-button";
            button.textContent = "Prop Odds";
            button.dataset.url = "https://www.hello.com"; // Store URL in dataset

            // Append button
            tdElem.appendChild(button);
          }
        }
      });
  });
}

// Global click event listener - this is a fix for React re-renders
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("odds-button")) {
    const url = event.target.dataset.url;
    if (url) {
      window.open(url, "_blank");
    }
  }
});

// Run initially
injectStyles();
applyButtons();

// Set up MutationObserver to reapply buttons if the DOM updates
const observer = new MutationObserver(() => {
  applyButtons();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Reapply periodically in case of React hydration
setInterval(applyButtons, 1000);
