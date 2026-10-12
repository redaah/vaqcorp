// Renders posts.json into radar.html as one row per post: thumbnail left, text right. Needs site.js.
// A post's optional "try" button links to its tool run on our site: "{vaqcorp}" in try.url becomes
// our public URL (GitHub Pages until vaqcorp.com serves HTTPS).
const VAQCORP_PUBLIC_URL = 'https://redaah.github.io/vaqcorp/';

function appendBilingualText(parent, value) {
  if (typeof value === 'string') { parent.append(value); return; }
  for (const lang of ['es', 'en']) {
    const span = createElement('span', null, value[lang] ?? value.es ?? value.en);
    span.lang = lang;
    parent.append(span);
  }
}

// Each card's id is its permalink (radar.html#orca): the post's "id", else its title as a slug.
function slugifyRadarPost(post) {
  const title = typeof post.title === 'string' ? post.title : post.title.en ?? post.title.es;
  return post.id ?? title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function renderRadarCard(post) {
  const card = createElement('article', 'exp radar-item');
  card.id = slugifyRadarPost(post);
  const thumb = createElement('div', 'thumb');
  if (post.image) {
    const img = createElement('img', 'cover');
    img.src = post.image; img.alt = ''; img.loading = 'lazy';
    thumb.append(img);
  }
  if (post.stamps?.length) {
    const stamps = createElement('div', 'stamps mono');
    post.stamps.forEach(stamp => { const seal = createElement('span'); appendBilingualText(seal, stamp); stamps.append(seal); });
    thumb.append(stamps);
  }
  const host = new URL(post.url).hostname.replace(/^www\./, '');
  const body = createElement('div', 'radar-body');
  const top = createElement('div', 'exp-top mono');
  const permalink = createElement('a', 'radar-permalink');
  permalink.href = '#' + card.id;
  permalink.append('# ', formatDateBilingual(post.date));
  top.append(permalink, createElement('span', null, host));
  const title = createElement('h3'); appendBilingualText(title, post.title);
  const note = createElement('p'); appendBilingualText(note, post.note);
  body.append(top, title, note);
  if (post.tags?.length) {
    const tags = createElement('div', 'stack mono');
    post.tags.forEach(tag => { const chip = createElement('span'); appendBilingualText(chip, tag); tags.append(chip); });
    body.append(tags);
  }
  const actions = createElement('div', 'radar-actions');
  const visit = createElement('a', 'go mono radar-visit', host + ' ↗');
  visit.href = post.url; visit.target = '_blank'; visit.rel = 'noopener';
  actions.append(visit);
  if (post.try) {
    const tryButton = createElement('a', 'radar-try mono');
    tryButton.href = post.try.url.replace('{vaqcorp}', encodeURIComponent(VAQCORP_PUBLIC_URL));
    tryButton.target = '_blank'; tryButton.rel = 'noopener';
    appendBilingualText(tryButton, post.try.label);
    actions.append(tryButton);
  }
  body.append(actions);
  card.append(thumb, body);
  addShareButton(card);
  return card;
}

fetch('posts.json')
  .then(response => response.json())
  .then(posts => {
    posts.sort((a, b) => b.date.localeCompare(a.date));
    const cards = posts.map(renderRadarCard);
    document.getElementById('radar-posts').append(...cards);
    document.getElementById('radar-empty').hidden = posts.length > 0;
    setUpRadarFilters(posts, cards);
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  })
  .catch(() => { document.getElementById('radar-empty').hidden = false; });
