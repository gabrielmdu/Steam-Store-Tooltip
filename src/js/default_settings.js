const EXTENSION_INFO = {
    name: "Steam Store Tooltip",
    version: "1.0.1",
    author: "gabrielmdu",
    link: "https://github.com/gabrielmdu/Steam-Store-Tooltip"
};

let defaultSettings = {
    // chrome sync options
    autoplay: 3000,
    activationKey: null,
    language: null,
    currency: null,
    // local options
    _keyDown: null
};

function fetchSetting(name) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({ [name]: defaultSettings[name] },
            result => !chrome.runtime.lastError ?
                resolve(result[name]) :
                reject(`Error getting options: ${chrome.runtime.lastError}`)
        );
    });
}

function fetchAllSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(defaultSettings,
            result => !chrome.runtime.lastError ?
                resolve(result) :
                reject(`Error getting options: ${chrome.runtime.lastError}`)
        );
    });
}