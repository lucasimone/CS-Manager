import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const src=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=src.indexOf('function createTimesheetSidecarStore(');
const end=src.indexOf('// Minimal XLSX reader:',start);
assert.ok(start>=0&&end>start);
const digest=text=>createHash('sha256').update(text).digest('hex');
const archiveName='CS-Manager-controls.json';
function directory(initial={}){
 const files=new Map(Object.entries(initial));const stats={reads:0,writes:0,aborts:0,fail:false};
 return {name:'synthetic-year',files,stats,async getFileHandle(name,opts={}){
  if(!files.has(name)){if(!opts.create)throw Object.assign(new Error('missing'),{name:'NotFoundError'});files.set(name,'');}
  return {name,async getFile(){const content=files.get(name);return {size:Buffer.byteLength(content),text:async()=>{stats.reads++;return content}}},async createWritable(){
   let staged;return {async write(v){if(stats.fail)throw Error('simulated write failure');staged=v},async close(){files.set(name,staged);stats.writes++},async abort(){stats.aborts++}};
  }};
 }};
}
function setup(){
 let clock=0;
 const c=vm.createContext({Blob});
 vm.runInContext(src.slice(start,end),c);
 const store=c.createTimesheetSidecarStore({digestText:async t=>digest(t),digestFile:async f=>digest(await f.text()),now:()=>new Date(Date.UTC(2026,0,1,0,0,clock++)).toISOString()});
 const dir=directory();const source={name:'demo.xlsx',content:'synthetic source',async getFile(){return {text:async()=>this.content}}};
 const args={directory:dir,path:'10/demo/demo.xlsx',sourceHandle:source,expectedSourceHash:digest(source.content),expectedRevision:null,context:{month:'2026-10',master:'demo-master'},checks:[{id:'po',label:'PO',automatic:'OK',state:'OK',comment:'',detail:'demo'}],author:'QA',validated:true};
 return {store,dir,source,args};
}
test('missing archive returns no record',async()=>{
 const {store,dir,args}=setup();const r=await store.readControl(dir,args.path);assert.equal(r.exists,false);assert.equal(r.revision,null);
});
test('save and reload preserve explicit validation and hash',async()=>{
 const {store,dir,args}=setup();const saved=await store.save(args),r=await store.readControl(dir,args.path);
 assert.equal(saved.changed,true);assert.equal(r.revision,saved.revision);assert.equal(r.data.validation.validated,true);assert.equal(r.data.source.sha256,args.expectedSourceHash);
});
test('unchanged save creates no extra revision or write',async()=>{
 const {store,dir,args}=setup();const first=await store.save(args);
 const second=await store.save({...args,expectedRevision:first.revision});
 assert.equal(second.changed,false);assert.equal(second.revision,first.revision);assert.equal(second.data.history.length,0);assert.equal(dir.stats.writes,1);
});
test('changed comment preserves previous snapshot',async()=>{
 const {store,args}=setup();const first=await store.save(args);
 const second=await store.save({...args,expectedRevision:first.revision,checks:[{...args.checks[0],comment:'updated'}]});
 assert.equal(second.data.history.length,1);assert.equal(second.data.history[0].checks[0].comment,'');assert.equal(second.data.checks[0].comment,'updated');
});
test('changed context invalidates implicit validation',async()=>{
 const {store,args}=setup();const first=await store.save(args);
 const second=await store.save({...args,expectedRevision:first.revision,context:{month:'2026-10',master:'changed'},validated:undefined});
 assert.equal(second.data.validation,null);assert.equal(second.data.history.length,1);
});
test('stale revision cannot overwrite current record',async()=>{
 const {store,dir,args}=setup();await store.save(args);const before=dir.files.get(archiveName);
 await assert.rejects(store.save(args),/cambiato/);assert.equal(dir.files.get(archiveName),before);
});
test('changed source blocks save',async()=>{
 const {store,dir,args,source}=setup();source.content='changed';await assert.rejects(store.save(args),/cambiato/);assert.equal(dir.stats.writes,0);
});
test('unresolved controls and blank acceptance comments cannot validate',async()=>{
 const {store,dir,args}=setup();
 await assert.rejects(store.save({...args,checks:[{...args.checks[0],state:'Anomalo'}]}),/validare/);
 await assert.rejects(store.save({...args,checks:[{...args.checks[0],state:'Accettato con commento'}]}),/commento/);
 assert.equal(dir.stats.writes,0);
});
test('malformed archive is not overwritten',async()=>{
 const {store,dir,args}=setup();dir.files.set(archiveName,'{broken');
 await assert.rejects(store.save(args),/non valido/);assert.equal(dir.files.get(archiveName),'{broken');
});
test('failed write aborts and preserves existing archive',async()=>{
 const {store,dir,args}=setup();const first=await store.save(args),before=dir.files.get(archiveName);dir.stats.fail=true;
 await assert.rejects(store.save({...args,expectedRevision:first.revision,validated:false}),/simulated/);
 assert.equal(dir.files.get(archiveName),before);assert.equal(dir.stats.aborts,1);
});
test('context signature is independent of object key order',async()=>{
 const {store}=setup();assert.equal(await store.contextSignature('hash',{a:1,b:2}),await store.contextSignature('hash',{b:2,a:1}));
 assert.notEqual(await store.contextSignature('hash',{a:1}),await store.contextSignature('other',{a:1}));
});
test('manual decisions require matching context',async()=>{
 const {store,args}=setup();const r=await store.save(args);
 assert.equal(store.decisionsFor(r.data,r.data.context.signature).po.state,'OK');
 assert.equal(Object.keys(store.decisionsFor(r.data,'old')).length,0);
});
test('batch commits staged records once',async()=>{
 const {store,dir,args}=setup();const batch=await store.beginBatch(dir);await batch.stage(args);
 assert.equal(dir.stats.writes,0);assert.equal((await batch.commit()).updated,1);assert.equal(dir.stats.writes,1);
 await assert.rejects(batch.commit(),/conclusa/);
});
test('analysis reuses the annual snapshot and compacts a legacy-formatted archive on write',async()=>{
 const {store,dir,args,source}=setup();
 const first=await store.save(args);
 const exclusion=await store.setExclusion(dir,args.path,source,args.expectedSourceHash,null,first.revision,true,'Keep this reason','QA');
 const old=JSON.stringify(JSON.parse(dir.files.get(archiveName)),null,2)+'\n';
 dir.files.set(archiveName,old);
 const beforeReads=dir.stats.reads,beforeWrites=dir.stats.writes;
 const session=await store.beginAnalysis(dir,[],true);
 assert.equal(session.size,Buffer.byteLength(old));
 const previous=await session.batch.readControl(dir,args.path);
 await session.batch.stage({...args,expectedRevision:previous.revision,validated:undefined});
 assert.equal((await session.batch.commit()).updated,0);
 assert.equal(session.batch.readExclusions()[args.path].reason,exclusion.reason);
 assert.equal(dir.stats.reads-beforeReads,2);
 assert.equal(dir.stats.writes,beforeWrites);
 assert.equal(dir.files.get(archiveName),old);

 const next=await store.beginAnalysis(dir,[],true);
 const edited={...args,author:'QA updated',validated:undefined,expectedRevision:previous.revision,
  checks:[{...args.checks[0],comment:'Another revision'}]};
 await next.batch.stage(edited);
 assert.equal((await next.batch.commit()).updated,1);
 const updated=dir.files.get(archiveName),data=JSON.parse(updated);
 assert.equal(updated,JSON.stringify(data)+'\n');
 assert.equal(data.files[args.path].history.length,previous.data.history.length+1);
 assert.deepEqual(JSON.parse(JSON.stringify(data.files[args.path].history.slice(0,-1))),JSON.parse(JSON.stringify(previous.data.history)));
 assert.equal((await store.readExclusions(dir))[args.path].reason,exclusion.reason);
});
test('analysis snapshot detects archive edits before saving',async()=>{
 const {store,dir,args}=setup();
 await store.save(args);
 const session=await store.beginAnalysis(dir,[],true);
 const revision=(await session.batch.readControl(dir,args.path)).revision;
 await session.batch.stage({...args,expectedRevision:revision,validated:false});
 const edited=dir.files.get(archiveName)+'\n';
 dir.files.set(archiveName,edited);
 await assert.rejects(session.batch.commit(),/modificato/);
 assert.equal(dir.files.get(archiveName),edited);
});
test('batch detects another committed writer',async()=>{
 const {store,dir,args}=setup();const batch=await store.beginBatch(dir);await batch.stage(args);
 await store.save(args);const before=dir.files.get(archiveName);
 await assert.rejects(batch.commit(),/modificato/);assert.equal(dir.files.get(archiveName),before);
});
test('batch detects source change before commit',async()=>{
 const {store,dir,args,source}=setup();const batch=await store.beginBatch(dir);await batch.stage(args);source.content='changed';
 await assert.rejects(batch.commit(),/cambiato/);assert.equal(dir.stats.writes,0);
});
test('legacy migration preserves backup and is idempotent',async()=>{
 const {store,dir,args}=setup();const record=(await store.save(args)).data;
 const old=JSON.stringify({schema:'ts-checker-folder-control/v1',files:{'demo.xlsx':record}});
 const legacy=directory({'TS-CHECKER-controlli.json':old}),target=directory(),folders=[{path:'10/demo',directory:legacy}];
 assert.equal((await store.migrate(target,folders,false)).pending,true);
 assert.equal((await store.migrate(target,folders,true)).imported,1);
 assert.equal((await store.readControl(target,args.path)).data.validation.validated,true);
 assert.equal((await store.migrate(target,folders,true)).imported,0);
 assert.equal(legacy.files.get('TS-CHECKER-controlli.json'),old);
});
test('exclusion requires reason and removes saved validation',async()=>{
 const {store,dir,args,source}=setup();const first=await store.save(args);
 await assert.rejects(store.setExclusion(dir,args.path,source,args.expectedSourceHash,null,first.revision,true,'','QA'),/motivo/);
 const ex=await store.setExclusion(dir,args.path,source,args.expectedSourceHash,null,first.revision,true,'synthetic reason','QA');
 assert.equal(ex.active,true);assert.equal((await store.readControl(dir,args.path)).data.validation,null);
 assert.equal((await store.readExclusions(dir))[args.path].active,true);
});
test('invalid relative path is rejected',async()=>{
 const {store,dir}=setup();await assert.rejects(store.readControl(dir,'../demo.xlsx'),/Percorso/);
});

