import { requestAppAndUserInfo, requestReviewsInfo, requestTagsInfo } from './js/requests.mjs';

export const backgroundQueries = {
    APP_USER: 'queryAppUser',
    REVIEWS: 'queryReviews',
    TAGS: 'queryTags',
    UPDATE_SETTINGS: 'updateSettings'
};

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

            default:
                sendResponse();
        }

        return true;
    });