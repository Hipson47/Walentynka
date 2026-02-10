import { test, expect, type Page } from "@playwright/test";

/**
 * Helper: navigate from intro to ask screen.
 * Uses Off mode for instant envelope landing, then clicks the envelope button.
 */
async function navigateToAsk(page: Page) {
  await page.getByRole("button", { name: "Off" }).click();

  // Scroll to landing section
  const stage = page.locator(".intro-stage");
  await stage.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await page.waitForTimeout(600);

  // Click the envelope button directly (it's always clickable and not obscured)
  const envelope = page.locator("button.envelope");
  await expect(envelope).toBeVisible({ timeout: 5000 });
  await envelope.click();

  // Wait for transition to ask screen (~620ms)
  await expect(page.getByText("TAK")).toBeVisible({ timeout: 3000 });
}

/**
 * Helper: navigate from intro through ask to celebrate.
 */
async function navigateToCelebrate(page: Page) {
  await navigateToAsk(page);
  await page.getByText("TAK").click();
  await expect(page.locator("h1")).toContainText(["Kocham"], { timeout: 3000 });
}

/**
 * Helper: navigate through all screens to the choice screen.
 * Waits for the celebrate timer (~7.6s).
 */
async function navigateToChoice(page: Page) {
  await navigateToCelebrate(page);
  await expect(page.getByText("Randeczka? ⭐")).toBeVisible({ timeout: 15000 });
}

/**
 * Helper: navigate through all screens to the final screen.
 */
async function navigateToFinal(page: Page) {
  await navigateToChoice(page);
  await page.getByText("Kolacyjka").click();
  await expect(page.getByText("Dobry wybór ✅")).toBeVisible({ timeout: 3000 });
}

// ─── Intro Screen ────────────────────────────────────────────────────────────

test.describe("Intro Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads and shows intro screen", async ({ page }) => {
    await expect(page).toHaveTitle(/Walentynka/);
    await expect(page.getByText("Mam coś dla Ciebie 💌")).toBeVisible();
    await expect(page.getByText("Mała niespodzianka")).toBeVisible();
  });

  test("shows motion mode toggle with three buttons", async ({ page }) => {
    await expect(page.getByText("Full")).toBeVisible();
    await expect(page.getByText("Lite")).toBeVisible();
    await expect(page.getByText("Off")).toBeVisible();
  });

  test("motion mode toggle changes active state", async ({ page }) => {
    const liteBtn = page.getByRole("button", { name: "Lite" });
    await liteBtn.click();
    await expect(liteBtn).toHaveClass(/active/);

    const offBtn = page.getByRole("button", { name: "Off" });
    await offBtn.click();
    await expect(offBtn).toHaveClass(/active/);
  });

  test("skip intro button reveals CTA", async ({ page }) => {
    const skipBtn = page.getByRole("button", { name: "Pomiń animację intro" });
    await skipBtn.click();

    // Scroll to landing
    const stage = page.locator(".intro-stage");
    await stage.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.locator(".intro-cta.cta-visible")).toBeVisible({ timeout: 3000 });
  });

  test("envelope opens and transitions to ask screen", async ({ page }) => {
    await navigateToAsk(page);
    await expect(page.getByRole("button", { name: "NIE" })).toBeVisible();
  });
});

// ─── Ask Screen ──────────────────────────────────────────────────────────────

test.describe("Ask Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await navigateToAsk(page);
  });

  test("shows TAK and NIE buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "TAK" })).toBeVisible();
    await expect(page.getByRole("button", { name: "NIE" })).toBeVisible();
  });

  test("clicking TAK transitions to celebrate", async ({ page }) => {
    await page.getByText("TAK").click();
    await expect(page.locator("h1")).toContainText(["Kocham"], { timeout: 3000 });
  });
});

// ─── Celebrate Screen ────────────────────────────────────────────────────────

test.describe("Celebrate Screen", () => {
  test("celebrate auto-transitions to choice screen", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/");
    await navigateToCelebrate(page);

    // Celebrate lasts ~7.6s by default, wait generously
    await expect(page.getByText("Randeczka? ⭐")).toBeVisible({ timeout: 20000 });

    await expect(page.getByText("Kolacyjka")).toBeVisible();
    await expect(page.getByText("film?")).toBeVisible();
    await expect(page.getByText("Spacer?")).toBeVisible();
  });
});

// ─── Choice Screen ───────────────────────────────────────────────────────────

test.describe("Choice Screen", () => {
  test("selecting a choice transitions to final", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/");
    await navigateToChoice(page);

    await page.getByText("Kolacyjka").click();
    await expect(page.getByText("Dobry wybór ✅")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("Nie mogę się doczekać! 💕")).toBeVisible();
    await expect(page.getByText("PS... 💌")).toBeVisible();
  });
});

// ─── Final Screen & PS Modal ─────────────────────────────────────────────────

test.describe("Final Screen & PS Modal", () => {
  test("PS modal opens and closes via button", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/");
    await navigateToFinal(page);

    // Open PS modal
    await page.getByText("PS... 💌").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Psssst.... 🙊")).toBeVisible();

    // Close via close button
    await page.getByLabel("Zamknij").click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("PS modal closes with Escape key", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/");
    await navigateToFinal(page);

    await page.getByText("PS... 💌").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

// ─── URL Parameter ───────────────────────────────────────────────────────────

test.describe("URL Parameter", () => {
  test("uses custom name from ?to= parameter", async ({ page }) => {
    await page.goto("/?to=Asia");
    await navigateToAsk(page);

    await expect(page.getByText("Asia, czy zostaniesz moją walentynką?")).toBeVisible();
  });
});

// ─── Runaway NIE Button ──────────────────────────────────────────────────────

test.describe("Runaway NIE Button", () => {
  test("NIE button escapes on hover", async ({ page }) => {
    await page.goto("/");
    await navigateToAsk(page);

    const nieButton = page.locator(".btn-secondary").first();
    await nieButton.hover();
    await page.waitForTimeout(300);

    // Portal button should appear
    const portalBtn = page.locator(".runaway-portal-btn");
    await expect(portalBtn).toBeVisible({ timeout: 2000 });

    // Original button should be hidden via aria-hidden
    await expect(nieButton).toHaveAttribute("aria-hidden", "true");
  });
});

// ─── Accessibility ───────────────────────────────────────────────────────────

test.describe("Accessibility", () => {
  test("envelope is a semantic button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Off" }).click();
    const stage = page.locator(".intro-stage");
    await stage.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(500);

    const envelope = page.locator("button.envelope");
    await expect(envelope).toBeVisible({ timeout: 3000 });
    await expect(envelope).toHaveAttribute("type", "button");
  });

  test("modal has correct ARIA attributes", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/");
    await navigateToFinal(page);

    await page.getByText("PS... 💌").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
  });

  test("motion mode toggle has group role", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("group", { name: "Tryb animacji" });
    await expect(toggle).toBeVisible();
  });

  test("hearts canvas overlay is aria-hidden", async ({ page }) => {
    await page.goto("/");
    await navigateToCelebrate(page);

    const canvas = page.locator(".hearts-canvas-overlay");
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
  });
});

// ─── Responsive ──────────────────────────────────────────────────────────────

test.describe("Responsive", () => {
  test("choice grid renders on mobile viewport", async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await navigateToChoice(page);

    await expect(page.getByText("Kolacyjka")).toBeVisible();
    await expect(page.getByText("film?")).toBeVisible();
    await expect(page.getByText("Spacer?")).toBeVisible();
  });
});
