const PRODUCT_TITLES = {
    "electronic-educare": "EEC - ELECTRONIC EDUCARE",
    "retail-management-system": "ERETAILMS - RETAIL MANAGEMENT SYSTEM",
    "food-and-beverage-management-system": "EFNBMMS - FOOD & BEVERAGE MANAGEMENT SYSTEM",
    esportm: "ESPORTM - SPORTS MANAGEMENT SYSTEM",
};

// Old slugs that now belong to a current product.
const SLUG_ALIASES = { sportbit: "esportm" };

// Merge renamed slugs into the current product and drop mistyped product URLs.
function canonicalizeVisits(visits) {
    return visits.flatMap((visit) => {
        const match = String(visit.path || "").match(/^\/products\/([^/?#]+)\/?$/);
        if (!match) return [visit];
        const slug = SLUG_ALIASES[match[1]] || match[1];
        if (!PRODUCT_TITLES[slug]) return [];
        return [{ ...visit, path: `/products/${slug}`, title: PRODUCT_TITLES[slug] }];
    });
}

export function summarizePageVisits(rawVisits = []) {
    const visits = canonicalizeVisits(rawVisits);
    const totalViews = visits.length;

    const pageMap = new Map();
    const totalStayMs = visits.reduce((sum, visit) => sum + Number(visit.durationMs || 0), 0);

    visits.forEach((visit) => {
        const page = String(visit.path || "/unknown");
        const title = String(visit.title || visit.pageTitle || page);
        const key = `${page}::${title}`;

        if (!pageMap.has(key)) {
            pageMap.set(key, {
                page,
                title,
                views: 0,
                totalStayMs: 0,
            });
        }

        const bucket = pageMap.get(key);
        bucket.views += 1;
        bucket.totalStayMs += Number(visit.durationMs || 0);
    });

    const pages = [...pageMap.values()]
        .map((entry) => ({
            page: entry.page,
            title: entry.title,
            views: entry.views,
            avgStayMs: entry.views ? Math.round(entry.totalStayMs / entry.views) : 0,
            totalStayMs: entry.totalStayMs,
            percentOfTraffic: totalViews ? Math.round((entry.views / totalViews) * 100) : 0,
        }))
        .sort((a, b) => b.views - a.views || b.totalStayMs - a.totalStayMs);

    const avgStayMs = totalViews ? Math.round(totalStayMs / totalViews) : 0;

    const topPage = pages[0] || {
        page: "N/A",
        title: "No page data yet",
        views: 0,
        avgStayMs: 0,
        totalStayMs: 0,
        percentOfTraffic: 0,
    };

    const longestStayPage = [...pages].sort((a, b) => b.avgStayMs - a.avgStayMs)[0] || topPage;

    return {
        totalViews,
        avgStayMs,
        pages,
        topPage,
        longestStayPage,
        totalStayMs,
    };
}

export function summarizeExploreClicks(clicks = []) {
    const totalClicks = clicks.length;
    const visitors = new Set();
    const locationTotals = new Map();
    const productMap = new Map();

    clicks.forEach((click) => {
        const slug = String(click.productSlug || "unknown");
        const visitorId = String(click.visitorId || "");
        const location = String(click.location || "Unknown") || "Unknown";

        if (visitorId) visitors.add(visitorId);
        locationTotals.set(location, (locationTotals.get(location) || 0) + 1);

        if (!productMap.has(slug)) {
            productMap.set(slug, {
                productSlug: slug,
                productTitle: String(click.productTitle || slug),
                totalClicks: 0,
                visitors: new Set(),
                locations: new Map(),
                referrers: new Map(),
                recentClicks: [],
                lastClickedAt: null,
            });
        }

        const bucket = productMap.get(slug);
        bucket.totalClicks += 1;
        if (visitorId) bucket.visitors.add(visitorId);
        bucket.locations.set(location, (bucket.locations.get(location) || 0) + 1);
        const referrer = String(click.referrer || "Direct") || "Direct";
        bucket.referrers.set(referrer, (bucket.referrers.get(referrer) || 0) + 1);
        // Clicks arrive newest-first, so the first few are the most recent.
        if (bucket.recentClicks.length < 8) {
            bucket.recentClicks.push({ location, referrer, createdAt: click.createdAt || null });
        }

        const clickedAt = click.createdAt ? new Date(click.createdAt) : null;
        if (clickedAt && !Number.isNaN(clickedAt.getTime()) && (!bucket.lastClickedAt || clickedAt > bucket.lastClickedAt)) {
            bucket.lastClickedAt = clickedAt;
        }
    });

    const mapLocations = (source) =>
        [...source.entries()]
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));

    const products = [...productMap.values()]
        .map((entry) => {
            const locations = mapLocations(entry.locations);
            return {
                productSlug: entry.productSlug,
                productTitle: entry.productTitle,
                totalClicks: entry.totalClicks,
                uniqueViews: entry.visitors.size,
                locations,
                referrers: [...entry.referrers.entries()]
                    .map(([referrer, count]) => ({ referrer, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5),
                recentClicks: entry.recentClicks,
                topLocation: locations[0]?.location || "Unknown",
                lastClickedAt: entry.lastClickedAt,
            };
        })
        .sort((a, b) => b.totalClicks - a.totalClicks || b.uniqueViews - a.uniqueViews || a.productSlug.localeCompare(b.productSlug));

    return {
        totalClicks,
        uniqueVisitors: visitors.size,
        products,
        locations: mapLocations(locationTotals),
    };
}
