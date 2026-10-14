const { chromium } = require("playwright");
const fs = require("fs");
const BASE = "http://localhost:5173";
const OUT = __dirname;

// Tall filler proves the scroll plumbing works with LONG real-sized content,
// since mocked APIs return empty data which makes natural page height small.
const FILLER = `<div id="scroll-filler" style="height: 3000px; background: repeating-linear-gradient(180deg,#f55,#fff 200px);"></div>`;

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.addInitScript(() => {
      localStorage.setItem("erp_token", "preview-token");
      localStorage.setItem("erp_role", "manager");
    });
    const page = await ctx.newPage();
    await page.route("**/api/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [], results: [], items: [] }) })
    );
    await page.goto(BASE + "/manager/projects/6ab277154079eb2e7e95b050?tab=requirements", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1200);
    await page.evaluate((h) => {
      const t = document.createElement("div");
      t.innerHTML = h;
      document.querySelector(".manager-inner").prepend(t.firstChild);
    }, FILLER);
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const doc = document.documentElement;
      const c = document.querySelector(".manager-content");
      return {
        bodyCanScroll: doc.scrollHeight > window.innerHeight + 1,
        contentCanScroll: c ? c.scrollHeight > c.clientHeight + 1 : null,
      };
    });
    // scroll the right container based on breakpoint mode
    if (m.contentCanScroll) {
      await page.evaluate(() => { document.querySelector(".manager-content").scrollTop = 500; });
    } else {
      await page.evaluate(() => window.scrollTo(0, 500));
    }
    await page.waitForTimeout(200);
    const m2 = await page.evaluate(() => {
      const sb = document.querySelector(".manager-sidebar");
      const sr = sb.getBoundingClientRect();
      return {
        scrolledTo: document.querySelector(".manager-content")?.scrollTop || window.scrollY,
        sidebarTop: Math.round(sr.top),
        sidebarLeft: Math.round(sr.left),
        sidebarW: Math.round(sr.width),
        sidebarH: Math.round(sr.height),
      };
    });
    const mobile = vp.width <= 768;
    const ok = {
      contentScrolled: m2.scrolledTo >= 400,
      // Strict: the sticky top bar must remain at exactly top=0 after page scroll
      sidebarPinned: m2.sidebarTop === 0 && (mobile || (m2.sidebarLeft === 0 && m2.sidebarW === 240)),
      noHOverflow: true,
    };
    const m3 = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    ok.noHOverflow = m3;
    results.push({ vp: vp.name, ...m, ...m2, verdict: ok });
    console.log(vp.name, JSON.stringify({ ...m, ...m2, verdict: ok }));
    await page.screenshot({ path: `${OUT}/filler-${vp.name}-scrolled.png` });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/filler-results.json`, JSON.stringify(results, null, 2));
  const allOk = results.every((r) => r.verdict && r.verdict.contentScrolled && r.verdict.sidebarPinned && r.verdict.noHOverflow);
  console.log(allOk ? "ALL PASS" : "SOME FAIL");
})();
