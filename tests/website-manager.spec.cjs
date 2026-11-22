const { test, expect } = require('@playwright/test');
test('website manager add, duplicate, reload, remove and built-ins', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button', { name: 'My Websites' }).click();
  const dialog = page.getByRole('dialog', { name: 'My Websites' });
  await expect(dialog.locator('.website-row')).toHaveCount(9);
  await expect(dialog.getByText('Field Force Hub')).toBeVisible();
  await expect(dialog.getByText('AN Master Visual Editor')).toBeVisible();
  await dialog.getByPlaceholder('Website name').fill('QA Demo');
  await dialog.getByPlaceholder('https://your-site.example/').fill('https://qa.example.test/');
  await dialog.getByPlaceholder('GitHub repository URL (optional)').fill('https://github.com/example/qa-demo');
  await dialog.getByRole('button', { name: '+ Add Website' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(9);
  await page.reload();
  await page.getByRole('button', { name: 'My Websites' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(9);
  await dialog.getByPlaceholder('Website name').fill('Duplicate');
  await dialog.getByPlaceholder('https://your-site.example/').fill('https://qa.example.test/');
  await dialog.getByRole('button', { name: '+ Add Website' }).click();
  await expect(dialog.getByRole('status')).toContainText('already added');
  await expect(dialog.locator('.website-row')).toHaveCount(9);
  await dialog.getByRole('button', { name: 'Remove QA Demo' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(8);
  await page.reload();
  await page.getByRole('button', { name: 'My Websites' }).click();
  await expect(dialog.locator('.website-row')).toHaveCount(8);
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
  await expect(d.locator('.website-row')).toHaveCount(8);
  await d.getByPlaceholder('GitHub repository URL (optional)').fill('https://github.com/mehedialimayon-del/examarena-bd');
  await d.getByRole('button', { name: '+ Add Website' }).click();
  await expect(d.getByRole('status')).toContainText('already added');
  await expect(d.locator('.website-row')).toHaveCount(8);
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

test('AI assistant requires cloud sign-in and keeps preset insertion available', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#ribbonAI').click();
  await page.locator('#assistantPrompt').fill('Create a clean hero section');
  await page.locator('#assistantAsk').click();
  await expect(page.locator('#assistantResult')).toHaveText('Sign in with Cloud Projects first');
  await page.locator('#assistantGoal').selectOption('hero');
  await page.locator('#assistantInsert').click();
  await expect(page.locator('.stage .item')).toHaveCount(1);
});

test('cloud controls preserve local data when sign-in is cancelled', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#save').click();
  const before = await page.evaluate(() => localStorage.getItem('an-mve-v1'));
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#cloudProjects').click();
  const after = await page.evaluate(() => localStorage.getItem('an-mve-v1'));
  expect(after).toBe(before);
});

test('authenticated AI response renders as text, not executable HTML', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(() => { mveSession = { access_token: 'qa-token' }; });
  await page.route('**/functions/v1/an-mve-ai-design', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ suggestion: '<img src=x onerror=alert(1)>Try a simple orange CTA' })
  }));
  await page.locator('#ribbonAI').click();
  await page.locator('#assistantPrompt').fill('Suggest a hero layout');
  await page.locator('#assistantAsk').click();
  await expect(page.locator('#assistantResult')).toContainText('Try a simple orange CTA');
  await expect(page.locator('#assistantResult img')).toHaveCount(0);
});

test('cloud load keeps a restorable backup of existing local project', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#save').click();
  const original = await page.evaluate(() => localStorage.getItem('an-mve-v1'));
  await page.evaluate(() => { mveSession = { access_token: 'qa-token' }; });
  const id = 'a9630000-0000-4000-8000-000000000001';
  await page.route('**/rest/v1/rpc/an_mve_list_projects', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([{ id, title: 'QA project' }])
  }));
  await page.route('**/rest/v1/rpc/an_mve_get_project', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ pages: [{ name: 'Imported', items: [] }], items: [], pageIndex: 0, device: '390x640', theme: 'dark', layout: 'fixed', breakpointLayouts: {} })
  }));
  const answers = ['load', id];
  page.on('dialog', dialog => dialog.type() === 'prompt' ? dialog.accept(answers.shift() || '') : dialog.accept());
  await page.locator('#cloudProjects').click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('an-mve-cloud-restore-backup-v1'))).toBe(original);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('an-mve-v1')).pages[0].name)).toBe('Imported');
});

