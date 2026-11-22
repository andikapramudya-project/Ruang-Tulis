import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { embedInfo } from '../lib/embeds.mjs';

// Bingkai hanya lolos kalau alamatnya persis salah satu alamat embed yang diizinkan;
// semua atributnya diganti dengan nilai tetap yang aman.
DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.nodeName !== 'IFRAME') return;
  const src = node.getAttribute('src') || '';
  const info = embedInfo(src);
  if (!info) { node.parentNode?.removeChild(node); return; }
  for (const name of [...node.getAttributeNames()]) node.removeAttribute(name);
  node.setAttribute('data-embed', info.provider);
  node.setAttribute('src', src);
  node.setAttribute('height', String(info.height));
  node.setAttribute('title', info.label);
  node.setAttribute('loading', 'lazy');
  node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation');
  node.setAttribute('allowfullscreen', '');
});

export function render(markdown) {
  return DOMPurify.sanitize(marked.parse(markdown), {USE_PROFILES:{html:true},ADD_TAGS:['iframe'],FORBID_TAGS:['style','form','input','button'],FORBID_ATTR:['style']});
}
