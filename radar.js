// Renders posts.json into radar.html: a 2-column grid of compact cards (picture, title, stamps) and,
// when the URL has a post's hash (radar.html#orca), that post's detail view. Needs site.js and share.js.
// A post's optional "try" button links to its tool run on our site: "{vaqcorp}" in try.url becomes
// our public URL (GitHub Pages until vaqcorp.com serves HTTPS).
const VAQCORP_PUBLIC_URL = 'https://redaah.github.io/vaqcorp/';

// The only tags a post can have. Unknown tags in posts.json are ignored.
const RADAR_TAGS = {
  tool: { es: 'HERRAMIENTA', en: 'TOOL' },
  game: { es: 'JUEGO', en: 'GAME' },
  idea: { es: 'IDEA', en: 'IDEA' },
};

function appendBilingualText(parent, value) {
  if (typeof value === 'string') { parent.append(value); return; }
  for (const lang of ['es', 'en']) {
    const span = createElement('span', null, value[lang] ?? value.es ?? value.en);
    span.lang = lang;
    parent.append(span);
  }
}

// A post's permalink (radar.html#orca): its "id", else its title as a slug.
function slugifyRadarPost(post) {
  const title = typeof post.title === 'string' ? post.title : post.title.en ?? post.title.es;
  return post.id ?? title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function radarPostTags(post) {
  return (post.tags ?? []).filter(tag => tag in RADAR_TAGS);
}

function hostOf(post) {
  return new URL(post.url).hostname.replace(/^www\./, '');
}

function renderStamps(post) {
  const stamps = createElement('div', 'stamps mono');
  (post.stamps ?? []).forEach(stamp => { const seal = createElement('span'); appendBilingualText(seal, stamp); stamps.append(seal); });
  return stamps;
}

function renderTagList(post) {
  const tags = createElement('div', 'radar-tags mono');
  radarPostTags(post).forEach(tag => { const label = createElement('span'); appendBilingualText(label, RADAR_TAGS[tag]); tags.append(label); });
  return tags;
}

function renderThumb(post) {
  const thumb = createElement('div', 'radar-thumb');
  if (post.image) {
    const img = createElement('img');
    img.src = post.image; img.alt = ''; img.loading = 'lazy';
    thumb.append(img);
  }
  return thumb;
}

function renderRadarCard(post) {
  const card = createElement('a', 'radar-card');
  card.href = '#' + slugifyRadarPost(post);
  const thumb = renderThumb(post);
  thumb.append(renderTagList(post));
  const body = createElement('div', 'radar-card-body');
  const title = createElement('h3'); appendBilingualText(title, post.title);
  const meta = createElement('p', 'radar-card-meta mono', hostOf(post));
  body.append(title, meta);
  if (post.stamps?.length) body.append(renderStamps(post));
  card.append(thumb, body);
  return card;
}

function renderRadarDetail(post) {
  const detail = createElement('article', 'radar-detail');
  detail.id = slugifyRadarPost(post);
  const thumb = renderThumb(post);
  if (post.stamps?.length) thumb.append(renderStamps(post));
  const body = createElement('div', 'radar-detail-body');
  const top = createElement('div', 'exp-top mono');
  top.append(formatDateBilingual(post.date), createElement('span', null, hostOf(post)));
  const title = createElement('h3'); appendBilingualText(title, post.title);
  const note = createElement('p'); appendBilingualText(note, post.note);
  const actions = createElement('div', 'radar-actions');
  const visit = createElement('a', 'radar-visit mono', hostOf(post) + ' ↗');
  visit.href = post.url; visit.target = '_blank'; visit.rel = 'noopener';
  actions.append(visit);
  if (post.try) {
    const tryButton = createElement('a', 'radar-try mono');
    tryButton.href = post.try.url.replace('{vaqcorp}', encodeURIComponent(VAQCORP_PUBLIC_URL));
    tryButton.target = '_blank'; tryButton.rel = 'noopener';
    appendBilingualText(tryButton, post.try.label);
    actions.append(tryButton);
  }
  body.append(top, title, renderTagList(post), note, actions);
  detail.append(thumb, body);
  addShareButton(detail);
  return detail;
}

// Shows the detail of the post named in the hash, or the grid when there is none.
let cameFromGrid = false;
let gridScrollY = 0;
function showRadarRoute(posts) {
  const slug = decodeURIComponent(location.hash.slice(1));
  const post = posts.find(p => slugifyRadarPost(p) === slug);
  const detailHost = document.getElementById('radar-detail');
  document.getElementById('radar-head').hidden = !!post;
  document.getElementById('radar-grid-view').hidden = !!post;
  detailHost.hidden = !post;
  detailHost.querySelector('article')?.remove();
  if (post) {
    detailHost.append(renderRadarDetail(post));
    document.title = detailHost.querySelector('h3').textContent.trim() + ' · Radar · VaqCorp';
    window.scrollTo(0, 0);
  } else {
    document.title = 'Radar · VaqCorp';
    window.scrollTo(0, gridScrollY);
  }
}

fetch('posts.json')
  .then(response => response.json())
  .then(posts => {
    posts.sort((a, b) => b.date.localeCompare(a.date));
    const cards = posts.map(renderRadarCard);
    cards.forEach(card => card.addEventListener('click', () => { cameFromGrid = true; gridScrollY = window.scrollY; }));
    document.getElementById('radar-posts').append(...cards);
    document.getElementById('radar-empty').hidden = posts.length > 0;
    setUpRadarFilters(posts, cards);
    // "Back" returns to the grid where it was (scroll, filters) when we came from it; otherwise loads it.
    document.getElementById('radar-back').addEventListener('click', event => {
      if (!cameFromGrid) return;
      event.preventDefault();
      cameFromGrid = false;
      history.back();
    });
    window.addEventListener('hashchange', () => showRadarRoute(posts));
    showRadarRoute(posts);
  })
  .catch(() => { document.getElementById('radar-empty').hidden = false; });
