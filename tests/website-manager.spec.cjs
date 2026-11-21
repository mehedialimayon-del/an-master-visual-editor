const { test, expect } = require('@playwright/test');
test('website manager add, duplicate, reload, remove and built-ins', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const dialog = page.getByRole('dialog', { name: 'My Websites' });
  await expect(dialog.locator('.website-row')).toHaveCount(7);
  await expect(dialog.getByText('Field Force Hub')).toBeVisible();
  await expect(dialog.getByText('AN Master Visual Editor')).toBeVisible();
  await dialog.getByPlaceholder('Website name').fill('QA Demo');
  await dialog.getByPlaceholder('https://your-site.example/').fill('https://qa.example.test/');
  await dialog.getByPlaceholder('GitHub repository URL (optional)').fill('https://github.com/example/qa-demo');
  await dialog.getByRole('button', { name: '+ Add Website' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(8);
  await page.reload();
  await page.getByRole('button', { name: 'My Websites' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(8);
  await dialog.getByPlaceholder('Website name').fill('Duplicate');
  await dialog.getByPlaceholder('https://your-site.example/').fill('https://qa.example.test/');
  await dialog.getByRole('button', { name: '+ Add Website' }).click();
  await expect(dialog.getByRole('status')).toContainText('already added');
  await expect(dialog.locator('.website-row')).toHaveCount(8);
  await dialog.getByRole('button', { name: 'Remove QA Demo' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(7);
  await page.reload();
  await page.getByRole('button', { name: 'My Websites' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(7);
});
test('invalid repository and built-in duplicates are rejected', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const d = page.getByRole('dialog', { name: 'My Websites' });
  await d.getByPlaceholder('Website name').fill('Bad repo');
  await d.getByPlaceholder('https://your-site.example/').fill('https://qa2.example.test/');
  await d.getByPlaceholder('GitHub repository URL (optional)').fill('https://github.com/owner/repo/tree/main');
  await d.getByRole('button', { name: '+ Add Website' }).click();
  await expect(d.getByRole('status')).toContainText('GitHub repository URL');
  await expect(d.locator('.website-row')).toHaveCount(7);
  await d.getByPlaceholder('GitHub repository URL (optional)').fill('https://github.com/mehedialimayon-del/examarena-bd');
  await d.getByRole('button', { name: '+ Add Website' }).click();
  await expect(d.getByRole('status')).toContainText('already added');
  await expect(d.locator('.website-row')).toHaveCount(7);
});
test('existing editor canvas and tools are preserved', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#canvas')).toBeVisible();
  await expect(page.locator('#designRibbon')).toBeAttached();
  await expect(page.locator('#save')).toBeAttached();
  await expect(page.locator('#export')).toBeAttached();
});

test('built-in and custom website preview in canvas with safe return', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const dialog = page.getByRole('dialog', { name: 'My Websites' });
  await dialog.getByRole('button', { name: 'Preview Field Force Hub in Canvas' }).click();
  const preview = page.getByRole('region', { name: 'Website preview: Field Force Hub' });
  await expect(preview).toBeVisible();
  await expect(preview.locator('iframe')).toHaveAttribute('src', /salesman-performance-app/);
  await expect(preview.getByRole('link', { name: 'Open Live' })).toHaveAttribute('target', '_blank');
  await preview.getByRole('button', { name: 'Return to Editor' }).click();
  await expect(preview).toHaveCount(0);
  await expect(page.locator('#canvas')).toBeVisible();
  await page.getByRole('button', { name: 'My Websites' }).click();
  await dialog.getByPlaceholder('Website name').fill('Custom preview');
  await dialog.getByPlaceholder('https://your-site.example/').fill('https://custom.example.test/');
  await dialog.getByRole('button', { name: '+ Add Website' }).click();
  await dialog.getByRole('button', { name: 'Preview Custom preview in Canvas' }).click();
  await expect(page.locator('#websiteCanvasPreview iframe')).toHaveAttribute('src', 'https://custom.example.test/');
  await page.getByRole('button', { name: 'Return to Editor' }).click();
});

test('responsive website preview changes real iframe viewport width', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  await page.getByRole('button', { name: 'Preview MA Tour & Travels in Canvas' }).click();
  const select = page.getByRole('combobox', { name: 'Website preview screen size' });
  const iframe = page.locator('#websiteCanvasPreview iframe');
  await expect(select).toHaveValue('1280');
  await expect(iframe).toHaveCSS('width', '1280px');
  await select.selectOption('1366');
  await expect(iframe).toHaveCSS('width', '1366px');
  await expect(iframe).toHaveCSS('transform', 'none');
  await expect(page.locator('body > #websiteCanvasPreview')).toHaveCount(1);
  await select.selectOption('430');
  await expect(iframe).toHaveCSS('width', '430px');
  await page.getByRole('button', { name: 'Return to Editor' }).click();
  await expect(page.locator('#websiteCanvasPreview')).toHaveCount(0);
});

test('preview offers original GitHub source without modifying the live website', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  await page.getByRole('button', { name: 'Preview Field Force Hub in Canvas' }).click();
  const source = page.getByRole('link', { name: 'Open Field Force Hub GitHub source' });
  await expect(source).toHaveAttribute('href', 'https://github.com/mehedialimayon-del/salesman-performance-app');
  await expect(source).toHaveAttribute('target', '_blank');
  await expect(source).toHaveAttribute('rel', /noopener/);
  await expect(page.locator('#websiteCanvasPreview iframe')).toHaveAttribute('src', /salesman-performance-app/);
});

test('website manager provides direct GitHub source editing entry', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const link = page.getByRole('link', { name: 'Edit A&N Overseas source in GitHub web editor' });
  await expect(link).toHaveAttribute('href', 'https://github.dev/mehedialimayon-del/an-overseas-education-');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test('full-screen live bypasses iframe clipping and retains exact destination', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  await page.getByRole('button', { name: 'Preview A&N Overseas in Canvas' }).click();
  const live = page.getByRole('link', { name: 'Open A&N Overseas in full screen live view' });
  await expect(live).toHaveAttribute('href', 'https://mehedialimayon-del.github.io/an-overseas-education-/');
  await expect(live).not.toHaveAttribute('target', '_blank');
  await expect(page.locator('body > #websiteCanvasPreview')).toHaveCount(1);
  await expect(page.locator('#websiteCanvasPreview iframe')).toHaveCSS('transform', 'none');
});

test('external website iframe retains origin for secure LockManager APIs', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  await page.getByRole('button', { name: 'Preview A&N Overseas in Canvas' }).click();
  await expect(page.locator('#websiteCanvasPreview iframe')).toHaveAttribute('sandbox', /allow-same-origin/);
  await expect(page.locator('#websiteCanvasPreview iframe')).toHaveAttribute('src', 'https://mehedialimayon-del.github.io/an-overseas-education-/');
});