test('button links to another editor page in preview and survives save reload', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(() => {
    pages.push({ name: 'QA Test Page', items: [{ id: 'qa-text', type: 'text', label: 'Page 2 Test', x: 30, y: 60, w: 180, h: 50, size: 20, color: '#111111' }] });
    render();
  });
  await page.locator('#button').click();
  await expect(page.locator('#linkPage option')).toHaveCount(3);
  await page.locator('#linkPage').selectOption('1');
  await expect(page.locator('#linkPage')).toHaveValue('1');
  await page.locator('#preview').click();
  await page.locator('.stage .item[data-type="button"]').click();
  await expect(page.locator('#currentPageTitle')).toHaveText('QA Test Page');
  await expect(page.locator('.stage')).toContainText('Page 2 Test');
});

test('visual style presets appear for text and apply orange glow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/');
  // Set up a text element directly: the mobile header is horizontally scrollable and
  // its +Text control may be outside the viewport. This test targets the preset UI.
  await page.evaluate(() => { add('text'); openPanel('text'); });
  // The sheet is a mobile scroll container; activate its tab without a
  // Playwright scroll-to-click wait, then exercise the actual preset button.
  await page.evaluate(() => document.querySelector('.sheet-tabs button[data-tab="Visual Styles"]').click());
  const neon = page.getByRole('button', { name: 'Apply Neon Glow preset' });
  await expect(neon).toBeVisible({ timeout: 5000 });
  await neon.click({ timeout: 5000 });
  const changed = await page.evaluate(() => { const i = items.find(v => v.id === selected); return { color: i.color, effect: i.effect, shadow: i.shadow }; });
  expect(changed).toEqual({ color: '#ff6600', effect: 'glow', shadow: 12 });
});

test('premium mobile dock opens compact contextual controls without duplicate galleries', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.mobile-dock .an-dock-icon')).toHaveCount(5);
  await page.locator('.mobile-dock [data-panel="image"]').click();
  await expect(page.locator('.tools')).toHaveClass(/sheet-open/);
  await expect(page.locator('.an-tool-gallery')).toBeHidden();
  await expect(page.locator('.sheet-tabs button[data-tab="Image Looks"]')).toBeVisible();
  await page.locator('.sheet-tabs button[data-tab="Image Looks"]').click();
  await expect(page.locator('.an-image-gallery')).toHaveClass(/visible/);
  await page.locator('.sheet-tabs button[data-tab="Image"]').click();
  await expect(page.locator('.an-image-gallery')).not.toHaveClass(/visible/);
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await page.locator('.sheet-tabs button[data-tab="Visual Styles"]').click();
  await expect(page.locator('.an-preset-wrap')).toHaveClass(/visible/);
});

test('mobile editing sheet shows text controls without duplicated gallery and resets scroll on tab change', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await expect(page.locator('.tools')).toHaveClass(/sheet-open/);
  await expect(page.locator('.an-tool-gallery')).toBeHidden();
  await expect(page.locator('#label')).toBeVisible();
  await expect(page.locator('.sheet-tabs button.active')).toHaveText('Content');
  const height = await page.locator('.tools').evaluate(el => el.getBoundingClientRect().height);
  expect(height).toBeLessThanOrEqual(355);
  await page.locator('.mobile-dock [data-panel="button"]').click();
  await expect(page.locator('#linkPage')).toBeVisible();
  await page.locator('.mobile-dock [data-panel="screen"]').click();
  await expect(page.locator('.sheet-tabs button.active')).toHaveText('Screen');
});

test('S23 Ultra portrait keeps editor narrow while switching real CSS viewport presets', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  const device = page.locator('#device');
  for (const [value, width, height] of [
    ['320x640', 320, 640],
    ['768x1024', 768, 1024],
    ['1366x768', 1366, 768],
    ['1440x900', 1440, 900]
  ]) {
    await device.evaluate((el, next) => { el.value = next; el.dispatchEvent(new Event('change', { bubbles: true })); }, value);
    await expect(device).toHaveValue(value);
    const dims = await page.locator('.canvas').evaluate(el => ({
      ratio: getComputedStyle(el).aspectRatio,
      screenWidth: document.documentElement.clientWidth,
      canvasWidth: el.getBoundingClientRect().width
    }));
    expect(dims.ratio).toBe(width + ' / ' + height);
    expect(dims.screenWidth).toBe(384);
    expect(dims.canvasWidth).toBeLessThanOrEqual(384);
  }
});

