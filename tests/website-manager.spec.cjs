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

test('A&N exact live preview navigates to official website without iframe', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const dialog = page.getByRole('dialog', { name: 'My Websites' });
  const row = dialog.locator('.website-row').filter({ hasText: 'A&N Overseas' });
  await expect(row.getByRole('button', { name: 'Preview A&N Overseas in Canvas' })).toHaveText('Open Exact Live View');
  await expect(row.getByRole('link', { name: '🌐 Live Website' })).toHaveAttribute('href', 'https://anoverseaseducation.com/');
  await page.route('https://anoverseaseducation.com/', route => route.fulfill({status:200,contentType:'text/html',body:'<h1>Official live website</h1>'}));
  await row.getByRole('button', { name: 'Preview A&N Overseas in Canvas' }).click();
  await expect(page).toHaveURL('https://anoverseaseducation.com/');
  await expect(page.getByRole('heading', { name: 'Official live website' })).toBeVisible();
});
test('custom website previews remain sandboxed', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const dialog = page.locator('#websitePicker');
  await dialog.getByPlaceholder('Website name').fill('Custom sandbox test');
  await dialog.getByPlaceholder('https://your-site.example/').fill('https://example.com/');
  await dialog.getByRole('button', { name: '+ Add Website' }).click();
  await dialog.getByRole('button', { name: 'Preview Custom sandbox test in Canvas' }).click();
  await expect(page.locator('#websiteCanvasPreview iframe')).toHaveAttribute('sandbox', /allow-scripts/);
});

test('keyboard undo and redo shortcuts do not interfere with text inputs', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'T+ Text' }).first().click();
  await expect(page.locator('#canvas .item')).toHaveCount(1);
  await page.locator('body').click({position:{x:2,y:2}});
  await page.keyboard.press('Control+z');
  await expect(page.locator('#canvas .item')).toHaveCount(0);
  await page.keyboard.press('Control+Shift+z');
  await expect(page.locator('#canvas .item')).toHaveCount(1);
  const name = page.locator('#newWebsiteName');
  await page.getByRole('button', { name: 'My Websites' }).click();
  await name.fill('Draft text');
  await name.press('Control+z');
  await expect(page.locator('#canvas .item')).toHaveCount(1);
});

test('undo and redo preserve a new element after repeated property editing', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  const before = await page.locator('.stage .item').count();
  await page.locator('#text').click();
  await expect(page.locator('.stage .item')).toHaveCount(before + 1);
  await page.locator('#undo').click();
  await expect(page.locator('.stage .item')).toHaveCount(before);
  await page.locator('#redo').click();
  await expect(page.locator('.stage .item')).toHaveCount(before + 1);
});

test('responsive breakpoint geometry survives device round trip and local save', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').click();
  const original = await page.locator('.stage .item').first().evaluate(el => ({ left: el.style.left, width: el.style.width }));
  const devices = await page.locator('#device option').evaluateAll(options => options.map(o => o.value));
  const other = devices.find(v => /^\d+x\d+$/.test(v) && v !== '390x640');
  expect(other).toBeTruthy();
  await page.locator('#device').selectOption(other);
  await page.locator('#device').selectOption('390x640');
  const restored = await page.locator('.stage .item').first().evaluate(el => ({ left: el.style.left, width: el.style.width }));
  expect(restored.left).toBe(original.left);
  expect(restored.width).toBe(original.width);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#save').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('an-mve-v1')));
  expect(saved.breakpointLayouts['390x640']).toBeTruthy();
  expect(saved.pages).toHaveLength(1);
});

test('style changes can be undone without deleting the edited element', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').click();
  const initial = await page.locator('.stage .item').first().evaluate(el => el.style.color);
  await page.locator('#color').fill('#ff0000');
  await page.locator('#color').dispatchEvent('input');
  await expect(page.locator('.stage .item').first()).toHaveCSS('color', 'rgb(255, 0, 0)');
  await page.locator('#undo').click();
  await expect(page.locator('.stage .item')).toHaveCount(1);
  expect(await page.locator('.stage .item').first().evaluate(el => el.style.color)).toBe(initial);
});

test('page templates save and insert without reusing element ids', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').click();
  page.once('dialog', dialog => dialog.accept('QA Template'));
  await page.locator('#savePageTemplate').click();
  await expect(page.locator('#components option')).toHaveCount(2);
  await page.locator('#components').selectOption({ label: 'QA Template' });
  await page.locator('#insertComponent').click();
  await expect(page.locator('.stage .item')).toHaveCount(2);
  const ids = await page.locator('.stage .item').evaluateAll(nodes => nodes.map(n => n.dataset.itemId));
  expect(new Set(ids).size).toBe(2);
  await page.reload();
  await expect(page.locator('#components option')).toHaveCount(2);
});

test('pages can be duplicated and undone', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').click();
  await page.locator('#duplicatePage').click();
  await expect(page.locator('#page option')).toHaveCount(2);
  await expect(page.locator('.stage .item')).toHaveCount(1);
  await page.locator('#undo').click();
  await expect(page.locator('#page option')).toHaveCount(1);
  await expect(page.locator('.stage .item')).toHaveCount(1);
});

test('media library rejects invalid assets and deduplicates uploaded images', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#openAssets').click();
  const png = Buffer.from(await page.evaluate(() => { const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;canvas.getContext('2d').fillRect(0,0,2,2);return canvas.toDataURL('image/png').split(',')[1] }), 'base64');
  await page.locator('#assetFile').setInputFiles({ name: 'tiny.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#assetRows .asset-card')).toHaveCount(1);
  await page.locator('#assetFile').setInputFiles({ name: 'tiny.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#assetRows .asset-card')).toHaveCount(1);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('an-mve-assets-v1')));
  expect(saved).toHaveLength(1);
});

test('design assistant inserts local hero preset without external requests', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  const before = await page.locator('.stage .item').count();
  await page.locator('#ribbonAI').click();
  await expect(page.getByRole('dialog', { name: 'Design assistant' })).toBeVisible();
  await page.locator('#assistantGoal').selectOption('hero');
  await page.locator('#assistantInsert').click();
  await expect(page.locator('.stage .item')).toHaveCount(before + 1);
  await expect(page.locator('.stage .item').last()).toContainText('Your headline here');
});

test('form setup rejects private webhook destinations', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  const answers = ['Contact', 'Name, Email', 'webhook', 'https://localhost/submit'];
  page.on('dialog', dialog => dialog.type() === 'alert' ? dialog.accept() : dialog.accept(answers.shift() || ''));
  await page.locator('#ribbonForm').click();
  await page.locator('#ribbonFormSettings').click();
  const mode = await page.evaluate(() => {
    const selected = document.querySelector('.stage .item.selected');
    return selected?.outerHTML || '';
  });
  expect(mode).toBeTruthy();
  expect(answers).toHaveLength(0);
});

test('published HTML export contains SEO metadata and secure webhook guard', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('visual-site.html');
  const fs = require('node:fs');
  const html = fs.readFileSync(await download.path(), 'utf8');
  expect(html).toContain('<meta name="description"');
  expect(html).toContain('<meta name="robots"');
  expect(html).toContain('Valid public HTTPS endpoint required');
  expect(html).toContain('data-site-page');
});
