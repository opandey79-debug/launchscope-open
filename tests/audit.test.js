import test from 'node:test';
import assert from 'node:assert/strict';
import {publicIP,validateURL,extract,assess} from '../server.js';

test('blocks unsafe and non-public IP addresses',()=>{
 for(const ip of ['127.0.0.1','10.1.1.1','172.16.1.5','192.168.0.1','169.254.169.254','100.64.0.1','::1','fd00::1','::ffff:127.0.0.1','192.0.2.5']) assert.equal(publicIP(ip),false,ip);
 for(const ip of ['1.1.1.1','8.8.8.8','2001:4860:4860::8888']) assert.equal(publicIP(ip),true,ip);
});
test('validates URLs and strips fragments',()=>{
 assert.equal(validateURL('example.com/a#secret').toString(),'https://example.com/a');
 for(const raw of ['localhost','http://127.0.0.1','file:///etc/passwd','http://a.local','http://example.com:8080','http://name:pw@example.com']) assert.throws(()=>validateURL(raw),raw);
});
test('extracts core SEO and UI metadata',()=>{
 const html=`<title>Example company | Great products</title><meta content="We build things with love and deliver to your doorstep." name="description"><meta name='viewport' content='width=device-width'><h1>Welcome</h1><link rel="shortcut icon" href="/icon.png">`;
 const e=extract(html);assert.equal(e.title,'Example company | Great products');assert.equal(e.headings,1);assert.equal(e.viewport,true);assert.equal(e.icon,true);assert.match(e.description,/deliver/);
});
test('weighted score stays bounded',()=>{
 const report=assess({status:200,url:'https://example.com',body:'<title>Example site with an excellent title</title><meta name="description" content="A sample website that describes its offers to visitors in more than fifty characters for easy discovery."><meta name="viewport" content="width=device-width"><h1>Hello</h1><link rel="icon" href="/favicon.ico">',headers:{'strict-transport-security':'max-age=10','content-security-policy':'default-src self','x-content-type-options':'nosniff'}},true,true);
 assert.equal(report.score,100);assert.equal(report.items.length,12);
});