test('mobile-hosted laptop and tablet canvas maps element coordinates proportionally', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').evaluate(el => el.click());
  for (const [width, height] of [[768, 1024], [1366, 768]]) {
    const value = width + 'x' + height;
    await page.locator('#device').evaluate((el, next) => {
      el.value = next;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    const result = await page.evaluate(() => {
      const canvas = document.querySelector('.canvas').getBoundingClientRect();
      const item = document.querySelector('.stage .item').getBoundingClientRect();
      return { canvasWidth: canvas.width, viewportWidth: document.documentElement.clientWidth,
        relativeX: (item.left - canvas.left) / canvas.width,
        relativeY: (item.top - canvas.top) / canvas.height,
        inside: item.left >= canvas.left && item.right <= canvas.right + 1 };
    });
    expect(result.canvasWidth).toBeLessThanOrEqual(result.viewportWidth);
    expect(result.relativeX).toBeGreaterThanOrEqual(0);
    expect(result.relativeX).toBeLessThan(1);
    expect(result.relativeY).toBeGreaterThanOrEqual(0);
    expect(result.inside).toBeTruthy();
  }
});

test('S23 mobile canvas zoom, pan and fit controls preserve selected breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#device').evaluate(el => {
    el.value='1366x768';
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
  const canvas=page.locator('#canvas');
  const controls=page.locator('.an-viewport-controls');
  await expect(controls).toBeVisible();
  await controls.locator('[data-view-action="in"]').click();
  await expect(canvas).toHaveAttribute('data-zoom','1.25');
  await controls.locator('[data-view-action="pan"]').click();
  await expect(controls.locator('[data-view-action="pan"]')).toHaveAttribute('aria-pressed','true');
  const before=await page.locator('.stage').evaluate(el=>getComputedStyle(el).transform);
  const bounds=await canvas.boundingBox();
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
  await page.mouse.down();
  await page.mouse.move(bounds.x+bounds.width/2+20,bounds.y+bounds.height/2+10,{steps:3});
  await page.mouse.up();
  const after=await page.locator('.stage').evaluate(el=>getComputedStyle(el).transform);
  expect(after).not.toBe(before);
  await controls.locator('[data-view-action="fit"]').click();
  await expect(canvas).toHaveAttribute('data-zoom','1');
  await expect(controls.locator('output')).toHaveText('100%');
  await expect(page.locator('#device')).toHaveValue('1366x768');
});

test('S23 touch pinch zoom uses two pointers and fit resets transform', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  const canvas=page.locator('#canvas');
  await canvas.evaluate(el=>{
    const send=(type,id,x,y)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',clientX:x,clientY:y,isPrimary:id===1}));
    send('pointerdown',1,80,140);
    send('pointerdown',2,180,140);
    send('pointermove',2,260,140);
    send('pointerup',2,260,140);
    send('pointerup',1,80,140);
  });
  await expect.poll(async()=>Number(await canvas.getAttribute('data-zoom'))).toBeGreaterThan(1);
  await page.locator('.an-viewport-controls [data-view-action="fit"]').click();
  await expect(canvas).toHaveAttribute('data-zoom','1');
});

test('S23 mobile element touch drag respects scaled stage coordinate', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').evaluate(el=>el.click());
  const item=page.locator('.stage .item').first();
  const initial=await item.evaluate(el=>parseFloat(el.style.left));
  const box=await item.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+24,box.y+box.height/2+8,{steps:4});
  await page.mouse.up();
  const moved=await item.evaluate(el=>parseFloat(el.style.left));
  expect(moved).toBeGreaterThan(initial);
});

