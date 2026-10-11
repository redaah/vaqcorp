// Search box, tag/stamp chips and month picker for radar.html. Needs site.js; radar.js calls setUpRadarFilters.
const radarFilterState = { text: '', label: null, month: '' };

function normalizeSearchText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function joinBilingualText(value) {
  return typeof value === 'string' ? value : Object.values(value).join(' ');
}

function labelKey(value) {
  return normalizeSearchText(typeof value === 'string' ? value : value.en ?? value.es);
}

function indexRadarCard(card, post) {
  const labels = [...(post.stamps ?? []), ...(post.tags ?? [])];
  card.dataset.search = normalizeSearchText([post.title, post.note, post.url, ...labels].map(joinBilingualText).join(' '));
  card.dataset.labels = labels.map(labelKey).join('|');
  card.dataset.month = post.date.slice(0, 7);
}

function applyRadarFilters(cards) {
  const words = normalizeSearchText(radarFilterState.text).split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  cards.forEach(card => {
    const matches = words.every(word => card.dataset.search.includes(word))
      && (!radarFilterState.label || card.dataset.labels.split('|').includes(radarFilterState.label))
      && (!radarFilterState.month || card.dataset.month === radarFilterState.month);
    card.hidden = !matches;
    if (matches) visibleCount++;
  });
  document.getElementById('radar-no-match').hidden = visibleCount > 0;
}

function renderLabelChips(posts, cards) {
  const chipList = document.getElementById('radar-labels');
  const labels = new Map();
  posts.forEach(post => {
    (post.stamps ?? []).forEach(value => labels.has(labelKey(value)) || labels.set(labelKey(value), { value, isStamp: true }));
    (post.tags ?? []).forEach(value => labels.has(labelKey(value)) || labels.set(labelKey(value), { value, isStamp: false }));
  });
  labels.forEach(({ value, isStamp }, key) => {
    const chip = createElement('button', isStamp ? 'chip mono is-stamp' : 'chip mono');
    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'false');
    appendBilingualText(chip, value);
    chip.addEventListener('click', () => {
      radarFilterState.label = radarFilterState.label === key ? null : key;
      chipList.querySelectorAll('.chip').forEach(other => other.setAttribute('aria-pressed', String(other === chip && radarFilterState.label === key)));
      applyRadarFilters(cards);
    });
    chipList.append(chip);
  });
}

// <option> and placeholder can't hold lang spans, so they are rewritten on every language switch.
function localizeRadarFilterControls(posts) {
  const lang = root.dataset.lang;
  document.getElementById('radar-search').placeholder = lang === 'es' ? 'Buscar por nombre, etiqueta…' : 'Search by name, tag…';
  const monthSelect = document.getElementById('radar-month');
  const months = [...new Set(posts.map(post => post.date.slice(0, 7)))].sort().reverse();
  monthSelect.replaceChildren(
    new Option(lang === 'es' ? 'Todas las fechas' : 'All dates', ''),
    ...months.map(month => new Option(new Date(month + '-15').toLocaleDateString(lang, { month: 'long', year: 'numeric' }), month)));
  monthSelect.value = radarFilterState.month;
}

function setUpRadarFilters(posts, cards) {
  cards.forEach((card, index) => indexRadarCard(card, posts[index]));
  renderLabelChips(posts, cards);
  localizeRadarFilterControls(posts);
  document.getElementById('radar-filters').hidden = posts.length === 0;
  document.getElementById('radar-search').addEventListener('input', event => { radarFilterState.text = event.target.value; applyRadarFilters(cards); });
  document.getElementById('radar-month').addEventListener('change', event => { radarFilterState.month = event.target.value; applyRadarFilters(cards); });
  document.querySelectorAll('[data-set-lang]').forEach(button => button.addEventListener('click', () => localizeRadarFilterControls(posts)));
}
