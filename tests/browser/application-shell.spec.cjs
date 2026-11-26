const {test,expect}=require('@playwright/test');
for(const width of [1280,1440,1920]){
 test('compact shell navigation and preferences at '+width,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/demo/index.html');
  await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
  await expect(page.locator('#quickAnalyze')).toBeVisible();
  await expect(page.locator('#openAlerts')).toBeVisible();
  await expect(page.locator('.nav-group-label')).toHaveCount(4);
  await expect(page.locator('#language')).not.toBeVisible();
  await page.locator('#workspacePreferences summary').click();
  await page.locator('#language').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.keyboard.press('Escape');
  await expect(page.locator('#language')).not.toBeVisible();
  await expect(page.locator('#workspacePreferences summary')).toBeFocused();
  await page.locator('[data-page="timesheets"]').click();
  await expect(page.locator('#filesView')).toBeVisible();
  await page.locator('#burger').click();
  await expect(page.locator('#burger')).toHaveAttribute('aria-expanded','false');
  await page.locator('[data-page="contracts"]').click();
  await expect(page.locator('#contractsView')).toBeVisible();
  const fits=await page.locator('.topbar').evaluate(el=>el.scrollWidth<=el.clientWidth+2);
  expect(fits).toBe(true);
 });
}
