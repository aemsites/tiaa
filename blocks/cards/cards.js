import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    // li.classList.add('ethos-2-theme')
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('img')) {
        div.className = 'card-image';
      } else {
        div.className = 'card-container';
      }
      div.querySelectorAll('h2,h3,h4,h5')
        .forEach((e) => {
          e.classList.add('card-title', 'heading-5');
        });
      div.querySelectorAll('p')
        .forEach((e) => {
          if (e.classList.contains('button-container')) {
            e.classList.add('card-button');
          } else {
            e.classList.add('card-text');
          }
        });
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img')
    .forEach((img) => img.closest('picture')
      .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
