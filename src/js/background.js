chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ btnColor: '#ff0000' }, function () {
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
    function (message, callback) {
        if (message.greeting === 'hello') {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {
                        code: 'document.body.style.backgroundColor = "black";'
                    });
            });
        }
    });