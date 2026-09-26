import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizePageVisits } from '../utils/productAnalyticsStats.js';

test('summarizePageVisits groups page views and compute dwell time', () => {
    const visits = [
        { path: '/products/efnbmms', pageTitle: 'EFNBMMS', durationMs: 120000 },
        { path: '/products/efnbmms', pageTitle: 'EFNBMMS', durationMs: 180000 },
        { path: '/products/rms', pageTitle: 'RMS', durationMs: 60000 },
        { path: '/products/eec', pageTitle: 'EEC', durationMs: 90000 },
        { path: '/products/eec', pageTitle: 'EEC', durationMs: 300000 },
    ];

    const summary = summarizePageVisits(visits);

    assert.equal(summary.totalViews, 5);
    assert.equal(summary.pages.length, 3);
    assert.deepEqual(summary.pages[0], {
        page: '/products/efnbmms',
        title: 'EFNBMMS',
        views: 2,
        avgStayMs: 150000,
        totalStayMs: 300000,
        percentOfTraffic: 40,
    });
    assert.equal(summary.topPage.page, '/products/efnbmms');
    assert.equal(summary.avgStayMs, 150000);
});
