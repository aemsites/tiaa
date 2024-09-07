import { toCamelCase } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';

function readHeroBlockConfig(block) {
  const config = {};

  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toCamelCase(cols[0].textContent);
        config[name] = col.children || [];
      }
    }
  });
  return config;
}

export default function decorate(block) {
  const heroConfig = readHeroBlockConfig(block);
  let mobileImage = heroConfig.mobileImage ? heroConfig.mobileImage[0] : null;
  let desktopImage = heroConfig.desktopImage ? heroConfig.desktopImage[0] : null;
  const image = heroConfig.image ? heroConfig.image[0] : null;

  if (mobileImage && desktopImage) {
    mobileImage.classList.add('mobile-image');
    desktopImage.classList.add('desktop-image');
  } else {
    mobileImage = mobileImage || desktopImage || image;
    desktopImage = desktopImage || mobileImage || image;
  }

  block.innerHTML = '';
  block.appendChild(
    div({ class: 'grid' },
      div({ class: 'hero-text' },
        ...heroConfig.text,
      ),
      div({ class: 'hero-image' },
        mobileImage, // mobile first always for LHS
        desktopImage,
      ),
    ),
  );

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

  let heroGroupLayout = 'g-col-md-10 g-col-12 offset-md-2';
  if (block.classList.contains('pathing-hero')) {
    heroGroupLayout = 'g-col-md-10 g-col-12 offset-md-2 offset-sm-2';
  }
  heroText.appendChild(
    div({ class: 'hero-group grid' },
      div({ class: heroGroupLayout },
        ...block.querySelectorAll('p'),
      ),
    ),
  );

  heroText.querySelector('p').classList.add('body-1');
}
