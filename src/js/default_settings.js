const EXTENSION_INFO = {
    name: 'Steam Store Tooltip',
    version: '1.1.0',
    author: 'gabrielmdu',
    link: 'https://github.com/gabrielmdu/Steam-Store-Tooltip'
};

const PLATFORMS_INFO = {
    win: {
        title: 'Windows',
        imgSrc: 'https://steamstore-a.akamaihd.net/public/images/v6/icon_platform_win.png?v=3'
    },
    mac: {
        title: 'Mac',
        imgSrc: 'https://steamstore-a.akamaihd.net/public/images/v6/icon_platform_mac.png'
    },
    linux: {
        title: 'Linux',
        imgSrc: 'https://steamstore-a.akamaihd.net/public/images/v6/icon_platform_linux.png'
    }
};

const MAX_CATEGORIES = 7;
const MAX_SCREENSHOTS = 6;

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