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
test('mobile contextual editor, component and export',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="text"]').click();
 await expect(page.locator('.tools')).toBeVisible();
 await page.locator('#closeSheet').click();
 await page.locator('.mobile-dock [data-panel="page"]').click();
 await page.getByRole('button',{name:'Components',exact:true}).click();
 await expect(page.locator('.sheet-tabs button.active')).toHaveText('Components');
 await page.locator('#closeSheet').click();
 await page.locator('.mobile-dock [data-panel="screen"]').click();
 await page.getByRole('button',{name:'Export',exact:true}).click();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('.sheet-actions button').filter({hasText:'Export HTML'}).click();
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

test('mobile content deletion is confirmed and undo restores item',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="text"]').click();
 await page.locator('.sheet-actions button').filter({hasText:'+ Text'}).click();
 await expect(page.locator('.item')).toHaveCount(1);
 // The Text sheet is already open: tapping its dock button again closes it.
 await expect(page.locator('.tools')).toBeVisible();
 await expect(page.getByRole('button',{name:'Delete Selected Content'})).toBeVisible();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Delete Selected Content'}).click();
 await expect(page.locator('.item')).toHaveCount(0);
 await page.locator('#undo').click();
 await expect(page.locator('.item')).toHaveCount(1);
});
