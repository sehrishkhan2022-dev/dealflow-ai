import { test, expect } from "@playwright/test";
const password = process.env.DEMO_PASSWORD;
test("marketing and registration routes are usable", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good conversations/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Build your workspace" }).click();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Confirm password")).toBeVisible();
});
test("demo login, authenticated shell, team and logout", async ({ page }) => {
  test.skip(!password, "Set DEMO_PASSWORD from the local environment");
  await page.goto("/login");
  await page.getByLabel("Email address").fill("owner@demo.dealflow.test");
  await page.getByLabel("Password", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Log in →" }).click();
  await expect(
    page.getByRole("heading", {
      name: "A little clarity. A lot of possibility.",
    }),
  ).toBeVisible();
  await expect(page.getByText("DEMO WORKSPACE", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Team", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "owner@demo.dealflow.test", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Log out/ }).click();
  await expect(page).toHaveURL(/\/login$/);
});
test("mobile navigation and empty recovery state", async ({ page }) => {
  test.skip(!password, "Set DEMO_PASSWORD from the local environment");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Email address").fill("owner@demo.dealflow.test");
  await page.getByLabel("Password", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Log in →" }).click();
  await expect(
    page.getByRole("heading", {
      name: "A little clarity. A lot of possibility.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Recovery Inbox", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Recovery Inbox",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Planned for Phase 1", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("guest access and forged mutations fail closed", async ({ request }) => {
  const me = await request.get("/api/v1/me");
  expect(me.status()).toBe(401);
  const forged = await request.post("/api/v1/workspaces", {
    data: {
      name: "Forged",
      region: "US",
      timezone: "UTC",
      terms_accepted: true,
    },
  });
  expect(forged.status()).toBe(419);
  expect((await forged.json()).error.code).toBe("CSRF_MISMATCH");
});
test("registration requests verification before workspace creation", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByLabel("Full name").fill("E2E Test User");
  await page.getByLabel("Email address").fill(`e2e-${Date.now()}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("BrowserTestPassword123");
  await page.getByLabel("Confirm password").fill("BrowserTestPassword123");
  await page.getByRole("button", { name: "Create account ↗" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(
    page.getByText("First, verify your email.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create workspace →" }),
  ).toBeDisabled();
});
