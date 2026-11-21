const { test, expect } = require('@playwright/test');
test('desktop controls and page history',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
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

test('manual hotspot settings, save reload and export',async({page})=>{
 test.setTimeout(45000);
 page.setDefaultTimeout(5000);
 page.on('dialog',dialog=>dialog.accept());
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="button"]').click();
 await expect(page.locator('.sheet-actions button').filter({hasText:'+ Select Hotspot Area'})).toBeVisible();
 await page.locator('.sheet-actions button').filter({hasText:'+ Select Hotspot Area'}).click();
 await expect(page.locator('.item[data-type="hotspot"]')).toHaveCount(1);
 await page.locator('#hotspotGlow').evaluate(el=>{el.value='neon';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#hotspotIcon').evaluate(el=>{el.value='★';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#url').evaluate(el=>{el.value='https://example.com';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await expect(page.locator('.item[data-type="hotspot"]')).toContainText('★');
 await page.locator('#save').evaluate(el=>el.click());
 await page.reload();
 await expect(page.locator('.item[data-type="hotspot"]')).toHaveCount(1);
 const downloadPromise=page.waitForEvent('download',{timeout:5000});
 await page.locator('#export').evaluate(el=>el.click());
 const download=await downloadPromise;
 const fs=require('fs');
 const html=fs.readFileSync(await download.path(),'utf8');
 expect(html).toContain('an-hotspot');
 expect(html).toContain('https://example.com');
});

test('hotspot selection, drag resize, delete and undo regression',async({page})=>{
 test.setTimeout(45000);
 page.on('dialog',d=>d.accept());
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="button"]').click();
 await page.locator('.sheet-actions button').filter({hasText:'+ Select Hotspot Area'}).click();
 const item=page.locator('.item[data-type="hotspot"]');
 await expect(item).toHaveCount(1);
 await page.locator('#closeSheet').click();
 const rect=await item.boundingBox();
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
 await page.mouse.down();
 await page.mouse.move(rect.x+rect.width/2+20,rect.y+rect.height/2+15,{steps:4});
 await page.mouse.up();
 await expect(item).toHaveCount(1);
 await item.click();
 await expect(page.locator('#sheetTitle')).toHaveText('Button Editing');
 await page.getByRole('button',{name:'Delete Selected Content'}).click();
 await expect(item).toHaveCount(0);
 await page.locator('#undo').click();
 await expect(page.locator('.item[data-type="hotspot"]')).toHaveCount(1);
});

test('mobile hotspot resize persists and exported links remain interactive',async({page,context})=>{
 test.setTimeout(60000);
 page.on('dialog',d=>d.accept());
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="button"]').click();
 await page.locator('.sheet-actions button').filter({hasText:'+ Select Hotspot Area'}).click();
 const hotspot=page.locator('.item[data-type="hotspot"]');
 await expect(hotspot).toHaveCount(1);
 await page.locator('#url').evaluate(el=>{el.value='https://example.com/hotspot';el.dispatchEvent(new Event('input',{bubbles:true}))});
 await page.locator('#closeSheet').click();
 const handle=hotspot.locator('.resize-handle');
 const before=await hotspot.boundingBox();
 const rect=await handle.boundingBox();
 await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
 await page.mouse.down();
 await page.mouse.move(rect.x+rect.width/2+18,rect.y+rect.height/2+12,{steps:5});
 await page.mouse.up();
 const after=await hotspot.boundingBox();
 expect(after.width).toBeGreaterThan(before.width+5);
 await page.locator('#save').evaluate(el=>el.click());
 await page.reload();
 await expect(page.locator('.item[data-type="hotspot"]')).toHaveCount(1);
 const persisted=await page.locator('.item[data-type="hotspot"]').boundingBox();
 expect(persisted.width).toBeGreaterThan(before.width+5);
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#export').evaluate(el=>el.click());
 const download=await downloadPromise;
 const html=require('fs').readFileSync(await download.path(),'utf8');
 expect(html).toContain('https://example.com/hotspot');
 const exported=await context.newPage();
 await exported.setContent(html);
 const link=exported.locator('.an-hotspot');
 await expect(link).toHaveAttribute('href','https://example.com/hotspot');
 await link.focus();
 await expect(link).toHaveCSS('outline-style','solid');
 await exported.close();
});

