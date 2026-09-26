export function summarizePageVisits(visits = []) {
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
