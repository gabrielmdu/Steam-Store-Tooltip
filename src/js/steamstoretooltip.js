class TooltipElement {
    constructor(tip, html, gameData, userData, steamImages) {
        this.tip = tip;

        const template = document.createElement('template');
        template.innerHTML = html.trim();
        this.element = template.content.firstChild;

        this.screenshots = gameData.screenshots || [];

        const sstTheme = '.steam-stt-theme';
        this.DOM = {
            name: this.element.querySelector(`${sstTheme} .name`),
            releaseDate: this.element.querySelector(`${sstTheme} .release-date`),
            genres: this.element.querySelector(`${sstTheme} .genres`),
            platforms: this.element.querySelector(`${sstTheme} .platforms`),
            headerImg: this.element.querySelector(`${sstTheme} .header-img`),
            description: this.element.querySelector(`${sstTheme} .description`),
            price: this.element.querySelector(`${sstTheme} .price`),
            priceWrapper: this.element.querySelector(`${sstTheme} .price-wrapper`),
            initialPrice: this.element.querySelector(`${sstTheme} .initial-price`),
            finalPrice: this.element.querySelector(`${sstTheme} .final-price`),
            percent: this.element.querySelector(`${sstTheme} .percent`),
            metacritic: this.element.querySelector(`${sstTheme} .metacritic`),
            userData: this.element.querySelector(`${sstTheme} .user-data`),
            categories: this.element.querySelector(`${sstTheme} .categories`),
            reviews: this.element.querySelector(`${sstTheme} .reviews`)
        };

        this.setElementContents(gameData, userData, steamImages);
    }

    setElementContents(gameData, userData, steamImages) {
        this.DOM.name.textContent = gameData.name;
        this.DOM.description.innerHTML = gameData.short_description;
        this.DOM.headerImg.querySelector('.carousel-img').style.backgroundImage = `url(${gameData.header_image})`;

        this.setAdditionalContent(gameData.release_date, gameData.genres, gameData.platforms);
        this.setPriceContent(gameData.is_free, gameData.price_overview);
        this.setMetacriticContent(gameData.metacritic);
        this.setUserDataContent(userData);
        this.setCategoriesContent(steamImages.categories, gameData.categories);
        this.setReviewsDataContent(steamImages.reviews, gameData.steam_appid, gameData.is_free, gameData.price_overview);
    }

    setAdditionalContent(releaseDate, genres, platforms) {
        this.DOM.releaseDate.textContent = releaseDate.date;

        const allGenres = genres.map(genre => genre.description);
        this.DOM.genres.title = allGenres.join(', ');
        this.DOM.genres.textContent = allGenres.splice(0, 3).join(', ');

        const supportedPlatforms = [];

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
            const platformImg = new Image(13, 13);
            platformImg.src = platform.imgSrc;
            platformImg.title = platform.title;
            this.DOM.platforms.appendChild(platformImg);
        });
    }

    setPriceContent(isFree, priceOverview) {
        if (isFree) {
            this.DOM.price.textContent = 'FREE';
        } else if (priceOverview) {
            if (priceOverview.discount_percent > 0) {
                this.DOM.initialPrice.textContent = priceOverview.initial_formatted;
                this.DOM.finalPrice.textContent = priceOverview.final_formatted;
                this.DOM.percent.textContent = `${-priceOverview.discount_percent}%`;

                this.DOM.priceWrapper.classList.remove('hidden');
                this.DOM.price.classList.add('hidden');
            } else {
                this.DOM.price.textContent = priceOverview.final_formatted;
            }
        } else {
            this.DOM.price.classList.add('hidden');
        }
    }

    setMetacriticContent(metacritic) {
        if (!metacritic) {
            return;
        }

        this.DOM.metacritic.classList.remove('hidden');

        const score = metacritic.score;
        if (score <= 39) {
            this.DOM.metacritic.classList.add('negative');
        } else if (score >= 40 && score <= 74) {
            this.DOM.metacritic.classList.add('mixed');
        } else {
            this.DOM.metacritic.classList.add('positive');
        }

        this.DOM.metacritic.firstChild.textContent = score;
        this.DOM.metacritic.firstChild.href = metacritic.url;
    }

    setUserDataContent(userData) {
        if (!userData) {
            return;
        }

        if (userData.is_owned) {
            this.DOM.userData.classList.remove('hidden');
            this.DOM.userData.classList.add('owned');
        } else if (userData.added_to_wishlist) {
            this.DOM.userData.classList.remove('hidden');
            this.DOM.userData.classList.add('wishlisted');
        }
    }

    setCategoriesContent(steamCategories, categoriesData) {
        // categories tooltip element
        const catListEl = document.createElement('div');
        catListEl.classList.add('categories-list');

        categoriesData.forEach((cat, index) => {
            const steamCategory = steamCategories.find(sCat => cat.id == sCat.id);

            if (steamCategory === undefined) {
                return false;
            }

            // limits the number of categories in the main tooltip
            if (index < MAX_CATEGORIES) {
                const catEl = document.createElement('div');
                catEl.classList.add('category');
                catEl.setAttribute('title', cat.description);

                const catImg = new Image(26, 16);
                catImg.src = steamCategory.img;
                catEl.appendChild(catImg);

                this.DOM.categories.appendChild(catEl);
            }

            // adds categories to tooltip without limit

            const catListItemEl = document.createElement('div');
            catListItemEl.classList.add('categories-list-item');

            const catListItemSpanEl = document.createElement('span');
            catListItemSpanEl.textContent = cat.description;

            const catListItemImg = new Image(26, 16);
            catListItemImg.src = steamCategory.img;

            catListItemEl.appendChild(catListItemImg);
            catListItemEl.appendChild(catListItemSpanEl);

            catListEl.appendChild(catListItemEl);
        });

        const catEllipsisEl = document.createElement('div');
        catEllipsisEl.classList.add('category-ellipsis');
        this.DOM.categories.appendChild(catEllipsisEl);

        tippy(catEllipsisEl, {
            content: catListEl,
            delay: 0,
            theme: 'steam-stt-categories',
            animateFill: false,
            ignoreAttributes: true,
        });
    }

    setReviewsDataContent(steamReviews, appId, isFree, priceOverview) {
        chrome.runtime.sendMessage({
            contentScriptQuery: 'queryReviews',
            appId: appId,
            language: defaultSettings.language,
            purchaseType: isFree ? 'all' : 'steam'
        },
            data => {
                if (data.query_summary.total_reviews === 0) {
                    this.DOM.reviews.remove();
                    return;
                }

                const ratio = Math.trunc((data.query_summary.total_positive * 100) / data.query_summary.total_reviews);

                const imgName = ratio >= 70 ? 'positive'
                    : ratio < 40 ? 'negative' : 'mixed';

                const imgSrc = steamReviews.find(rev => rev.name === imgName).img;

                this.DOM.reviews.title = `${ratio}% (${data.query_summary.total_positive.toLocaleString()})` +
                    ` positive reviews from ${data.query_summary.total_reviews.toLocaleString()}`;

                if (!isFree && priceOverview && priceOverview.discount_percent > 0) {
                    this.DOM.reviews.classList.add('flex-column');
                }

                const reviewLoading = this.DOM.reviews.querySelector('.loading');
                reviewLoading.classList.add('hidden');

                const reviewImg = this.DOM.reviews.querySelector('img');
                reviewImg.classList.remove('hidden');
                reviewImg.src = imgSrc;

                const reviewRatio = this.DOM.reviews.querySelector('span');
                reviewRatio.classList.remove('hidden');
                reviewRatio.textContent = ratio;
            });
    }

    setCarouselContent() {
        if (!this.tip.state.isLoaded ||
            !this.tip.state.isVisible ||
            this.tip.state.isCarouselLoaded) {
            return;
        }

        const slides = this.tip.props.content.querySelector('.glide__slides');
        const bullets = this.tip.props.content.querySelector('.glide__bullets');

        for (let i = 0; i < this.screenshots.length; i++) {
            if (i === MAX_SCREENSHOTS) {
                break;
            }

            const screenshot = this.screenshots[i];

            const slide = document.createElement('li');
            slide.classList.add('glide__slide');

            const carouselImg = document.createElement('div');
            carouselImg.classList.add('carousel-img');
            carouselImg.style.backgroundImage = `url(${screenshot.path_thumbnail})`;

            slide.appendChild(carouselImg);
            slides.appendChild(slide);

            const bullet = document.createElement('button');
            bullet.classList.add('glide__bullet');
            bullet.setAttribute('data-glide-dir', `=${(i + 1)}`);
            bullets.appendChild(bullet);
        }

        new Glide('.glide', { autoplay: defaultSettings.autoplay }).mount();

        this.tip.state.isCarouselLoaded = true;
    }
}

