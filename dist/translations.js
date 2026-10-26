(() => {
  const glossary = [
    ['Wah, kya baat hai!', 'That is wonderful'],
    ['Doodh Rooh Afza', 'Milk with rose syrup'],
    ['Meethi Lassi', 'Sweet lassi'],
    ['Doodh Patti', 'Milk tea'],
    ['Doodh Soda', 'Milk soda'],
    ['Thanda Garam', 'Hot and cold'],
    ['Shabaash!', 'Well done'],
    ['Shikanjvi', 'Lemonade'],
    ['Rooh Afza', 'Rose syrup'],
    ['lassi', 'Yogurt drink'],
    ['chai', 'Tea'],
    ['pyaar', 'Love']
  ];
  const english = new Map(glossary.map(([term, meaning]) => [term.toLowerCase(), meaning]));
  const pattern = new RegExp(glossary.map(([term]) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
  // Only authored interface copy is translated; names and cup messages stay personal.
  const targets = '#drinks h2,#drinks p,.play-heading,.ticket-brand,.ticket-small,#order-name,#order-prompt,#receipt-lines,#round-title,#round-detail,#game-message,#glass-help,#added-list,.ingredient-tool>span';
  const observer = new MutationObserver(decorate);
  function decorate() {
    observer.disconnect();
    document.querySelectorAll(targets).forEach(container => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) if (!walker.currentNode.parentElement.closest('.urdu-term')) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const text = node.textContent;
        pattern.lastIndex = 0;
        const matches = [...text.matchAll(pattern)];
        if (!matches.length) continue;
        const fragment = document.createDocumentFragment();
        let offset = 0;
        for (const match of matches) {
          fragment.append(text.slice(offset, match.index));
          const span = document.createElement('span');
          span.className = 'urdu-term';
          span.textContent = match[0];
          span.dataset.english = english.get(match[0].toLowerCase());
          fragment.append(span);
          offset = match.index + match[0].length;
        }
        fragment.append(text.slice(offset));
        node.replaceWith(fragment);
      }
    });
    sync();
    document.querySelectorAll(targets).forEach(target => observer.observe(target, {childList:true,subtree:true,characterData:true}));
  }
  function sync() {
    const enabled = document.body.classList.contains('translate-on');
    document.querySelectorAll('.urdu-term').forEach(term => {
      // Interactive parent buttons retain their single, uninterrupted click target.
      term.tabIndex = enabled && !term.closest('button,[role="button"]') ? 0 : -1;
      if (enabled) term.setAttribute('aria-label', term.textContent + ': ' + term.dataset.english);
      else term.removeAttribute('aria-label');
      term.classList.remove('show-english');
    });
  }
  document.getElementById('translate').addEventListener('click',sync);
  document.addEventListener('click', event => {
    const term = event.target.closest('.urdu-term');
    if (term && document.body.classList.contains('translate-on')) term.classList.toggle('show-english');
  });
  decorate();
})();
