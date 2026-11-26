const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const axe=require.resolve('axe-core/axe.min.js');
async function ready(page){
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
}
test('skip link and collapsed sidebar support keyboard navigation',async({page})=>{
 await ready(page);
 await page.locator('.skip-main').focus();
 await expect(page.locator('.skip-main')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#mainContent')).toBeFocused();
 await page.locator('#burger').click();
 await expect(page.locator('#burger')).toHaveAttribute('aria-expanded','false');
 for(const button of await page.locator('.nav button').all())expect(await button.getAttribute('aria-label')).toBeTruthy();
});
test('timesheet tabs follow keyboard navigation and focus',async({page})=>{
 await ready(page);await page.locator('[data-page="timesheets"]').click();
 await page.locator('#rows button[data-i]').first().click();
 await page.locator('#checksTab').focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('#issuesTab')).toBeFocused();await expect(page.locator('#issuesTab')).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('End');await expect(page.locator('#historyTab')).toBeFocused();
 await page.keyboard.press('Home');await expect(page.locator('#checksTab')).toBeFocused();
});
test('dark log success rows and demo banner have safe visual styles',async({page})=>{
 await ready(page);await page.locator('#workspacePreferences summary').click();await page.locator('#themeToggle').click();await page.locator('#workspacePreferences summary').click();
 await page.locator('[data-page="log"]').click();
 const success=page.locator('.log-entry.ok').first();
 await expect(success).toBeVisible();
 await expect(success).toHaveCSS('background-color','rgb(32, 59, 52)');
 await expect(success.locator('.log-message')).toHaveCSS('color','rgb(225, 240, 232)');
 await expect(page.locator('#demoBanner')).toHaveCSS('position','relative');
});
test('capture WCAG accessibility audit baseline for representative pages',async({page})=>{
 await ready(page);await page.addScriptTag({path:axe});
 const reports=[];
 for(const theme of ['light','dark']){
  if(theme==='dark'){await page.locator('#workspacePreferences summary').click();await page.locator('#themeToggle').click();await page.locator('#workspacePreferences summary').click();}
  for(const route of ['overview','contracts','profiles','timesheets','delivery','consumption','settings','log','guide']){
   await page.locator('[data-page="'+route+'"]').click();
   const report=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   reports.push({theme,route,violations:report.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:report.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))});
  }
 }
 await fs.mkdir('test-results/accessibility',{recursive:true});
 await fs.writeFile('test-results/accessibility/axe-baseline.json',JSON.stringify(reports,null,2));
 expect(reports).toHaveLength(16);
 // Report-only baseline: existing violations remain visible for later remediation.
});