test('zoomed laptop canvas drag uses transformed coordinates and fit restores layout', async ({ page }) => {
  test.setTimeout(15000);
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#device').evaluate(el => {
    el.value='1366x768';
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.locator('#text').evaluate(el => el.click());
  await page.locator('.an-viewport-controls [data-view-action="in"]').evaluate(el => el.click());
  await expect(page.locator('#canvas')).toHaveAttribute('data-zoom','1.25');
  const result=await page.locator('.stage .item').first().evaluate(el => {
    const before=parseFloat(el.style.left);
    const bounds=el.getBoundingClientRect();
    const x=bounds.left+Math.min(10,bounds.width/2);
    const y=bounds.top+Math.min(10,bounds.height/2);
    const fire=(target,type,clientX,clientY)=>target.dispatchEvent(new PointerEvent(type,{
      bubbles:true,cancelable:true,pointerId:19,pointerType:'mouse',button:0,buttons:type==='pointerup'?0:1,clientX,clientY
    }));
    fire(el,'pointerdown',x,y);
    fire(window,'pointermove',x+16,y);
    fire(window,'pointerup',x+16,y);
    return {before,after:parseFloat(el.style.left)};
  });
  expect(result.after).toBeGreaterThan(result.before);
  await page.locator('.an-viewport-controls [data-view-action="fit"]').evaluate(el => el.click());
  await expect(page.locator('#canvas')).toHaveAttribute('data-zoom','1');
  await expect(page.locator('#device')).toHaveValue('1366x768');
});

test('stage 3 mobile text creation and image replace action labels follow selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await expect(page.locator('.sheet-actions button[aria-label="Add Text"]')).toBeVisible();
  await page.locator('.sheet-actions button[aria-label="Add Text"]').click();
  await expect(page.locator('.stage .item[data-type="text"]')).toHaveCount(1);
  await page.locator('.mobile-dock [data-panel="image"]').click();
  await expect(page.locator('.sheet-actions button[aria-label="Add Image"]')).toBeVisible();
});

test('stage 3 mobile text edit and effect survive save and reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  page.on('dialog', dialog => dialog.accept());
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').evaluate(el=>el.click());
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await page.locator('#label').fill('Stage 3 mobile heading');
  await page.locator('.sheet-tabs button[data-tab="Animation"]').click();
  await page.locator('#effect').selectOption('pulse');
  await page.locator('#save').evaluate(el=>el.click());
  await page.reload();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('an-mve-v1')));
  const item=stored.pages[stored.pageIndex].items.find(i=>i.type==='text');
  expect(item.label).toBe('Stage 3 mobile heading');
  expect(item.effect).toBe('pulse');
  await expect(page.locator('.stage .item[data-type="text"]')).toHaveCount(1);
});

test('stage 3 mobile image upload and replace preserve identity after reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  page.on('dialog', dialog => dialog.accept());
  await page.goto('http://127.0.0.1:4173/');
  const pixel=Buffer.from(await page.evaluate(() => { const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;canvas.getContext('2d').fillRect(0,0,2,2);return canvas.toDataURL('image/png').split(',')[1] }), 'base64');
  await page.locator('#image').setInputFiles({name:'first.png',mimeType:'image/png',buffer:pixel});
  await expect(page.locator('.stage .item[data-type="image"]')).toHaveCount(1);
  const id=await page.locator('.stage .item[data-type="image"]').getAttribute('data-item-id');
  await page.locator('.mobile-dock [data-panel="image"]').click();
  await expect(page.locator('.sheet-actions button[aria-label="Replace Selected Image"]')).toBeVisible();
  await page.locator('#image').setInputFiles({name:'replacement.png',mimeType:'image/png',buffer:pixel});
  await expect(page.locator('.stage .item[data-type="image"]')).toHaveCount(1);
  await expect(page.locator('.stage .item[data-type="image"]')).toHaveAttribute('data-item-id',id);
  await page.locator('#save').evaluate(el=>el.click());
  await page.reload();
  await expect(page.locator('.stage .item[data-type="image"]')).toHaveAttribute('data-item-id',id);
});

test('premium editor chrome uses black orange white instead of legacy purple on S23', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  const colors=await page.evaluate(()=>{
    const header=getComputedStyle(document.querySelector('header'));
    const dock=getComputedStyle(document.querySelector('.mobile-dock'));
    return {header:header.backgroundColor,dock:dock.backgroundColor,border:dock.borderTopColor};
  });
  expect(colors.header).toBe('rgb(16, 16, 16)');
  expect(colors.dock).toBe('rgb(16, 16, 16)');
  const styles=await page.evaluate(()=>[...document.querySelectorAll('style')].map(x=>x.textContent).join(''));
  expect(styles).not.toContain('#7220b5');
  expect(styles).not.toContain('#8b25e8');
});

