const {test,expect}=require('@playwright/test');
const path=require('node:path');
const root=path.join(__dirname,'fixtures','generated');
test.beforeEach(async({page})=>{
 await page.goto('/');
 await expect(page.locator('#contractsView')).toBeVisible();
});
test('real browser parses Standard and V2 XLSX with cached formulas',async({page})=>{
 await page.evaluate(async()=>{
  const master=new File([await (await fetch('/tests/fixtures/generated/master.xlsx')).arrayBuffer()],'master.xlsx');
  await loadMaster(master);
 });
 for(const [name,format,person] of [['standard.xlsx','Standard','Demo Standard'],['v2.xlsx','V2','Demo Vtwo']]){
  const parsed=await page.evaluate(async name=>{
   const file=new File([await(await fetch('/tests/fixtures/generated/2026/10/demo/'+name)).arrayBuffer()],name);
   const r=await parseTS(file,'2026-10');r.sourceFile=file;
   const {facts,extraHours}=await buildControlFacts(r,readControlConfiguration());
   const result=evaluateTimesheetControls(facts);
   return {format:r.format,person:r.person,period:r.period,os:r.os,ns:r.ns,status:r.status,valid:result.valid,checks:result.checks,extraHours};
  },name);
  expect(parsed).toMatchObject({format,person,period:'2026-10',os:8.5,ns:5,status:'ok',valid:true,extraHours:false});
 }
});
test('wrong month, missing cached value and malformed XLSX are detected',async({page})=>{
 const cases=await page.evaluate(async()=>{
  const output={};
  for(const name of ['wrong-month.xlsx','missing-cache.xlsx','bad.xlsx']){
   const file=new File([await(await fetch('/tests/fixtures/generated/'+name)).arrayBuffer()],name);
   const r=await parseTS(file,'2026-10');r.sourceFile=file;
   const {facts}=await buildControlFacts(r,readControlConfiguration());
   output[name]={status:r.status,checks:evaluateTimesheetControls(facts).checks};
  }
  return output;
 });
 expect(cases['wrong-month.xlsx'].checks.find(x=>x.id==='month').automatic).toBe('Anomalo');
 expect(cases['missing-cache.xlsx'].checks.find(x=>x.id==='formulas').automatic).toBe('Anomalo');
 expect(cases['bad.xlsx'].status).toBe('error');
});
test('native file input fallback analyses synthetic annual directory',async({page})=>{
 await page.locator('[data-page="settings"]').click();
 await page.locator('#master').setInputFiles(path.join(root,'master.xlsx'));
 await expect(page.locator('#masterState')).toHaveAttribute('data-state','valid');
 await page.locator('#yearFolder').setInputFiles(path.join(root,'2026'));
 await page.locator('#run').click();
 await expect(page.locator('#closeAnalysisDialog')).toBeEnabled({timeout:30000});
 await page.locator('#closeAnalysisDialog').click();
 await expect(page.locator('#filesView')).toBeVisible();
 await expect(page.locator('#rows tr')).toHaveCount(2);
 await page.locator('#rows button[data-i]').first().click();
 await expect(page.locator('#timesheetDetailView')).toBeVisible();
 await expect(page.locator('#browserPdf')).toBeDisabled();
 await page.screenshot({path:'test-results/timesheet-detail.png',fullPage:true});
});
test('main navigation renders without page errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [route,id] of [['contracts','contractsView'],['profiles','profilesView'],['timesheets','filesView'],['delivery','deliveryView'],['consumption','costView'],['settings','settingsView'],['log','activityLog'],['guide','guideView']]){
  await page.locator('[data-page="'+route+'"]').click();
  await expect(page.locator('#'+id)).toBeVisible();
 }
 expect(errors).toEqual([]);
});
