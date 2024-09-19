import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  loadScript,
} from './aem.js';
import { domEl } from './dom-helpers.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
main

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(/* main */) {
  try {
    // buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function decorateTIAAContent(main) {
  main.querySelectorAll('h1').forEach((h1) => {
    h1.className = 'display-strong-1';
  });
  main.querySelectorAll('h2').forEach((h2) => {
    h2.className = 'eyebrow-2 color-accent-tertiary';
  });
  main.querySelectorAll('h3').forEach((h3) => {
    h3.className = 'display-3';
  });
  main.querySelectorAll('h1>u,h2>u,h3>u').forEach((h) => {
    h.className = 'color-accent-primary';
  });

  main.querySelectorAll('.default-content-wrapper').forEach((content) => {
    const container = document.createElement('div');
    container.classList.add('container');
    container.append(...content.children);
    content.append(container);
  });

  main.querySelectorAll('.block').forEach((block) => {
    block.classList.add('container');
  });
}

function isPdf(url) {
  return url.toLowerCase().endsWith('.pdf');
}

function openInSameTab(url) {
  if (!url) return true;

  const ancUrl = new URL(url);
  return (
    !isPdf(url)
    && (window.location.hostname === ancUrl.hostname
      || ancUrl.hostname.toLowerCase() === 'www.tiaa.org'
      || ancUrl.hostname.toLowerCase() === 'tiaa.com'
      || ancUrl.hostname.toLowerCase().endsWith('.aem.live')
      || ancUrl.hostname.toLowerCase().endsWith('.aem.page')
    )
    && ancUrl.searchParams.get('target') !== '_blank'
  );
}

function decorateTIAAButtons(main) {
  main.querySelectorAll('a').forEach((a) => {
    const sameTab = openInSameTab(a.href);

    const cta = domEl(
      'qui-wc-cta',
      {
        'cta-type':
        'link',
        href: a.href,
        size: 'medium',
        class: 'qui-cta',
      },
    );

    if (!sameTab) {
      cta.setAttribute('target', '_blank');
      if (!isPdf(a.href)) {
        a.title += ' Opens in a new tab';
        cta.setAttribute('icon-name', 'launch');
        cta.setAttribute('icon-position', 'right');
      } else {
        a.title += ' Opens PDF';
        cta.setAttribute('icon-name', 'document_outline');
        cta.setAttribute('icon-position', 'right');
      }
    }

    cta.setAttribute('qui-aria-label', a.title);

    if (a.classList.contains('button')) {
      cta.setAttribute('cta-appearance', 'button');

      const aClass = ['mat-flat-button', 'mat-primary'];
      if (a.classList.contains('primary')) {
        cta.setAttribute('variant', 'flat');
      } else {
        cta.setAttribute('variant', 'stroke');
      }
      a.className = aClass.join(' ');
    } else {
      cta.setAttribute('cta-appearance', 'link');
      if (a.classList.contains('standalone')) {
        cta.setAttribute('appearance', 'standalone');
      }
    }

    cta.append(...a.childNodes);
    a.replaceWith(cta);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateTIAAButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateTIAAContent(main);
}

async function loadEthosJS() {
  await loadScript(`${window.hlx.codeBasePath}/scripts/ethos-config.js`);
  loadScript(`${window.hlx.codeBasePath}/lib/ethos/js/runtime.js`, { deffer: '' });
  loadScript(`${window.hlx.codeBasePath}/lib/ethos/js/polyfills.js`, { deffer: '' });
  loadScript(`${window.hlx.codeBasePath}/lib/ethos/js/main.js`, { deffer: '' });
  loadScript(`${window.hlx.codeBasePath}/lib/ethos/js/common.js`, { deffer: '' });
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage); // LCP
    loadEthosJS();
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
