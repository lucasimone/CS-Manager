const {test,expect}=require('@playwright/test');
async function openContract(page){
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.locator('#contractRows button[data-contract-row]').first().click();
 await expect(page.locator('#contractOverviewPanel')).toBeVisible();
}
async function tabColors(tab){
 return tab.evaluate(el=>{
  const s=getComputedStyle(el);
  const rgb=value=>value.match(/[\d.]+/g).map(Number);
  const luminance=channels=>channels.slice(0,3).map(x=>x/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4).reduce((a,x,i)=>a+x*[0.2126,0.7152,0.0722][i],0);
  const fg=rgb(s.color),bg=rgb(s.backgroundColor);
  const l1=luminance(fg),l2=luminance(bg);
  return {foreground:s.color,background:s.backgroundColor,contrast:(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05),opaque:bg.length===3||bg[3]===1,border:s.borderBottomColor};
 });
}
for(const theme of ['light','dark']){
 test('contract tab contrast and selection in '+theme+' mode',async({page})=>{
  await openContract(page);
  if(theme==='dark'){
   await page.locator('#workspacePreferences summary').click();
   await page.locator('#themeToggle').click();
   await page.locator('#workspacePreferences summary').click();
  }
  const tabs=page.locator('.contract-tabs [role="tab"]');
  await expect(tabs).toHaveCount(4);
  for(let selected=0;selected<4;selected++){
   await tabs.nth(selected).click();
   await page.locator('#contractReadTitle').hover();
   const active=await tabColors(tabs.nth(selected));
   expect(active.opaque).toBe(true);
   expect(active.contrast).toBeGreaterThanOrEqual(4.5);
   await expect(tabs.nth(selected)).toHaveAttribute('aria-selected','true');
   for(let i=0;i<4;i++){
    if(i===selected)continue;
    const inactive=await tabColors(tabs.nth(i));
    expect(inactive.opaque).toBe(true);
    expect(inactive.contrast).toBeGreaterThanOrEqual(4.5);
    expect(inactive.background).not.toBe(active.background);
    expect(inactive.border).not.toBe(active.border);
    await tabs.nth(i).hover();
    expect((await tabColors(tabs.nth(i))).contrast).toBeGreaterThanOrEqual(4.5);
   }
  }
  await tabs.first().click();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.locator('#contractResourcesPanel')).toBeVisible();
  await page.locator('#contractReadTitle').hover();
  await page.screenshot({path:'test-results/contract-tabs-'+theme+'.png',fullPage:true});
 });
}
test('resource save retains the Resources tab and shows feedback',async({page})=>{
 await openContract(page);
 await page.locator('#contractResourcesTab').click();
 await page.locator('#contractResourceRows button[data-resource-row]').first().click();
 await page.locator('#resourcePM').fill('Demo updated PM');
 await page.locator('#resourceSave').click();
 await expect(page.locator('#resourceModal')).not.toBeVisible({timeout:30000});
 await expect(page.locator('#contractResourcesTab')).toHaveAttribute('aria-selected','true');
 await expect(page.locator('#resourceSaveNotice')).toBeVisible();
 await expect(page.locator('#contractResourceRows')).toContainText('Demo updated PM');
});
