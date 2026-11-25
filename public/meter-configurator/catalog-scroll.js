(() => {
  const viewport = document.getElementById('meter-catalog-table');
  const slider = document.getElementById('meter-catalog-position');
  const control = slider.parentElement;

  function syncSlider() {
    const distance = viewport.scrollWidth - viewport.clientWidth;
    control.hidden = distance <= 0;
    slider.max = Math.max(0, distance);
    slider.value = Math.round(viewport.scrollLeft);
  }

  slider.addEventListener('input', () => {
    viewport.scrollLeft = slider.valueAsNumber;
  });
  viewport.addEventListener('scroll', syncSlider, { passive: true });

  const sort = document.getElementById('meter-catalog-sort');
  const body = viewport.querySelector('tbody');
  const rows = Array.from(body.rows);
  sort.addEventListener('change', () => {
    const [key, direction] = sort.value.split('-');
    const ordered = direction ? [...rows].sort((a, b) =>
      (Number(a.dataset[key]) - Number(b.dataset[key])) * (direction === 'desc' ? -1 : 1),
    ) : rows;
    body.append(...ordered);
  });
  sort.parentElement.hidden = false;

  const observer = new ResizeObserver(syncSlider);
  observer.observe(viewport);
  observer.observe(viewport.querySelector('table'));
  syncSlider();
})();
