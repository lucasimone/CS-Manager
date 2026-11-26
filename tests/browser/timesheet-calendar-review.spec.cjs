const {test,expect}=require('@playwright/test');
test('timesheet preview calendar navigates to source cells',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.locator('[data-page="timesheets"]').click();
 await page.locator('#rows button[data-i]').first().click();
 await page.locator('#detailsTab').click();
 await expect(page.locator('#tsCalendarGrid [data-ts-date]')).toHaveCount(31);
 const regularDay=page.locator('#tsCalendarGrid [data-ts-state="ok"]').first();
 const zeroHoursDay=page.locator('#tsCalendarGrid [data-ts-state="closed"]').first();
 const issueDay=page.locator('#tsCalendarGrid [data-ts-state="error"]').first();
 const originalTheme=await page.locator('html').getAttribute('data-theme');

 await page.locator('html').evaluate(html=>html.setAttribute('data-theme','light'));
 await expect(regularDay).toHaveCSS('background-color','rgb(228, 245, 236)');
 await expect(zeroHoursDay).toHaveCSS('background-color','rgb(228, 232, 238)');
 await expect(issueDay).toHaveCSS('background-color','rgb(252, 225, 223)');

 await page.locator('html').evaluate(html=>html.setAttribute('data-theme','dark'));
 await expect(regularDay).toHaveCSS('background-color','rgb(36, 72, 61)');
 await expect(zeroHoursDay).toHaveCSS('background-color','rgb(52, 66, 85)');
 await expect(issueDay).toHaveCSS('background-color','rgb(85, 43, 48)');

 await page.locator('html').evaluate((html,theme)=>{
  if(theme===null) html.removeAttribute('data-theme');
  else html.setAttribute('data-theme',theme);
 },originalTheme);
 await page.locator('[data-ts-date="2026-10-01"]').click();
 await expect(page.locator('#tsCalendarDay [data-ts-cell]')).toHaveCount(3);
 await page.locator('#tsCalendarDay [data-ts-cell]').nth(1).click();
 await expect(page.locator('#previewGrid .ts-calendar-cell-focus')).toHaveCount(1);
 await page.locator('#tsCalendarOnlyIssues').check();
 await expect(page.locator('#tsCalendarGrid [data-ts-state="ok"]')).toHaveCount(0);
 await page.screenshot({path:'test-results/timesheet-calendar-review.png',fullPage:true});
});
