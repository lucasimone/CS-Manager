import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const src=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function between(a,b){const i=src.indexOf(a),j=src.indexOf(b,i+a.length);assert.ok(i>=0&&j>i);return src.slice(i,j)}
function context(extra={}){return vm.createContext({contractDate1904:false,txt:x=>String(x??'').trim(),...extra})}
test('Excel 1900 and 1904 dates agree with edit values',()=>{
 const c=context();vm.runInContext(between('function contractDate(','function renderContracts(')+between('function contractInputDate(','function setNumericSheetValue('),c);
 assert.equal(c.contractInputDate('45000',false),'2023-03-15');assert.equal(c.contractDate('45000',false),'15/03/2023');
 assert.equal(c.contractInputDate('45000',true),'2027-03-16');assert.equal(c.contractDate('45000',true),'16/03/2027');
 assert.equal(c.contractDate('',''), '—');
});
test('CSV escapes formulas but retains negative numeric values and quotes',()=>{
 const c=context();vm.runInContext(between('function csvCell(','function exportTimesheets('),c);
 for(const value of ['=1+1','+1','-1','@SUM(A1)','  =1','\t=1','\ntext'])assert.equal(c.csvCell(value),'"\''+value+'"');
 assert.equal(c.csvCell(-4.25),'"-4.25"');assert.equal(c.csvCell('a;"b"'),'"a;""b"""');assert.equal(c.csvCell(null),'""');
});
test('CSV filtering uses the same month, status and search as the table',()=>{
 const rows=[{file:'A',expected:'2026-10',status:'ok',controlValidated:true},{file:'B',expected:'2026-10',status:'review'},{file:'A2',expected:'2026-09',status:'ok',controlValidated:true}];
 const fields={'#search':{value:'a'},'#filter':{value:'validated'},'#viewMonth':{value:'2026-10'}};
 const c=context({results:rows,$:id=>fields[id]});vm.runInContext(between('function filteredTimesheets(','function update(){updateCosts();'),c);
 assert.equal(c.filteredTimesheets().length,1);assert.equal(c.filteredTimesheets()[0].file,'A');
 fields['#search'].value='';fields['#filter'].value='';fields['#viewMonth'].value='';assert.equal(c.filteredTimesheets().length,3);
});
test('Form snapshot detects edits and reversion; canceled close preserves resource draft',()=>{
 const field={id:'demo',value:'original',type:'text'}, modal={open:true,close(){this.open=false}}, form={querySelectorAll:()=>[field],classList:{contains:()=>false}};
 const nodes={'#contractForm':form,'#resourceForm':form,'#resourceModal':modal,'#resourceSave':{disabled:false}};
 let approve=false,prompts=0;const c=context({$:id=>nodes[id],activeAppPage:'contractDetail',confirm:()=>{prompts++;return approve},translateText:x=>x});
 vm.runInContext(between('var contractDraftBaseline=','function canDiscardTimesheetDraft(')+between('function requestResourceClose()','$(\'#resourceCancel\').onclick='),c);
 c.contractDraftBaseline=c.formSnapshot('contractForm');c.resourceDraftBaseline=c.formSnapshot('resourceForm');
 assert.equal(c.contractDraftDirty(),false);field.value='changed';assert.equal(c.contractDraftDirty(),true);
 assert.equal(c.requestResourceClose(),false);assert.equal(modal.open,true);assert.equal(prompts,1);
 field.value='original';assert.equal(c.contractDraftDirty(),false);field.value='changed';approve=true;assert.equal(c.requestResourceClose(),true);assert.equal(modal.open,false);
});
