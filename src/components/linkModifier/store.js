import createStore from '../../utils/createStore';

const noop = () => {};

//   selectionRect
//   selectedTextNodes
//   range
//     range
//     container
//   selection
//     startOffset
//     endOffset

export const displayToolStore = createStore({
  visible: false,
  url: '',
  focusLink: null,
  getEditor: noop
});

export const modifierToolStore = createStore({
  visible: false,
  url: '',
  selection: null,
  selectionRect: null,
  selectedTextNodes: [],
  range: {},
  getEditor: noop
});

export const closeLinkDisplayTool = () => {
  if (displayToolStore.getItem('focusLink')) {
    displayToolStore.updateItem('visible', false);
    displayToolStore.updateItem('url', '');
    displayToolStore.updateItem('focusLink', null);
  }
}
