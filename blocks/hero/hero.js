import { toCamelCase } from '../../scripts/aem.js';
import { div } from '../../scripts/dom-helpers.js';

function dynamicMediaOptimisedPicture(src, component, alt, eager) {
  const url = new URL(src, window.location.href);
  url.search = '';
  if (url.pathname.includes(':')) {
    [url.pathname] = url.pathname.split(':');
  }

  const picture = document.createElement('picture');
  const formats = [
    { type: 'image/webp', format: 'webp' },
    { type: 'image/jpeg', format: 'webp&amp;pscan=5' },
  ];

  const pixels = [
    { suffix: '', pixels: 1 },
    { suffix: '-Retina-2x', pixels: 2 },
    { suffix: '-Retina-3x', pixels: 3 },
  ];

  const breakpoints = [
    { media: '(max-width: 599px)', size: 'ExtraSmall' },
    { media: '(max-width: 959px)', size: 'Small' },
    { media: '(max-width: 1279px)', size: 'Medium' },
    { media: '(max-width: 1440px)', size: 'Large' },
    { size: 'ExtraLarge' },
  ];

  formats.forEach((format) => {
    breakpoints.forEach((br) => {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('type', format.type);
      source.setAttribute('srcset', pixels.map((pixel) => `${url}:${component}-${br.size}${pixel.suffix}?fmt=${format.format} ${pixel.pixels}x`).join(','));
      picture.appendChild(source);
    });
  });

  const img = document.createElement('img');
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('alt', alt || true);
  img.setAttribute('src', url.href);

  picture.appendChild(img);

  return picture;
}

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
  block.querySelectorAll('a').forEach((a) => {
    if (!a.href.startsWith('https://s7d1.scene7.com')) return;
    a.replaceWith(
      dynamicMediaOptimisedPicture(a.href, 'Hero-With-Children', ''),
    );
  });

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

  const heroText = block.querySelector('.hero-text');
  const heroImage = block.querySelector('.hero-image');

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
        ...heroText.querySelectorAll('p'),
      ),
    ),
  );

  heroText.querySelector('p').classList.add('body-1');
}