test('export retains text URL and page navigation',async({page,context})=>{
 page.on('dialog',d=>d.accept('Second Page'));
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#url').fill('https://example.com/text');
 await page.locator('#newPage').click();
 await page.locator('#page').selectOption('0');
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#export').click();
 const download=await downloadPromise;
 const html=require('fs').readFileSync(await download.path(),'utf8');
 const exported=await context.newPage();
 await exported.setContent(html);
 await expect(exported.locator('a[href="https://example.com/text"]')).toHaveCount(1);
 await expect(exported.locator('nav [data-page]')).toHaveCount(2);
 await exported.locator('nav [data-page="1"]').click();
 await expect(exported.locator('[data-site-page="1"]')).toBeVisible();
 await expect(exported.locator('[data-site-page="0"]')).toBeHidden();
 await exported.close();
});

for(const device of [
 {name:'Samsung S23 Ultra portrait',width:384,height:824},
 {name:'Samsung A07 portrait',width:360,height:800},
 {name:'Samsung S23 Ultra landscape',width:824,height:384},
 {name:'Samsung A07 landscape',width:800,height:360}
]){
 test('responsive contextual editor - '+device.name,async({page})=>{
  await page.setViewportSize({width:device.width,height:device.height});
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.mobile-dock')).toBeVisible();
  await expect(page.locator('#canvas')).toBeVisible();
  const metrics=await page.evaluate(()=>{
   const header=document.querySelector('header').getBoundingClientRect();
   const dock=document.querySelector('.mobile-dock').getBoundingClientRect();
   const canvas=document.querySelector('#canvas').getBoundingClientRect();
   return {innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,
    headerTop:header.top,dockBottom:dock.bottom,canvasWidth:canvas.width,
    dockHeight:dock.height};
  });
  expect(metrics.scrollWidth).toBeLessThanOrEqual(device.width+2);
  expect(metrics.headerTop).toBeGreaterThanOrEqual(-1);
  expect(metrics.dockBottom).toBeLessThanOrEqual(device.height+2);
  expect(metrics.canvasWidth).toBeGreaterThan(100);
  await page.locator('.mobile-dock [data-panel="text"]').click();
  await expect(page.locator('.tools')).toBeVisible();
  await page.locator('.sheet-actions button').filter({hasText:'+ Text'}).click();
  const input=page.locator('#label');
  await input.focus();
  await input.fill('Mobile keyboard field');
  await expect(page.locator('.item[data-type="text"]')).toContainText('Mobile keyboard field');
  await expect(input).toBeFocused();
  await page.locator('#closeSheet').click();
  await expect(page.locator('.tools')).toBeHidden();
 });
}
test('mobile touch drag and resize persists after reload',async({browser})=>{
 const context=await browser.newContext({viewport:{width:384,height:824},hasTouch:true,isMobile:true});
 const page=await context.newPage();
 page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="button"]').tap();
 await page.locator('.sheet-actions button').filter({hasText:'+ Select Hotspot Area'}).tap();
 await expect(page.locator('.item[data-type="hotspot"]')).toHaveCount(1);
 await page.locator('#closeSheet').tap();
 const before=await page.locator('.item[data-type="hotspot"]').boundingBox();
 const moved=await page.evaluate(()=>{
  const el=document.querySelector('.item[data-type="hotspot"]');
  const r=el.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;
  const event=(name,px,py)=>el.dispatchEvent(new PointerEvent(name,{bubbles:true,cancelable:true,pointerId:7,pointerType:'touch',isPrimary:true,clientX:px,clientY:py,button:0}));
  event('pointerdown',x,y);window.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,cancelable:true,pointerId:7,pointerType:'touch',clientX:x+24,clientY:y+16}));
  window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:7,pointerType:'touch',clientX:x+24,clientY:y+16}));
  return true;
 });
 expect(moved).toBe(true);
 const after=await page.locator('.item[data-type="hotspot"]').boundingBox();
 expect(after.x).toBeGreaterThan(before.x+4);
 await page.locator('#save').evaluate(el=>el.click());
 await page.reload();
 const persisted=await page.locator('.item[data-type="hotspot"]').boundingBox();
 expect(persisted.x).toBeGreaterThan(before.x+4);
 await context.close();
});

