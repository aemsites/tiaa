function decorateStackCardContent(div) {
  const content = div;
  if (content) {
    // first child
    const eyeBrow = content.children[0];
    if (eyeBrow) {
      eyeBrow.classList.add('qui-stack-card-eyebrow');
      eyeBrow.classList.add('eyebrow-1');
      eyeBrow.classList.add('color-accent-tertiary');
    }
    const title = content.children[1];
    if (title) {
      title.classList.add('qui-stack-card-title');
      title.classList.add('jumbo-1');
      title.classList.add('color-accent-secondary');
      title.classList.add('stat-title');
    }
    const description = content.children[2];
    if (description) {
      description.classList.add('qui-stack-card-description');
      description.classList.add('body-1');
    }
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  block.classList.add(`stackcard-${rows.length}-rows`);

  rows.forEach((row, index) => {
    row.classList.add('stackcard-qui-stack-card');
    row.classList.add('stackcard-row');
    row.classList.add(`stackcard-row-${index + 1}`);
    const columns = [...row.children];
    columns.forEach((column) => {
      // create a wrapper div and move the column inside it
      const wrapper = document.createElement('div');
      wrapper.classList.add('stackcard-content-wrapper');
      wrapper.classList.add('stackcard-qui-enhanced-card');
      column.parentNode.insertBefore(wrapper, column);
      wrapper.appendChild(column);
      column.classList.add('stackcard-content');
      decorateStackCardContent(column);
    });
  });
}
