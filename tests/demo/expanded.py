"""Generate a richer fictional portfolio, separate from deterministic regression fixtures."""
from pathlib import Path
import calendar,datetime,runpy,shutil
root=Path(__file__).resolve().parents[2]
lib=runpy.run_path(str(root/'tests/fixtures/generate.py'))
write,rows=lib['write'],lib['rows']
out=Path(__file__).resolve().parent/'generated'
if out.exists():shutil.rmtree(out)
contracts=[['CS','PO','VALID_FROM','VALID_TO','FTU','Owner','BUDGET','Available','TYPE','Status','TITLE']]
people=[['Profilo','Nome e cognome','PO','PM','Tariffa NS / ora','Tariffa OS / ora','Contratto','Foglio origine','Riga origine','Note','Active','Contractor','Ore previste NS','Ore previste OS','Gestione risorsa']]
titles=['Web portal','Data catalogue','Visitor services','Search platform','Reporting','Identity services','Content platform','Metadata services','Integration hub','Operations support','Analytics','Archive services']
profiles=['DEV','QA','BA','PM']
for k,title in enumerate(titles,1):
    ref=f'DEMO/CS{k:03d}'
    po=str(1000000000+k)
    size=4 if k<=4 else 3
    status='Active' if k<=9 else ('Pending' if k==10 else 'Closed')
    kind=['TM','QTM','FP'][(k-1)%3]
    budget=80000+k*27000
    balance=budget*(0.15+(k%5)*0.15)
    contracts.append([ref,po,'2026-01-01','2026-12-31',size,'Demo owner',budget,round(balance,2),kind,status,title])
    for j in range(size):
        name=f'Demo Resource {k:02d}-{j+1:02d}'
        profile=profiles[(k+j)%4]
        ns_rate=45+5*((k+j)%5)
        os_rate=ns_rate+15
        people.append([profile,name,po,f'Demo PM {k:02d}',ns_rate,os_rate,ref,'',0,'','yes',f'Demo supplier {(k-1)%3+1}',640,320,'CS-Manager'])
        if status!='Active':continue
        for month in (8,9,10):
            if (k+j+month)%13==0:continue
            actual=month-1 if (k+j+month)%19==0 else month
            c={(4,3):ref,(5,3):po,(6,3):f'2026-{actual:02d}',(7,3):name,(8,3):profile,(9,3):'STD',(10,1):'DAY',(10,3):'On-site',(10,4):'Near-site',(10,5):'Number of additional hours'}
            os=ns=0
            for day in range(1,calendar.monthrange(2026,actual)[1]+1):
                row=10+day;c[(row,1)]=day
                wd=datetime.date(2026,actual,day).weekday()
                h=lib['synthetic_hours'](datetime.date(2026,actual,day))
                # Deliberate examples: closure work and excess on short days.
                if k==1 and j==0 and month==10 and day==15:h=8.5
                if k==4 and j==0 and month==9 and wd==4 and h==5:h=8.5
                if not h:continue
                if (day+k+j)%4==0:c[(row,3)]=h;os+=h
                else:c[(row,4)]=h;ns+=h
            c.update({(42,2):'TOTAL',(42,3):('SUM(D11:D41)',os),(42,4):('SUM(E11:E41)',ns),(43,3):('D42+E42',os+ns)})
            write(out/'2026'/f'{month:02d}'/f'CS{k:03d}'/f'resource-{k:02d}-{j+1:02d}.xlsx',{'TIMESHEET':c})
write(out/'master.xlsx',{'Calendar':lib['synthetic_calendar'](),'Contracts':rows(contracts),'Persone e tariffe PO':rows(people)})
print('Synthetic portfolio:',len(contracts)-1,'contracts,',len(people)-1,'resources')
