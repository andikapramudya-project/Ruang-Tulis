import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEmbedUrl, embedInfo, embedHTML, isCanonicalEmbed} from '../lib/embeds.mjs';
import {validatePost} from '../lib/content.mjs';

const post = markdown => ({title:'Tes', slug:'tes', date:'2026-11-23', category:'Personal', markdown});

test('tautan biasa diubah menjadi bingkai kanonik', () => {
  assert.equal(parseEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5').src, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(parseEmbedUrl('https://youtu.be/dQw4w9WgXcQ').provider, 'youtube');
  assert.equal(parseEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ').provider, 'youtube');
  assert.equal(parseEmbedUrl('https://x.com/jack/status/20'), null);
  assert.equal(parseEmbedUrl('https://x.com/jack/status/1234567890123').provider, 'twitter');
  assert.equal(parseEmbedUrl('https://twitter.com/jack/status/1234567890123?s=20').src, 'https://platform.twitter.com/embed/Tweet.html?id=1234567890123&dnt=true');
  assert.equal(parseEmbedUrl('https://www.instagram.com/reel/Cabcde12345/').src, 'https://www.instagram.com/reel/Cabcde12345/embed');
  assert.equal(parseEmbedUrl('https://t.me/durov/123').src, 'https://t.me/durov/123?embed=1&mode=tme');
  assert.equal(parseEmbedUrl('https://www.tiktok.com/@akun/video/7234567890123456789').provider, 'tiktok');
  assert.equal(parseEmbedUrl('https://www.facebook.com/akun/posts/1234567890').provider, 'facebook');
});

test('situs lain dan tautan tidak lengkap ditolak', () => {
  for (const value of ['https://vimeo.com/123456789', 'https://evil.example/watch?v=dQw4w9WgXcQ', 'javascript:alert(1)', 'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ', 'bukan tautan', 'https://www.youtube.com/watch?v=pendek'])
    assert.equal(parseEmbedUrl(value), null, value);
  assert.equal(embedInfo('https://evil.example/embed/dQw4w9WgXcQ'), null);
  assert.equal(embedInfo('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'), null);
});

test('bentuk kanonik dikenali dan bentuk lain ditolak penerbit', () => {
  const src = parseEmbedUrl('https://twitter.com/jack/status/1234567890123').src;
  const html = embedHTML(src);
  assert.ok(isCanonicalEmbed(html));
  assert.ok(html.includes('&amp;dnt=true'));
  assert.doesNotThrow(() => validatePost(post(`Awal.\n\n${html}\n\nAkhir.`)));
  assert.throws(() => validatePost(post('<iframe src="https://evil.example/x"></iframe>')), /Embed hanya boleh/);
  assert.throws(() => validatePost(post(html.replace('<iframe', '<iframe onload="alert(1)"'))), /Embed hanya boleh/);
  assert.throws(() => validatePost(post('<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" sandbox></iframe>')), /Embed hanya boleh/);
});
