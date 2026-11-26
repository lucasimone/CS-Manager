"""Build a disposable, standalone QA edition from the current distribution."""
from pathlib import Path
import argparse,base64,json,subprocess,sys
parser=argparse.ArgumentParser()
parser.add_argument('--expanded',action='store_true',help='Build public demo with a richer synthetic portfolio')
args=parser.parse_args()
root=Path(__file__).resolve().parents[2]
subprocess.run([sys.executable,str(root/'tests/fixtures/generate.py')],check=True)
fixtures=root/'tests/fixtures/generated'
if args.expanded:
    subprocess.run([sys.executable,str(root/'tests/demo/expanded.py')],check=True)
    fixtures=root/'tests/demo/generated'
payload={str(p.relative_to(fixtures)).replace('\\','/'):base64.b64encode(p.read_bytes()).decode() for p in [fixtures/'master.xlsx',*sorted((fixtures/'2026').rglob('*.xlsx'))]}
source=(root/'index.html').read_text(encoding='utf-8')
def once(old,new):
    global source
    if source.count(old)!=1:raise RuntimeError('Unexpected integration boundary: '+old[:80])
    source=source.replace(old,new,1)
# Do not read the production IndexedDB handles or production localStorage.
once("restoreSettings();","/* QA edition: production handle restoration disabled */")
once("'use strict';\nconst $=", "'use strict';\nconst demoStorage=(()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})();\nconst $=")
source=source.replace('localStorage.','demoStorage.')
once('id="launchDemo"','id="launchDemo" hidden')
adapter=(root/'tests/demo/adapter.js').read_text(encoding='utf-8')
once('</script></body></html>', '\nconst demoFixtures='+json.dumps(payload,separators=(',',':'))+';\nconst demoExpanded='+json.dumps(args.expanded)+';\n'+adapter+'\n</script></body></html>')
out=root/'demo'/('expanded.html' if args.expanded else 'index.html')
out.parent.mkdir(exist_ok=True)
out.write_text(source,encoding='utf-8')
print('Generated standalone QA edition:',out)
