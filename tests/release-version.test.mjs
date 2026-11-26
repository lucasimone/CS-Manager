import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('current release version agrees across application and documentation',()=>{
 const html=read('index.html'),v=html.match(/<title>CS-Manager (\d+\.\d+\.\d+)/)?.[1];assert.ok(v);
 assert.equal(html.match(/id="openChangelog"[^>]*>(\d+\.\d+\.\d+)</)?.[1],v);
 assert.equal(html.match(/CHANGELOG:APP:START -->\s*<article[^>]*><h3>(\d+\.\d+\.\d+)</)?.[1],v);
 assert.equal(read('README.md').match(/Current documented release: \*\*(\d+\.\d+\.\d+)\*\*/)?.[1],v);
 for(const p of ['INSTALLATION.md','docs/USER_GUIDE.md'])assert.equal(read(p).match(/^# CS-Manager (\d+\.\d+\.\d+):/)?.[1],v,p);
 assert.equal(read('docs/CHANGELOG.md').match(/^#{2,3} (\d+\.\d+\.\d+)/m)?.[1],v);
});
