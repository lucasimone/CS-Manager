"""Generate synthetic XLSX fixtures using only Python's standard library."""
from pathlib import Path
import datetime,calendar
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parent/"generated"
NS="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG="http://schemas.openxmlformats.org/package/2006/relationships"
def sheet(cells):
    rows={}
    for (row,col),v in cells.items():
        ref=chr(65+col)+str(row)
        if isinstance(v,tuple):
            f,cache=v
            cell=f'<c r="{ref}"><f>{escape(f)}</f>'+('' if cache is None else f'<v>{cache}</v>')+'</c>'
        elif isinstance(v,(int,float)):
            cell=f'<c r="{ref}"><v>{v}</v></c>'
        else:
            cell=f'<c r="{ref}" t="inlineStr"><is><t>{escape(str(v))}</t></is></c>'
        rows.setdefault(row,[]).append((col,cell))
    return f'<worksheet xmlns="{NS}"><sheetData>'+''.join(f'<row r="{r}">'+''.join(c for _,c in sorted(cs))+'</row>' for r,cs in sorted(rows.items()))+'</sheetData></worksheet>'
def write(path,sheets,date1904=False):
    path.parent.mkdir(parents=True,exist_ok=True)
    names=list(sheets)
    with ZipFile(path,'w',ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1,len(names)+1))+'</Types>')
        z.writestr('_rels/.rels',f'<Relationships xmlns="{PKG}"><Relationship Id="rId1" Type="{REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        z.writestr('xl/workbook.xml',f'<workbook xmlns="{NS}" xmlns:r="{REL}"><workbookPr date1904="{int(date1904)}"/><sheets>'+''.join(f'<sheet name="{escape(name)}" sheetId="{i}" r:id="rId{i}"/>' for i,name in enumerate(names,1))+'</sheets></workbook>')
        z.writestr('xl/_rels/workbook.xml.rels',f'<Relationships xmlns="{PKG}">'+''.join(f'<Relationship Id="rId{i}" Type="{REL}/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1,len(names)+1))+'</Relationships>')
        for i,name in enumerate(names,1):z.writestr(f'xl/worksheets/sheet{i}.xml',sheet(sheets[name]))
def rows(values):
    return {(i,j):v for i,row in enumerate(values,1) for j,v in enumerate(row)}
def synthetic_hours(day):
    # Fictional calendar, not the institutional calendar.
    if day.weekday()>=5 or (day.month,day.day) in {(1,1),(8,17),(9,16),(10,15),(12,24),(12,25),(12,28),(12,29),(12,30),(12,31)}:return 0
    if day.weekday()==4:return 8.5 if day.day%2==0 and day!=datetime.date(2026,10,2) else 5
    return 8.5
def synthetic_calendar():
    data=[['Month','Date','Hours','Day','Location','Reason']]
    for i in range(365):
        d=datetime.date(2026,1,1)+datetime.timedelta(days=i)
        data.append([d.strftime('%B'),(d-datetime.date(1899,12,30)).days,synthetic_hours(d),d.strftime('%A'), 'LU' if (d.month,d.day)==(8,17) else 'BR' if (d.month,d.day)==(9,16) else '', 'Synthetic local holiday' if (d.month,d.day) in {(8,17),(9,16)} else 'Synthetic closure' if (d.month,d.day)==(10,15) else ''])
    return rows(data)
ref='DEMO/CS001'
po='1000000001'
write(ROOT/'master.xlsx',{'Calendar':synthetic_calendar(),'Contracts':rows([['CS','PO','VALID_FROM','VALID_TO','FTU','Owner','BUDGET','Available','TYPE','Status','TITLE'],[ref,po,'2026-01-01','2026-12-31',2,'Demo',100000,90000,'TM','Active','Synthetic contract']]),'Persone e tariffe PO':rows([['Profilo','Nome e cognome','PO','PM','Tariffa NS / ora','Tariffa OS / ora','Contratto','Foglio origine','Riga origine','Note','Active','Contractor'],['DEV','Demo Standard',po,'Demo PM',40,60,ref,'',0,'','yes','Demo company'],['DEV','Demo Vtwo',po,'Demo PM',40,60,ref,'',0,'','yes','Demo company']])})
def timesheet(v2=False,wrong=False,formula_missing=False):
    c={(4,3):ref,(5,3):po,(6,3):'2026-09' if wrong else '2026-10',(10,1):'DAY',(10,3):'On-site',(10,4):'Near-site',(10,5):'Number of additional hours'}
    if v2:c.update({(7,1):'FAMILY NAME',(7,3):'Vtwo',(8,1):'FIRST NAME',(8,3):'Demo',(9,3):'DEV-STD'})
    else:c.update({(7,3):'Demo Standard',(8,3):'DEV',(9,3):'STD'})
    for day in range(1,32):c[(10+day,1)]=day
    c.update({(11,3):8.5,(12,4):5,(42,2):'TOTAL',(42,3):('SUM(D11:D41)',None if formula_missing else 8.5),(42,4):('SUM(E11:E41)',5),(43,3):('D42+E42',13.5)})
    return {'TIMESHEET':c}
write(ROOT/'2026'/'10'/'demo'/'standard.xlsx',timesheet())
write(ROOT/'2026'/'10'/'demo'/'v2.xlsx',timesheet(True))
write(ROOT/'wrong-month.xlsx',timesheet(wrong=True))
write(ROOT/'missing-cache.xlsx',timesheet(formula_missing=True))
(ROOT/'bad.xlsx').write_bytes(b'not an XLSX archive')
