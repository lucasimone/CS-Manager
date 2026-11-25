// QA-only adapter: embedded synthetic bytes, disposable writes, no native handles.
function demoDirectory(name){
 const children=new Map();
 return {kind:'directory',name,children,
   async queryPermission(){return 'granted'},
   async requestPermission(){return 'granted'},
   async *entries(){yield* children.entries()},
   async getFileHandle(name,{create=false}={}){
     if(!children.has(name)&&create)children.set(name,demoFile(name,new Uint8Array()));
     const h=children.get(name);
     if(!h||h.kind!=='file')throw new DOMException('Synthetic file not found','NotFoundError');
     return h;
   }
 };
}
function demoFile(name,bytes){
 let blob=new Blob([bytes]);
 return {kind:'file',name,async queryPermission(){return 'granted'},async requestPermission(){return 'granted'},
   async getFile(){return new File([blob],name)},
   async createWritable(){
     let pending=blob,closed=false;
     return {async write(value){if(closed)throw Error('Writer closed');pending=new Blob([value])},
       async close(){if(closed)throw Error('Writer closed');blob=pending;closed=true},
       async abort(){closed=true}};
   }
 };
}
function decodeDemo(value){return Uint8Array.from(atob(value),c=>c.charCodeAt(0))}
async function startDemo(){
 const banner=document.createElement('div');
 banner.id='demoBanner';banner.setAttribute('role','status');
 banner.style.cssText='position:relative;z-index:1;padding:6px 12px;background:#573d91;color:white;display:flex;align-items:center;justify-content:space-between;gap:12px;font:600 12px system-ui';
 const label=document.createElement('span');label.textContent='DEMO / QA — synthetic data only · changes reset on reload';
 const reset=document.createElement('button');reset.id='demoReset';reset.textContent='Reset demo';reset.style.cssText='background:white;color:#573d91;padding:3px 10px;border:0;border-radius:4px';
 reset.onclick=()=>{if(confirm('Reset synthetic demo data?'))location.reload()};
 banner.append(label,reset);document.body.prepend(banner);
 document.title='CS-Manager — DEMO / QA';
 for(const id of ['pickMaster','pickDirectory','reconnectMaster','reconnectDirectory','master','yearFolder','files','folder','nativeMasterLabel']){
   const node=$('#'+id);if(!node)continue;
   node.disabled=true;node.classList.add('hidden');node.onclick=null;node.onchange=null;
 }
 // Defense in depth: never invoke production handle persistence or native pickers.
 storedHandle=async()=>{throw Error('Persistent handles disabled in demo')};
 window.showOpenFilePicker=async()=>{throw new DOMException('Demo only','AbortError')};
 window.showDirectoryPicker=async()=>{throw new DOMException('Demo only','AbortError')};
 // Disable external email actions while retaining production draft preparation.
 $('#openFinanceMail').onclick=()=>{$('#financeMailStatus').textContent='DEMO: email opening disabled.'};
 $('#pmContactOpen').onclick=()=>{alert('DEMO: email opening disabled.')};
 window.print=()=>{alert('DEMO: native printing disabled.')};
 const year=demoDirectory('2026');
 for(const [key,value] of Object.entries(demoFixtures)){
   if(key==='master.xlsx')continue;
   const parts=key.split('/').slice(1),name=parts.pop();let dir=year;
   for(const part of parts){if(!dir.children.has(part))dir.children.set(part,demoDirectory(part));dir=dir.children.get(part)}
   dir.children.set(name,demoFile(name,decodeDemo(value)));
 }
 savedMasterHandle=demoFile('master.xlsx',decodeDemo(demoFixtures['master.xlsx']));
 savedDirectoryHandle=year;editedMasterFile=null;
 $('#userName').value='Demo reviewer';$('#skipPrefix').value='SKIP';
 $('#deliveryBasePath').value='DEMO/2026';
 handleStatus('master',savedMasterHandle,true);handleStatus('directory',year,true);
 await activateMaster(await savedMasterHandle.getFile());
 await runAnalysis();
 if(results.length!==2||!masterLoaded)throw Error('Synthetic analysis failed');
 showPage('contracts');banner.dataset.ready='true';
}
startDemo().catch(error=>{
 const banner=$('#demoBanner');if(banner){banner.dataset.ready='false';banner.textContent='DEMO initialization failed: '+error.message}
 console.error(error);
});
