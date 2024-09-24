function decoratestackcomponentContent(div) {
  const content = div;
  if (content) {
    // first child
    const eyeBrow = content.children[0];
    if (eyeBrow) {
      eyeBrow.classList.add('qui-stack-component-eyebrow');
      eyeBrow.classList.add('eyebrow-2');
      eyeBrow.classList.add('color-accent-tertiary');
    }
    const title = content.children[1];
    if (title) {
      title.classList.add('qui-stack-component-title');
    }
    const description = content.children[2];
    if (description) {
      description.classList.add('qui-stack-component-description');
      description.classList.add('body-1');
    }
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  block.classList.add(`stackcomponent-${rows.length}-rows`);

  rows.forEach((row, index) => {
    row.classList.add('stackcomponent-qui-stack-component');
    row.classList.add('stackcomponent-row');
    row.classList.add(`stackcomponent-row-${index + 1}`);
    const columns = [...row.children];
    columns.forEach((column) => {
      // create a wrapper div and move the column inside it
      const wrapper = document.createElement('div');
      wrapper.classList.add('stackcomponent-wrapper');
      wrapper.classList.add('stackcomponent-qui-enhanced-card');
      column.parentNode.insertBefore(wrapper, column);
      wrapper.appendChild(column);
      column.classList.add('stackcomponent-content');
      decoratestackcomponentContent(column);
    });
  });
}
