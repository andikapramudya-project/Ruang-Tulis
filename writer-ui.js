// Ruang penulis: menu kecil di pojok kanan atas dan toolbar yang naik bersama keyboard ponsel.
(() => {
  const button = document.getElementById('menuButton');
  const menu = document.getElementById('writerMenu');
  if (button && menu) {
    const close = (focus = false) => {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (focus) button.focus();
    };
    button.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('button, a')?.focus();
    });
    document.addEventListener('click', event => {
      if (menu.hidden || event.target.closest('#writerMenu, #menuButton')) return;
      close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) close(true);
    });
    // Menutup menu setelah memilih daftar, pratinjau, simpan salinan, atau kembali membaca.
    menu.addEventListener('click', event => {
      if (event.target.closest('#libraryButton, #previewButton, #exportButton, .menu-link')) close();
    });
  }

  // Keyboard ponsel menyusutkan area tampil: naikkan toolbar sebesar tinggi keyboard.
  const viewport = window.visualViewport;
  if (viewport) {
    const place = () => {
      const covered = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty('--kb', `${Math.round(covered)}px`);
    };
    viewport.addEventListener('resize', place);
    viewport.addEventListener('scroll', place);
    place();
  }
})();
