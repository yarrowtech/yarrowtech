const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:5173";
const OUT = __dirname;

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },   // iPhone-ish
  { name: "mobile-414", width: 414, height: 896 },   // large phone
  { name: "tablet-768", width: 768, height: 1024 },  // iPad portrait
  { name: "tablet-1024", width: 1024, height: 768 }, // iPad landscape / small laptop
  { name: "desktop-1440", width: 1440, height: 900 },
];

const PAGES = [
  { name: "dashboard", url: "/manager/dashboard" },
  { name: "projects", url: "/manager/projects" },
  { name: "project-details", url: "/manager/projects/6ab277154079eb2e7e95b050?tab=requirements" },
  { name: "user-management", url: "/manager/user-management" },
];

const measure = () => {
  const doc = document.documentElement;
  const sidebar = document.querySelector(".manager-sidebar");
  const content = document.querySelector(".manager-content");
  const inner = document.querySelector(".manager-inner");
  const sr = sidebar ? sidebar.getBoundingClientRect() : null;
  const cr = content ? content.getBoundingClientRect() : null;
  return {
    vw: window.innerWidth,
    vh: window.innerHeight,
    docScrollW: doc.scrollWidth,
    hOverflow: doc.scrollWidth > window.innerWidth + 1,
    bodyScrollY: window.scrollY,
    bodyCanScroll: doc.scrollHeight > window.innerHeight + 1,
    sidebar: sr ? {
      top: Math.round(sr.top), left: Math.round(sr.left),
      w: Math.round(sr.width), h: Math.round(sr.height),
      internalScrolls: sidebar.scrollHeight > sidebar.clientHeight + 1,
      visible: sr.width > 0 && sr.height > 0,
    } : null,
    content: cr ? {
      top: Math.round(cr.top), w: Math.round(cr.width), h: Math.round(cr.height),
      canScroll: content.scrollHeight > content.clientHeight + 1,
      scrollTop: content.scrollTop,
      scrollHeight: content.scrollHeight, clientHeight: content.clientHeight,
    } : null,
    innerPresent: !!inner,
  };
};

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const rows = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.addInitScript(() => {
      localStorage.setItem("erp_token", "preview-token");
      localStorage.setItem("erp_role", "manager");
    });
    const page = await ctx.newPage();
    // Mock all API calls: the layout check doesn't need real data, and a fake
    // token would get a real 401 -> interceptor wipes storage -> redirect to /.
    await page.route("**/api/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [], results: [], items: [] }) })
    );
    page.on("pageerror", (e) => console.log("  [pageerror]", vp.name, String(e).slice(0, 160)));
    for (const p of PAGES) {
      try {
        await page.goto(BASE + p.url, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(1200);
        const m = await page.evaluate(measure);

        // scroll probes
        let probe = {};
        if (m.content && m.content.canScroll) {
          await page.evaluate(() => { document.querySelector(".manager-content").scrollTop = 400; });
          await page.waitForTimeout(150);
          const m2 = await page.evaluate(measure);
          probe.contentScrolled = m2.content.scrollTop >= 300;
          probe.sidebarStillPinned = m2.sidebar && Math.abs(m2.sidebar.top) < 2 && m2.sidebar.left === 0;
          await page.evaluate(() => { document.querySelector(".manager-content").scrollTop = 0; });
        } else {
          probe.contentScrolled = null;
        }
        // window scroll probe (mobile: whole page scrolls)
        await page.evaluate(() => window.scrollTo(0, 400));
        await page.waitForTimeout(150);
        const m3 = await page.evaluate(measure);
        probe.windowScrolled = m3.bodyScrollY >= 300;
        probe.sidebarTopAfterWinScroll = m3.sidebar ? m3.sidebar.top : null;
        probe.hOverflow = m3.hOverflow;
        await page.evaluate(() => window.scrollTo(0, 0));

        const label = `${vp.name} / ${p.name}`;
        console.log(`\n== ${label} ==`);
        console.log(JSON.stringify({ ...m, probe }, null, 1));
        rows.push({ label, ...m, probe });
        await page.screenshot({ path: `${OUT}/${vp.name}-${p.name}.png`, fullPage: false });
      } catch (e) {
        console.log(`\n== ${vp.name} / ${p.name} == FAILED: ${String(e).slice(0, 200)}`);
        rows.push({ label: `${vp.name}/${p.name}`, error: String(e) });
      }
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(rows, null, 2));
  console.log("\nDONE");
})();
