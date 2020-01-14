async function requestAppAndUserInfo(appId, language, currency) {
    let dataInfo = {
        app: null,
        user: null
    };

    let l = language ? `&l=${language}` : "";
    let cc = currency ? `&cc=${currency}` : "";

    try {
        let resultApp = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}${l}${cc}`);
        dataInfo.app = await resultApp.json();

        let resultUser = await fetch(`https://store.steampowered.com/api/appuserdetails?appids=${appId}`);
        dataInfo.user = await resultUser.json();
    } catch (e) {
        console.error(e);
    }

    return dataInfo;
}

async function requestReviewsInfo(appId, language, purchaseType) {
    let reviewsInfo = null;

    let l = language ? `&l=${language}` : "";
    let p = purchaseType ? `&purchase_type=${purchaseType}` : "";

    try {
        let resultReviews = await fetch(`https://store.steampowered.com/appreviews/${appId}?json=1&language=all${l}${p}`);
        reviewsInfo = await resultReviews.json();
    } catch (e) {
        console.error(e);
    }

    return reviewsInfo;
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        let appId = encodeURIComponent(request.appId);
        let language = encodeURIComponent(request.language);

        if (request.contentScriptQuery == "queryAppUser") {
            let currency = encodeURIComponent(request.currency);

            requestAppAndUserInfo(appId, language, currency)
                .then(dataInfo => sendResponse(dataInfo));
        } else if (request.contentScriptQuery == "queryReviews") {
            let purchaseType = encodeURIComponent(request.purchaseType);

            requestReviewsInfo(appId, language, purchaseType)
                .then(dataInfo => sendResponse(dataInfo));
        }

        return true;
    });