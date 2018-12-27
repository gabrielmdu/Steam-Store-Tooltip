const loadingText = "Loading store details...";
const errorText = "Error loading store data";

class TooltipElement {
    constructor(html, gameData) {
        let template = document.createElement("template");
        template.innerHTML = html.trim();

        this.element = template.content.firstChild;
        this.gameData = gameData;

        this.name = this.element.querySelector(".name");
        this.headerImg = this.element.querySelector(".header-img");
        this.description = this.element.querySelector(".description");
        this.price = this.element.querySelector(".price");
        this.discount = this.element.querySelector(".discount");

        this.setElementContents();
    }

    setElementContents() {
        this.name.textContent = this.gameData.name;
        this.description.textContent = this.gameData.short_description;
        this.headerImg.firstChild.src = this.gameData.header_image;

        if (this.gameData.is_free) {
            this.price.textContent = "FREE";
        } else if (this.gameData.price_overview) {
            this.price.textContent = this.gameData.price_overview.final_formatted;

            if (this.gameData.price_overview.discount_percent > 0) {
                this.discount.textContent = this.gameData.price_overview.discount_percent + "%";
                this.discount.classList.remove("hidden");
            }
        } else {
            this.price.classList.add("hidden");
        }
    }
}

function fetchContent(tip, html) {
    if (tip.popper.innerText !== loadingText &&
        tip.popper.innerText !== errorText)
        return;

    let tipContent = null;
    let appId = /\/app\/(\d*)\?*/g.exec(tip.reference.href)[1];

    fetch("https://store.steampowered.com/api/appdetails?appids=" + appId)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let gameData = data[appId].data;

            // categories / genres / metacritic / platforms / price_overview / release_date / type

            let divElement = new TooltipElement(html, gameData);
            tipContent = divElement.element;
        })
        .catch(reason => tipContent = errorText)
        .then(() => tip.setContent(tipContent));
}

function initTooltips(html) {
    let bodyEl = document.getElementsByTagName("body")[0];

    tippy(bodyEl, {
        target: "[href*='store.steampowered.com/app']",
        content: loadingText,
        theme: "steam-stt",
        interactive: true,
        maxWidth: 500,
        animateFill: false,
        performance: true,
        onShow: tip => fetchContent(tip, html)
    });
}

function main() {
    let name = "Steam Store Tooltip";
    let version = "1.0.0";
    let author = "gabrielmdu";
    let greyColor = "color: grey;";
    let blackBackground = "background: black;";

    console.log("%c[%c%s %c%s %cby %c%s%c]",
        greyColor + blackBackground,
        "color: #1470a1;" + blackBackground,
        name,
        "color: white;" + blackBackground,
        version,
        greyColor + blackBackground,
        "color: orange;" + blackBackground,
        author,
        greyColor + blackBackground);

    fetch(chrome.extension.getURL("/html/steamstoretooltip.html"))
        .then(response => response.text())
        .then(initTooltips)
        .catch(reason => console.error("[ERROR] " + reason));
}

main();