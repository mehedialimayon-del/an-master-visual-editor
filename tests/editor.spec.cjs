const { test, expect } = require('@playwright/test');
test('desktop controls and page history',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'+ Text'}).click();
 await expect(page.locator('.item')).toHaveCount(1);
 await page.locator('#label').fill('QA Desktop');
 await expect(page.locator('.item')).toContainText('QA Desktop');
 await page.locator('#undo').click();
 await expect(page.locator('.item')).toHaveCount(1);
 await page.locator('#redo').click();
 await expect(page.locator('.item')).toContainText('QA Desktop');
 page.once('dialog',d=>d.accept());
 await page.locator('#save').click();
 await page.reload();
 await expect(page.locator('.item')).toHaveCount(1);
 page.once('dialog',d=>d.accept('Second Page'));
 await page.locator('#newPage').click();
 await page.locator('#page').selectOption('0');
});
test('mobile layout, component and export',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 page.once('dialog',d=>d.accept('Saved Text'));
 await page.locator('#saveComponent').click();
 await page.locator('#components').selectOption('0');
 await page.locator('#insertComponent').click();
 await expect(page.locator('.item')).toHaveCount(2);
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#export').click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('visual-site.html');
});

test('canvas-first mobile interface shows dock and contextual tools',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await expect(page.locator('.mobile-dock')).toBeVisible();
 await expect(page.locator('.tools')).toBeHidden();
 await page.locator('.mobile-dock [data-panel="screen"]').click();
 await expect(page.locator('.tools')).toBeVisible();
 await expect(page.locator('#sheetTitle')).toHaveText('Screen & Layout');
 await page.locator('#closeSheet').click();
 await expect(page.locator('.tools')).toBeHidden();
 await expect(page.locator('#canvas')).toBeVisible();
});
