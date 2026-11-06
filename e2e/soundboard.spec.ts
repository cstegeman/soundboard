import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // the Google Fonts stylesheet is not under test and would break offline runs
  await page.route(/fonts\.googleapis\.com/, route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
});

test('search filters the board', async ({ page }) => {
  const sounds = page.locator('.sound > button:not(.star)');
  const total = await sounds.count();
  await page.getByRole('searchbox', { name: 'Search sounds' }).fill('zzzz-no-match');
  await expect(sounds).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Search sounds' }).clear();
  await expect(sounds).toHaveCount(total);
});

test('favorites survive a reload', async ({ page }) => {
  await page
    .getByRole('button', { name: /^Add .* to favorites$/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: /^Favorites/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /^Favorites/ })).toBeVisible();
});

test('share link shows the shared clip and dismisses it', async ({ page }) => {
  const [{ category, sounds }] = (await (await page.request.get('/sounds.json')).json()) as {
    category: string;
    sounds: { title: string; name: string }[];
  }[];
  await page.goto(`/#clip=${encodeURIComponent(`${category}/${sounds[0].name}`)}&speed=1.5`);
  await page.reload(); // hash-only navigation doesn't remount; the hash is read on load
  await expect(page.locator('.shared')).toContainText(sounds[0].title);
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.locator('.shared')).toHaveCount(0);
  await expect(page).toHaveURL('/');
});
