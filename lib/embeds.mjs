// Embed yang diizinkan: hanya bingkai (iframe) dari situs tepercaya, dengan alamat kanonik.
// Dipakai bersama oleh editor, pembaca blog (renderer), dan Worker penerbit.

const attr = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const PROVIDERS = {
  youtube: { label: 'YouTube', height: 315, pattern: /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/ },
  twitter: { label: 'X (Twitter)', height: 520, pattern: /^https:\/\/platform\.twitter\.com\/embed\/Tweet\.html\?id=\d{5,25}&dnt=true$/ },
  instagram: { label: 'Instagram', height: 640, pattern: /^https:\/\/www\.instagram\.com\/(?:p|reel)\/[A-Za-z0-9_-]{5,30}\/embed$/ },
  facebook: { label: 'Facebook', height: 560, pattern: /^https:\/\/www\.facebook\.com\/plugins\/(?:post|video)\.php\?href=https%3A%2F%2Fwww\.facebook\.com%2F[A-Za-z0-9%._~!*'()-]{1,400}&show_text=true&width=500$/ },
  telegram: { label: 'Telegram', height: 420, pattern: /^https:\/\/t\.me\/[A-Za-z][A-Za-z0-9_]{3,31}\/\d{1,12}\?embed=1&mode=tme$/ },
  tiktok: { label: 'TikTok', height: 740, pattern: /^https:\/\/www\.tiktok\.com\/embed\/v2\/\d{8,25}$/ }
};

export const EMBED_NAMES = 'YouTube, X/Twitter, Instagram, Facebook, Telegram, atau TikTok';

// Alamat bingkai kanonik -> {provider, label, height} atau null bila tidak diizinkan.
export function embedInfo(src) {
  const value = String(src || '');
  for (const [provider, info] of Object.entries(PROVIDERS)) {
    if (info.pattern.test(value)) return { provider, label: info.label, height: info.height };
  }
  return null;
}

// Teks HTML kanonik yang disimpan di Markdown.
export function embedHTML(src) {
  const info = embedInfo(src);
  if (!info) return '';
  return `<iframe data-embed="${info.provider}" src="${attr(src)}" height="${info.height}" loading="lazy" allowfullscreen></iframe>`;
}

// Apakah potongan "<iframe ...></iframe>" persis bentuk kanonik?
export function isCanonicalEmbed(tag) {
  const match = /\ssrc="([^"]*)"/.exec(tag);
  if (!match) return false;
  const src = match[1].replace(/&amp;/g, '&');
  const html = embedHTML(src);
  return html !== '' && html === tag;
}

// Tautan biasa yang ditempel pengguna -> {provider, label, height, src} atau null.
export function parseEmbedUrl(input) {
  let url;
  try { url = new URL(String(input || '').trim()); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase().replace(/^(?:www|m|web|mobile)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);
  let src = '';

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'music.youtube.com') {
    let id = '';
    if (host === 'youtu.be') id = parts[0] || '';
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) id = parts[1] || '';
    else if (parts[0] === 'watch') id = url.searchParams.get('v') || '';
    if (/^[A-Za-z0-9_-]{11}$/.test(id)) src = `https://www.youtube-nocookie.com/embed/${id}`;
  } else if (host === 'x.com' || host === 'twitter.com') {
    const status = parts.indexOf('status');
    const id = status > 0 ? parts[status + 1] : '';
    if (/^\d{5,25}$/.test(id || '')) src = `https://platform.twitter.com/embed/Tweet.html?id=${id}&dnt=true`;
  } else if (host === 'instagram.com') {
    const index = parts.findIndex(part => ['p', 'reel', 'tv'].includes(part));
    const code = index >= 0 ? parts[index + 1] : '';
    if (/^[A-Za-z0-9_-]{5,30}$/.test(code || '')) src = `https://www.instagram.com/${parts[index] === 'reel' ? 'reel' : 'p'}/${code}/embed`;
  } else if (host === 'facebook.com') {
    const video = parts.includes('videos') || parts[0] === 'watch' || parts[0] === 'reel';
    const keep = ['v', 'story_fbid', 'id', 'fbid'].filter(key => url.searchParams.has(key)).map(key => `${key}=${encodeURIComponent(url.searchParams.get(key))}`);
    const canonical = `https://www.facebook.com${url.pathname}${keep.length ? `?${keep.join('&')}` : ''}`;
    if (parts.length >= 2 || (parts.length === 1 && keep.length)) src = `https://www.facebook.com/plugins/${video ? 'video' : 'post'}.php?href=${encodeURIComponent(canonical)}&show_text=true&width=500`;
  } else if (host === 't.me' || host === 'telegram.me') {
    if (/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(parts[0] || '') && /^\d{1,12}$/.test(parts[1] || '')) src = `https://t.me/${parts[0]}/${parts[1]}?embed=1&mode=tme`;
  } else if (host === 'tiktok.com') {
    const index = parts.indexOf('video');
    const id = index > 0 ? parts[index + 1] : '';
    if (/^\d{8,25}$/.test(id || '')) src = `https://www.tiktok.com/embed/v2/${id}`;
  }

  const info = embedInfo(src);
  return info ? { ...info, src } : null;
}
