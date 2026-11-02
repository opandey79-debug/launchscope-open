const byId=id=>document.getElementById(id);
const form=byId('scan-form'),field=byId('website'),button=byId('run'),status=byId('status');
let latest=null;
byId('year').textContent=String(new Date().getFullYear());
byId('share-app').addEventListener('click',async()=>{
 const url='https://launchscope-open.onrender.com/';
 const title='LaunchScope Open — free website launch checker';
 const message='Check 12 website launch essentials for free — no signup required.';
 const status=byId('share-status');
 try{
  if(typeof navigator.share==='function'){
   await navigator.share({title,text:message,url});
   status.textContent='Shared successfully.';
  }else if(navigator.clipboard && typeof navigator.clipboard.writeText==='function'){
   await navigator.clipboard.writeText(url);
   status.textContent='✓ LaunchScope link copied. Share it with a friend.';
  }else{
   const tmp=document.createElement('textarea');tmp.value=url;tmp.style.position='fixed';tmp.style.opacity='0';
   document.body.append(tmp);tmp.select();
   const copied=document.execCommand('copy');tmp.remove();
   if(!copied)throw new Error('Copy not available');
   status.textContent='✓ LaunchScope link copied. Share it with a friend.';
  }
 }catch(e){status.textContent=e?.name==='AbortError'?'Share cancelled.':'Unable to share automatically. Copy the website URL from your browser.';}
});
// Maintainers: set these on your own GitHub repository after getting approved by Hostinger.
// This placeholder deliberately does NOT attribute clicks or commissions to anyone.
const repo='https://github.com/opandey79-debug/launchscope-open';
const partnerDeployUrl=''; // Copy your unique approved URL from Hostinger hPanel.
if(repo){byId('github-top').href=repo;byId('self-host-link').href=repo;}
if(partnerDeployUrl){byId('deploy-link').href=partnerDeployUrl;byId('deploy-link').firstChild.textContent='Deploy on Hostinger ';}
const phrases={reach:'Website status',https:'HTTPS',title:'SEO title',titleLength:'Title length',description:'Meta description',descriptionLength:'Description length',h1:'H1 structure',viewport:'Mobile viewport',robots:'robots.txt',sitemap:'XML sitemap',headers:'Security headers',favicon:'Favicon'};
function render(report){
 latest=report;byId('report').hidden=false;
 byId('preview-state').textContent='LIVE AUDIT';
 document.querySelector('.preview').setAttribute('aria-label','Latest website audit results');
 const score=report.score;
 byId('score-value').textContent=score;
 byId('score-ring').style.background=`conic-gradient(${score>=60?'#bcfb80':'#ffbb75'} 0 ${score}%, #3b4453 ${score}% 100%)`;
 byId('result-domain').textContent=new URL(report.url).host;
 byId('result-code').textContent=`● HTTP ${report.httpStatus}`;
 byId('result-grade').textContent=report.grade+'.';
 byId('score-description').textContent=`${report.items.filter(x=>x.passed).length} of ${report.items.length} launch checks passed. ${report.items.length-report.items.filter(x=>x.passed).length} opportunities to improve.`;
 byId('report-count').textContent=report.items.length;
 byId('response-time').textContent=`${(report.responseMs/1000).toFixed(1)}s scan`;
 const checks=byId('checks-preview');checks.replaceChildren();
 report.items.slice(0,4).forEach(item=>{
  const line=document.createElement('div');line.className='checkline';
  const icon=document.createElement('span');icon.className=item.passed?'greencheck':'warncheck';icon.textContent=item.passed?'✓':'!';
  const name=document.createElement('span');name.textContent=phrases[item.id]||item.name;
  const tag=document.createElement('span');tag.className=item.passed?'tag-good':'tag-warn';tag.textContent=item.passed?'PASSED':'REVIEW';
  line.append(icon,name,tag);checks.append(line);
 });
 const items=byId('findings');items.replaceChildren();
 report.items.forEach(item=>{
  const el=document.createElement('article');el.className='finding';
  const top=document.createElement('div');top.className='finding-top';
  const group=document.createElement('span');group.className='finding-group';group.textContent=item.group;
  const state=document.createElement('span');state.className='finding-state'+(item.passed?'':' failed');state.textContent=item.passed?'✓ PASSED':'! REVIEW';top.append(group,state);
  const h=document.createElement('h3');h.textContent=item.name;
  const p=document.createElement('p');p.textContent=item.detail;
  el.append(top,h,p);
  if(!item.passed){const tip=document.createElement('div');tip.className='finding-tip';tip.textContent='TIP · '+item.tip;el.append(tip);}
  items.append(el);
 });
 byId('report-subtitle').textContent=`${new URL(report.url).host} · Checked ${new Date(report.checkedAt).toLocaleString()}`;
 byId('report').scrollIntoView({behavior:'smooth',block:'start'});
}
form.addEventListener('submit',async e=>{
 e.preventDefault();const url=field.value.trim();if(!url)return;
 button.disabled=true;button.textContent='Checking…';status.classList.remove('error');status.textContent='Connecting securely and checking the website…';
 try{
  const response=await fetch('/api/audit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'The check failed.');
  render(data);byId('report-action-status').textContent='';status.textContent='✓ Scan completed. Export as CSV or JSON, copy the summary, or save as PDF.';
 }catch(err){status.textContent='⚠ '+err.message;status.classList.add('error');}
 finally{button.disabled=false;button.innerHTML='Run free audit <span aria-hidden="true">↗</span>';}
});
byId('save-json').addEventListener('click',()=>{
 if(!latest)return;
 download(JSON.stringify(latest,null,2),'application/json','.json');
 showActionStatus('✓ JSON report downloaded.');
});

function safeCSVCell(value) {
 // Guard spreadsheet users against formula injection from audited site metadata.
 let cell=String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim();
 if(/^[=+@\-]/.test(cell)) cell="'"+cell;
 return '"'+cell.replace(/"/g,'""')+'"';
}
function makeCSV(report) {
 const rows=[['Website',report.url],['Score',String(report.score)+'/100'],['Grade',report.grade],
   ['Checked at',report.checkedAt],[],['Category','Check','Status','Points earned','Available points','Details','Recommendation']];
 report.items.forEach(item=>rows.push([item.group,item.name,item.passed?'Passed':'Needs review',
   item.passed?item.points:0,item.points,item.detail,item.passed?'':item.tip]));
 return '\uFEFF'+rows.map(row=>row.map(safeCSVCell).join(',')).join('\r\n');
}
function download(text,mime,suffix) {
 if(!latest)return;
 const blob=new Blob([text],{type:mime});
 const u=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=u;a.download='launchscope-'+new URL(latest.url).hostname+'-'+new Date().toISOString().slice(0,10)+suffix;
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function showActionStatus(message) { byId('report-action-status').textContent=message; }
byId('save-csv').addEventListener('click',()=>{
 if(!latest)return;
 download(makeCSV(latest),'text/csv;charset=utf-8','.csv');
 showActionStatus('✓ CSV report downloaded.');
});
byId('copy-summary').addEventListener('click',async()=>{
 if(!latest)return;
 const passed=latest.items.filter(item=>item.passed).length;
 const site=latest.url;
 const shareURL=new URL(window.location.origin+'/');
 shareURL.searchParams.set('site',site);
 const summary=[
   'LaunchScope Open — Website Launch Check',
   'Website: '+site,
   'Score: '+latest.score+'/100 ('+latest.grade+')',
   'Checks: '+passed+'/'+latest.items.length+' passed',
   '',
   ...latest.items.map(item=>(item.passed?'✓ ':'! ')+item.name+': '+(item.passed?'Passed':'Review')),
   '',
   'Run your own audit: '+shareURL,
   'Note: A basic technical checklist, not a comprehensive security or SEO audit.'
 ].join('\n');
 try {
  if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(summary);
  else {
   const t=document.createElement('textarea');t.value=summary;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();
   if(!document.execCommand('copy'))throw new Error('Copy unavailable');
   t.remove();
  }
  showActionStatus('✓ Summary copied. Share it with your developer or team.');
 } catch { showActionStatus('Copy was blocked by your browser. Use CSV or Print / PDF instead.'); }
});
byId('try-example').addEventListener('click',()=>{
 field.value='https://example.com';
 field.focus();
 status.textContent='Example added. Press Run free audit to view a real report.';
});
try {
 const suggested=new URL(window.location.href).searchParams.get('site');
 if(suggested && suggested.length<=2048 && /^https?:\/\//i.test(suggested)) field.value=suggested;
} catch { /* ignore invalid URL parameters */ }

byId('print-report').addEventListener('click',()=>{if(latest)window.print();});
