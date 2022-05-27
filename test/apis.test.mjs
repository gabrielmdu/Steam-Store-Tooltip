import { requestAppAndUserInfo, requestReviewsInfo, requestTagsInfo } from '../src/js/requests.mjs';

describe('Third party API tests', () => {
    test('Requests and verifies Steam app info for Counter Strike: GO', async () => {
        const appId = 730;
        const appInfo = await requestAppAndUserInfo(appId);
        expect(appInfo.app[appId].success).toBe(true);

        const appData = appInfo.app[appId].data;
        expect(appData.name).toBe('Counter-Strike: Global Offensive');
        expect(Array.isArray(appData.categories)).toBe(true);
    });

    test('Requests and verifies Steam reviews info for Team Forstress 2', async () => {
        const appId = 440;
        const reviewsInfo = await requestReviewsInfo(appId, null, 'all');

        expect(reviewsInfo.success).toBe(1);
        expect(typeof reviewsInfo.query_summary.review_score_desc).toBe('string');
        expect(reviewsInfo.query_summary.total_positive).toBeGreaterThan(0);
        expect(reviewsInfo.query_summary.total_negative).toBeGreaterThan(0);
    });

    test('Requests and verifies Steam Spy API tags for Half-Life 2', async () => {
        const appId = 220;
        const tagsInfo = await requestTagsInfo(appId);

        expect(typeof tagsInfo).toBe('object');
        expect(tagsInfo).toHaveProperty('FPS');
    });
});