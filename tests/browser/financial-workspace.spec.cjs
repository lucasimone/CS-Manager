const {test,expect}=require('@playwright/test');
async function ready(page){
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
}
test('portfolio summary distinguishes Excel balance from calculated cost and supports drill-down',async({page})=>{
 await ready(page);
 await page.locator('[data-page="consumption"]').click();
 await expect(page.locator('#costPortfolio')).toBeVisible();
 await expect(page.locator('#costPortfolioRows tr')).toHaveCount(1);
 await expect(page.locator('#costPortfolioRows tr td').nth(0)).toContainText('1000000001');
 await expect(page.locator('#costPortfolioRows tr td').nth(1)).toContainText(/100[.,]000/);
 await expect(page.locator('#costPortfolioRows tr td').nth(2)).toContainText(/90[.,]000/);
 await expect(page.locator('#costPortfolioRows tr td').nth(3)).toContainText(/1[.,]420/);
 await page.locator('#costPortfolioRows button').click();
 await expect(page.locator('#costPO')).toHaveValue('1000000001');
 await expect(page.locator('#costDetails')).toBeVisible();
 await expect(page.locator('#costPortfolio')).not.toBeVisible();
 await page.locator('#costPO').selectOption('');
 await expect(page.locator('#costPortfolio')).toBeVisible();
});
test('delivery readiness follows persisted validations without claiming PDF existence',async({page})=>{
 await ready(page);
 await page.locator('[data-page="delivery"]').click();
 await page.locator('#mailMonth').selectOption('2026-10');
 await page.locator('#mailCS').selectOption('DEMO/CS001');
 await expect(page.locator('#deliveryReadiness .finance-check-row').first()).toContainText('0 / 2');
 await page.locator('#deliveryReview button[data-delivery-i]').first().click();
 await page.locator('#controlValidated').check();
 await page.locator('#saveControl').click();
 await expect(page.locator('#browserPdf')).toBeEnabled();
 await page.locator('#timesheetBack').click();
 await expect(page.locator('#deliveryReadiness .finance-check-row').first()).toContainText('1 / 2');
 await expect(page.locator('#deliveryReadiness')).toContainText('PDF');
 await page.screenshot({path:'test-results/delivery-readiness.png',fullPage:true});
});
