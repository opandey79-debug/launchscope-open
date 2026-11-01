const byId=id=>document.getElementById(id);
const form=byId('scan-form'),field=byId('website'),button=byId('run'),status=byId('status');
let latest=null;
byId('year').textContent=String(new Date().getFullYear());
// Maintainers: set these on your own GitHub repository after getting approved by Hostinger.
// This placeholder deliberately does NOT attribute clicks or commissions to anyone.
const repo='https://github.com/opandey79-debug/launchscope-open';
const partnerDeployUrl=''; // Copy your unique approved URL from Hostinger hPanel.
if(repo){byId('github-top').href=repo;byId('self-host-link').href=repo;}
if(partnerDeployUrl){byId('deploy-link').href=partnerDeployUrl;byId('deploy-link').firstChild.textContent='Deploy on Hostinger ';}
const phrases={reach:'Website status',https:'HTTPS',title:'SEO title',titleLength:'Title length',description:'Meta description',descriptionLength:'Description length',h1:'H1 structure',viewport:'Mobile viewport',robots:'robots.txt',sitemap:'XML sitemap',headers:'Security headers',favicon:'Favicon'};
function render(report){
 latest=report;byId('report').hidden=false;
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
  render(data);status.textContent='✓ Scan completed. You can export or print the full report.';
 }catch(err){status.textContent='⚠ '+err.message;status.classList.add('error');}
 finally{button.disabled=false;button.innerHTML='Run free audit <span aria-hidden="true">↗</span>';}
});
byId('save-json').addEventListener('click',()=>{
 if(!latest)return;
 const blob=new Blob([JSON.stringify(latest,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`launchscope-${new URL(latest.url).hostname}-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
});
byId('print-report').addEventListener('click',()=>{if(latest)window.print();});
