import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  footer.querySelectorAll('.footer-col1-row1 p a').forEach((e) => {
    if (e.children.length === 0) {
      e.classList.add(...['button', 'secondary']);
    }
  });

  footer.querySelectorAll('.footer-col1-row3 p a span').forEach((e) => {
    if (!(e.classList.contains('icon-apple-app-store') || e.classList.contains('icon-google-play-store'))) {
      e.classList.add(...['icon-social-media']);
    }
  });
  block.append(footer);
}
