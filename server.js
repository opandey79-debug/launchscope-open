import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY = 550_000;
const MAX_REQUEST_BODY = 2_048;
const limits = new Map();
let activeAudits = 0;

function publicIP(ip) {
  if (!ip || net.isIP(ip) === 0) return false;
  const lower = ip.toLowerCase().split('%')[0];
  if (net.isIP(lower) === 6) {
    if (lower === '::1' || lower === '::' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('ff')) return false;
    if (lower.startsWith('::ffff:')) return publicIP(lower.slice(7));
    // Only unicast globally routable IPv6. Reserved/documentation ranges are denied.
    const group = parseInt(lower.split(':')[0] || '0', 16);
    return group >= 0x2000 && group <= 0x3fff && !lower.startsWith('2001:db8:');
  }
  const [a,b,c] = lower.split('.').map(Number);
  if (a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a === 192 && b === 0 && c === 0 || a === 192 && b === 0 && c === 2 || a === 198 && (b === 18 || b === 19 || b === 51 && c === 100) || a === 203 && b === 0 && c === 113 || a === 255) return false;
  return true;
}

function validateURL(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) throw new Error('Enter a valid public website URL.');
  let raw = value.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let u;
  try { u = new URL(raw); } catch { throw new Error('That URL is not valid.'); }
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.hostname.length > 253) throw new Error('Only public HTTP(S) websites can be audited.');
  if (u.port && u.port !== '80' && u.port !== '443') throw new Error('Custom ports are not supported.');
  const host = u.hostname.replace(/\[|\]/g,'').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.') || (net.isIP(host) && !publicIP(host))) throw new Error('Private and local hosts cannot be audited.');
  u.hash = '';
  return u;
}

// DNS answers are validated in the same socket lookup step to avoid unsafe internal fetches.
function safeLookup(host, options, callback) {
  dns.lookup(host, { all: true, verbatim: true }, (err, list) => {
    if (err) return callback(err);
    if (!list?.length || list.some(({address}) => !publicIP(address))) return callback(new Error('This host resolves to a private or reserved IP address.'));
    if (options?.all) return callback(null, list);
    const chosen = list.find(x => !options?.family || options.family === x.family) || list[0];
    callback(null, chosen.address, chosen.family);
  });
}

function fetchSafe(url, method='GET', redirectCount=0, maxBody=MAX_BODY) {
  return new Promise((resolve,reject) => {
    let u;
    try { u = validateURL(url.toString()); } catch(e) { return reject(e); }
    const client = u.protocol === 'https:' ? https : http;
    let settled=false;
    const done=(err,res)=>{if(settled)return;settled=true;err?reject(err):resolve(res)};
    const req=client.request(u, {
      method, lookup:safeLookup, timeout:9000, headers:{
        'user-agent':'LaunchScope/1.0 (+open-source website health checker)',
        'accept':'text/html,text/plain,application/xml;q=0.9,*/*;q=0.4',
        'accept-encoding':'identity',
        'connection':'close'
      }
    }, res=> {
      const ssl = u.protocol === 'https:' ? res.socket?.getPeerCertificate?.() : null;
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        res.resume();
        if (redirectCount >= 3) return done(new Error('Too many redirects.'));
        let next;
        try { next=new URL(res.headers.location, u); validateURL(next.toString()); } catch {return done(new Error('Redirect points to an unsupported URL.'));}
        return fetchSafe(next.toString(), method, redirectCount+1, maxBody).then(done.bind(null,null),done);
      }
      const data=[]; let size=0; let clipped=false;
      res.on('data', chunk=> {
        size += chunk.length;
        if (size <= maxBody) data.push(chunk);
        else if (!clipped) {
          clipped=true;
          data.push(chunk.subarray(0,Math.max(0,maxBody-(size-chunk.length))));
          done(null,{status:res.statusCode,headers:res.headers,url:u.toString(),body:Buffer.concat(data).toString('utf8'),sslExpires:ssl?.valid_to||null,clipped:true});
          res.destroy();
        }
      });
      res.on('end',()=>done(null, {status:res.statusCode,headers:res.headers,url:u.toString(),body:Buffer.concat(data).toString('utf8'),sslExpires:ssl?.valid_to||null,clipped}));
      res.on('error', e=>done(e));
    });
    req.on('timeout',()=>req.destroy(new Error('The website took too long to respond.')));
    req.on('error',e=>done(e));
    req.end();
  });
}

