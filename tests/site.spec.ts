import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const reference = JSON.parse(readFileSync(new URL("../app/data/reference.json", import.meta.url), "utf8"));

async function selectCategory(page: Page, label: string) {
  if ((page.viewportSize()?.width ?? 1350) <= 640) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "projects", exact: true }).click();
  }
  await page.getByRole("link", { name: label.toLowerCase(), exact: true }).click();
}
async function selectYear(page: Page, year: string) {
  await page.getByRole("group", { name: "Filter projects by year" }).getByRole("button", { name: year, exact: true }).click();
}

const routes = [
  "/",
  "/projects",
  "/projects/premium-woodwork",
  "/projects/heritage-craft",
  "/projects/commercial-space",
  "/projects/media-drama-furniture",
  "/projects/brand-pop-up",
  "/archive",
  "/office",
];
for (const width of [390, 768, 1350]) {
  test(`all page layouts and media at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 875 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const img of await page.locator("main img").all()) {
        if (!(await img.isVisible())) continue;
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            img.evaluate(
              (el) =>
                (el as HTMLImageElement).complete &&
                (el as HTMLImageElement).naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });
}

test("project navigation, read more, header theme and browser history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1350, height: 875 });
  await page.goto("/projects");
  await page
    .getByRole("link", { name: "우드슬랩 테이블 01", exact: true })
    .click();
  await expect(page).toHaveURL(/projects\/premium-woodwork\?project=woodslab-01$/);
  await expect(page.locator(".site-header")).toHaveClass(/is-transparent/);
  const button = page.locator(".text-toggle");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".expanded-copy")).toBeVisible();
  await page.getByRole("button", { name: "접기" }).click();
  await expect(page.locator(".expanded-copy")).toHaveCount(0);
  await page.locator(".project-gallery").scrollIntoViewIfNeeded();
  await expect(page.locator(".site-header")).not.toHaveClass(/is-transparent/);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Premium Woodwork");
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole("link", { name: "forestory furniture home" }).first().click();
  await expect(page.locator(".site-header")).toHaveClass(/is-transparent/);
});

test("mobile menu traps focus, closes with Escape, and navigates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.locator(".menu-toggle");
  await expect(menu).toBeEnabled();
  await menu.focus();
  await menu.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#projects-dropdown")).toBeVisible();
  await expect(page.locator("#projects-dropdown a")).toHaveText([
    "all", "media & pop-up", "commercial space", "heritage craft", "premium woodwork",
  ]);
  await expect(
    page.getByRole("button", { name: "projects", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("link", { name: "office", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("link", { name: "forestory archive", exact: true }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("home section controls and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1350, height: 875 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".menu-toggle")).toBeEnabled();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).paused),
    )
    .toBe(true);
  await expect(page.locator(".home-scene")).toHaveCount(4);
  for (let section = 1; section < 4; section++) {
    await page.getByRole("button", { name: "Scroll to explore" }).click();
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(875 * section);
    await expect.poll(() => page.locator(".home-scene").nth(section).locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await expect(
    page.getByRole("button", { name: "Scroll to explore" }),
  ).toHaveCount(0);
  await expect(page.locator(".home-scene a")).toHaveCount(0);
  await page.locator(".home-scene h2").last().click();
  await expect(page).toHaveURL(/\/$/);
});

test("mobile project filters and Contact bars stay usable across pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  await selectCategory(page, "HERITAGE CRAFT");
  await selectYear(page, "2026");
  await expect(page.locator(".project-card h2")).toHaveText(["자개 리폼 03", "자개 리폼 04"]);
  await selectCategory(page, "PREMIUM WOODWORK");
  await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await selectYear(page, "2024");
  await expect(page.locator(".project-card h2")).toHaveText(["우드슬랩 테이블 03", "우드슬랩 테이블 04"]);
  await page.reload();
  await expect(page.locator(".project-card h2")).toHaveText(["우드슬랩 테이블 03", "우드슬랩 테이블 04"]);
  await page.setViewportSize({ width: 1350, height: 875 });
  await page.getByRole("button", { name: "projects", exact: true }).click();
  await expect(page.getByRole("link", { name: "premium woodwork", exact: true })).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(page.locator(".contact-bar-mobile")).toBeHidden();
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.locator(".year-chip")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const route of ["/projects", "/archive", "/projects/premium-woodwork", "/office"]) {
    await page.goto(route);
    const contact = page.locator(".contact-bar");
    await expect(contact).toBeVisible();
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    await expect(menu.locator("svg")).toBeVisible();
    await menu.click();
    await expect(contact).toBeHidden();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(contact).toBeVisible();
    await contact.click();
    await expect(page.locator(".footer-contact")).toBeInViewport();
    await expect(contact).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(contact).toBeVisible();
  }
});

test("office process follows scroll, sticky labels stack, Contact is not duplicated", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1350, height: 875 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/office");
  await page.waitForFunction(() =>
    Boolean(
      (document.querySelector("#__nuxt") as Element & { __vue_app__?: unknown })
        ?.__vue_app__,
    ),
  );
  await expect(page.locator(".contact-bar")).toBeVisible();
  await expect(page.locator(".process-step")).toHaveCount(reference.office.process.length);
  for (const step of [1, reference.office.process.length - 1]) {
    await page.locator(".process-step").nth(step).evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(page.locator(".process-step").nth(step)).toHaveClass(/active/);
    await expect(page.locator(".process-image .responsive-image").nth(step)).toHaveClass(/active/);
  }
  await page.locator("#services").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect(page.locator(".office-navigation a").nth(2)).toHaveCSS("top", "180px");
  const positions = await page
    .locator(".office-navigation a")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(positions.slice(0, 3)).toEqual([60, 120, 180]);
  expect(positions[3]).toBeGreaterThanOrEqual(240);
  await expect(page.locator(".contact-bar")).toBeVisible();
  await page.locator(".contact-bar").click();
  await expect(page.locator(".contact-bar")).toHaveCount(0);
  await expect(page.locator(".footer-contact")).toBeInViewport();
});

test("unknown project returns an actual 404 and offers recovery", async ({
  page,
}) => {
  const response = await page.goto("/projects/not-a-project");
  expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Explore our projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator(".project-card")).toHaveCount(reference.projects.length);
});

test("landscape mobile keeps the main heading and navigation within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of routes) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("selected project year survives reload and history without changing the shared hero", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: "우드슬랩 테이블 01", exact: true }).click();
  await expect(page.locator(".project-specs dd").last()).toHaveText("2025");
  await page.goBack();
  await page.getByRole("link", { name: "우드슬랩 테이블 03", exact: true }).click();
  await expect(page.locator(".project-specs dd").last()).toHaveText("2024");
  await page.reload();
  await expect(page.locator(".project-specs dd").last()).toHaveText("2024");
  await expect(page.locator(".project-hero img")).toHaveAttribute("src", "/images/wood-interior-cta.webp");
  await page.goto("/projects/premium-woodwork?project=heritage-04");
  await expect(page.locator(".project-specs dd").last()).toHaveText("2025");
  await page.goto("/projects/premium-woodwork");
  await expect(page.locator(".project-specs dd").last()).toHaveText("2025");
});

test("premium woodwork filters preserve photo order and share one detail page", async ({
  page,
  request,
}) => {
  await page.goto("/projects");
  await selectCategory(page, "PREMIUM WOODWORK");
  await selectYear(page, "2025");
  await expect(page.locator(".project-card h2")).toHaveText([
    "우드슬랩 테이블 01", "우드슬랩 테이블 02",
  ]);
  await selectYear(page, "2024");
  await expect(page.locator(".project-card h2")).toHaveText([
    "우드슬랩 테이블 03", "우드슬랩 테이블 04",
  ]);
  await selectYear(page, "2026");
  await expect(page.locator(".project-card")).toHaveCount(0);
  await expect(page.locator(".projects-empty")).toBeVisible();
  await selectYear(page, "All");
  await expect(page.locator(".project-card")).toHaveCount(4);
  const links = await page
    .locator(".project-card")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
  expect(links).toEqual([1, 2, 3, 4].map(i => `/projects/premium-woodwork?project=woodslab-0${i}`));
  const response = await request.get(links[0]!);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("project-gallery");
  await page.locator(".project-card").last().click();
  await expect(page.locator(".project-specs dt")).toHaveText(["Location", "Wood", "Year"]);
  await expect(page.locator(".project-specs dd")).toHaveText(["Korea", "-", "2024"]);
  await expect(page.locator(".project-gallery-slot.is-empty")).toHaveCount(6);
  await expect(page.locator(".project-gallery img")).toHaveCount(0);
});

test("media and popup cards preserve years and route to their own shared details", async ({ page }) => {
  await page.goto("/projects");
  await selectCategory(page, "MEDIA & POP-UP");
  const titles2025 = ["드라마 가구 01", "드라마 가구 02", "드라마 가구 04", "지자체 소품 01", "행사 가판대 01", "행사 가판대 02", "행사 가판대 03", "행사 가판대 04"];
  const titles2026 = ["드라마 가구 03", "지자체 소품 02", "지자체 소품 03", "지자체 소품 04", "브랜드 팝업 01", "브랜드 팝업 02", "브랜드 팝업 03", "브랜드 팝업 04"];
  await selectYear(page, "2025");
  await expect(page.locator(".project-card h2")).toHaveText(titles2025);
  await selectYear(page, "2026");
  await expect(page.locator(".project-card h2")).toHaveText(titles2026);
  await selectYear(page, "2024");
  await expect(page.locator(".projects-empty")).toBeVisible();
  await selectYear(page, "All");
  await expect(page.locator(".project-card")).toHaveCount(16);
  const links = await page.locator(".project-card").evaluateAll(els => els.map(el => el.getAttribute("href")));
  expect(links).toEqual([
    ...[1, 2, 3, 4].map(i => `/projects/media-drama-furniture?project=media-drama-0${i}`),
    ...Array.from({ length: 12 }, (_, i) => `/projects/brand-pop-up?project=brand-popup-${String(i + 1).padStart(2, "0")}`),
  ]);
  await page.locator(".project-card").first().click();
  await expect(page.locator("h1")).toHaveText("Media & Pop-up");
  await expect(page.locator(".project-hero img")).toHaveAttribute("src", "/images/wood-interior-cta.webp");
  await page.getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(page.locator(".expanded-copy")).toContainText("연출 의도");
  await expect(page.locator(".project-gallery-slot.is-empty")).toHaveCount(6);
  await expect(page.locator(".project-gallery img")).toHaveCount(0);
  await page.goto("/projects");
  await page.getByRole("link", { name: "브랜드 팝업 04", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Media & Pop-up");
  await expect(page.locator(".project-hero img")).toHaveAttribute("src", "/images/wood-interior-cta.webp");
  await expect(page.locator(".project-specs dd")).toHaveText(["Korea", "-", "2026"]);
  await page.getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(page.locator(".expanded-copy")).toContainText("CNC 정밀 가공");
  await expect(page.locator(".project-gallery-slot.is-empty")).toHaveCount(6);
  await expect(page.locator(".project-gallery img")).toHaveCount(0);
});

test("commercial space filters preserve assigned years and share one detail", async ({ page }) => {
  await page.goto("/projects");
  await selectCategory(page, "COMMERCIAL SPACE");
  await selectYear(page, "2025");
  await expect(page.locator(".project-card h2")).toHaveText(["상업가구 01", "상업가구 03", "상업가구 04"]);
  await selectYear(page, "2026");
  await expect(page.locator(".project-card h2")).toHaveText(["상업가구 02"]);
  await selectYear(page, "2024");
  await expect(page.locator(".projects-empty")).toBeVisible();
  await selectYear(page, "All");
  await expect(page.locator(".project-card")).toHaveCount(4);
  for (const card of await page.locator(".project-card").all()) {
    await expect(card).toHaveAttribute("href", /^\/projects\/commercial-space\?project=commercial-0[1-4]$/);
  }
  await page.locator(".project-card").first().click();
  await expect(page.locator("h1")).toHaveText("Commercial Space");
  await expect(page.locator(".project-hero img")).toHaveAttribute("src", "/images/wood-interior-cta.webp");
  await expect(page.locator(".project-specs dd")).toHaveText(["Korea", "-", "2025"]);
  await page.getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(page.locator(".expanded-copy")).toContainText("정밀 실측");
  await expect(page.locator(".project-gallery-slot.is-empty")).toHaveCount(6);
  await expect(page.locator(".project-gallery img")).toHaveCount(0);
});

test("heritage craft filters and cards share the category detail and default hero", async ({ page }) => {
  await page.goto("/projects");
  await selectCategory(page, "HERITAGE CRAFT");
  await selectYear(page, "2025");
  await expect(page.locator(".project-card h2")).toHaveText(["자개 리폼 01", "자개 리폼 02"]);
  await selectYear(page, "2026");
  await expect(page.locator(".project-card h2")).toHaveText(["자개 리폼 03", "자개 리폼 04"]);
  await selectYear(page, "2024");
  await expect(page.locator(".projects-empty")).toBeVisible();
  await selectYear(page, "All");
  await expect(page.locator(".project-card")).toHaveCount(4);
  for (const card of await page.locator(".project-card").all()) {
    await expect(card).toHaveAttribute("href", /^\/projects\/heritage-craft\?project=heritage-0[1-4]$/);
  }
  await page.locator(".project-card").last().click();
  await expect(page.locator("h1")).toHaveText("Heritage Craft");
  await expect(page.locator(".project-hero img")).toHaveAttribute("src", "/images/wood-interior-cta.webp");
  await expect(page.locator(".project-specs dd")).toHaveText(["Korea", "-", "2026"]);
  await page.getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(page.locator(".expanded-copy")).toContainText("코팅 기술");
  await expect(page.locator(".project-gallery-slot.is-empty")).toHaveCount(6);
  await expect(page.locator(".project-gallery img")).toHaveCount(0);
  await page.locator(".related-projects .project-card").first().click();
  await expect(page.locator("h1")).toHaveText("Premium Woodwork");
  await expect(page.locator(".project-hero img")).toHaveAttribute("src", "/images/wood-interior-cta.webp");
});