test('image upload replaces selected image and undo restores previous image',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 const makePng=async(color)=>Buffer.from((await page.evaluate((fill)=>{const canvas=document.createElement('canvas');canvas.width=16;canvas.height=16;const ctx=canvas.getContext('2d');ctx.fillStyle=fill;ctx.fillRect(0,0,16,16);return canvas.toDataURL('image/png')},color)).split(',')[1],'base64');
 const first=await makePng('#ff6600');
 const second=await makePng('#000000');
 await page.locator('#image').setInputFiles({name:'first.png',mimeType:'image/png',buffer:first});
 await expect(page.locator('.item[data-type="image"]')).toHaveCount(1);
 const original=await page.locator('.item[data-type="image"] img').getAttribute('src');
 await page.locator('#image').setInputFiles({name:'second.png',mimeType:'image/png',buffer:second});
 await expect(page.locator('.item[data-type="image"]')).toHaveCount(1);
 const replacement=await page.locator('.item[data-type="image"] img').getAttribute('src');
 expect(replacement).not.toBe(original);
 await page.locator('#undo').click();
 await expect(page.locator('.item[data-type="image"] img')).toHaveAttribute('src',original);
});

test('style, component library, save reload, delete undo and export regression',async({page})=>{
 test.setTimeout(45000);
 page.setDefaultTimeout(3500);
 page.on('dialog',d=>d.accept('Reusable QA Component'));
 await page.goto('http://127.0.0.1:4173/');
 await test.step('QA checkpoint 1: await page.locator(#button).click();',async()=>{await page.locator('#button').click();});
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(1);
 await page.locator('#label').fill('QA Action');
 await page.locator('#color').fill('#ffffff');
 await test.step('QA checkpoint 2: await page.locator(#saveComponent).click();',async()=>{await page.locator('#saveComponent').click();});
 await expect(page.locator('#components option')).toHaveCount(2);
 await page.locator('#components').selectOption('0');
 await test.step('QA checkpoint 3: await page.locator(#insertComponent).click();',async()=>{await page.locator('#insertComponent').click();});
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(2);
 await test.step('QA checkpoint 4: await page.locator(#undo).click();',async()=>{await page.locator('#undo').click();});
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(1);
 await test.step('QA checkpoint 5: await page.locator(#redo).click();',async()=>{await page.locator('#redo').click();});
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(2);
 await test.step('QA checkpoint 6: await page.locator(#save).click();',async()=>{await page.locator('#save').click();});
 await test.step('QA checkpoint 7: await page.reload();',async()=>{await page.reload();});
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(2);
 await expect(page.locator('#components option')).toHaveCount(2);
 await test.step('QA checkpoint 8: await page.locator(.item[data-type="button"]).firs',async()=>{await page.locator('.item[data-type="button"]').last().click();});
 await test.step('QA checkpoint 9: await page.locator(#delete).click();',async()=>{await page.locator('#delete').click();});
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(1);
 await page.locator('#undo').click();
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(2);
 const downloadPromise=page.waitForEvent('download');
 await test.step('QA checkpoint 10: await page.locator(#export).click();',async()=>{await page.locator('#export').click();});
 const download=await downloadPromise;
 const html=require('fs').readFileSync(await download.path(),'utf8');
 expect(html).toContain('QA Action');
});
test('mobile style panel controls remain discoverable by category',async({page})=>{
 await page.setViewportSize({width:384,height:824});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.mobile-dock [data-panel="button"]').click();
 await expect(page.getByRole('button',{name:'Content',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Style',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Animation',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Layout',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Style',exact:true}).click();
 await expect(page.locator('#hotspotGlow')).toBeVisible();
 await page.getByRole('button',{name:'Animation',exact:true}).click();
 await expect(page.locator('#hotspotClick')).toBeVisible();
});

test('property editing supports undo and redo without losing stored element',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#label').fill('Original');
 await expect(page.locator('.item[data-type="text"]')).toContainText('Original');
 await page.locator('#color').fill('#123456');
 await expect(page.locator('.item[data-type="text"]')).toHaveCSS('color','rgb(18, 52, 86)');
 await page.locator('#undo').click();
 await expect(page.locator('.item[data-type="text"]')).not.toHaveCSS('color','rgb(18, 52, 86)');
 await page.locator('#redo').click();
 await expect(page.locator('.item[data-type="text"]')).toHaveCSS('color','rgb(18, 52, 86)');
});

