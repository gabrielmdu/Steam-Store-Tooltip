export const EXTENSION_INFO = {
    name: 'Steam Store Tooltip',
    version: '1.2.0',
    author: 'Gabriel Schulte',
    link: 'https://github.com/gabrielmdu/Steam-Store-Tooltip'
};

export const PLATFORMS_INFO = {
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

export const MAX_CATEGORIES = 7;
export const MAX_SCREENSHOTS = 6;
export const MAX_TAGS = 4;

let defaultSettings = {
    // chrome sync options
    autoplay: 3000,
    activationKey: null,
    language: null,
    currency: null,
    // local options
    _keyDown: null
};

export function fetchSetting(settings, settingName) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({ [settingName]: defaultSettings[settingName] },
            result => !chrome.runtime.lastError ?
                resolve(result[settingName]) :
                reject(`Error getting options: ${chrome.runtime.lastError}`)
        );
    });
}

export function fetchAllSettings(settings) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(defaultSettings,
            result => !chrome.runtime.lastError ?
                resolve(result) :
                reject(`Error getting options: ${chrome.runtime.lastError}`)
        );
    });
}
