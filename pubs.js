// Renders publications.json into the #pub-list <ol> and updates the count/year-range subtitle.
// To add a new paper: just add a new object to publications.json — no HTML edits needed.

async function loadPublications() {
  const list = document.getElementById('pub-list');
  const sub = document.querySelector('.page-sub');

  try {
    const res = await fetch('publications.json');
    const pubs = await res.json();

    // Newest first (assumes entries aren't already guaranteed sorted)
    pubs.sort((a, b) => b.year - a.year);

    list.innerHTML = pubs.map(renderEntry).join('');

    const years = pubs.map(p => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    sub.textContent = `${pubs.length} papers · ${minYear === maxYear ? minYear : `${minYear}–${maxYear}`}`;
  } catch (err) {
    list.innerHTML = '<li><div class="authors">Could not load publications.</div></li>';
    console.error('Failed to load publications.json:', err);
  }
}

function renderEntry(p) {
  const authorsHtml = p.authors
    .map(a => (a === 'Sarkar, D.' ? `<span class="me">${a}</span>` : a))
    .join(', ');

  const linkHtml = p.link
    ? `<a href="${p.link.url}">${p.link.label}</a>`
    : '';

  return `<li><div>
    <div class="authors">${authorsHtml} (${p.year}). ${p.title}</div>
    <div class="venue">${p.venue}</div>
    ${linkHtml}
  </div></li>`;
}

loadPublications();
