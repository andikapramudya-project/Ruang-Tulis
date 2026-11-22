// Tombol "Hapus" di daftar tulisan yang sudah terbit (Ruang penulis → ikon buku).
// Skrip biasa, terpisah dari editor, jadi tidak perlu build ulang.
(() => {
  const config = window.RUANG_TULIS || {};
  const base = String(config.publisherUrl || '').replace(/\/$/, '');
  const list = document.getElementById('publishedList');
  const hint = document.getElementById('publishedHint');
  if (!list || !base) return;

  const token = () => { try { return sessionStorage.getItem('ruang-session') || ''; } catch { return ''; } };
  async function call(path, options = {}) {
    const response = await fetch(base + path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` } });
    let data = {};
    try { data = await response.json(); } catch { /* jawaban kosong */ }
    if (!response.ok) throw new Error(data.error || 'Permintaan belum berhasil. Coba lagi.');
    return data;
  }
  function forgetDrafts(file) {
    try {
      const open = indexedDB.open('ruang-tulis-writer', 1);
      open.onsuccess = () => {
        const db = open.result;
        const store = db.transaction('drafts', 'readwrite').objectStore('drafts');
        store.openCursor().onsuccess = event => {
          const cursor = event.target.result;
          if (!cursor) return db.close();
          if (cursor.value.file === file) cursor.delete();
          cursor.continue();
        };
      };
    } catch { /* draf lokal tidak wajib dibersihkan */ }
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
        forgetDrafts(post.file);
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

  // Dibuka dari halaman sebuah tulisan (tulis.html?edit=posts/nama.md): langsung buka tulisan itu untuk disunting.
  const target = new URLSearchParams(location.search).get('edit') || '';
  if (/^posts\/[a-z0-9][a-z0-9-]*(?:\.md)?$/.test(target)) openTarget(target);

  async function openTarget(file) {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const notice = message => { const box = document.getElementById('editorNotice'); if (box) { box.hidden = false; box.dataset.error = 'false'; box.textContent = message; } };
    history.replaceState(null, '', location.pathname);
    const library = document.getElementById('libraryButton');
    for (let i = 0; i < 60 && !(document.querySelector('.tiptap') && library && !library.disabled); i++) await wait(150);
    if (!token()) { notice('Hubungkan GitHub (menu ⋯), lalu buka tulisan ini lewat Draf dan tulisan untuk menyuntingnya.'); return; }
    try {
      const posts = (await call('/api/posts')).posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const index = posts.findIndex(post => post.file === file);
      if (index < 0) { notice('Tulisan ini sudah tidak ada di repository.'); return; }
      document.body.classList.add('opening-post');
      library.click();
      for (let i = 0; i < 60 && list.querySelectorAll('.library-item').length !== posts.length; i++) await wait(150);
      const row = list.querySelectorAll('.library-item')[index];
      if (row?.querySelector('strong')?.textContent !== posts[index].title) throw new Error('Daftar belum cocok.');
      row.querySelector('button').click();
    } catch {
      notice('Tulisan belum bisa dibuka otomatis. Pilih lewat Draf dan tulisan.');
    }
    await wait(1500);
    document.body.classList.remove('opening-post');
  }
})();
