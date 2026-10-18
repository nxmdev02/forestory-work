import { test, expect } from "@playwright/test";
import { statSync } from "node:fs";

for (const [width, deviceScaleFactor] of [[390, 1], [390, 2], [1350, 1]] as const) {
  test(`project photos use smaller files at ${width}px / ${deviceScaleFactor}x`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 875 }, deviceScaleFactor });
    const page = await context.newPage();
    const requested: string[] = [];
    page.on("request", request => requested.push(new URL(request.url()).pathname));
    try {
      await page.goto("/projects");
      const first = page.locator(".project-card img").first();
      await first.evaluate(image => (image as HTMLImageElement).decode());
      const selected = await first.evaluate(image => (image as HTMLImageElement).currentSrc);
      expect(selected).toContain("/images/optimized/");
      const original = (await first.getAttribute("src"))!;
      expect(requested).not.toContain(original);
      const response = await context.request.get(selected);
      expect(response.ok()).toBe(true);
      const originalBytes = statSync(new URL(`../public${original}`, import.meta.url)).size;
      expect((await response.body()).length).toBeLessThan(originalBytes * 0.8);
      // Scrolling must still load images that were deferred on initial render.
      const last = page.locator(".project-card img").last();
      await last.scrollIntoViewIfNeeded();
      await expect.poll(() => last.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });
}

test("home waits for its image before downloading video", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const media: string[] = [];
  page.on("request", request => {
    if (request.url().includes("intro.mp4")) media.push(request.url());
  });
  await page.route("**/images/optimized/intro-poster-*.webp", async route => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".menu-toggle")).toBeEnabled();
    expect(media).toEqual([]);
    await expect(page.locator("video")).not.toHaveAttribute("src", /intro\.mp4/);
    release();
    await expect(page.locator("video")).toHaveAttribute("src", /intro\.mp4/);
    await expect(page.locator("video")).toHaveClass(/is-playing/);
    expect(media.length).toBeGreaterThan(0);
  } finally {
    release();
  }
});

test("reduced motion displays the image without a video download", async ({ page }) => {
  const media: string[] = [];
  page.on("request", request => {
    if (request.url().includes("intro.mp4")) media.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".menu-toggle")).toBeEnabled();
  await page.locator(".scene-image").first().evaluate(image => (image as HTMLImageElement).decode());
  await expect(page.locator("video")).not.toHaveAttribute("src", /intro\.mp4/);
  expect(media).toEqual([]);
});
