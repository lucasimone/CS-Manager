const {test,expect}=require('@playwright/test');
const routes=[['overview','overviewView'],['contracts','contractsView'],['profiles','profilesView'],['timesheets','filesView'],['delivery','deliveryView'],['calendar','epCalendarView'],['consumption','costView'],['settings','settingsView'],['log','activityLog'],['guide','guideView']];
async function ready(page){
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
}
test('isolated demo validates both timesheets and prepares financial summary',async({page})=>{
 await ready(page);
 await expect(page.locator('#contractRows tr')).toHaveCount(1);
 await page.locator('[data-page="timesheets"]').click();
 await expect(page.locator('#rows tr')).toHaveCount(2);
 for(let i=0;i<2;i++){
   await page.locator('#rows button[data-i]').nth(i).click();
   await expect(page.locator('#controlValidated')).toBeEnabled();
   await page.locator('#controlValidated').check();
   await page.locator('#saveControl').click();
   await expect(page.locator('#browserPdf')).toBeEnabled();
   await page.locator('#timesheetBack').click();
 }
 await page.locator('[data-page="delivery"]').click();
 await page.locator('#mailMonth').selectOption('2026-10');
 await page.locator('#mailCS').selectOption('DEMO/CS001');
 await page.locator('#mailLocation').fill('DEMO/excel');
 await page.locator('#mailPdfLocation').fill('DEMO/pdf');
 await page.locator('#prepareFinanceMail').click();
 await expect(page.locator('#financeMailStatus')).toContainText('PDF');
 await page.locator('#pickPdfFolder').click();
 await expect(page.locator('#pdfTrackingRows [data-signature-index]')).toHaveCount(2);
 page.on('dialog',dialog=>dialog.accept());
 for(let i=0;i<2;i++){
   await page.locator('#pdfTrackingRows [data-signature-index]').nth(i).click();
   await expect(page.locator('#pdfTrackingRows [data-signature-index]').nth(i)).toHaveText('Revoca conferma');
 }
 await page.locator('#prepareFinanceMail').click();
 await expect(page.locator('#financeMailPreview')).toHaveValue(/Monthly total: €1,420\.00/);
 await page.screenshot({path:'test-results/demo-delivery-validated.png',fullPage:true});
 await page.reload();
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true');
 await page.locator('[data-page="timesheets"]').click();
 await page.locator('#rows button[data-i]').first().click();
 await expect(page.locator('#controlValidated')).not.toBeChecked();
});
for(const [width,height,language,dark,collapse] of [[1920,1080,'en',false,false],[1440,900,'fr',true,false],[1280,800,'it',false,true]]){
 test('visual evidence '+width+' '+language,async({page})=>{
  await page.setViewportSize({width,height});await ready(page);
  await page.locator('#workspacePreferences summary').click();
  await page.locator('#language').selectOption(language);
  if(dark)await page.locator('#themeToggle').click();
  await page.locator('#workspacePreferences summary').click();
  if(collapse)await page.locator('#burger').click();
  const prefix='test-results/visual/'+width+'-'+language;
  for(const [route,id] of routes){
   await page.locator('[data-page="'+route+'"]').click();
   await expect(page.locator('#'+id)).toBeVisible();
   await page.screenshot({path:prefix+'/'+route+'.png',fullPage:true,animations:'disabled'});
  }
  await page.locator('[data-page="contracts"]').click();
  await page.locator('#contractRows button[data-contract-row]').first().click();
  await expect(page.locator('#contractDetailView')).toBeVisible();
  await page.screenshot({path:prefix+'/contract-detail.png',fullPage:true});
  await page.locator('[data-page="timesheets"]').click();
  await page.locator('#rows button[data-i]').first().click();
  await expect(page.locator('#timesheetDetailView')).toBeVisible();
  await page.screenshot({path:prefix+'/timesheet-detail.png',fullPage:true});
  await page.locator('#workspacePreferences summary').click();
  await page.locator('#openChangelog').click();
  await page.locator('#workspacePreferences summary').click();
  await expect(page.locator('#changelogView')).toBeVisible();
  await page.screenshot({path:prefix+'/changelog.png',fullPage:true});
 });
}
