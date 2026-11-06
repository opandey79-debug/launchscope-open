import PDFDocument from 'pdfkit';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fonts = {
  Latin: require.resolve('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff'),
  Hindi: require.resolve('@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff')
};

function validateReport(report) {
  if (!report || typeof report.url !== 'string' || report.url.length > 2048 ||
      !Number.isFinite(report.score) || report.score < 0 || report.score > 100 ||
      !Array.isArray(report.items) || report.items.length !== 12 ||
      typeof report.checkedAt !== 'string' || !Number.isFinite(Date.parse(report.checkedAt))) {
    throw new Error('A complete audit report is required for PDF export.');
  }
  const site = new URL(report.url);
  if (!['http:', 'https:'].includes(site.protocol) || site.username || site.password) throw new Error('Invalid report URL.');
  for (const item of report.items) {
    if (!item || typeof item.passed !== 'boolean' ||
        !Object.entries({name:120,group:50,detail:1500,tip:600}).every(([key, limit]) => typeof item[key] === 'string' && item[key].length <= limit)) {
      throw new Error('Invalid report finding.');
    }
  }
}

// Render the existing snapshot: exporting never scans the target again or stores it.
export function makeReportPDF(report) {
  validateReport(report);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({size: 'A4', margin: 44, bufferPages: true,
      info: {Title: 'LaunchScope Open - Website Audit', Author: 'LaunchScope Open'}});
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    for (const [name, path] of Object.entries(fonts)) doc.registerFont(name, path);
    const width = doc.page.width - 88;
    const bottom = doc.page.height - 62;
    const text = (value, size = 10, color = '#263447') => {
      doc.fontSize(size).fillColor(color);
      // Keep Hindi shaping intact, while using Latin glyphs for adjacent English.
      const runs = String(value).match(/[\u0900-\u097f]+|[^\u0900-\u097f]+/gu) || [''];
      runs.forEach((run, index) => doc.font(/[\u0900-\u097f]/u.test(run) ? 'Hindi' : 'Latin')
        .text(run, {width, lineGap: 3, continued: index < runs.length - 1}));
    };
    const pageHeader = () => {
      doc.rect(0, 0, doc.page.width, 8).fill('#9ad950');
      text('LAUNCHSCOPE OPEN', 11, '#285b22');
      doc.moveDown(0.6);
    };
    pageHeader();
    text('Website launch audit', 23, '#111c2e');
    doc.moveDown(0.4);
    text(report.url, 10);
    text('Checked: ' + new Date(report.checkedAt).toISOString().replace('T', ' ').replace('.000Z', ' UTC'), 9, '#586779');
    doc.moveDown(0.8);
    const passed = report.items.filter(item => item.passed).length;
    text(`${report.score}/100  |  ${passed} of 12 checks passed`, 17, '#285b22');
    doc.moveDown(0.7);
    report.items.forEach((item, index) => {
      const content = [item.detail, ...(!item.passed ? ['Recommendation: ' + item.tip] : [])];
      const plain = `${index + 1}. ${item.name}\n${content.join('\n')}`;
      doc.font('Latin').fontSize(10);
      const estimated = doc.heightOfString(plain, {width, lineGap: 3}) + 42;
      if (doc.y + estimated > bottom) {doc.addPage(); pageHeader();}
      doc.moveTo(44, doc.y).lineTo(doc.page.width - 44, doc.y).lineWidth(0.5).stroke('#d7dfe6');
      doc.moveDown(0.55);
      text(`${index + 1}. ${item.name}`, 12, '#111c2e');
      text(`${item.group.toUpperCase()}  /  ${item.passed ? 'PASSED' : 'NEEDS REVIEW'}`, 8,
        item.passed ? '#285b22' : '#865022');
      content.forEach(line => text(line, 9));
      doc.moveDown(0.65);
    });
    if (doc.y + 65 > bottom) {doc.addPage(); pageHeader();}
    doc.moveDown(0.5);
    text('A basic technical checklist, not a complete SEO, accessibility, performance or security audit. File availability does not guarantee search indexing.', 8, '#586779');
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.font('Latin').fontSize(8).fillColor('#586779')
        .text(`LaunchScope Open  |  ${i + 1} / ${pages.count}`, 44, doc.page.height - 38, {lineBreak: false});
    }
    doc.end();
  });
}