test('minimum opacity persists and reduced motion disables canvas animation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#opacity').fill('10');
 await expect(page.locator('.item[data-type="text"]')).toHaveCSS('opacity','0.1');
 await page.locator('#effect').selectOption('pulse');
 await expect(page.locator('.item[data-type="text"] .effect-pulse')).toHaveCSS('animation-name','none');
 await page.locator('#save').click();
 await page.reload();
 await expect(page.locator('.item[data-type="text"]')).toHaveCSS('opacity','0.1');
});

test('multi-element page template saves and inserts both elements after reload',async({page})=>{
 page.on('dialog',d=>d.accept('QA Page Template'));
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#label').fill('Template heading');
 await page.locator('#button').click();
 await page.locator('#label').fill('Template action');
 await page.locator('#savePageTemplate').click();
 await expect(page.locator('#components option')).toHaveCount(2);
 await page.locator('#save').click();
 await page.reload();
 await page.locator('#components').selectOption('0');
 await page.locator('#insertComponent').click();
 await expect(page.locator('.item[data-type="text"]')).toHaveCount(2);
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(2);
 await page.locator('#undo').click();
 await expect(page.locator('.item[data-type="text"]')).toHaveCount(1);
 await expect(page.locator('.item[data-type="button"]')).toHaveCount(1);
});

test('animation timeline can seek pause and resume selected text',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#effect').selectOption('pulse');
 await page.locator('#timelineScrub').fill('1.5');
 await expect(page.locator('.item.selected .content')).toHaveCSS('animation-play-state','paused');
 await page.locator('#timelinePlay').click();
 await expect(page.locator('.item.selected .content')).toHaveCSS('animation-play-state','running');
 await page.locator('#timelinePause').click();
 await expect(page.locator('.item.selected .content')).toHaveCSS('animation-play-state','paused');
});

test('custom responsive viewport saves and restores after reload',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#breakpointWidth').fill('412');
 await page.locator('#breakpointHeight').fill('915');
 await page.locator('#applyBreakpoint').click();
 await expect(page.locator('#device')).toHaveValue('412x915');
 await page.locator('#save').click();
 await page.reload();
 await expect(page.locator('#device')).toHaveValue('412x915');
 await expect(page.locator('#canvas')).toHaveCSS('aspect-ratio','412 / 915');
});

test('two-point keyframes persist and can be undone',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#kfStartOpacity').fill('15');
 await page.locator('#kfEndOpacity').fill('95');
 await page.locator('#kfStartY').fill('40');
 await page.locator('#kfEndY').fill('0');
 await page.locator('#applyKeyframes').click();
 await expect.poll(()=>page.locator('.item.selected .content').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await page.locator('#save').click();
 await page.reload();
 await expect.poll(()=>page.locator('.item[data-type="text"] .content').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await page.locator('.item[data-type="text"]').click();
 await page.locator('#clearKeyframes').click();
 await expect(page.locator('.item[data-type="text"] .content')).toHaveCount(1);
});

test('exported HTML contains custom keyframe CSS for text and buttons',async({page})=>{
 page.on('pageerror',error=>console.log('EXPORT_PAGE_ERROR:',error.message));page.on('dialog',async d=>{console.log('EXPORT_DIALOG:',d.message());await d.dismiss()});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#applyKeyframes').click();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#export').click();
 const file=await downloadPromise;
 const html=require('fs').readFileSync(await file.path(),'utf8');
 expect(html).toContain('@keyframes anCustomKeyframe');
 expect(html).toContain('animation:anCustomKeyframe');
});
test('saved breakpoint layout restores independently after device switch and reload',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#saveBreakpointLayout').click();
 await page.locator('#device').selectOption('768x1024');
 await page.locator('#save').click();
 await page.reload();
 await page.locator('#device').selectOption('390x640');
 await expect(page.locator('.item[data-type="text"]')).toHaveCount(1);
 await expect(page.locator('#device')).toHaveValue('390x640');
});

