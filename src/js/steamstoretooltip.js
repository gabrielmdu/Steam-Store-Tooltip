const PLATFORMS_INFO = {
    win: {
        title: "Windows",
        imgSrc: "https://steamstore-a.akamaihd.net/public/images/v6/icon_platform_win.png?v=3"
    },
    mac: {
        title: "Mac",
        imgSrc: "https://steamstore-a.akamaihd.net/public/images/v6/icon_platform_mac.png"
    },
    linux: {
        title: "Linux",
        imgSrc: "https://steamstore-a.akamaihd.net/public/images/v6/icon_platform_linux.png"
    }
};

const MAX_CATEGORIES = 7;
const MAX_SCREENSHOTS = 6;

class TooltipElement {
    constructor(tip, html, gameData, userData, steamCategories) {
        this.tip = tip;

        let template = document.createElement("template");
        template.innerHTML = html.trim();
        this.element = template.content.firstChild;

        this.screenshots = gameData.screenshots;

        this.DOM = {
            name: this.element.querySelector(".name"),
            releaseDate: this.element.querySelector(".release-date"),
            genres: this.element.querySelector(".genres"),
            platforms: this.element.querySelector(".platforms"),
            headerImg: this.element.querySelector(".header-img"),
            description: this.element.querySelector(".description"),
            price: this.element.querySelector(".price"),
            priceWrapper: this.element.querySelector(".price-wrapper"),
            initialPrice: this.element.querySelector(".initial-price"),
            finalPrice: this.element.querySelector(".final-price"),
            percent: this.element.querySelector(".percent"),
            metacritic: this.element.querySelector(".metacritic"),
            userData: this.element.querySelector(".user-data"),
            categories: this.element.querySelector(".categories")
        };

        this.setElementContents(gameData, userData, steamCategories);
    }

    setElementContents(gameData, userData, steamCategories) {
        this.DOM.name.textContent = gameData.name;
        this.DOM.description.innerHTML = gameData.short_description;
        this.DOM.headerImg.querySelector(".carousel-img").style.backgroundImage = `url(${gameData.header_image})`;

        this.setAdditionalContent(gameData.release_date, gameData.genres, gameData.platforms);
        this.setPriceContent(gameData.is_free, gameData.price_overview);
        this.setMetacriticContent(gameData.metacritic);
        this.setUserDataContent(userData);
        this.setCategoriesContent(steamCategories, gameData.categories);
    }

    setAdditionalContent(releaseDate, genres, platforms) {
        this.DOM.releaseDate.textContent = releaseDate.date;

        let allGenres = genres.map(genre => genre.description);
        this.DOM.genres.title = allGenres.join(", ");
        this.DOM.genres.textContent = allGenres.splice(0, 3).join(", ");

        let supportedPlatforms = [];

        if (platforms.windows) {
            supportedPlatforms.push(PLATFORMS_INFO.win);
        }

        if (platforms.mac) {
            supportedPlatforms.push(PLATFORMS_INFO.mac);
        }

        if (platforms.linux) {
            supportedPlatforms.push(PLATFORMS_INFO.linux);
        }

        supportedPlatforms.forEach(platform => {
            let platformImg = new Image(13, 13);
            platformImg.src = platform.imgSrc;
            platformImg.title = platform.title;
            this.DOM.platforms.appendChild(platformImg);
        });
    }

    setPriceContent(isFree, priceOverview) {
        if (isFree) {
            this.DOM.price.textContent = "FREE";
        } else if (priceOverview) {
            if (priceOverview.discount_percent > 0) {
                this.DOM.initialPrice.textContent = priceOverview.initial_formatted;
                this.DOM.finalPrice.textContent = priceOverview.final_formatted;
                this.DOM.percent.textContent = `${-priceOverview.discount_percent}%`;

                this.DOM.priceWrapper.classList.remove("hidden");
                this.DOM.price.classList.add("hidden");
            } else {
                this.DOM.price.textContent = priceOverview.final_formatted;
            }
        } else {
            this.DOM.price.classList.add("hidden");
        }
    }

    setMetacriticContent(metacritic) {
        if (!metacritic) {
            return;
        }

        this.DOM.metacritic.classList.remove("hidden");

        let score = metacritic.score;
        if (score <= 39) {
            this.DOM.metacritic.classList.add("negative");
        } else if (score >= 40 && score <= 74) {
            this.DOM.metacritic.classList.add("mixed");
        } else {
            this.DOM.metacritic.classList.add("positive");
        }

        this.DOM.metacritic.firstChild.textContent = score;
        this.DOM.metacritic.firstChild.href = metacritic.url;
    }

    setUserDataContent(userData) {
        if (!userData) {
            return;
        }

        if (userData.is_owned) {
            this.DOM.userData.classList.remove("hidden");
            this.DOM.userData.classList.add("owned");
        } else if (userData.added_to_wishlist) {
            this.DOM.userData.classList.remove("hidden");
            this.DOM.userData.classList.add("wishlisted");
        }
    }

