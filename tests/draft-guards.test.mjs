import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function between(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, 'Expected source boundaries: '+start+' / '+end);
  return source.slice(a, b);
}
const navigation = between('var contractDraftBaseline=', "document.querySelectorAll('.nav button').forEach(b=>{b.setAttribute('aria-label'");
const back = between("$('#timesheetBack').onclick=", ";$('#previewSheet').onchange");
const run = between("$('#run').onclick=", ";$('#quickAnalyze').onclick");
const reset = between("$('#reset').onclick=", ";$('#search').oninput");
const opening = between('async function openTimesheetDetail(x){', "detailReturnPage=activeAppPage");
function setup(approve, dirty = true) {
  const nodes = new Map();
  const node = () => ({ classList: {toggle(){}}, dataset:{}, setAttribute(){}, removeAttribute(){}, focus(){}, hasAttribute(){return true;} });
  const $ = key => {if(!nodes.has(key)) nodes.set(key,node());return nodes.get(key);};
  const state = { $, document:{querySelector:$, querySelectorAll:()=>[]}, activeAppPage:'timesheetDetail', pdfDirty:dirty, previewToken:4, previewCurrent:{file:'demo.xlsx'}, detailReturnPage:'timesheets', translateText:x=>x, confirm:()=>{state.prompts++;return approve;}, prompts:0, runs:0, updates:0, results:[1,2], pageInfo:{timesheets:['Timesheets','']}, updatePdfAction(){}, analysisRunning:false, analysisDialog:{open:false,showModal(){this.open=true;}}, async runAnalysis(){state.runs++;}, setAnalysisProgress(){}, clearActivityLog(){}, renderProfiles(){}, update(){state.updates++;} };
  vm.createContext(state);
  vm.runInContext(navigation + ';' + back + ';' + run + ';' + reset + ';', state);
  return state;
}
test('Back cancellation preserves draft and preview', () => {
  const s=setup(false), original=s.previewCurrent;
  s.$('#timesheetBack').onclick();
  assert.equal(s.prompts,1); assert.equal(s.activeAppPage,'timesheetDetail'); assert.equal(s.pdfDirty,true); assert.equal(s.previewCurrent,original); assert.equal(s.previewToken,4);
});
test('Back confirmation discards draft after navigation', () => {
  const s=setup(true); s.$('#timesheetBack').onclick();
  assert.equal(s.prompts,1); assert.equal(s.activeAppPage,'timesheets'); assert.equal(s.pdfDirty,false); assert.equal(s.previewCurrent,null); assert.equal(s.previewToken,5);
});
test('Clean Back does not prompt', () => {
  const s=setup(false,false); s.$('#timesheetBack').onclick();
  assert.equal(s.prompts,0); assert.equal(s.activeAppPage,'timesheets');
});
test('Analyze cancellation does not start analysis', async () => {
  const s=setup(false), original=s.results; await s.$('#run').onclick();
  assert.equal(s.prompts,1); assert.equal(s.runs,0); assert.equal(s.results,original); assert.equal(s.pdfDirty,true); assert.equal(s.analysisDialog.open,false);
});
test('Analyze confirmation starts analysis once', async () => {
  const s=setup(true); await s.$('#run').onclick();
  assert.equal(s.prompts,1); assert.equal(s.runs,1); assert.equal(s.pdfDirty,false); assert.equal(s.activeAppPage,'timesheets');
});
test('Reset cancellation leaves results untouched', () => {
  const s=setup(false), original=s.results; s.$('#reset').onclick();
  assert.equal(s.prompts,1); assert.equal(s.results,original); assert.equal(s.pdfDirty,true); assert.equal(s.updates,0);
});
test('Reset confirmation clears results', () => {
  const s=setup(true); s.$('#reset').onclick();
  assert.equal(s.prompts,1); assert.equal(s.results.length,0); assert.equal(s.pdfDirty,false); assert.equal(s.updates,1);
});
test('Reopening the same timesheet asks before overwriting the draft', async () => {
  const s=setup(false); vm.runInContext(opening+'return true;}',s);
  assert.equal(await s.openTimesheetDetail(s.previewCurrent),undefined); assert.equal(s.prompts,1); assert.equal(s.pdfDirty,true);
});
test('Sidebar navigation cancellation preserves current page', () => {
  const s=setup(false); assert.equal(s.showPage('contracts'),false); assert.equal(s.activeAppPage,'timesheetDetail'); assert.equal(s.pdfDirty,true);
});
