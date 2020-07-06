class TooltipElement {
    constructor(tip, html, gameData, userData, steamImages) {
        this.tip = tip;

        let template = document.createElement("template");
        template.innerHTML = html.trim();
        this.element = template.content.firstChild;

        this.screenshots = gameData.screenshots;

        this.DOM = {
            name: this.element.querySelector(".steam-stt-theme .name"),
            releaseDate: this.element.querySelector(".steam-stt-theme .release-date"),
            genres: this.element.querySelector(".steam-stt-theme .genres"),
            platforms: this.element.querySelector(".steam-stt-theme .platforms"),
            headerImg: this.element.querySelector(".steam-stt-theme .header-img"),
            description: this.element.querySelector(".steam-stt-theme .description"),
            price: this.element.querySelector(".steam-stt-theme .price"),
            priceWrapper: this.element.querySelector(".steam-stt-theme .price-wrapper"),
            initialPrice: this.element.querySelector(".steam-stt-theme .initial-price"),
            finalPrice: this.element.querySelector(".steam-stt-theme .final-price"),
            percent: this.element.querySelector(".steam-stt-theme .percent"),
            metacritic: this.element.querySelector(".steam-stt-theme .metacritic"),
            userData: this.element.querySelector(".steam-stt-theme .user-data"),
            categories: this.element.querySelector(".steam-stt-theme .categories"),
            reviews: this.element.querySelector(".steam-stt-theme .reviews")
        };

        this.setElementContents(gameData, userData, steamImages);
    }

    setElementContents(gameData, userData, steamImages) {
        this.DOM.name.textContent = gameData.name;
        this.DOM.description.innerHTML = gameData.short_description;
        this.DOM.headerImg.querySelector(".carousel-img").style.backgroundImage = `url(${gameData.header_image})`;

        this.setAdditionalContent(gameData.release_date, gameData.genres, gameData.platforms);
        this.setPriceContent(gameData.is_free, gameData.price_overview);
        this.setMetacriticContent(gameData.metacritic);
        this.setUserDataContent(userData);
        this.setCategoriesContent(steamImages.categories, gameData.categories);
        this.setReviewsDataContent(steamImages.reviews, gameData.steam_appid, gameData.is_free, gameData.price_overview);
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

    setReviewsDataContent(steamReviews, appId, isFree, priceOverview) {
        chrome.runtime.sendMessage({
            contentScriptQuery: "queryReviews",
            appId: appId,
            language: defaultSettings.language,
            purchaseType: isFree ? "all" : "steam"
        },
            data => {
                if (data.query_summary.total_reviews === 0) {
                    this.DOM.reviews.remove();
                    return;
                }

                let ratio = Math.trunc((data.query_summary.total_positive * 100) / data.query_summary.total_reviews);
                let imgSrc = "";

                let imgName = ratio >= 70 ? "positive"
                    : ratio < 40 ? "negative" : "mixed";

                imgSrc = steamReviews.find(rev => rev.name === imgName).img;

                this.DOM.reviews.title = `${ratio}% (${data.query_summary.total_positive.toLocaleString()})` +
                    ` positive reviews from ${data.query_summary.total_reviews.toLocaleString()}`;

                if (!isFree && priceOverview && priceOverview.discount_percent > 0) {
                    this.DOM.reviews.classList.add("flex-column");
                }

                let reviewLoading = this.DOM.reviews.querySelector(".loading");
                reviewLoading.classList.add("hidden");

                let reviewImg = this.DOM.reviews.querySelector("img");
                reviewImg.classList.remove("hidden");
                reviewImg.src = imgSrc;

                let reviewRatio = this.DOM.reviews.querySelector("span");
                reviewRatio.classList.remove("hidden");
                reviewRatio.textContent = ratio;
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

function createLoadingWrapper() {
    let loadingWrapper = document.createElement("div");
    loadingWrapper.classList.add("loading-wrapper");

    let loadingText = document.createElement("div");
    loadingText.textContent = "Loading store details...";
    loadingText.classList.add("inline");

    let loading = document.createElement("div");
    loading.classList.add("loading");
    loading.classList.add("inline");

    loadingWrapper.appendChild(loadingText);
    loadingWrapper.appendChild(loading);

    return loadingWrapper;
}

function fetchContent(tip, html, steamImages) {
    if ((tip.state.isLoading || tip.state.isLoaded) &&
        tip.originalHref === tip.reference.href) {
        return;
    }

    tip.ttElement = null;
    tip.setContent(createLoadingWrapper());
    tip.originalHref = tip.reference.href;

    tip.state.isLoading = true;
    tip.state.isCarouselLoaded = false;

    let appId = /\/app\/(\d*)\?*/g.exec(tip.reference.href)[1];

    chrome.runtime.sendMessage({
        contentScriptQuery: "queryAppUser",
        appId: appId,
        language: defaultSettings.language,
        currency: defaultSettings.currency
    },
        data => {
            let tipContent;
            let ttElement;

            if (data.app) {
                let gameData = data.app[appId].data;
                let userData = (data.user ? data.user[appId].success : false) ?
                    data.user[appId].data : false;

                ttElement = new TooltipElement(tip, html, gameData, userData, steamImages);
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

function initTooltips(html, steamImages) {
    let bodyEl = document.getElementsByTagName("body")[0];

    tippy(bodyEl, {
        target: "[href*='store.steampowered.com/app']",
        theme: "steam-stt",
        interactive: true,
        maxWidth: 585,
        animateFill: false,
        ignoreAttributes: true,
        onShow: tip => {
            if (!defaultSettings.activationKey ||
                (defaultSettings.activationKey && defaultSettings.activationKey === defaultSettings._keyDown)) {
                fetchContent(tip, html, steamImages);
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

function logConsoleExtensionInfo() {
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
}

async function main() {
    try {
        defaultSettings = await fetchAllSettings();

        bindOptionsMessage();
        bindKeyEvents();
        initTooltips(sstTemplate, steamImages);
    } catch (error) {
        console.error(`Failed to initiate extension: ${error}`);
    }
}

main();