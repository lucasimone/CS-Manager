const {test,expect}=require('@playwright/test');
test('TM delivery shows missing resources even in months without analyzed files',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.locator('[data-page="delivery"]').click();
 await page.locator('#mailMonth').selectOption('2026-09');
 await expect(page.locator('#tmCollection [data-tm-group]')).toHaveCount(1);
 await page.locator('#tmCollection [data-tm-group]').click();
 await expect(page.locator('#tmCollection [data-tm-state="missing"]')).toHaveCount(2);
 await page.locator('#tmReminder').click();
 await expect(page.locator('#tmReminderText')).toBeVisible();
 await expect(page.locator('#tmReminderText')).toHaveValue(/Demo Standard/);
 await page.locator('#mailMonth').selectOption('2026-10');
 await page.locator('#tmCollection [data-tm-group]').click();
 await expect(page.locator('#tmCollection [data-tm-state="missing"]')).toHaveCount(0);
 await page.locator('[data-page="overview"]').click();
 await page.locator('#overviewMonth').selectOption('2026-10');
 await expect(page.locator('#overviewTMCollection')).toContainText('2 / 2');
});