    setCategoriesContent(steamCategories, categoriesData) {
        // categories tooltip element
        let catListEl = document.createElement("div");
        catListEl.classList.add("categories-list");

        categoriesData.forEach((cat, index) => {
            let steamCategory = steamCategories.find(sCat => cat.id == sCat.id);

            if (steamCategory === undefined) {
                return false;
            }

            // limits the number of categories in the main tooltip
            if (index < MAX_CATEGORIES) {
                let catEl = document.createElement("div");
                catEl.classList.add("category");
                catEl.setAttribute("title", cat.description);

                let catImg = new Image(26, 16);
                catImg.src = steamCategory.img;
                catEl.appendChild(catImg);

                this.DOM.categories.appendChild(catEl);
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
        this.DOM.categories.appendChild(catEllipsisEl);

        tippy(catEllipsisEl, {
            content: catListEl,
            delay: 0,
            theme: "steam-stt-categories",
            animateFill: false,
            ignoreAttributes: true,
        });
    }

    setCarouselContent() {
        if (!this.tip.state.isLoaded ||
            !this.tip.state.isVisible ||
            this.tip.state.isCarouselLoaded) {
            return;
        }

        let slides = this.tip.props.content.querySelector(".glide__slides");
        let bullets = this.tip.props.content.querySelector(".glide__bullets");

        for (let i = 0; i < this.screenshots.length; i++) {
            if (i === MAX_SCREENSHOTS) {
                break;
            }

            const screenshot = this.screenshots[i];

            let slide = document.createElement("li");
            slide.classList.add("glide__slide");

            let carouselImg = document.createElement("div");
            carouselImg.classList.add("carousel-img");
            carouselImg.style.backgroundImage = `url(${screenshot.path_thumbnail})`;

            slide.appendChild(carouselImg);
            slides.appendChild(slide);

            let bullet = document.createElement("button");
            bullet.classList.add("glide__bullet");
            bullet.setAttribute("data-glide-dir", `=${(i + 1)}`);
            bullets.appendChild(bullet);
        }

        new Glide(".glide", { autoplay: defaultSettings.autoplay }).mount();

        this.tip.state.isCarouselLoaded = true;
    }
}

function fetchContent(tip, html, steamCategories) {
    if (tip.state.isLoading || tip.state.isLoaded) {
        return;
    }

    tip.state.isLoading = true;
    tip.state.isCarouselLoaded = false;

    let appId = /\/app\/(\d*)\?*/g.exec(tip.reference.href)[1];

    chrome.runtime.sendMessage({
        contentScriptQuery: "queryAppId",
        appId: appId,
        language: defaultSettings.language,
        currency: defaultSettings.currency
    },
        data => {
            let tipContent;
            let ttElement;

            if (data.app) {
                let gameData = data.app[appId].data;
                let userData = (data.user ? data.user[appId].success : false) ? data.user[appId].data : false;

                ttElement = new TooltipElement(tip, html, gameData, userData, steamCategories);
                tip.ttElement = ttElement;
                tipContent = ttElement.element;
            } else {
                tipContent = "Error loading store data.";
            }

            tip.setContent(tipContent);
            tip.state.isLoading = false;
            tip.state.isLoaded = true;

            if (ttElement) {
                ttElement.setCarouselContent();
            }
        });
}

function initTooltips(html, steamCategories) {
    let bodyEl = document.getElementsByTagName("body")[0];

    let loadingWrapper = document.createElement("div");

    let loadingText = document.createElement("div");
    loadingText.textContent = "Loading store details...";
    loadingText.classList.add("inline");

    let loading = document.createElement("div");
    loading.classList.add("loading");
    loading.classList.add("inline");

    loadingWrapper.appendChild(loadingText);
    loadingWrapper.appendChild(loading);

    tippy(bodyEl, {
        target: "[href*='store.steampowered.com/app']",
        content: loadingWrapper,
        theme: "steam-stt",
        interactive: true,
        maxWidth: 585,
        animateFill: false,
        ignoreAttributes: true,
        onShow: tip => {
            if (!defaultSettings.activationKey ||
                (defaultSettings.activationKey && defaultSettings.activationKey === defaultSettings._keyDown)) {
                fetchContent(tip, html, steamCategories);
            } else {
                return false;
            }
        },
        onMount: tip => {
            if (tip.ttElement) {
                tip.ttElement.setCarouselContent();
            }
        }
    });
}

function bindOptionsMessage() {
    chrome.runtime.onMessage.addListener(
        message => {
            defaultSettings = { ...defaultSettings, ...message };
        });
}

function bindKeyEvents() {
    window.addEventListener("keydown", evt => {
        if (defaultSettings._keyDown !== evt.code) {
            defaultSettings._keyDown = evt.code;
        }
    });

    window.addEventListener("keyup", evt => {
        if (defaultSettings._keyDown === evt.code) {
            defaultSettings._keyDown = null;
        }
    });
}

async function main() {
    let greyColor = "color: grey;";
    let blackBackground = "background: black;";

    console.log("%c[%c%s %c%s %cby %c%s%c]",
        greyColor + blackBackground,
        "color: #1470a1;" + blackBackground,
        EXTENSION_INFO.name,
        "color: white;" + blackBackground,
        EXTENSION_INFO.version,
        greyColor + blackBackground,
        "color: orange;" + blackBackground,
        EXTENSION_INFO.author,
        greyColor + blackBackground);

    try {
        let response = await fetch(chrome.extension.getURL("/html/steamstoretooltip.html"));
        let sstHtml = await response.text();

        response = await fetch(chrome.extension.getURL("/steam_categories.json"));
        let steamCategories = await response.json();

        defaultSettings = await fetchAllSettings();

        bindOptionsMessage();
        bindKeyEvents();
        initTooltips(sstHtml, steamCategories);
    } catch (error) {
        console.error(`Failed to initiate extension: ${error}`);
    }
}

main();