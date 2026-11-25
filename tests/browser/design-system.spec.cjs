const {test,expect}=require('@playwright/test');
test('shared design tokens resolve across light and dark themes',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 const snapshot=()=>page.evaluate(()=>{
   const css=getComputedStyle(document.documentElement);
   const probe=document.createElement('div');
   probe.style.backgroundColor='var(--cs-surface)';
   document.body.append(probe);
   const surface=getComputedStyle(probe).backgroundColor;
   probe.remove();
   return {surface,radius:css.getPropertyValue('--cs-radius-card').trim(),spacing:css.getPropertyValue('--cs-space-3').trim()};
 });
 expect(await snapshot()).toEqual({surface:'rgb(255, 255, 255)',radius:'12px',spacing:'12px'});
 await expect(page.locator('#contractsView')).toHaveCSS('border-radius','12px');
 await page.locator('#workspacePreferences summary').click();
 await page.locator('#themeToggle').click();
 await page.locator('#workspacePreferences summary').click();
 expect(await snapshot()).toEqual({surface:'rgb(28, 38, 54)',radius:'12px',spacing:'12px'});
 await expect(page.locator('#contractsView')).toHaveCSS('border-radius','12px');
});
