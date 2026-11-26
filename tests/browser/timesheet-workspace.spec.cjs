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
