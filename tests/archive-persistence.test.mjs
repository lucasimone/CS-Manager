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
 const files=new Map(Object.entries(initial));const stats={writes:0,aborts:0,fail:false};
 return {name:'synthetic-year',files,stats,async getFileHandle(name,opts={}){
  if(!files.has(name)){if(!opts.create)throw Object.assign(new Error('missing'),{name:'NotFoundError'});files.set(name,'');}
  return {name,async getFile(){return {text:async()=>files.get(name)}},async createWritable(){
   let staged;return {async write(v){if(stats.fail)throw Error('simulated write failure');staged=v},async close(){files.set(name,staged);stats.writes++},async abort(){stats.aborts++}};
  }};
 }};
}
function setup(){
 let clock=0;
 const c=vm.createContext({});
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
