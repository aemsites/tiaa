import { decorateIcons } from '../../scripts/aem.js';
import { div, span } from '../../scripts/dom-helpers.js';

function expandColumn(column, columns) {
  columns.forEach((col) => {
    col.classList.remove('open');
    col.querySelector('.qui-expanding-mc-item-expand-icon').setAttribute('aria-expanded', 'false');
  });

  column.classList.add('open');
  column.querySelector('.qui-expanding-mc-item-expand-icon').setAttribute('aria-expanded', 'true');
}

export default function decorate(block) {
  // this block has custom widths and paddings
  block.classList.remove('container');

  // if this is the last block in the section, remove the bottom padding
  const section = block.closest('.section');
  if (section && section.children[section.children.length - 1] === block.parentElement) {
    section.classList.add('pb-0');
  }

  const row = block.children[0];
  row.classList.add('qui-expanding-mc-items');
  const columns = [...row.children];
  columns.forEach((column, index) => {
    column.classList.add('qui-expanding-mc-item');
    if (index === 0) { column.classList.add('open'); }

    column.addEventListener('mouseenter', () => {
      expandColumn(column, columns);
    });

    const heading = column.children[0];
    heading.classList.add('heading-5');
    heading.remove();

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
      div(
        {
          class: 'qui-expanding-mc-item-expand-icon',
          tabindex: '0',
          role: 'button',
          'aria-expanded': (index === 0).toString(),
          onclick: () => expandColumn(column, columns),
          onkeydown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              expandColumn(column, columns);
            }
          },
        },
        span({ class: 'icon icon-ethos-expand qui-expanding-mc-icon' }),
      ),
      itemContent,
    );
  });

  decorateIcons(block);
}
