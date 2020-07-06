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

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const appId = encodeURIComponent(request.appId);
        const language = encodeURIComponent(request.language);

        if (request.contentScriptQuery == 'queryAppUser') {
            const currency = encodeURIComponent(request.currency);

            requestAppAndUserInfo(appId, language, currency)
                .then(dataInfo => sendResponse(dataInfo));
        } else if (request.contentScriptQuery == 'queryReviews') {
            const purchaseType = encodeURIComponent(request.purchaseType);

            requestReviewsInfo(appId, language, purchaseType)
                .then(dataInfo => sendResponse(dataInfo));
        }

        return true;
    });