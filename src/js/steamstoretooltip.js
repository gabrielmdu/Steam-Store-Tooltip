import { steamImages } from './steam_images.js';
import { sstTemplate } from './sst_template.js';
import { EXTENSION_INFO, PLATFORMS_INFO, MAX_CATEGORIES, MAX_SCREENSHOTS, MAX_TAGS, fetchAllSettings } from './default_settings.js';
import { backgroundQueries } from './../background.js';

import '../sass/steamstoretooltip.scss';

import tippy from 'tippy.js';
import Glide from '@glidejs/glide';

var settings = {};
/** 
 * Unique array of app data fetched from the Steam API. Not unique only if the user hovers the mouse 
 * too quickly between multiple links with the same app id, which doesn't give enough time for the
 * fetching response
 */
var appDatas = [];

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
            reviews: this.element.querySelector(`${sstTheme} .reviews`),
            tags: this.element.querySelector(`${sstTheme} .tags`)
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
        this.setTagsContent(gameData.steam_appid);
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
            contentScriptQuery: backgroundQueries.REVIEWS,
            appId: appId,
            language: settings.language,
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

    /** Fills up the tags */
    setTagsContent(appId) {
        chrome.runtime.sendMessage({
            contentScriptQuery: backgroundQueries.TAGS,
            appId: appId,
        },
            data => {
                if (!data) {
                    return;
                }

                // sorts the tags by most votes - adapted from https://stackoverflow.com/a/16794116
                const tags = Object.keys(data).sort((a, b) => data[b] - data[a]);
                for (let i = 0; i < tags.length; i++) {
                    if (i === MAX_TAGS) {
                        break;
                    }

                    const tagEl = document.createElement('span');
                    tagEl.classList.add('tag');
                    tagEl.classList.add('inline');
                    tagEl.textContent = tags[i];

                    this.DOM.tags.appendChild(tagEl);
                }
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

        new Glide('.glide', { autoplay: settings.autoplay }).mount();

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

    const existantData = appDatas.filter(d => d.app[appId])[0];
    // if the app data already exists, sets it as the new tip content
    if (existantData) {
        setTipAppData(existantData, appId, tip, html, steamImages);
    } else {
        // makes a request to the Steam API to retrieve the app's data
        chrome.runtime.sendMessage({
            contentScriptQuery: backgroundQueries.APP_USER,
            appId: appId,
            language: settings.language,
            currency: settings.currency
        },
            data => {
                if (data.app) {
                    // adds the app data to the general list
                    appDatas = [...appDatas, data];
                }

                setTipAppData(data, appId, tip, html, steamImages);
            });
    }
}

/** Sets the tip content according to the fetched data from the Steam API  */
function setTipAppData(data, appId, tip, html, steamImages) {
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
}

function initTooltips(html, steamImages) {
    tippy(document.body, {
        target: '[href*="store.steampowered.com/app"]',
        theme: 'steam-stt',
        interactive: true,
        maxWidth: 585,
        animateFill: false,
        ignoreAttributes: true,
        onShow: tip => {
            if (!settings.activationKey ||
                (settings.activationKey && settings.activationKey === settings._keyDown)) {
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
            settings = { ...settings, ...message };
        });
}

function bindKeyEvents() {
    window.addEventListener('keydown', evt => {
        if (settings._keyDown !== evt.code) {
            settings._keyDown = evt.code;
        }
    });

    window.addEventListener('keyup', evt => {
        if (settings._keyDown === evt.code) {
            settings._keyDown = null;
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
        settings = await fetchAllSettings();

        bindOptionsMessage();
        bindKeyEvents();
        initTooltips(sstTemplate, steamImages);
    } catch (error) {
        console.error(`Failed to initiate extension: ${error}`);
    }
}

main();
