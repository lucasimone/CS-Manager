const {test,expect}=require('@playwright/test');

test('analysis opens each timesheet once and reads a changed master again',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});

 const report=await page.evaluate(async()=>{
  const opens=[];
  const openWorkbook=workbook;
  workbook=(file,...options)=>{
   opens.push(file.name);
   return openWorkbook(file,...options);
  };
  const masterName=savedMasterHandle.name;
  const snapshot=()=>results.map(r=>({file:r.file,signature:r.controlSignature,status:r.status}));
  const before=snapshot();

  await runAnalysis();
  const after=snapshot();
  const reused=[...opens];

  const master=await savedMasterHandle.getFile();
  const get=await unzip(master);
  const book=await openWorkbook(master);
  const sheet=book.sheets.find(s=>s.name==='Contracts');
  const changed=(await get(sheet.path)).replace('Synthetic contract','Updated synthetic contract');
  const replacement=await replaceZipFile(master,sheet.path,changed);
  const writer=await savedMasterHandle.createWritable();
  await writer.write(replacement);
  await writer.close();

  opens.length=0;
  await runAnalysis();
  return {before,after,reused,updated:[...opens],masterName,title:contractDetails[0].title};
 });

 expect(report.before).toHaveLength(2);
 expect(report.after).toEqual(report.before);
 expect(report.reused).toHaveLength(report.before.length);
 expect(report.reused).not.toContain(report.masterName);
 expect(report.updated.filter(name=>name===report.masterName)).toHaveLength(1);
 expect(report.title).toBe('Updated synthetic contract');
 await expect(page.locator('#logEntries')).toContainText('Timesheet reading and checks');
 await expect(page.locator('#logEntries')).toContainText('Control archive verification and save');
});


test('Analyze logs one timing summary for a completed run and for an early exit',async({page})=>{
 await page.goto('/demo/index.html');
 await expect(page.locator('#demoBanner')).toHaveAttribute('data-ready','true',{timeout:30000});

 const analyze=async()=>{
  await page.locator('#quickAnalyze').click();
  await page.locator('#closeAnalysisDialog').click();
 };
 const timings=page.locator('#logEntries .log-message').filter({hasText:'Analysis timings ('});

 await analyze();
 await expect(timings).toHaveCount(1);
 await expect(timings).toContainText(/Analysis timings \(completed\) · Total: \d+\.\d{2} s · Files found: 2/);
 for(const phase of ['Permissions and source access','Timesheet folder scan','Contracts workbook',
  'Timesheet reading and checks','Duplicates and control preparation',
  'Control archive verification and save','Display results']){
  await expect(timings).toContainText(phase+': ');
 }

 await page.evaluate(()=>{savedMasterHandle=null;});
 await analyze();
 await expect(timings).toHaveCount(1);
 await expect(timings).toContainText(/Analysis timings \(stopped\) · Total: \d+\.\d{2} s · Files found: 0/);
 await expect(timings).toContainText('Permissions and source access: ');
});
