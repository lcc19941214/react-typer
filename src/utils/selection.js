export const getTextNode = elem => {
  if (elem.hasChildNodes()) {
    return getTextNode(elem.firstChild);
  } else {
    return elem.nodeType === 3 ? elem : null;
  }
};

function nextNode(node) {
  if (node.hasChildNodes()) {
    return node.firstChild;
  } else {
    while (node && !node.nextSibling) {
      node = node.parentNode;
    }
    if (!node) {
      return null;
    }
    return node.nextSibling;
  }
}

function getRangeSelectedNodes(range) {
  var node = range.startContainer;
  var endNode = range.endContainer;

  // Special case for a range that is contained within a single node
  if (node === endNode) {
    return [node];
  }

  // Iterate nodes until we hit the end container
  var rangeNodes = [];
  while (node && node !== endNode) {
    rangeNodes.push((node = nextNode(node)));
  }

  // Add partially selected nodes at the start of the range
  node = range.startContainer;
  while (node && node !== range.commonAncestorContainer) {
    rangeNodes.unshift(node);
    node = node.parentNode;
  }

  return rangeNodes;
}

export function getSelectedNodes() {
  if (window.getSelection) {
    var s = window.getSelection();
    if (!s.isCollapsed) {
      return getRangeSelectedNodes(s.getRangeAt(0));
    }
  }
  return [];
}

export function getSelectedTextNodes() {
  const nodes = getSelectedNodes();
  return nodes.filter(v => v.childNodes.length === 0 && v.nodeType === 3);
}

const splitText = (text, start = 0, end = text.length) => {
  const pre = text.slice(0, start);
  const middle = text.slice(start, end);
  const next = text.slice(end);
  return [pre, middle, next];
};

const generateSelectedFragment = (textGroup = [], targetIndex) => {
  const fragment = document.createDocumentFragment();
  let selection;
  textGroup.forEach((text, i) => {
    if (targetIndex === i) {
      selection = document.createElement('span');
      selection.textContent = text;
      fragment.appendChild(selection);
    } else if (text) {
      fragment.appendChild(document.createTextNode(text));
    }
  });
  return {
    fragment,
    selection
  };
};

const removeRelativeTextNodes = (parent, target) => {
  target.previousSibling && parent.removeChild(target.previousSibling);
  target.nextSibling && parent.removeChild(target.nextSibling);
};

const replaceChildNodes = (selectedTextNodes, range) => {
  const childNodes = [];
  selectedTextNodes.forEach(node => {
    const parent = node.parentElement;
    const text = node.nodeValue;
    let wrapper;
    if (range.startContainer === range.endContainer) {
      const textGroup = splitText(text, range.startOffset, range.endOffset);
      const { fragment, selection } = generateSelectedFragment(textGroup, 1);
      wrapper = selection;
      parent.replaceChild(fragment, node);
    } else if (node === range.startContainer) {
      const textGroup = splitText(text, range.startOffset);
      const { fragment, selection } = generateSelectedFragment(textGroup, 1);
      wrapper = selection;
      parent.replaceChild(fragment, node);
    } else if (node === range.endContainer) {
      const textGroup = splitText(text, undefined, range.endOffset);
      const { fragment, selection } = generateSelectedFragment(textGroup, 1);
      wrapper = selection;
      parent.replaceChild(fragment, node);
    } else {
      wrapper = document.createElement('span');
      wrapper.textContent = text;
      parent.replaceChild(wrapper, node);
    }
    childNodes.push(wrapper);
  });
  return childNodes;
};

const resetChildNodes = (selectedTextNodes, childNodes, range) => {
  childNodes.forEach((wrapper, i) => {
    const parent = wrapper.parentElement;
    const node = selectedTextNodes[i];
    if (
      range.startContainer === range.endContainer ||
      node === range.startContainer ||
      node === range.endContainer
    ) {
      removeRelativeTextNodes(parent, wrapper);
    }
    parent.replaceChild(node, wrapper);
  });
};

// it's hard to mock selection of each line, especially when selection contains multiple lines
const createSelectionBackground = rect => {
  const selection = document.createElement('div');
  selection.className = 'selection';
  selection.style.top = `${rect.top}px`;
  selection.style.left = `${rect.left}px`;
  selection.style.width = `${rect.width}px`;
  selection.style.height = `${rect.height}px`;
  return selection;
};

export const toggleSelectRangeBackgroundColor = (() => {
  const cls = 'react-typer__slection-container';
  let selectionContainer = document.querySelector(`.${cls}`);
  if (!selectionContainer) {
    selectionContainer = document.createElement('div');
    selectionContainer.className = cls;
    document.body.appendChild(selectionContainer);
  }

  return (selectedTextNodes, range) => {
    var s = window.getSelection();

    if (selectedTextNodes.selections) {
      s.addRange(range);
      while (selectionContainer.hasChildNodes()) {
        selectionContainer.removeChild(selectionContainer.lastChild);
      }
      delete selectedTextNodes.selections;
    } else {
      const rangeObj = {
        startContainer: getTextNode(range.startContainer),
        endContainer: getTextNode(range.endContainer)
      };
      const replacedChildNodes = replaceChildNodes(selectedTextNodes, range);
      const selections = [];
      replacedChildNodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        const selection = createSelectionBackground(rect);
        selectionContainer.appendChild(selection);
        selections.push(selection);
      });
      resetChildNodes(selectedTextNodes, replacedChildNodes, rangeObj);
      selectedTextNodes.selections = selections;
    }
  };
})();
