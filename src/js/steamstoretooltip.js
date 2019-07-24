const extensionInfo = {
    name: "Steam Store Tooltip",
    version: "1.0.0",
    author: "gabrielmdu"
};

const platformsInfo = {
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

const maxCategories = 7;
const maxScreenshots = 6;

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
            supportedPlatforms.push(platformsInfo.win);
        }

        if (platforms.mac) {
            supportedPlatforms.push(platformsInfo.mac);
        }

        if (platforms.linux) {
            supportedPlatforms.push(platformsInfo.linux);
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
            if (index < maxCategories) {
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
            trigger: "focus",
            delay: 0,
            theme: "steam-stt-categories",
            animateFill: false,
            performance: true,
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
            if (i === maxScreenshots) {
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

        new Glide('.glide', { autoplay: 3000 }).mount();

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
        appId: appId
    },
        data => {
            let tipContent;
            let ttElement;

            if (data.app) {
                let gameData = data.app[appId].data;
                let userData = (data.user ? data.user[appId].success : false) ? data.user[appId].data : false;

                console.log(gameData);
                console.log(userData);

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

    tippy(bodyEl, {
        target: "[href*='store.steampowered.com/app']",
        content: "Loading store details...",
        theme: "steam-stt",
        interactive: true,
        maxWidth: 585,
        animateFill: false,
        performance: true,
        onShow: tip => fetchContent(tip, html, steamCategories),
        onMount: tip => {
            if (tip.ttElement) {
                tip.ttElement.setCarouselContent();
            }
        }
    });
}

function main() {
    let greyColor = "color: grey;";
    let blackBackground = "background: black;";

    console.log("%c[%c%s %c%s %cby %c%s%c]",
        greyColor + blackBackground,
        "color: #1470a1;" + blackBackground,
        extensionInfo.name,
        "color: white;" + blackBackground,
        extensionInfo.version,
        greyColor + blackBackground,
        "color: orange;" + blackBackground,
        extensionInfo.author,
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
        .catch(reason => console.error(`[ERROR] ${reason}`));
}

main();