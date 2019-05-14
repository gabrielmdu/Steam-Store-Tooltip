const name = "Steam Store Tooltip";
const version = "1.0.0";
const author = "gabrielmdu";

class TooltipElement {
    constructor(html, gameData, steamCategories) {
        let template = document.createElement("template");
        template.innerHTML = html.trim();

        this.element = template.content.firstChild;

        this.name = this.element.querySelector(".name");
        this.headerImg = this.element.querySelector(".header-img");
        this.description = this.element.querySelector(".description");
        this.price = this.element.querySelector(".price");
        this.priceWrapper = this.element.querySelector(".price-wrapper");
        this.initialPrice = this.element.querySelector(".initial-price");
        this.finalPrice = this.element.querySelector(".final-price");
        this.percent = this.element.querySelector(".percent");
        this.metacritic = this.element.querySelector(".metacritic");
        this.categories = this.element.querySelector(".categories");

        this.setElementContents(gameData, steamCategories);
    }

    setElementContents(gameData, steamCategories) {
        this.name.textContent = gameData.name;
        this.description.innerHTML = gameData.short_description;
        this.headerImg.firstChild.src = gameData.header_image;

        this.setPriceContent(gameData.is_free, gameData.price_overview);
        this.setMetacriticContent(gameData.metacritic);
        this.setCategoriesContent(steamCategories, gameData.categories);
    }

    setPriceContent(isFree, priceOverview) {
        if (isFree) {
            this.price.textContent = "FREE";
        } else if (priceOverview) {
            if (priceOverview.discount_percent > 0) {
                this.initialPrice.textContent = priceOverview.initial_formatted;
                this.finalPrice.textContent = priceOverview.final_formatted;
                this.percent.textContent = -priceOverview.discount_percent + "%";

                this.priceWrapper.classList.remove("hidden");
                this.price.classList.add("hidden");
            } else {
                this.price.textContent = priceOverview.final_formatted;
            }
        } else {
            this.price.classList.add("hidden");
        }
    }

    setMetacriticContent(metacritic) {
        if (metacritic) {
            this.metacritic.classList.remove("hidden");

            let score = metacritic.score;
            if (score <= 39) {
                this.metacritic.classList.add("negative");
            } else if (score >= 40 && score <= 74) {
                this.metacritic.classList.add("mixed");
            } else {
                this.metacritic.classList.add("positive");
            }

            this.metacritic.firstChild.textContent = score;
            this.metacritic.firstChild.href = metacritic.url;
        }
    }

    setCategoriesContent(steamCategories, categoriesData) {
        // categories tooltip element
        let catListEl = document.createElement("div");
        catListEl.classList.add("categories-list");

        categoriesData.forEach((cat, index) => {
            let steamCategory = steamCategories.find(sCat => cat.id == sCat.id);

            if (steamCategory === undefined) {
                return;
            }

            // limits the number of categories in the main tooltip
            if (index < 7) {
                let catEl = document.createElement("div");
                catEl.classList.add("category");
                catEl.setAttribute("title", cat.description);

                let catImg = new Image(26, 16);
                catImg.src = steamCategory.img;
                catEl.appendChild(catImg);

                this.categories.appendChild(catEl);
            }

            // adds categories to tooltip without limit

            let catListItemEl = document.createElement("div");
            catListItemEl.classList.add("categories-list-item");

            let catListItemSpanEl = document.createElement("span");
            catListItemSpanEl.textContent = cat.description;

            let catListItemImg = new Image(26, 16);
            catListItemImg.src = steamCategory.img;

            catListItemEl.appendChild(catListItemImg);
            catListItemEl.appendChild(catListItemSpanEl);

            catListEl.appendChild(catListItemEl);
        });

        let catEllipsisEl = document.createElement("div");
        catEllipsisEl.classList.add("category-ellipsis");
        this.categories.appendChild(catEllipsisEl);

        tippy(catEllipsisEl, {
            content: catListEl,
            trigger: "focus",
            delay: 0,
            theme: "steam-stt-categories",
            animateFill: false,
            performance: true,
        });
    }
}

function fetchContent(tip, html, steamCategories) {
    if (tip.state.isLoading || tip.state.isLoaded) {
        return;
    }

    tip.state.isLoading = true;

    let tipContent = null;
    let appId = /\/app\/(\d*)\?*/g.exec(tip.reference.href)[1];

    chrome.runtime.sendMessage({
            contentScriptQuery: "queryAppId",
            appId: appId
        },
        data => {
            if (data) {
                console.log(data);
                let gameData = data[appId].data;

                let divElement = new TooltipElement(html, gameData, steamCategories);
                tipContent = divElement.element;

                tip.state.isLoading = false;
                tip.state.isLoaded = true;
            } else {
                tipContent = "Erro loading store data.";
            }

            tip.setContent(tipContent);
        });
}

function initTooltips(html, steamCategories) {
    let bodyEl = document.getElementsByTagName("body")[0];

    tippy(bodyEl, {
        target: "[href*='store.steampowered.com/app']",
        content: "Loading store details...",
        theme: "steam-stt",
        interactive: true,
        maxWidth: 500,
        animateFill: false,
        performance: true,
        onShow: tip => fetchContent(tip, html, steamCategories)
    });
}

function main() {
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

    let sstHtml;
    let steamCategories;

    fetch(chrome.extension.getURL("/html/steamstoretooltip.html"))
        .then(response => response.text())
        .then(response => {
            sstHtml = response;
            return fetch(chrome.extension.getURL("/steam_categories.json"));
        })
        .then(response => response.json())
        .then(response => {
            steamCategories = response;
            initTooltips(sstHtml, steamCategories);
        })
        .catch(reason => console.error("[ERROR] " + reason));
}

main();