import { div } from "../../scripts/dom-helpers.js";

export default function decorate(block) {
  const heroText = block.firstElementChild.firstElementChild;
  const heroImage = block.firstElementChild.lastElementChild;

  heroText.classList.add('hero-text');
  heroImage.classList.add('hero-image');

  block.firstElementChild.classList.add('grid');

  if (block.classList.contains('standard-hero-overlap')) { // should this the default?
    heroText.classList.add(...'g-col-xl-6 g-col-lg-7 g-col-md-7 g-col-12'.split(' '));
    heroImage.classList.add(...'g-col-xl-6 g-col-lg-5 g-col-md-5 g-col-12'.split(' '));
  }

  if (block.classList.contains('pathing-hero')) {
    heroText.classList.add(...'g-col-md-7 g-col-sm-7 g-col-12'.split(' '));
    heroImage.classList.add(...'g-col-md-5 g-col-sm-5 g-col-12'.split(' '));
  }

  heroText.appendChild(
    div({ class: 'hero-group grid'},
      div({ class: 'g-col-md-10 g-col-12 offset-md-2 offset-sm-2' },
        ...block.querySelectorAll("p")
      ),
    )
  );

  heroText.querySelector('p').classList.add('body-1');
}
