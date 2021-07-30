export const backgroundQueries = {
    APP_USER: 'queryAppUser',
    REVIEWS: 'queryReviews',
    TAGS: 'queryTags'
};

async function requestAppAndUserInfo(appId, language, currency) {
    const dataInfo = {
        app: null,
        user: null
    };

    const l = language ? `&l=${language}` : '';
    const cc = currency ? `&cc=${currency}` : '';

    try {
        const resultApp = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}${l}${cc}`);
        dataInfo.app = await resultApp.json();

        const resultUser = await fetch(`https://store.steampowered.com/api/appuserdetails?appids=${appId}`);
        dataInfo.user = await resultUser.json();
    } catch (e) {
        console.error(e);
    }

    return dataInfo;
}

async function requestReviewsInfo(appId, language, purchaseType) {
    let reviewsInfo = null;

    const l = language ? `&l=${language}` : '';
    const p = purchaseType ? `&purchase_type=${purchaseType}` : '';

    try {
        const resultReviews = await fetch(`https://store.steampowered.com/appreviews/${appId}?json=1&language=all${l}${p}`);
        reviewsInfo = await resultReviews.json();
    } catch (e) {
        console.error(e);
    }

    return reviewsInfo;
}

/** Requests app info from Steam Spy API, then gets its tags list */
async function requestTagsInfo(appId) {
    let tagsInfo = null;

    try {
        const resultInfo = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appId}`);

        const info = await resultInfo.json();
        if (typeof info.tags !== 'object') {
            throw new TypeError('Tags not found');
        }

        tagsInfo = info.tags;
    } catch (e) {
        console.error(e);
    }

    return tagsInfo;
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const appId = encodeURIComponent(request.appId);
        const language = encodeURIComponent(request.language);

        switch (request.contentScriptQuery) {
            case backgroundQueries.APP_USER:
                const currency = encodeURIComponent(request.currency);

                requestAppAndUserInfo(appId, language, currency)
                    .then(dataInfo => sendResponse(dataInfo));
                break;

            case backgroundQueries.REVIEWS:
                const purchaseType = encodeURIComponent(request.purchaseType);

                requestReviewsInfo(appId, language, purchaseType)
                    .then(dataInfo => sendResponse(dataInfo));
                break;

            case backgroundQueries.TAGS:
                requestTagsInfo(appId)
                    .then(dataInfo => sendResponse(dataInfo));
                break;
        }

        return true;
    });