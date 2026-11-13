document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loading-screen');
  const revealItems = document.querySelectorAll('.reveal');

  const hideLoader = () => window.setTimeout(() => loader?.classList.add('hidden'), 250);
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, { once: true });

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
});