function decodeEntities(s='') {
  return s.replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp);/gi, m => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&nbsp;':' '}[m.toLowerCase()]||m)).replace(/\s+/g,' ').trim();
}
function getTag(html, pattern) { return decodeEntities(html.match(pattern)?.[1] || ''); }
function attributes(tag) {
  const out = {};
  for(const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) out[match[1].toLowerCase()] = match[2]??match[3]??match[4];
  return out;
}
function getMeta(html, name) {
  for (const t of html.match(/<meta\b[^>]*>/gi)||[]) { const attrs=attributes(t); if ((attrs.name||attrs.property||'').toLowerCase()===name) return decodeEntities(attrs.content||''); }
  return '';
}
function extract(html) {
  const title=getTag(html, /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const description=getMeta(html,'description');
  const headings=(html.match(/<h1(?:\s|>)[^>]*>/gi)||[]).length;
  const viewport=!!getMeta(html,'viewport');
  const icon=/<link\b[^>]*rel\s*=\s*["'][^"']*\bicon\b[^"']*["'][^>]*>/i.test(html)||/<link\b[^>]*rel\s*=\s*icon(?:\s|>)/i.test(html);
  return {title,description,headings,viewport,icon};
}
function assess(result, robotsOk, sitemapOk) {
  const p=extract(result.body);
  const h=result.headers;
  const items=[
    {id:'reach',group:'Availability',name:'Website reachable',points:15,passed:result.status>=200&&result.status<400,detail:`HTTP ${result.status}`,tip:'Fix server errors and confirm your domain resolves.'},
    {id:'https',group:'Security',name:'HTTPS enabled',points:15,passed:result.url.startsWith('https:'),detail:result.url.startsWith('https:')?'Encrypted connection':'HTTP connection',tip:'Install a valid SSL certificate and redirect HTTP to HTTPS.'},
    {id:'title',group:'SEO',name:'Page title present',points:10,passed:!!p.title,detail:p.title? p.title.slice(0,110):'Missing title',tip:'Add a unique, descriptive <title> to the page.'},
    {id:'titleLength',group:'SEO',name:'Title length',points:5,passed:p.title.length>=15&&p.title.length<=60,detail:`${p.title.length} characters`,tip:'Aim for an informative title around 15–60 characters.'},
    {id:'description',group:'SEO',name:'Meta description present',points:10,passed:!!p.description,detail:p.description?p.description.slice(0,140):'Missing description',tip:'Add a useful <meta name="description">.'},
    {id:'descriptionLength',group:'SEO',name:'Description length',points:5,passed:p.description.length>=50&&p.description.length<=160,detail:`${p.description.length} characters`,tip:'Aim for a description around 50–160 characters.'},
    {id:'h1',group:'Structure',name:'One clear H1 heading',points:10,passed:p.headings===1,detail:`${p.headings} H1 heading(s)`,tip:'Use one main H1 that describes your page.'},
    {id:'viewport',group:'Structure',name:'Mobile viewport tag',points:5,passed:p.viewport,detail:p.viewport?'Viewport detected':'Not found',tip:'Add a responsive viewport meta tag.'},
    {id:'robots',group:'Discoverability',name:'robots.txt available',points:5,passed:robotsOk,detail:robotsOk?'Found':'Not found',tip:'Publish /robots.txt with instructions for crawlers.'},
    {id:'sitemap',group:'Discoverability',name:'sitemap.xml available',points:5,passed:sitemapOk,detail:sitemapOk?'Found':'Not found',tip:'Publish /sitemap.xml or update the SEO plugin sitemap.'},
    {id:'headers',group:'Security',name:'Basic security headers',points:10,passed:!!h['x-content-type-options']&&!!h['content-security-policy']&&!!h['strict-transport-security'],detail:`${['x-content-type-options','content-security-policy','strict-transport-security'].filter(k=>h[k]).length}/3 found`,tip:'Review CSP, HSTS, and X-Content-Type-Options on your server.'},
    {id:'favicon',group:'Branding',name:'Favicon declared',points:5,passed:p.icon,detail:p.icon?'Icon linked in HTML':'No icon link found',tip:'Declare a favicon with <link rel="icon">.'}
  ];
  const score=items.reduce((sum,item)=>sum+(item.passed?item.points:0),0);
  const sslDays=result.sslExpires?Math.ceil((new Date(result.sslExpires)-Date.now())/86400000):null;
  return {score,grade:score>=85?'Launch ready':score>=60?'Almost there':'Needs attention',items,summary:{title:p.title||'Untitled website',description:p.description||'',sslDays},checkedAt:new Date().toISOString()};
}

async function audit(input) {
  const url=validateURL(input);
  const started=Date.now();
  const site=await fetchSafe(url.toString());
  if (!/text\/html|application\/xhtml\+xml/i.test(site.headers['content-type']||'text/html')) throw new Error('This URL does not return an HTML web page.');
  const origin=new URL(site.url).origin;
  const probes=await Promise.allSettled([fetchSafe(`${origin}/robots.txt`,'GET',0,20000),fetchSafe(`${origin}/sitemap.xml`,'GET',0,20000)]);
  const available=r=>r.status==='fulfilled'&&r.value.status>=200&&r.value.status<300;
  const report=assess(site,available(probes[0]),available(probes[1]));
  return {url:site.url,requestedUrl:url.toString(),responseMs:Date.now()-started,httpStatus:site.status,...report};
}

function respond(res, status, body, type='application/json; charset=utf-8') {
  res.writeHead(status,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
  res.end(typeof body==='string'||Buffer.isBuffer(body)?body:JSON.stringify(body));
}
function rateLimit(req) {
  const ip=req.socket.remoteAddress||'unknown';const now=Date.now();
  for(const [key,v] of limits) if(v.expires<now) limits.delete(key);
  const curr=limits.get(ip)||{count:0,expires:now+60000};
  curr.count++;limits.set(ip,curr);
  return curr.count>12;
}
async function handler(req,res) {
  // Ignore query parameters when matching application routes and static assets.
  // For example, /?utm_source=chat is still the home page.
  let pathname;
  try { pathname = new URL(req.url || '/', 'http://localhost').pathname; }
  catch { return respond(res,400,{error:'Invalid request URL'}); }
  if(req.method==='GET'&&pathname==='/health') return respond(res,200,{status:'ok'});
  if(req.method==='POST'&&pathname==='/api/audit') {
    if(rateLimit(req)) return respond(res,429,{error:'Rate limit: try again in a minute.'});
    if(activeAudits>=5) return respond(res,503,{error:'The auditor is busy; please try again.'});
    let body='';
    try {
      for await (const chunk of req) { body+=chunk.toString();if(body.length>MAX_REQUEST_BODY) throw new Error('Request is too large.'); }
      const url=JSON.parse(body).url;
      activeAudits++;
      try {return respond(res,200,await audit(url));} finally {activeAudits--;}
    } catch(error) {return respond(res,400,{error:error.message||'Unable to audit website.'});}
  }
  const files={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js','/favicon.svg':'favicon.svg'};
  if(req.method==='GET' && files[pathname]) {
    try {
      const file = await readFile(join(ROOT, 'public', files[pathname]));
      const contentType = ({'/styles.css':'text/css; charset=utf-8','/app.js':'application/javascript; charset=utf-8','/favicon.svg':'image/svg+xml'})[pathname] || 'text/html; charset=utf-8';
      return respond(res, 200, file, contentType);
    } catch { return respond(res,500,'Server error.','text/plain'); }
  }
  respond(res,404,{error:'Not found'});
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  http.createServer((req,res)=>handler(req,res).catch(()=>respond(res,500,{error:'Internal server error'}))).listen(PORT,'0.0.0.0',()=>console.log(`LaunchScope running on port ${PORT}`));
}
export {publicIP,validateURL,extract,assess,audit,handler};
