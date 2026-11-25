import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function between(a,b){
  const i=src.indexOf(a),j=src.indexOf(b,i+a.length);
  assert.ok(i>=0&&j>i,'Missing source boundary: '+a);
  return src.slice(i,j);
}
function setup(){
  const c=vm.createContext({results:[],roster:[],pdfDirty:false});
  vm.runInContext([
    between('const norm=','/* CS-Manager: pure control calculations.'),
    between('function evaluateTimesheetControls(','/* CS-Manager sidecar storage.'),
    between('function datePeriod(','async function loadMaster('),
    between('function dailyHoursIssue(','async function parseTS('),
    between('function calculateCost(','function renderMonthly('),
    between('function calculatePlannedCost(','function renderContractBudgetCheck('),
    between('function financeScope(','async function verifyFinanceScope('),
    between('function suggestedPdfFilename(','function updatePdfFilename('),
    between('function pdfAllowed(','function updatePdfAction(')
  ].join('\n'),c);
  return c;
}
// Synthetic examples only. Expected amounts are independently specified.
function facts(overrides={}){
  return {poValid:true,csValid:true,personMatchCount:1,hoursLayoutValid:true,
    days:[{date:'2026-10-01',ns:8.5,os:0},{date:'2026-10-02',ns:0,os:5}],
    reportedNS:8.5,reportedOS:5,reportedTotal:13.5,
    expectedMonth:'2026-10',actualMonth:'2026-10',formulaScanComplete:true,
    formulaErrors:[],hourIssues:[],duplicate:false,...overrides};
}
const state=(r,id)=>r.checks.find(x=>x.id===id);
test('all ten checks pass for consistent synthetic input',()=>{
  const r=setup().evaluateTimesheetControls(facts());
  assert.equal(r.checks.length,10);assert.equal(r.valid,true);
  assert.equal(r.ns,8.5);assert.equal(r.os,5);assert.equal(r.total,13.5);
});
for(const [label,overrides,id] of [
  ['wrong PO',{poValid:false},'po'],
  ['wrong CS',{csValid:false},'cs'],
  ['missing resource',{personMatchCount:0},'person'],
  ['ambiguous resource',{personMatchCount:2},'person'],
  ['wrong month',{actualMonth:'2026-09'},'month'],
  ['wrong year with explicit expected period',{actualMonth:'2025-10'},'month'],
  ['wrong total',{reportedTotal:14},'sum'],
  ['missing formula cache',{formulaErrors:['Sheet A1']},'formulas'],
  ['incomplete formula scan',{formulaScanComplete:false},'formulas'],
  ['duplicate',{duplicate:true},'duplicate'],
  ['daily anomaly',{hourIssues:['unexpected hours']},'anomalies'],
  ['unrecognized hours layout',{hoursLayoutValid:false},'hours']
]){
  test(label+' is flagged',()=>{
    const r=setup().evaluateTimesheetControls(facts(overrides));
    assert.equal(state(r,id).automatic,'Anomalo');assert.equal(r.valid,false);
  });
}
test('weekend hours and dates outside expected month are flagged',()=>{
  const c=setup();
  assert.equal(state(c.evaluateTimesheetControls(facts({days:[{date:'2026-10-03',ns:8.5,os:0}]})),'weekend').automatic,'Anomalo');
  assert.equal(state(c.evaluateTimesheetControls(facts({days:[{date:'2026-09-30',ns:8.5,os:0}]})),'month').automatic,'Anomalo');
});
test('negative and nonnumeric hours do not produce calculable totals',()=>{
  const c=setup();
  for(const ns of [-1,'8.5',NaN]){
    const r=c.evaluateTimesheetControls(facts({days:[{date:'2026-10-01',ns,os:0}]}));
    assert.equal(r.total,null);assert.equal(state(r,'hours').automatic,'Anomalo');
  }
});
test('manual acceptance requires a comment and matching signature',()=>{
  const c=setup(),f=facts({poValid:false});
  const evaluate=(comment,signature)=>c.evaluateTimesheetControls(f,{po:{state:'Accettato con commento',comment,signature}},'current');
  assert.equal(evaluate('verified','current').valid,true);
  assert.equal(evaluate('  ','current').valid,false);
  assert.equal(evaluate('verified','old').valid,false);
  assert.equal(state(evaluate('verified','current'),'po').automatic,'Anomalo');
});
test('manual rejection remains blocking despite automatic OK',()=>{
  const r=setup().evaluateTimesheetControls(facts(),{po:{state:'Rifiutato',signature:'current'}},'current');
  assert.equal(r.valid,false);assert.equal(state(r,'po').state,'Rifiutato');
});
test('working hours allow normal days, half days and short Friday',()=>{
  const c=setup();
  for(const [h,d] of [[0,1],[4.25,1],[8.5,1],[5,5]])assert.equal(c.dailyHoursIssue(h,d),'');
  for(const [h,d] of [[5,1],[6.5,1],[9,5]])assert.notEqual(c.dailyHoursIssue(h,d),'');
});
test('reporting periods parse both Excel date systems and reject invalid calendar dates',()=>{
  const c=setup();
  assert.equal(c.datePeriod('45000',false),'2023-03');
  assert.equal(c.datePeriod('45000',true),'2027-03');
  assert.equal(c.datePeriod('10/2026'),'2026-10');
  assert.equal(c.datePeriod('2026-02-30'),'');
  assert.equal(c.datePeriod('2026-13'),'');
});
test('profile and seniority parsing preserves explicitly supplied seniority',()=>{
  const c=setup();
  assert.equal(c.splitTimesheetProfile('DEV-STD','').profile,'DEV');
  assert.equal(c.splitTimesheetProfile('DEV Senior','').seniority,'SENIOR');
  assert.equal(c.splitTimesheetProfile('DEV','Junior').seniority,'Junior');
});
function ts(overrides={}){
  return {po:'1000000001',person:'Demo Person',reference:'DEMO-CS',status:'ok',
    expected:'2026-10',ns:8.5,os:5,controlValidated:true,controlPersisted:true,...overrides};
}
function rate(overrides={}){
  return {po:'1000000001',person:'Person Demo',ref:'DEMO-CS',profile:'DEV',rateNS:40,rateOS:60,...overrides};
}
test('financial cost uses NS and OS rates independently',()=>{
  assert.equal(setup().calculateCost(ts(),[rate()]).cost,640);
});
for(const [name,overrides,entries] of [
  ['excluded',{manualExclusion:{active:true}},[rate()]],
  ['restored pending analysis',{restoredNeedsAnalysis:true},[rate()]],
  ['review status',{status:'review'},[rate()]],
  ['missing hours',{ns:null},[rate()]],
  ['missing NS rate',{},[rate({rateNS:null})]],
  ['ambiguous rates',{},[rate(),rate()]],
  ['wrong contract',{},[rate({ref:'OTHER'})]],
  ['roster notes',{},[rate({notes:'check'})]]
]){
  test(name+' cannot contribute cost',()=>assert.equal(setup().calculateCost(ts(overrides),entries).cost,null));
}
test('zero hours do not require an unused rate',()=>{
  assert.equal(setup().calculateCost(ts({ns:0}),[rate({rateNS:null})]).cost,300);
});
test('planned cost distinguishes missing values from zero allocation',()=>{
  const c=setup(),r=c.calculatePlannedCost({maxNS:10,rateNS:40,maxOS:5,rateOS:60});
  assert.equal(r.ns,400);assert.equal(r.os,300);
  const missing=c.calculatePlannedCost({maxNS:10,rateNS:null,maxOS:0,rateOS:null});
  assert.equal(missing.ns,null);assert.equal(missing.os,0);
});
test('delivery excludes manual exclusions and blocks unsaved validation',()=>{
  const c=setup();c.roster=[rate()];
  c.results=[ts(),ts({controlPersisted:false}),ts({manualExclusion:{active:true}}),ts({expected:'2026-09'})];
  const s=c.financeScope('2026-10','1000000001','DEMO-CS');
  assert.equal(s.group.length,3);assert.equal(s.excluded.length,1);assert.equal(s.rows.length,2);assert.equal(s.invalid.length,1);
});
test('financial email includes independently calculated profile and monthly totals',()=>{
  const c=setup();c.roster=[rate()];c.results=[ts()];
  const s=c.financeScope('2026-10','1000000001','DEMO-CS');
  const msg=c.financeMessage('2026-10','1000000001','DEMO-CS','demo/excel','demo/pdf',s);
  assert.match(msg,/NS: 8\.50 h/);assert.match(msg,/OS: 5\.00 h/);
  assert.match(msg,/Profile total: €640\.00/);assert.match(msg,/Monthly total: €640\.00/);
});
test('PDF filename preserves source basename and rejects unsupported extensions',()=>{
  const c=setup();
  assert.equal(c.suggestedPdfFilename({controlPath:'10/demo/Example.XLSX'}),'Example-VALIDATED.pdf');
  assert.equal(c.suggestedPdfFilename({file:'demo.txt'}),'');
});
test('PDF gate blocks unvalidated, excluded, pending or dirty records',()=>{
  const c=setup();
  const r={controlValidated:true,controlDirectory:{},controlPath:'10/demo.xlsx',sourceHandle:{},controlSourceHash:'hash',controlSignature:'sig',sheet:'TS'};
  assert.equal(c.pdfAllowed(r),true);
  for(const change of [{controlValidated:false},{manualExclusion:{active:true}},{controlPendingCommit:true},{controlReadError:true}]){
    assert.equal(c.pdfAllowed({...r,...change}),false);
  }
  c.pdfDirty=true;assert.equal(c.pdfAllowed(r),false);
});
