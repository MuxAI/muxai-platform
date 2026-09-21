import { strFromU8, unzipSync } from 'fflate';
import { Attachment } from '../types';

const MAX_TEXT_LENGTH = 30000;

function truncate(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return text.slice(0, MAX_TEXT_LENGTH) + '\n\n[... content truncated for token limits ...]';
}

function isProbablyBinary(bytes: Uint8Array): boolean {
  let nonAscii = 0;
  const sample = bytes.slice(0, 1024);
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 0) return true;
    if (sample[i] > 127) nonAscii++;
  }
  return nonAscii > sample.length * 0.3;
}

async function parseDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const unzipped = unzipSync(bytes);
    const docXmlEntry = unzipped['word/document.xml'];
    if (!docXmlEntry) return '[Could not extract document text from DOCX]';

    const xmlString = strFromU8(docXmlEntry);
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const paragraphsNodes = doc.getElementsByTagName('w:p');
    const paragraphs: string[] = [];

    for (let i = 0; i < paragraphsNodes.length; i++) {
      const para = paragraphsNodes[i];
      const texts = para.getElementsByTagName('w:t');
      const parts: string[] = [];
      for (let j = 0; j < texts.length; j++) {
        parts.push(texts[j].textContent || '');
      }
      if (parts.length > 0) {
        paragraphs.push(parts.join(''));
      }
    }

    return paragraphs.join('\n') || '[Empty DOCX file]';
  } catch (e: any) {
    return `[DOCX extraction note: ${e?.message || 'standard document'}]`;
  }
}

async function parseXlsxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const unzipped = unzipSync(bytes);

    const sheetKeys = Object.keys(unzipped).filter((k) =>
      k.match(/^xl\/worksheets\/sheet\d+\.xml$/)
    );
    sheetKeys.sort();

    const sharedStrings: string[] = [];
    const ssEntry = unzipped['xl/sharedStrings.xml'];
    if (ssEntry) {
      const ssXml = strFromU8(ssEntry);
      const doc = new DOMParser().parseFromString(ssXml, 'application/xml');
      const siNodes = doc.getElementsByTagName('si');
      for (let i = 0; i < siNodes.length; i++) {
        const tNodes = siNodes[i].getElementsByTagName('t');
        const parts: string[] = [];
        for (let j = 0; j < tNodes.length; j++) {
          parts.push(tNodes[j].textContent || '');
        }
        sharedStrings.push(parts.join(''));
      }
    }

    let fullText = '';
    for (let s = 0; s < sheetKeys.length; s++) {
      const sheetXml = strFromU8(unzipped[sheetKeys[s]]);
      const doc = new DOMParser().parseFromString(sheetXml, 'application/xml');
      fullText += `--- Sheet ${s + 1} ---\n`;
      const rows = doc.getElementsByTagName('row');
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].getElementsByTagName('c');
        const rowParts: string[] = [];
        for (let c = 0; c < cells.length; c++) {
          const cell = cells[c];
          const type = cell.getAttribute('t');
          const v = cell.getElementsByTagName('v')[0];
          let value = '';
          if (type === 's' && v) {
            const idx = parseInt(v.textContent || '0', 10);
            value = sharedStrings[idx] || '';
          } else if (v) {
            value = v.textContent || '';
          }
          rowParts.push(value);
        }
        if (rowParts.some(Boolean)) {
          fullText += rowParts.join(' | ') + '\n';
        }
      }
    }
    return fullText || '[Empty spreadsheet]';
  } catch (e: any) {
    return `[Spreadsheet extraction: ${e?.message || 'standard sheet'}]`;
  }
}

export async function parseFile(file: File): Promise<Attachment> {
  const name = file.name;
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const type = file.type;
  const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve({
          id,
          name,
          type: 'image',
          mimeType: type || `image/${ext}`,
          size: file.size,
          base64,
          dataUrl,
          preview: dataUrl,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  let textContent = '';
  let detectedType = 'text';

  try {
    if (ext === 'docx') {
      detectedType = 'docx';
      textContent = await parseDocxFile(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      detectedType = 'xlsx';
      textContent = await parseXlsxFile(file);
    } else if (ext === 'json') {
      detectedType = 'json';
      const text = await file.text();
      try {
        textContent = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        textContent = text;
      }
    } else {
      const text = await file.text();
      textContent = text;
    }
  } catch (err: any) {
    textContent = `[Could not parse ${name}: ${err?.message || 'unknown issue'}]`;
  }

  return {
    id,
    name,
    type: detectedType,
    mimeType: type || 'text/plain',
    size: file.size,
    textContent: truncate(textContent),
  };
}

export function formatFileForContext(parsedFile: Attachment): string {
  if (parsedFile.type === 'image') {
    return `[Attached Image: ${parsedFile.name}]`;
  }
  const header = `--- ATTACHMENT: ${parsedFile.name} (${parsedFile.type.toUpperCase()} | ${formatBytes(parsedFile.size)}) ---`;
  return `${header}\n${parsedFile.textContent || '[No textual content]'}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ACCEPTED_FILE_TYPES = [
  'image/*',
  '.txt', '.md', '.log', '.json', '.csv', '.xml', '.html', '.htm',
  '.docx', '.xlsx', '.js', '.ts', '.tsx', '.py', '.java', '.c', '.cpp',
  '.yaml', '.yml', '.env', '.sql', '.sh'
].join(',');
