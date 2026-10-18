import { test, expect } from "@playwright/test";
import { statSync } from "node:fs";

for (const width of [390, 1350]) {
  test(`image skeletons reserve space until photos load at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 875 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/images/optimized/**", async route => {
      await gate;
      await route.continue();
    });
    try {
      await page.goto("/projects", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".menu-toggle")).toBeEnabled();
      const frame = page.locator(".project-card .responsive-image").first();
      const photo = frame.locator("img");
      await expect(frame).toHaveAttribute("data-image-state", "loading");
      await expect(photo).toHaveCSS("opacity", "0");
      expect(await frame.evaluate(el => getComputedStyle(el, "::before").backgroundColor)).toBe("rgb(233, 231, 229)");
      expect(await frame.evaluate(el => getComputedStyle(el, "::before").animationName)).toBe("none");
      const before = await frame.boundingBox();
      expect(before!.height).toBeGreaterThan(100);
      release();
      await expect(frame).toHaveAttribute("data-image-state", "ready");
      await expect(photo).toHaveCSS("opacity", "1");
      expect(await frame.boundingBox()).toEqual(before);
      // Cached images can finish before hydration attaches the load listener.
      await page.unroute("**/images/optimized/**");
      await page.reload();
      await expect(frame).toHaveAttribute("data-image-state", "ready");
    } finally {
      release();
    }
  });
}

test("home keeps its skeleton until image decoding completes", async ({ page }) => {
  await page.addInitScript(() => {
    const decode = HTMLImageElement.prototype.decode;
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    Object.assign(window, { releaseImageDecode: release });
    HTMLImageElement.prototype.decode = async function () {
      await decode.call(this);
      await gate;
    };
  });
  await page.goto("/");
  await expect(page.locator(".menu-toggle")).toBeEnabled();
  const frame = page.locator(".scene-image").first();
  await expect.poll(() => frame.locator("img").evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(frame).toHaveAttribute("data-image-state", "loading");
  await expect(frame.locator("img")).toHaveCSS("opacity", "0");
  await expect(page.locator("video")).not.toHaveAttribute("src", /intro\.mp4/);
  await page.evaluate(() => (window as unknown as { releaseImageDecode: () => void }).releaseImageDecode());
  await expect(frame).toHaveAttribute("data-image-state", "ready");
  await expect(frame.locator("img")).toHaveCSS("opacity", "1");
  await expect(page.locator("video")).toHaveAttribute("src", /intro\.mp4/);
});

test("failed images keep a static placeholder and do not start the home video", async ({ page }) => {
  await page.route("**/images/optimized/**", route => route.abort());
  await page.goto("/");
  const frame = page.locator(".scene-image").first();
  await expect(frame).toHaveAttribute("data-image-state", "error");
  await expect(frame).toHaveAttribute("aria-busy", "false");
  await expect(frame.locator("img")).toHaveCSS("opacity", "0");
  expect(await frame.evaluate(el => getComputedStyle(el, "::before").animationName)).toBe("none");
  await expect(page.locator("video")).not.toHaveAttribute("src", /intro\.mp4/);
  await page.unroute("**/images/optimized/**");
  await page.reload();
  await expect(frame).toHaveAttribute("data-image-state", "ready");
});

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
  await page.locator(".scene-image img").first().evaluate(image => (image as HTMLImageElement).decode());
  await expect(page.locator("video")).not.toHaveAttribute("src", /intro\.mp4/);
  expect(media).toEqual([]);
});
