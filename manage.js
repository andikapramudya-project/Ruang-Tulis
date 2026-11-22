// Tombol "Hapus" di daftar tulisan yang sudah terbit (Ruang penulis → ikon buku).
// Skrip biasa, terpisah dari editor, jadi tidak perlu build ulang.
(() => {
  const config = window.RUANG_TULIS || {};
  const base = String(config.publisherUrl || '').replace(/\/$/, '');
  const list = document.getElementById('publishedList');
  const hint = document.getElementById('publishedHint');
  if (!list || !base) return;

  const token = () => { try { return localStorage.getItem('ruang-session') || sessionStorage.getItem('ruang-session') || ''; } catch { return ''; } };
  async function call(path, options = {}) {
    const response = await fetch(base + path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` } });
    let data = {};
    try { data = await response.json(); } catch { /* jawaban kosong */ }
    if (!response.ok) throw new Error(data.error || 'Permintaan belum berhasil. Coba lagi.');
    return data;
  }
  function attach(row, post) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button-quiet draft-delete delete-post';
    button.textContent = 'Hapus';
    button.setAttribute('aria-label', `Hapus tulisan ${post.title}`);
    button.addEventListener('click', () => confirmDelete(row, post));
    row.append(button);
  }

  function confirmDelete(row, post) {
    const original = [...row.children];
    const box = document.createElement('div');
    box.className = 'delete-confirm';
    box.setAttribute('role', 'alertdialog');
    const text = document.createElement('p');
    text.textContent = `Hapus tulisan “${post.title}” dari blog? Tulisan dan gambarnya dihapus dari repository. Tindakan ini tidak dapat dibatalkan dari editor.`;
    const yes = document.createElement('button');
    yes.type = 'button'; yes.className = 'button button-primary'; yes.textContent = `Hapus “${post.title}”`;
    const no = document.createElement('button');
    no.type = 'button'; no.className = 'button button-quiet'; no.textContent = 'Batal';
    const actions = document.createElement('div');
    actions.className = 'dialog-actions'; actions.append(no, yes);
    box.append(text, actions);
    row.replaceChildren(box);
    no.focus();
    no.addEventListener('click', () => row.replaceChildren(...original));
    yes.addEventListener('click', async () => {
      yes.disabled = no.disabled = true; yes.textContent = 'Menghapus…';
      try {
        await call('/api/delete', { method: 'POST', body: JSON.stringify({ file: post.file }) });
        window.dispatchEvent(new CustomEvent('ruang:deleted', { detail: { file: post.file } }));
        row.remove();
        if (hint) hint.textContent = `“${post.title}” sudah dihapus. Beranda diperbarui dalam 1–2 menit.`;
      } catch (error) {
        yes.disabled = no.disabled = false; yes.textContent = `Hapus “${post.title}”`;
        text.textContent = error.message;
      }
    });
  }

  let busy = false;
  async function decorate() {
    if (busy) return;
    const rows = [...list.querySelectorAll('.library-item')];
    if (!rows.length || rows.every(row => row.querySelector('.delete-post'))) return;
    busy = true;
    try {
      const posts = (await call('/api/posts')).posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      [...list.querySelectorAll('.library-item')].forEach((row, index) => {
        const post = posts[index];
        if (!post || row.querySelector('.delete-post') || row.querySelector('strong')?.textContent !== post.title) return;
        attach(row, post);
      });
    } catch { /* tanpa tombol hapus bila daftar tidak bisa dimuat */ }
    busy = false;
  }
  new MutationObserver(decorate).observe(list, { childList: true });
})();
