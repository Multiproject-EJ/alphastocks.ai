function wireSearch(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    [...container.querySelectorAll('.card.dir')].forEach(card => {
      const name = (card.dataset.name || card.textContent).toLowerCase();
      card.style.display = name.includes(q) ? '' : 'none';
    });
  });
}
wireSearch('dir-search','dir-cards');
wireSearch('dir-search-page','dir-cards-page');

console.log('Alphastocks.ai loaded');
