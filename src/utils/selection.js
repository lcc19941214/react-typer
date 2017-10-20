import { EditorState } from 'draft-js';
import createStore from './createStore';

export const globalSelectionStore = createStore({
  selectedTextNodes: [],
  replacedChildNodes: [],
  range: undefined
});

export function getTextNode(elem) {
  if (elem.hasChildNodes()) {
    return getTextNode(elem.firstChild);
  } else {
    return elem.nodeType === 3 ? elem : null;
  }
}

export function forceSelect(editorState, start, end) {
  const selection = editorState.getSelection();
  const nextSelection = selection.merge({
    anchorOffset: start,
    focusOffset: end
  });
  const nextEditorState = EditorState.forceSelection(editorState, nextSelection);
  return nextEditorState;
}

/*
 * find nodes in selection
 */
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

/*
 * split selected text nodes into different parts
 */
function splitText(text, start = 0, end = text.length) {
  const pre = text.slice(0, start);
  const middle = text.slice(start, end);
  const next = text.slice(end);
  return [pre, middle, next];
}
function generateSelectedFragment(textGroup = [], targetIndex) {
  const fragment = document.createDocumentFragment();
  let selection;
  textGroup.forEach((text, i) => {
    if (targetIndex === i) {
      selection = document.createElement('span');
      selection.style.backgroundColor = 'rgba(0,0,0,.15)';
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
}
function replaceChildNodes(selectedTextNodes, range) {
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
}

/*
 * put different text nodes used to have same ancestor into together
 */
function removeRelativeTextNodes(parent, target) {
  target.previousSibling && parent.removeChild(target.previousSibling);
  target.nextSibling && parent.removeChild(target.nextSibling);
}
function resetChildNodes(selectedTextNodes, childNodes, range = {}) {
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
  globalSelectionStore.updateItem('selectedTextNodes', []);
  globalSelectionStore.updateItem('replacedChildNodes', []);
  globalSelectionStore.updateItem('range', undefined);
}
export function resetMockSelection() {
  const selectedTextNodes = globalSelectionStore.getItem('selectedTextNodes');
  const replacedChildNodes = globalSelectionStore.getItem('replacedChildNodes');
  const range = globalSelectionStore.getItem('range');
  if (selectedTextNodes.length && replacedChildNodes.length && range) {
    resetChildNodes(selectedTextNodes, replacedChildNodes, range);
  }
}

/*
 * manually mock selection
 * TODO:
 *   recompute position on resize
 * REMIND:
 *   it's hard to mock selection of each line, especially when selection contains multiple lines
 */

export function toggleMockSelection(selectedTextNodes, range) {
  var s = window.getSelection();

  if (selectedTextNodes.__hasMockSelection) {
    s.addRange(range);
    resetMockSelection();
    delete selectedTextNodes.__hasMockSelection;
  } else {
    const rangeObj = {
      startContainer: getTextNode(range.startContainer),
      endContainer: getTextNode(range.endContainer)
    };
    const replacedChildNodes = replaceChildNodes(selectedTextNodes, range);

    globalSelectionStore.updateItem('selectedTextNodes', selectedTextNodes);
    globalSelectionStore.updateItem('replacedChildNodes', replacedChildNodes);
    globalSelectionStore.updateItem('range', rangeObj);

    selectedTextNodes.__hasMockSelection = true;
  }
}
