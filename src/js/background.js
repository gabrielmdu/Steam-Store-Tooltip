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

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.contentScriptQuery == "queryAppId") {
            let appId = encodeURIComponent(request.appId);
            let language = encodeURIComponent(request.language);
            let currency = encodeURIComponent(request.currency);

            requestAppAndUserInfo(appId, language, currency)
                .then(dataInfo => sendResponse(dataInfo));

            return true;
        }
    });