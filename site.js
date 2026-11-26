const menu = document.querySelector('#mobile-menu');
const menuTrigger = document.querySelector('[aria-controls="mobile-menu"]');
const desktopBrand = document.querySelector('.site-header .brand');
const desktopLayout = window.matchMedia('(min-width: 900px)');
const root = document.documentElement;
const notice = document.querySelector('#section-notice');
const noticeMessage = notice.querySelector('.section-notice__message');
const noticeStatus = document.querySelector('#section-notice-status');
const sectionNames = new Map(
  [...document.querySelectorAll('.site-nav [data-section]')]
    .map((link) => [link.dataset.section, link.textContent.trim()])
);
let scrollBeforeMenu = 0;
let noticeTrigger;

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

  headerFocusTarget().focus({ preventScroll: true });
}

function headerFocusTarget() {
  return desktopLayout.matches ? desktopBrand : menuTrigger;
}

function closeMenu() {
  menu.close();
  // Unlock scrolling before the browser follows an in-page link.
  finishClosingMenu();
}

function showNotice(name, trigger) {
  const message = `Раздел «${name}» в разработке`;
  noticeTrigger = trigger;
  noticeMessage.textContent = message;
  notice.hidden = false;
  noticeStatus.textContent = message;
}

function hideNotice() {
  const restoreFocus = notice.contains(document.activeElement);
  notice.hidden = true;
  noticeStatus.textContent = '';

  if (restoreFocus) {
    const target = noticeTrigger?.getClientRects().length ? noticeTrigger : headerFocusTarget();
    target.focus({ preventScroll: true });
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

// Ready sections keep native links. Until then, an enhanced page opens a notice.
for (const link of document.querySelectorAll('[data-section]')) {
  const id = link.dataset.section;
  const section = document.getElementById(id);
  if (section) {
    link.href = `#${section.id}`;
    continue;
  }

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = link.className;
  trigger.dataset.section = id;
  trigger.setAttribute('aria-controls', notice.id);
  trigger.append(...link.childNodes);
  link.replaceWith(trigger);

  trigger.addEventListener('click', async () => {
    const fromMenu = menu.contains(trigger);
    if (fromMenu) {
      closeMenu();
      await Promise.allSettled(menu.getAnimations().map((animation) => animation.finished));
      if (menu.open) return;
    }
    showNotice(sectionNames.get(id), fromMenu ? menuTrigger : trigger);
  });
}

menu.addEventListener('click', (event) => {
  if (event.target === menu || event.target.closest('a')) closeMenu();
});

notice.querySelector('.section-notice__close').addEventListener('click', hideNotice);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.open && !notice.hidden) hideNotice();
});
