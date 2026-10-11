// Shared by every page: ES/EN toggle and a small DOM helper.
const root = document.documentElement;

function setLang(lang) {
  root.dataset.lang = lang;
  root.lang = lang;
  try { localStorage.setItem('lang', lang); } catch (e) {}
  document.querySelectorAll('[data-set-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.setLang === lang));
}

document.querySelectorAll('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));
let savedLang;
try { savedLang = localStorage.getItem('lang'); } catch (e) {}
setLang(savedLang || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en'));

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function formatDateBilingual(isoDate) {
  const wrapper = createElement('span');
  for (const lang of ['es', 'en']) {
    const label = new Date(isoDate).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' });
    const span = createElement('span', null, label);
    span.lang = lang;
    wrapper.append(span);
  }
  return wrapper;
}