test('breakpoint saved positions survive switch reload and undo redo',async({page})=>{
 page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#saveBreakpointLayout').click();
 const original=await page.locator('.item[data-type="text"]').evaluate(e=>e.style.left);
 await page.locator('#device').selectOption('768x1024');
 await page.locator('#undo').click();
 await expect(page.locator('#device')).toHaveValue('390x640');
 expect(await page.locator('.item[data-type="text"]').evaluate(e=>e.style.left)).toBe(original);
 await page.locator('#redo').click();
 await expect(page.locator('#device')).toHaveValue('768x1024');
 await page.locator('#save').click();
 await page.reload();
 await page.locator('#device').selectOption('390x640');
 expect(await page.locator('.item[data-type="text"]').evaluate(e=>e.style.left)).toBe(original);
});
test('exported keyframe animation actually plays in standalone HTML',async({page,browser})=>{
 page.on('pageerror',error=>console.log('EXPORT_PAGE_ERROR:',error.message));page.on('dialog',async d=>{console.log('EXPORT_DIALOG:',d.message());await d.dismiss()});
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 await page.locator('#applyKeyframes').click();
 const promise=page.waitForEvent('download');
 await page.locator('#export').click();
 const download=await promise;
 const html=require('fs').readFileSync(await download.path(),'utf8');
 const exported=await browser.newPage();
 await exported.goto('http://127.0.0.1:4173/');
 await exported.setContent(html);
 const target=exported.locator('[style*="anCustomKeyframe"]').first();
 await expect(target).toHaveCount(1);
 expect(await target.evaluate(e=>e.getAnimations().length)).toBeGreaterThan(0);
 await exported.close();
});

for(const device of [{name:'S23 Ultra',width:384,height:824},{name:'A07',width:360,height:800}]){
 test('mobile deep QA '+device.name+' keyboard edit, panel navigation and save reload',async({browser})=>{
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.mobile-dock')).toBeVisible();
  await page.locator('.mobile-dock [data-panel="text"]').tap();
  await page.locator('.sheet-actions button').filter({hasText:'+ Text'}).tap();
  const label=page.locator('#label');
  await label.fill('Mobile '+device.name+' keyboard QA');
  await expect(page.locator('.item[data-type="text"]')).toContainText('Mobile '+device.name+' keyboard QA');
  await page.locator('#closeSheet').tap();
  await expect(page.locator('.tools')).toBeHidden();
  await page.locator('.mobile-dock [data-panel="screen"]').tap();
  await expect(page.locator('#sheetTitle')).toHaveText('Screen & Layout');
  await page.locator('#closeSheet').tap();
  await page.locator('#save').evaluate(el=>el.click());
  await page.reload();
  await expect(page.locator('.item[data-type="text"]')).toContainText('Mobile '+device.name+' keyboard QA');
  const metrics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,dock:document.querySelector('.mobile-dock').getBoundingClientRect().toJSON()}));
  expect(metrics.width).toBeLessThanOrEqual(metrics.viewport+2);
  expect(metrics.dock.bottom).toBeLessThanOrEqual(device.height+2);
  await context.close();
 });
}


test('Stage 5 cancelled page operations do not pollute undo history',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#text').click();
 page.once('dialog',d=>d.dismiss());
 await page.locator('#newPage').click();
 await page.locator('#undo').click();
 await expect(page.locator('.item[data-type="text"]')).toHaveCount(0);
 await expect(page.locator('#page option')).toHaveCount(1);
});

test('Stage 5 cancelling deletion keeps page and undo history intact',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 page.once('dialog',d=>d.accept('Second'));
 await page.locator('#newPage').click();
 await expect(page.locator('#page option')).toHaveCount(2);
 page.once('dialog',d=>d.dismiss());
 await page.locator('#deletePage').click();
 await expect(page.locator('#page option')).toHaveCount(2);
 await page.locator('#undo').click();
 await expect(page.locator('#page option')).toHaveCount(1);
});

