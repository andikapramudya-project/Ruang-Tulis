// Apply the saved theme before the first paint. Storage may be unavailable.
try {
  document.documentElement.dataset.theme = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch { document.documentElement.dataset.theme = 'light'; }
// Font artikel yang dipilih pembaca (sans atau serif).
try { document.documentElement.dataset.font = localStorage.getItem('font') === 'serif' ? 'serif' : 'sans'; }
catch { document.documentElement.dataset.font = 'sans'; }
