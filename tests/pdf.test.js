import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { assess,handler } from '../server.js';
import { makeReportPDF } from '../report-pdf.js';

function sample() {
 return {url:'https://example.com/',...assess({status:200,url:'https://example.com/',
 body:'<title>Website &amp; launch readiness</title><h1>Welcome</h1>',headers:{}},false,false)};
}

test('exports a real multi-page PDF with embedded fonts',async()=>{
 const report=sample(); report.items[2].detail='वेबसाइट की जाँच - Website & launch readiness';
 const pdf=await makeReportPDF(report);
 assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 assert.match(pdf.toString('latin1'),/%%EOF/);
 assert.match(pdf.toString('latin1'),/\/FontFile2/);
 assert.ok(pdf.length>10000);
});

test('rejects incomplete and oversized report snapshots',()=>{
 assert.throws(()=>makeReportPDF({}),/complete audit/);
 const bad=sample();bad.items[0].name='x'.repeat(121);
 assert.throws(()=>makeReportPDF(bad),/Invalid report finding/);
 const unsafe=sample();unsafe.url='file:///etc/passwd';
 assert.throws(()=>makeReportPDF(unsafe),/Invalid report URL/);
});

test('PDF route returns an attachment without making an audit request',async()=>{
 const result={};const req=Readable.from([Buffer.from(JSON.stringify(sample()))]);
 req.method='POST';req.url='/api/report/pdf';req.socket={remoteAddress:'test-pdf'};
 const res={setHeader(k,v){(result.extra??={})[k]=v;},writeHead(status,headers){Object.assign(result,{status,headers});},end(body){result.body=body;}};
 await handler(req,res);
 assert.equal(result.status,200);
 assert.equal(result.headers['content-type'],'application/pdf');
 assert.match(result.extra['Content-Disposition'],/attachment/);
 assert.equal(result.body.subarray(0,5).toString(),'%PDF-');
});