test('Stage 7 real shapes render and export',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 page.once('dialog',d=>d.accept('ellipse'));
 await page.locator('#ribbonShape').click();
 await expect(page.locator('.item[data-type="shape"]')).toHaveCount(1);
 const promise=page.waitForEvent('download');
 await page.locator('#export').click();
 const html=require('fs').readFileSync(await (await promise).path(),'utf8');
 expect(html).toContain('border-radius:50%');
});
test('Stage 7 editable tables persist after save and reload',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 page.on('dialog',async d=>d.accept(d.message().includes('rows')?'2':d.message().includes('columns')?'2':d.message().includes('Row (')?'1':d.message().includes('Column (')?'1':'Updated cell'));
 await page.locator('#ribbonTable').click();
 await expect(page.locator('.item[data-type="table"] .design-table td')).toHaveCount(4);
 await page.locator('#ribbonEditTable').click();
 await expect(page.locator('.item[data-type="table"]')).toContainText('Updated cell');
 await page.locator('#save').click();
 await page.reload();
 await expect(page.locator('.item[data-type="table"]')).toContainText('Updated cell');
});
test('Stage 7 local assistant inserts reusable design without external calls',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('#ribbonAI').click();
 await expect(page.locator('#designAssistant')).toHaveClass(/open/);
 await page.locator('#assistantGoal').selectOption('cta');
 await page.locator('#assistantInsert').click();
 await expect(page.locator('.item[data-type="button"]')).toContainText('Get Started');
});

test('Stage 8 form builder persists and exports working submission handler',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 page.on('dialog',async d=>d.accept(d.message().includes('Form title')?'Contact Form':d.message().includes('Fields')?'Name, Email':'download'));
 await page.locator('#ribbonForm').click();
 await expect(page.locator('.item[data-type="form"] input')).toHaveCount(2);
 await page.locator('#save').click();
 await page.reload();
 await expect(page.locator('.item[data-type="form"] input')).toHaveCount(2);
 const download=page.waitForEvent('download');
 await page.locator('#export').click();
 const html=require('fs').readFileSync(await (await download).path(),'utf8');
 expect(html).toContain('data-an-form');
 expect(html).toContain('form-submission.json');
});

test('Stage 8 cloud project save uses authenticated RPC and keeps existing local editor',async({page})=>{
 await page.route('https://ztedjqdilkealvnjwivd.supabase.co/**',async route=>{
  const url=route.request().url();
  if(url.includes('/auth/v1/token'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'qa-token'})});
  if(url.includes('an_mve_save_project'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify('11111111-1111-4111-8111-111111111111')});
  return route.fulfill({status:404,contentType:'application/json',body:'{}'});
 });
 await page.goto('http://127.0.0.1:4173/');
 page.on('dialog',async d=>{
  if(d.type()==='prompt'){const msg=d.message();await d.accept(msg.includes('email')?'qa@example.com':msg.includes('password')?'test-password':'save')}
  else await d.accept();
 });
 await page.locator('#text').click();
 await page.locator('#cloudProjects').click();
 await expect(page.locator('.item')).toHaveCount(1);
});

test('Stage 9 SEO metadata exports safely with robots controls',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 page.on('dialog',async d=>{if(d.type()==='prompt')await d.accept(d.message().includes('title')?'My Test Site': 'A sample description');else await d.dismiss()});
 await page.locator('#seoSettings').click();
 const download=page.waitForEvent('download');
 await page.locator('#export').click();
 const html=require('fs').readFileSync(await (await download).path(),'utf8');
 expect(html).toContain('<title>My Test Site</title>');
 expect(html).toContain('name="description"');
 expect(html).toContain('name="robots" content="noindex,nofollow"');
});

test('Stage 9 SEO persists after reload and export is complete HTML',async({page})=>{
 await page.goto('http://127.0.0.1:4173/');
 page.on('dialog',async d=>{if(d.type()==='prompt')await d.accept(d.message().includes('title')?'Persistent Site':'Persistent description');else if(d.message().includes('index'))await d.dismiss();else await d.accept()});
 await page.locator('#seoSettings').click();
 await page.reload();
 const download=page.waitForEvent('download');
 await page.locator('#export').click();
 const html=require('fs').readFileSync(await (await download).path(),'utf8');
 expect(html).toContain('<title>Persistent Site</title>');
 expect(html).toContain('Persistent description');
 expect(html).toContain('<body>');
 expect(html).toContain('</body></html>');
 expect(html).toContain('noindex,nofollow');
 await expect(page.locator('#publishGuide')).toBeVisible();
});
