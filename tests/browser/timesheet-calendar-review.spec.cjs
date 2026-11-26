const {test,expect}=require('@playwright/test');
test('timesheet preview calendar navigates to source cells',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.locator('[data-page="timesheets"]').click();
 await page.locator('#rows button[data-i]').first().click();
 await page.locator('#detailsTab').click();
 await expect(page.locator('#tsCalendarGrid [data-ts-date]')).toHaveCount(31);
 await page.locator('[data-ts-date="2026-10-01"]').click();
 await expect(page.locator('#tsCalendarDay [data-ts-cell]')).toHaveCount(3);
 await page.locator('#tsCalendarDay [data-ts-cell]').nth(1).click();
 await expect(page.locator('#previewGrid .ts-calendar-cell-focus')).toHaveCount(1);
 await page.locator('#tsCalendarOnlyIssues').check();
 await expect(page.locator('#tsCalendarGrid [data-ts-state="ok"]')).toHaveCount(0);
 await page.screenshot({path:'test-results/timesheet-calendar-review.png',fullPage:true});
});
