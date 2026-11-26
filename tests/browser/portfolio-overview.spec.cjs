const {test,expect}=require('@playwright/test');
test('production opens overview without invented financial values',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#overviewView')).toBeVisible();
 await expect(page.locator('[data-overview-action="active-consumption"]').first()).toContainText('—');
 await expect(page.locator('#overviewTrend')).toContainText('Nessun timesheet analizzato');
 await page.locator('[data-overview-action="settings"]').click();
 await expect(page.locator('#settingsView')).toBeVisible();
});
test('expanded demo opens portfolio and supports month and financial drill-down',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/demo/expanded.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:90000});
 await expect(page.locator('#overviewView')).toBeVisible();
 await expect(page.locator('[data-overview-action="contracts"] strong')).toHaveText('9');
 await expect(page.locator('#overviewTrend .overview-trend-row')).toHaveCount(3);
 await page.locator('#overviewMonth').selectOption('2026-10');
 const count=await page.evaluate(()=>results.filter(x=>x.expected==='2026-10'&&!x.manualExclusion?.active&&!x.controlValidated).length);
 await expect(page.locator('[data-overview-action="unvalidated"] strong')).toHaveText(count+' →');
 await page.screenshot({path:'test-results/portfolio-overview.png',fullPage:true});
 await page.locator('[data-overview-action="unvalidated"]').click();
 await expect(page.locator('#viewMonth')).toHaveValue('2026-10');
 await expect(page.locator('#filter')).toHaveValue('unvalidated');
 await expect(page.locator('#rows tr')).toHaveCount(count);
 await page.locator('[data-page="overview"]').click();
 await page.locator('[data-overview-action="active-consumption"]').first().click();
 await expect(page.locator('#costPortfolio')).toBeVisible();
 await expect(page.locator('#costStatus')).toHaveValue('Active');
});