test('manual DISP confirmation persists with PDF hash and supports revocation',async()=>{
 const {store,dir,args,source}=setup(),saved=await store.save(args),pdf={name:'demo-VALIDATED.pdf',content:'synthetic pdf',async getFile(){return {text:async()=>this.content}}};
 const data={directory:dir,path:args.path,sourceHandle:source,sourceHash:args.expectedSourceHash,revision:saved.revision,signature:saved.data.context.signature,pdfHandle:pdf,pdfHash:digest(pdf.content),expected:null,signed:true,author:'QA'};
 const confirmed=await store.savePdfConfirmation(data);assert.equal(confirmed.signed,true);assert.equal((await store.readPdfConfirmations(dir))[args.path].pdfHash,data.pdfHash);
 const revoked=await store.savePdfConfirmation({...data,expected:confirmed,signed:false});assert.equal(revoked.signed,false);assert.equal(revoked.history.length,1);assert.equal(revoked.history[0].signed,true);
 await assert.rejects(store.savePdfConfirmation(data),/altra sessione/);
});
test('changed PDF or invalidated source validation cannot be confirmed',async()=>{
 const {store,dir,args,source}=setup(),saved=await store.save(args),pdf={name:'demo-VALIDATED.pdf',content:'synthetic pdf',async getFile(){return {text:async()=>this.content}}};
 const data={directory:dir,path:args.path,sourceHandle:source,sourceHash:args.expectedSourceHash,revision:saved.revision,signature:saved.data.context.signature,pdfHandle:pdf,pdfHash:digest(pdf.content),expected:null,signed:true,author:'QA'};
 pdf.content='changed';await assert.rejects(store.savePdfConfirmation(data),/PDF modificato/);
 pdf.content='synthetic pdf';await store.save({...args,expectedRevision:saved.revision,validated:false});await assert.rejects(store.savePdfConfirmation(data),/Validazione modificata/);
});

