const { chromium } = require("playwright");
const BASE = "http://localhost:5173";

// Reproduce the mobile view WITHOUT filler and inspect the sidebar's
// position/offsetParent/ancestor overflow to find why sticky fails at -500.
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await ctx.addInitScript(() => {
    localStorage.setItem("erp_token", "preview-token");
    localStorage.setItem("erp_role", "manager");
  });
  const page = await ctx.newPage();
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [], results: [], items: [] }) })
  );
  await page.goto(BASE + "/manager/projects", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  const info = await page.evaluate(() => {
    const sb = document.querySelector(".manager-sidebar");
    const r = sb.getBoundingClientRect();
    const chain = [];
    let el = sb.parentElement;
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      chain.push({
        sel: "." + (el.className.split(" ").slice(0, 2).join(".")),
        overflow: cs.overflow + "/" + cs.overflowX + "/" + cs.overflowY,
        pos: cs.position,
        height: cs.height,
      });
      el = el.parentElement;
    }
    const cs = getComputedStyle(sb);
    return {
      sidebarTop: Math.round(r.top),
      sidebarH: Math.round(r.height),
      winY: window.scrollY,
      position: cs.position,
      top: cs.top,
      zIndex: cs.zIndex,
      ancestors: chain,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
