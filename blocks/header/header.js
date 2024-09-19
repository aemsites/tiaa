import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Toggles all nav submenus
 * @param {Element} submenus The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSubmenus(submenus, expanded = false) {
  submenus.forEach((submenu) => {
    submenu.querySelectorAll('.nav-submenu .default-content-wrapper > ul > li').forEach((navDrop) => {
      navDrop.setAttribute('aria-expanded', expanded);
    });
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSubmenus = nav.querySelectorAll('.nav-submenu');
    const navSubmenuExpanded = Array.from(navSubmenus).some((submenu) => submenu.querySelector('[aria-expanded="true"]') !== null);

    if (navSubmenuExpanded && isDesktop.matches) {
      toggleAllNavSubmenus(navSubmenus);
      navSubmenuExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSubmenus);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSubmenus = nav.querySelectorAll('.nav-submenu');
    const navSubmenuExpanded = Array.from(navSubmenus).some((submenu) => submenu.querySelector('[aria-expanded="true"]') !== null);

    if (navSubmenuExpanded && isDesktop.matches) {
      toggleAllNavSubmenus(navSubmenus, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSubmenus, false);
    }
  }
}

function toggleOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';

  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';

    const nav = document.getElementById('nav');
    const navSubmenus = nav.querySelectorAll('.nav-submenu');
    toggleAllNavSubmenus(navSubmenus);

    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSubmenu() {
  document.activeElement.addEventListener('keydown', toggleOnKeydown);
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} submenus The nav submenus within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, submenus, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  // Close all submenus on navigation open/close
  toggleAllNavSubmenus(submenus, 'false');

  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable nav dropdown keyboard accessibility
  const navDrops = Array.from(submenus).reduce((acc, submenu) => {
    const submenuElements = Array.from(submenu.querySelectorAll('.nav-drop'));

    return [
      ...acc,
      ...submenuElements,
    ];
  }, []);

  if (isDesktop.matches) {
    // On desktop, we should not keep focus on the whole navigation
    nav.removeAttribute('tabindex', -1);

    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSubmenu);
      }
    });
  } else {
    // On mobile, keeps focus on the whole navigation for navigating through its content
    nav.setAttribute('tabindex', -1);

    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSubmenu);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Builds navigation drop elements, which can open a second level of navigation
 * @param {Element} navElement The target navigation element
 * @param {Element} navSubmenus All nav submenus
 */
function buildNavDrop(navElement, navSubmenus) {
  if (!navElement.querySelector('ul')) {
    return;
  }

  navElement.classList.add('nav-drop');

  const navDropIcon = document.createElement('qui-ng-icon');
  navDropIcon.classList.add('qui-icon');

  // svgs cannot be created with document.createElement
  navDropIcon.innerHTML = `<svg role="img" size="md" aria-hidden="true">
    <use href="#chevron_right"></use>
  </svg>`;
  navElement.append(navDropIcon);

  navElement.addEventListener('click', () => {
    const expanded = navElement.getAttribute('aria-expanded') === 'true';
    toggleAllNavSubmenus(navSubmenus);
    navElement.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // quick workaround to revert the default content decoration
  fragment.querySelectorAll('.default-content-wrapper').forEach((contentWrapper) => {
    const container = contentWrapper.querySelector('.container');
    if (!container) return;
    contentWrapper.innerHTML = '';
    contentWrapper.append(...container.children);
  });

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const navSectionsOrder = ['triage', 'brand', 'main', 'search', 'tools', 'login'];
  navSectionsOrder.forEach((sectionName, i) => {
    const section = nav.children[i];
    if (section) {
      section.classList.add(`nav-${sectionName}`);

      if (sectionName === 'triage' || sectionName === 'main') {
        section.classList.add('nav-submenu');
      }
    }
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSubmenus = nav.querySelectorAll('.nav-submenu');
  navSubmenus.forEach((submenu) => {
    submenu.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navDrop) => buildNavDrop(navDrop, navSubmenus));
  });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSubmenus));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSubmenus, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSubmenus, isDesktop.matches));

  // navigation overlay for desktop
  const navOverlay = document.createElement('div');
  navOverlay.classList.add('nav-overlay');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  navWrapper.append(navOverlay);
  block.append(navWrapper);
}
