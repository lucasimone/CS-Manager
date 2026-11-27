const {test,expect}=require('@playwright/test');

test('contract extension preserves resources when replacing its temporary PO',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});
 await page.locator('[data-page="contracts"]').click();
 await page.locator('#contractRows button[data-contract-row]').click();

 const original=await page.evaluate(()=>({po:editingContract.po,ref:editingContract.ref}));
 const contractRows=page.locator('#contractRows tr');
 const openContract=po=>contractRows.filter({has:page.getByText(po,{exact:true})}).locator('[data-contract-row]').click();
 const resources=page.locator('#contractResourceRows tr');

 await page.locator('#contractClone').click();
 const temporaryPO=await page.locator('#editPO').inputValue();
 expect(temporaryPO).toMatch(/^TMP-[0-9a-f-]+$/);
 await expect(page.locator('#editStatus')).toHaveValue('Pending');
 await expect(page.locator('#editBudget')).toHaveValue('');
 await page.locator('#editFrom').fill('2027-01-01');
 await page.locator('#editTo').fill('2027-06-30');
 await page.locator('#saveContract').click();
 await expect(contractRows).toHaveCount(2,{timeout:30000});
 await openContract(temporaryPO);
 await page.locator('#contractResourcesTab').click();
 await expect(resources).toHaveCount(2);
 await expect(resources.first()).toContainText('Demo Standard');
 await expect(resources.last()).toContainText('Demo Vtwo');

 await page.locator('#contractStartEdit').click();
 await page.locator('#editPO').fill(original.po);
 await page.locator('#saveContract').click();
 await expect(page.locator('#contractError')).not.toBeEmpty();
 await expect(page.locator('#editPO')).toBeVisible();

 const finalPO='0999000027';
 const extensionRef=original.ref+'-EXT';
 await page.locator('#editPO').fill(finalPO);
 await page.locator('#editRef').fill(extensionRef);
 await page.locator('#saveContract').click();
 await expect(page.locator('#contractSaveNotice')).toBeVisible({timeout:30000});
 await expect(contractRows.filter({hasText:temporaryPO})).toHaveCount(0);
 await openContract(finalPO);
 await page.locator('#contractResourcesTab').click();
 await expect(resources).toHaveCount(2);
 await expect(resources.first()).toContainText('Demo Standard');

 const persisted=await page.evaluate(async({original,finalPO,extensionRef})=>{
  await activateMaster(await savedMasterHandle.getFile());
  const association=(po,ref)=>roster.filter(r=>r.po===po&&r.ref===ref)
   .map(({person,profile,rateNS,rateOS,pm,contractor,activeRaw})=>({person,profile,rateNS,rateOS,pm,contractor,activeRaw}));
  return {
   original:association(original.po,original.ref),
   extension:association(finalPO,extensionRef),
   hasTemporary:roster.some(r=>r.po.startsWith('TMP-')),
   dates:contractDetails.filter(c=>c.po===finalPO).map(c=>[c.from,c.to])
  };
 },{original,finalPO,extensionRef});
 expect(persisted.original).toHaveLength(2);
 expect(persisted.extension).toEqual(persisted.original);
 expect(persisted.hasTemporary).toBe(false);
 expect(persisted.dates).toEqual([['2027-01-01','2027-06-30']]);
});
