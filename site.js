const menu = document.querySelector('#mobile-menu');
const menuTrigger = document.querySelector('[aria-controls="mobile-menu"]');
const desktopLayout = window.matchMedia('(min-width: 900px)');
const root = document.documentElement;
let scrollBeforeMenu = 0;

function openMenu() {
  if (menu.open) return;

  scrollBeforeMenu = window.scrollY;
  root.style.setProperty('--page-offset', `-${scrollBeforeMenu}px`);
  root.classList.add('menu-open');
  menuTrigger.setAttribute('aria-expanded', 'true');
  menu.showModal();
}

function finishClosingMenu() {
  if (menu.open || !root.classList.contains('menu-open')) return;

  root.classList.remove('menu-open');
  root.style.removeProperty('--page-offset');
  window.scrollTo(0, scrollBeforeMenu);
  menuTrigger.setAttribute('aria-expanded', 'false');

  if (desktopLayout.matches) {
    document.querySelector('.site-header .brand').focus({ preventScroll: true });
  } else {
    menuTrigger.focus({ preventScroll: true });
  }
}

menuTrigger.addEventListener('click', openMenu);
menu.addEventListener('close', finishClosingMenu);

desktopLayout.addEventListener('change', ({ matches }) => {
  if (matches && menu.open) menu.close();
});

menu.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const first = menu.querySelector('.brand');
  const last = menu.querySelector('.menu__booking');

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// As sections are built, their local IDs take over from the salon's public listing.
for (const link of document.querySelectorAll('[data-section]')) {
  const section = document.getElementById(link.dataset.section);
  if (section) link.href = `#${section.id}`;
}

menu.addEventListener('click', (event) => {
  if (event.target === menu || event.target.closest('a')) {
    menu.close();
    // Unlock scrolling before the browser follows an in-page link.
    finishClosingMenu();
  }
});
