chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        btnColor: '#ff0000'
    }, function () {
        console.log('The color is green.');
    });
    /*
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'developer.chrome.com' },
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });*/
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.contentScriptQuery == "queryAppId") {
            let dataInfo = {
                app: null,
                user: null
            };

            let resultApp = fetch("https://store.steampowered.com/api/appdetails?appids=" +
                    encodeURIComponent(request.appId))
                .then(responseApp => responseApp.json())
                .then(dataApp => dataApp)
                .catch(error => false);

            let resultUser = fetch("https://store.steampowered.com/api/appuserdetails?appids=" +
                    encodeURIComponent(request.appId))
                .then(responseUser => responseUser.json())
                .then(dataUser => dataUser)
                .catch(error => false);

            resultApp
                .then(infoApp => {
                    dataInfo.app = infoApp;
                    return resultUser;
                })
                .then(infoUser => {
                    dataInfo.user = infoUser;
                    sendResponse(dataInfo);
                });

            return true;
        }
    });