test('stage 3 selected text opens editable content in compact mobile bottom sheet', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 854 });
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#text').evaluate(el=>el.click());
  await page.locator('.mobile-dock [data-panel="text"]').click();
  const edit=page.getByRole('button',{name:'Edit Selected Text'});
  await expect(edit).toBeVisible();
  await edit.click();
  await expect(page.locator('.sheet-tabs button[data-tab="Content"]')).toHaveClass(/active/);
  await expect(page.locator('#label')).toBeFocused();
  await page.locator('#label').fill('Updated mobile heading');
  await expect(page.locator('.stage .item[data-type="text"]')).toContainText('Updated mobile heading');
});

test('reference mobile editor has framed device presets and working navigation', async ({page})=>{
  await page.setViewportSize({width:384,height:854});
  await page.goto('http://127.0.0.1:4173/');
  const bar=page.locator('.an-reference-screenbar');
  await expect(bar).toBeVisible();
  await bar.getByRole('button',{name:'Tablet'}).click();
  await expect(page.locator('#device')).toHaveValue('768x1024');
  await expect(page.locator('#canvas')).toHaveAttribute('data-an-frame','tablet');
  await bar.getByRole('button',{name:'Laptop'}).click();
  await expect(page.locator('#device')).toHaveValue('1366x768');
  await expect(page.locator('#canvas')).toHaveAttribute('data-an-frame','laptop');
  await bar.getByRole('button',{name:'Mobile'}).click();
  await expect(page.locator('#device')).toHaveValue('390x844');
  await expect(page.locator('#canvas')).toHaveAttribute('data-an-frame','mobile');
  await expect(page.locator('.mobile-dock [data-editor-shortcut="save"]')).toBeVisible();
  await expect(page.locator('.mobile-dock [data-panel="text"]')).toBeVisible();
  const width=await page.locator('#canvas').evaluate(el=>el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(384);
});

test('reference layout fits device frame between selectors and dock on S23 portrait', async ({page})=>{
  await page.setViewportSize({width:384,height:854});
  await page.goto('http://127.0.0.1:4173/');
  for(const [name,value] of [['Mobile','390x844'],['Tablet','768x1024'],['Laptop','1366x768']]){
    await page.locator('.an-reference-screenbar').getByRole('button',{name}).click();
    await expect(page.locator('#device')).toHaveValue(value);
    const metrics=await page.evaluate(()=>{
      const bar=document.querySelector('.an-reference-screenbar').getBoundingClientRect();
      const canvas=document.querySelector('#canvas').getBoundingClientRect();
      const dock=document.querySelector('.mobile-dock').getBoundingClientRect();
      return {barBottom:bar.bottom,canvasTop:canvas.top,canvasBottom:canvas.bottom,dockTop:dock.top,width:canvas.width};
    });
    expect(metrics.canvasTop).toBeGreaterThanOrEqual(metrics.barBottom);
    expect(metrics.canvasBottom).toBeLessThanOrEqual(metrics.dockTop+1);
    expect(metrics.width).toBeLessThanOrEqual(384);
  }
  await expect(page.locator('.mobile-dock [data-editor-shortcut="publish"]')).toBeVisible();
});

test('editor boot has no JavaScript page errors and reference controls initialize',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:384,height:854});
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.an-reference-screenbar')).toBeVisible();
  await expect(page.locator('.mobile-dock [data-editor-shortcut="save"]')).toBeVisible();
  await page.locator('#text').evaluate(el=>el.click());
  await expect(page.locator('.stage .item[data-type="text"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('final premium S23 chrome exposes menu, zoom fit and fixed toolbar without page errors', async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:384,height:854});
  await page.goto('http://127.0.0.1:4173/');
  const menu=page.getByRole('button',{name:'Open editor menu'});
  await expect(menu).toBeVisible();
  await expect(page.locator('#canvas')).toHaveAttribute('data-an-frame','mobile');
  await page.locator('#canvas [data-view-action="in"]').click();
  await expect(page.locator('#canvas')).toHaveAttribute('data-zoom',/1\.25|1\.2/);
  await page.locator('.an-reference-screenbar').getByRole('button',{name:'Fit'}).click();
  await expect(page.locator('#canvas')).toHaveAttribute('data-zoom','1');
  await menu.click();
  await expect(page.locator('.tools')).toHaveClass(/sheet-open/);
  await page.locator('#closeSheet').click();
  await expect(page.locator('.tools')).not.toHaveClass(/sheet-open/);
  await expect(page.locator('.mobile-dock [data-editor-shortcut="save"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('final release keeps seven built-in websites and custom registry unchanged across editor save and page navigation',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  const baseline=await page.evaluate(()=>({builtins:ownedWebsites.map(x=>x.slice()),extras:localStorage.getItem('an-mve-extra-websites-v1')}));
  expect(baseline.builtins).toHaveLength(7);
  expect(new Set(baseline.builtins.map(x=>x[1])).size).toBe(7);
  page.on('dialog',d=>d.accept(d.type()==='prompt'?'QA Temporary Page':undefined));
  await page.locator('#newPage').click();
  await page.locator('#page').selectOption('0');
  await page.locator('#text').click();
  await page.locator('#label').fill('Registry Preservation QA');
  await page.locator('#save').click();
  await page.reload();
  const after=await page.evaluate(()=>({builtins:ownedWebsites.map(x=>x.slice()),extras:localStorage.getItem('an-mve-extra-websites-v1')}));
  expect(after).toEqual(baseline);
  await page.getByRole('button',{name:'My Websites'}).click();
  const dialog=page.getByRole('dialog',{name:'My Websites'});
  await expect(dialog.locator('.website-row')).toHaveCount(8);
  for(const [name] of baseline.builtins)await expect(dialog.getByText(name,{exact:true})).toBeVisible();
});
test('publish control accurately explains manual export instead of claiming remote publishing',async({page})=>{
  await page.setViewportSize({width:384,height:824});
  await page.goto('http://127.0.0.1:4173/');
  let notice='';
  page.once('dialog',d=>{notice=d.message();d.accept()});
  await page.locator('.mobile-dock [data-editor-shortcut="publish"]').click();
  expect(notice).toContain('does not automatically publish');
  expect(notice).toContain('Export HTML');
});

test('isolated demo website creates two editable pages, navigates and survives save reload without changing website registry',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 const before=await page.evaluate(()=>({owned:JSON.stringify(ownedWebsites),extra:localStorage.getItem('an-mve-extra-websites-v1')}));
 await page.getByRole('button',{name:'My Websites'}).click();
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:'Edit Eighth Live Demo Website'}).click();
 await expect(page.locator('#page option')).toHaveCount(2);
 await expect(page.locator('#currentPageTitle')).toHaveText('Demo Home');
 await page.locator('.item[data-type="button"]').click();
 await expect(page.locator('#linkPage')).toHaveValue('1');
 await page.locator('#save').click();
 await page.reload();
 await expect(page.locator('#currentPageTitle')).toHaveText('Demo Home');
 await expect(page.locator('#page option')).toHaveCount(2);
 const after=await page.evaluate(()=>({owned:JSON.stringify(ownedWebsites),extra:localStorage.getItem('an-mve-extra-websites-v1')}));
 expect(after).toEqual(before);
});