function createLoadingWrapper() {
    const loadingWrapper = document.createElement('div');
    loadingWrapper.classList.add('loading-wrapper');

    const loadingText = document.createElement('div');
    loadingText.textContent = 'Loading store details...';
    loadingText.classList.add('inline');

    const loading = document.createElement('div');
    loading.classList.add('loading');
    loading.classList.add('inline');

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

    const appId = /\/app\/(\d*)\?*/g.exec(tip.reference.href)[1];

    chrome.runtime.sendMessage({
        contentScriptQuery: 'queryAppUser',
        appId: appId,
        language: defaultSettings.language,
        currency: defaultSettings.currency
    },
        data => {
            let tipContent;
            let ttElement;

            if (data.app) {
                const gameData = data.app[appId].data;
                const userData = (data.user ? data.user[appId].success : false) ?
                    data.user[appId].data : false;

                ttElement = new TooltipElement(tip, html, gameData, userData, steamImages);
                tip.ttElement = ttElement;
                tipContent = ttElement.element;
            } else {
                tipContent = 'Error loading store data.';
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
    const bodyEl = document.getElementsByTagName('body')[0];

    tippy(bodyEl, {
        target: '[href*="store.steampowered.com/app"]',
        theme: 'steam-stt',
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
    window.addEventListener('keydown', evt => {
        if (defaultSettings._keyDown !== evt.code) {
            defaultSettings._keyDown = evt.code;
        }
    });

    window.addEventListener('keyup', evt => {
        if (defaultSettings._keyDown === evt.code) {
            defaultSettings._keyDown = null;
        }
    });
}

function logConsoleExtensionInfo() {
    const greyColor = 'color: grey;';
    const blackBackground = 'background: black;';

    console.log('%c[%c%s %c%s %cby %c%s%c]',
        greyColor + blackBackground,
        'color: #1470a1;' + blackBackground,
        EXTENSION_INFO.name,
        'color: white;' + blackBackground,
        EXTENSION_INFO.version,
        greyColor + blackBackground,
        'color: orange;' + blackBackground,
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