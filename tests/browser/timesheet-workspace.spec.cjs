const {test,expect}=require('@playwright/test');
async function ready(page){
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.locator('[data-page="timesheets"]').click();
 await expect(page.locator('#rows tr')).toHaveCount(2);
}
test('operational counters stay scoped before status filtering',async({page})=>{
 await ready(page);
 await expect(page.locator('[data-status-filter="ready"] strong')).toHaveText('2');
 await expect(page.locator('[data-status-filter="validated"] strong')).toHaveText('0');
 await page.locator('[data-status-filter="validated"]').click();
 await expect(page.locator('#rows tr')).toHaveCount(0);
 await expect(page.locator('[data-status-filter="ready"] strong')).toHaveText('2');
 await page.locator('[data-status-filter="ready"]').click();
 await expect(page.locator('#rows tr')).toHaveCount(2);
 await page.locator('#viewContract').selectOption(JSON.stringify(['1000000001','DEMO/CS001']));
 await page.locator('#search').fill('Standard');
 await expect(page.locator('#rows tr')).toHaveCount(1);
 await expect(page.locator('[data-status-filter=""] strong')).toHaveText('1');
 await page.locator('#clearTimesheetFilters').click();
 await expect(page.locator('#rows tr')).toHaveCount(2);
});
test('hours remain visible across detail tabs and validation changes counters',async({page})=>{
 await ready(page);
 await page.locator('#rows button[data-i]').first().click();
 await expect(page.locator('#timesheetHoursOverview > div')).toHaveCount(3);
 await page.locator('#detailsTab').click();
 await expect(page.locator('#timesheetHoursOverview')).toBeVisible();
 await page.locator('#checksTab').click();
 await expect(page.locator('#browserPdf')).toBeDisabled();
 await page.locator('#controlValidated').check();
 await page.locator('#saveControl').click();
 await expect(page.locator('#browserPdf')).toBeEnabled();
 await page.screenshot({path:'test-results/timesheet-workspace-validated.png',fullPage:true});
 await page.locator('#timesheetBack').click();
 await expect(page.locator('[data-status-filter="validated"] strong')).toHaveText('1');
 await expect(page.locator('[data-status-filter="ready"] strong')).toHaveText('1');
});

test('one unrecognized period filter includes malformed files and permits persistent exclusion',async({page})=>{
 await ready(page);

 await page.evaluate(async()=>{
  const folder=savedDirectoryHandle.children.get('10').children.get('demo');
  const handle=await folder.getFileHandle('standard.xlsx');
  const file=await handle.getFile();
  const book=await workbook(file);
  const get=await unzip(file);
  const sheet=book.sheets[0];
  const xml=await get(sheet.path);
  const changed=xml.replace('2026-10','unknown period');
  if(changed===xml)throw Error('Missing test period');
  const writer=await handle.createWritable();
  await writer.write(await replaceZipFile(file,sheet.path,changed));
  await writer.close();
  folder.children.set('malformed.xlsx',demoFile('malformed.xlsx',new Uint8Array([1,2,3])));

  // A prior control exists for standard.xlsx. Failing the checks must retain its revision.
  const original=buildControlFacts;
  buildControlFacts=async(result,...args)=>{
   if(result.sourceFile?.name==='standard.xlsx')throw Error('Synthetic checks failure');
   return original(result,...args);
  };
  await runAnalysis();
 });

 const monthFilter=page.locator('#viewMonth');
 await expect(monthFilter.locator('option')).toHaveCount(3);
 await expect(monthFilter.locator('option[value="unrecognized"]')).toHaveCount(1);
 await monthFilter.selectOption('unrecognized');
 const rows=page.locator('#rows tr');
 await expect(rows).toHaveCount(2);
 await expect(rows.filter({hasText:'standard.xlsx'})).toHaveCount(1);
 await expect(rows.filter({hasText:'malformed.xlsx'})).toHaveCount(1);

 const openStandard=()=>rows.filter({hasText:'standard.xlsx'}).locator('button[data-i]').click();
 const exclude=page.locator('#toggleExclusion');
 await openStandard();
 await expect(exclude).toBeEnabled();
 await expect(page.locator('#controlValidated')).toBeDisabled();
 page.once('dialog',dialog=>dialog.accept('Unreadable reporting period'));
 await exclude.click();
 await expect(page.locator('#exclusionInfo')).toContainText('Unreadable reporting period');

 await page.locator('#timesheetBack').click();
 await page.evaluate(()=>runAnalysis());
 await expect(monthFilter).toHaveValue('unrecognized');
 await expect(rows.filter({hasText:'standard.xlsx'}).locator('[data-operational-state="excluded"]')).toHaveCount(1);
 await openStandard();
 await expect(exclude).toBeEnabled();
 await exclude.click();
 await expect(page.locator('#exclusionInfo')).not.toContainText('Unreadable reporting period');
});