test('eighth live demo appears as removable website and demo publishing is isolated',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'My Websites'}).click();
 const dialog=page.getByRole('dialog',{name:'My Websites'});
 await expect(dialog.locator('.website-row')).toHaveCount(8);
 const demo=dialog.locator('.website-row').filter({hasText:'AN Live Demo Website'});
 await expect(demo.getByRole('button',{name:'Edit Demo Website'})).toBeVisible();
 await expect(demo.getByRole('link',{name:/Live Website/})).toHaveAttribute('href',/\/demo-site\/$/);
 await page.locator('#closeWebsites').click();
 let notice='';
 page.once('dialog',d=>{notice=d.message();d.accept()});
 await page.locator('#publishDemo').click();
 expect(notice).toContain('Only the isolated two-page demo');
 await page.getByRole('button',{name:'My Websites'}).click();
 const removable=dialog.locator('.website-row').filter({hasText:'AN Live Demo Website'});
 page.once('dialog',d=>d.accept());
 await removable.getByRole('button',{name:'Remove AN Live Demo Website'}).click();
 await expect(dialog.locator('.website-row')).toHaveCount(7);
 await page.reload();
 await page.getByRole('button',{name:'My Websites'}).click();
 await expect(page.getByRole('dialog',{name:'My Websites'}).locator('.website-row')).toHaveCount(7);
});
