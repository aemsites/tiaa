import { decorateIcons } from '../../scripts/aem.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.classList.remove('container');
  const section = block.closest('.section');
  if (section && section.children[section.children.length - 1] === block.parentElement) {
    section.classList.add('pb-0');
  }

  const row = block.children[0];
  row.classList.add('qui-expanding-mc-items');
  const columns = [...row.children];
  columns.forEach((column, index) => {
    if (index === 0) { column.classList.add('open'); }

    column.classList.add('qui-expanding-mc-item');
    column.addEventListener('mouseover', () => {
      columns.forEach((col) => col.classList.remove('open'));
      column.classList.add('open');
    });

    const heading = column.children[0];
    heading.classList.add('heading-5');
    heading.remove(); // remove heading from column

    const itemContent = div({ class: 'qui-expanding-mc-item-content' });
    [...column.children].forEach((child) => {
      if (child.querySelector('img')) {
        child.classList.add('qui-expanding-mc-item-image-container');
      } else if (child.querySelector('qui-wc-cta')) {
        child.classList.add('qui-expanding-mc-item-cta-container');
      } else {
        child.classList.add('body-2');
      }
      itemContent.appendChild(child);
    });

    column.append(
      div({ class: 'qui-expanding-mc-item-heading' },
        heading,
      ),
      div({ class: 'qui-expanding-mc-item-expand-icon' },
        span({ class: 'icon icon-ethos-expand qui-expanding-mc-icon' }),
      ),
      itemContent,
    );
  });

  decorateIcons(block);
}
