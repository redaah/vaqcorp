// Share button for any card with an id: native share sheet on phones, otherwise a menu with
// copy link + social networks. Needs site.js. Call addShareButton(card) after the card has its id.
const SHARE_NETWORKS = [
  { name: 'X', url: (link, text) => `https://x.com/intent/post?url=${link}&text=${text}` },
  { name: 'WhatsApp', url: (link, text) => `https://wa.me/?text=${text}%20${link}` },
  { name: 'LinkedIn', url: link => `https://www.linkedin.com/sharing/share-offsite/?url=${link}` },
  { name: 'Facebook', url: link => `https://www.facebook.com/sharer/sharer.php?u=${link}` },
  { name: 'Email', url: (link, text) => `mailto:?subject=${text}&body=${link}` },
];
const SHARE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

function readVisibleText(element) {
  const copy = element.cloneNode(true);
  copy.querySelectorAll(`[lang]:not([lang="${root.dataset.lang}"])`).forEach(hidden => hidden.remove());
  return copy.textContent.trim();
}

// navigator.clipboard only exists on https pages; plain http (local testing) uses the old copy command.
async function copyTextToClipboard(text) {
  if (navigator.clipboard) { await navigator.clipboard.writeText(text); return; }
  const field = createElement('textarea');
  field.value = text;
  document.body.append(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

function buildCardShareLink(card) {
  return location.origin + location.pathname + '#' + card.id;
}

function closeShareMenus(except) {
  document.querySelectorAll('.share-menu:not([hidden])').forEach(menu => {
    if (menu === except) return;
    menu.hidden = true;
    menu.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
}

function appendBilingualLabel(parent, es, en) {
  for (const [lang, text] of [['es', es], ['en', en]]) {
    const span = createElement('span', null, text);
    span.lang = lang;
    parent.append(span);
  }
}

function buildShareMenu(card) {
  const menu = createElement('div', 'share-menu mono');
  menu.hidden = true;
  const copyButton = createElement('button');
  copyButton.type = 'button';
  appendBilingualLabel(copyButton, 'Copiar enlace', 'Copy link');
  copyButton.addEventListener('click', async () => {
    await copyTextToClipboard(buildCardShareLink(card));
    copyButton.replaceChildren();
    appendBilingualLabel(copyButton, '¡Copiado!', 'Copied!');
    setTimeout(() => { copyButton.replaceChildren(); appendBilingualLabel(copyButton, 'Copiar enlace', 'Copy link'); }, 1500);
  });
  menu.append(copyButton);
  SHARE_NETWORKS.forEach(network => {
    const networkLink = createElement('a', null, network.name);
    networkLink.target = '_blank'; networkLink.rel = 'noopener';
    networkLink.addEventListener('click', () => {
      const text = encodeURIComponent(readVisibleText(card.querySelector('h3')) + ' · VaqCorp');
      networkLink.href = network.url(encodeURIComponent(buildCardShareLink(card)), text);
    });
    menu.append(networkLink);
  });
  return menu;
}

function openNativeShare(card) {
  return navigator.share({ title: readVisibleText(card.querySelector('h3')) + ' · VaqCorp', url: buildCardShareLink(card) });
}

// Cards that are links themselves (<a class="exp">) can't hold a button, so they get wrapped.
function addShareButton(card) {
  let host = card;
  if (card.tagName === 'A') {
    host = createElement('div', 'share-host');
    card.replaceWith(host);
    host.append(card);
  }
  const button = createElement('button', 'share-button');
  button.type = 'button';
  button.innerHTML = SHARE_ICON;
  button.setAttribute('aria-label', 'Compartir / Share');
  button.setAttribute('aria-expanded', 'false');
  const menu = buildShareMenu(card);
  button.addEventListener('click', event => {
    event.stopPropagation();
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { openNativeShare(card).catch(() => {}); return; }
    closeShareMenus(menu);
    menu.hidden = !menu.hidden;
    button.setAttribute('aria-expanded', String(!menu.hidden));
  });
  host.append(button, menu);
}

document.addEventListener('click', event => { if (!event.target.closest('.share-menu')) closeShareMenus(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeShareMenus(); });
document.querySelectorAll('.exp[id]').forEach(addShareButton);
