const {test,expect}=require('@playwright/test');
for(const viewport of [{width:768,height:1024},{width:800,height:1280}]){
 test('tablet portrait canvas and contextual tools '+viewport.width,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#canvas')).toBeVisible();
  await expect(page.locator('.mobile-dock')).toBeVisible();
  await expect(page.locator('.tools')).toBeHidden();
  const geometry=await page.evaluate(()=>{
   const canvas=document.querySelector('#canvas').getBoundingClientRect();
   const dock=document.querySelector('.mobile-dock').getBoundingClientRect();
   return {canvasTop:canvas.top,canvasBottom:canvas.bottom,canvasWidth:canvas.width,dockTop:dock.top,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.canvasWidth).toBeGreaterThan(250);
  expect(geometry.canvasBottom).toBeLessThanOrEqual(geometry.dockTop+2);
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await expect(page.locator('.tools')).toBeVisible();
  await page.locator('#closeSheet').click();
  await expect(page.locator('.tools')).toBeHidden();
  await page.locator('#text').click({timeout:6000});
  await expect(page.locator('.item')).toHaveCount(1);
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await page.locator('#label').fill('Tablet saved text');
  await expect(page.locator('.item')).toContainText('Tablet saved text');
  await page.locator('#closeSheet').click();
  page.once('dialog',d=>d.accept());
  await page.locator('#save').click({timeout:6000});
  await page.reload();
  await expect(page.locator('.item')).toContainText('Tablet saved text');
  await page.locator('#device').selectOption('390x844',{timeout:6000});
  await expect(page.locator('#device')).toHaveValue('390x844');
 });
}

test('tablet inline text hides editing chrome while preserving canvas',async({page})=>{
 await page.setViewportSize({width:800,height:1280});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('.item[data-type="text"] .content').first().click({timeout:6000});
 await expect(page.locator('body')).toHaveClass(/an-tablet-typing/);
 await expect(page.locator('.tools')).toBeHidden();
 await expect(page.locator('#canvas')).toBeVisible();
 await page.locator('.item[data-type="text"] .content').first().press('Escape');
 await expect(page.locator('body')).not.toHaveClass(/an-tablet-typing/);
});
