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
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "queryAppId") {
            var url = "https://store.steampowered.com/api/appdetails?appids=" +
                encodeURIComponent(request.appId);

            fetch(url)
                .then(response => response.json())
                .then(data => sendResponse(data))
                .catch(error => sendResponse(false));

            return true;
        }
    });