test('financial delivery records explicit send, prevents duplicate and preserves revocation history',async()=>{
 const {store,dir,args,source}=setup(),saved=await store.save(args),pdf={name:'demo-VALIDATED.pdf',content:'synthetic pdf',async getFile(){return {text:async()=>this.content}}};
 const sign=await store.savePdfConfirmation({directory:dir,path:args.path,sourceHandle:source,sourceHash:args.expectedSourceHash,revision:saved.revision,signature:saved.data.context.signature,pdfHandle:pdf,pdfHash:digest(pdf.content),expected:null,signed:true,author:'QA'});
 const d={directory:dir,month:'2026-10',po:'1',cs:'CS1',documents:[{path:args.path,sourceHash:args.expectedSourceHash,revision:saved.revision,pdfHash:sign.pdfHash,confirmedAt:sign.at}],recipient:'demo@example.invalid',subject:'Synthetic delivery',bodyHash:digest('body'),total:710,author:'QA',sentAt:'2026-01-01T00:00:00Z',expected:null,action:'sent'};
 const sent=await store.recordDelivery(d);assert.equal(sent.status,'sent');assert.equal((await store.readDeliveries(dir))[JSON.stringify(['2026-10','1','CS1'])].total,710);
 await assert.rejects(store.recordDelivery({...d,expected:sent}),/già registrata/);
 await assert.rejects(store.recordDelivery({...d,expected:sent,action:'revoke',reason:''}),/motivo/);
 const revoked=await store.recordDelivery({...d,expected:sent,action:'revoke',reason:'Correction'});assert.equal(revoked.status,'revoked');assert.equal(revoked.history[0].status,'sent');
 await assert.rejects(store.recordDelivery(d),/altra sessione/);
});
test('financial delivery refuses invalidated signature and future timestamps',async()=>{
 const {store,dir,args,source}=setup(),saved=await store.save(args),pdf={name:'demo-VALIDATED.pdf',content:'synthetic pdf',async getFile(){return {text:async()=>this.content}}};
 const signArgs={directory:dir,path:args.path,sourceHandle:source,sourceHash:args.expectedSourceHash,revision:saved.revision,signature:saved.data.context.signature,pdfHandle:pdf,pdfHash:digest(pdf.content),expected:null,signed:true,author:'QA'};
 const sign=await store.savePdfConfirmation(signArgs);
 const d={directory:dir,month:'2026-10',po:'1',cs:'CS1',documents:[{path:args.path,sourceHash:args.expectedSourceHash,revision:saved.revision,pdfHash:sign.pdfHash,confirmedAt:sign.at}],recipient:'demo@example.invalid',subject:'Synthetic delivery',bodyHash:digest('body'),total:710,author:'QA',sentAt:'2026-01-01T00:00:00Z',expected:null,action:'sent'};
 await assert.rejects(store.recordDelivery({...d,sentAt:'2099-01-01T00:00:00Z'}),/non validi/);
 await store.savePdfConfirmation({...signArgs,expected:sign,signed:false});
 await assert.rejects(store.recordDelivery(d),/firma modificata/);
});
