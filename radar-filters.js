// Tag chips (All · Tool · Game · Idea) and a search box for radar.html's grid.
// Needs site.js; radar.js defines RADAR_TAGS and calls setUpRadarFilters.
const radarFilterState = { text: '', tag: null };

function normalizeSearchText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function joinBilingualText(value) {
  return typeof value === 'string' ? value : Object.values(value).join(' ');
}

function indexRadarCard(card, post) {
  const tags = radarPostTags(post);
  const words = [post.title, post.note, post.url, ...(post.stamps ?? []), ...tags.map(tag => RADAR_TAGS[tag])];
  card.dataset.search = normalizeSearchText(words.map(joinBilingualText).join(' '));
  card.dataset.tags = tags.join(' ');
}

function applyRadarFilters(cards) {
  const words = normalizeSearchText(radarFilterState.text).split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  cards.forEach(card => {
    const matches = words.every(word => card.dataset.search.includes(word))
      && (!radarFilterState.tag || card.dataset.tags.split(' ').includes(radarFilterState.tag));
    card.hidden = !matches;
    if (matches) visibleCount++;
  });
  document.getElementById('radar-no-match').hidden = visibleCount > 0;
}

// One chip per tag that some post uses, plus "All". Each chip shows how many posts it has.
function renderTagChips(posts, cards) {
  const chipList = document.getElementById('radar-tags');
  const counts = Object.fromEntries(Object.keys(RADAR_TAGS).map(tag => [tag, 0]));
  posts.forEach(post => radarPostTags(post).forEach(tag => counts[tag]++));
  const chips = [[null, { es: 'TODO', en: 'ALL' }, posts.length], ...Object.entries(RADAR_TAGS).map(([tag, label]) => [tag, label, counts[tag]])];
  chips.filter(([, , count]) => count > 0).forEach(([tag, label, count]) => {
    const chip = createElement('button', 'chip mono');
    chip.type = 'button';
    chip.dataset.tag = tag ?? '';
    chip.setAttribute('aria-pressed', String(tag === null));
    appendBilingualText(chip, label);
    chip.append(createElement('small', null, String(count)));
    chip.addEventListener('click', () => {
      radarFilterState.tag = tag;
      chipList.querySelectorAll('.chip').forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
      applyRadarFilters(cards);
    });
    chipList.append(chip);
  });
}

// A placeholder can't hold lang spans, so it is rewritten on every language switch.
function localizeRadarSearch() {
  document.getElementById('radar-search').placeholder = root.dataset.lang === 'es' ? 'Buscar…' : 'Search…';
}

function setUpRadarFilters(posts, cards) {
  cards.forEach((card, index) => indexRadarCard(card, posts[index]));
  renderTagChips(posts, cards);
  localizeRadarSearch();
  document.getElementById('radar-filters').hidden = posts.length === 0;
  document.getElementById('radar-search').addEventListener('input', event => { radarFilterState.text = event.target.value; applyRadarFilters(cards); });
  document.querySelectorAll('[data-set-lang]').forEach(button => button.addEventListener('click', localizeRadarSearch));
}
