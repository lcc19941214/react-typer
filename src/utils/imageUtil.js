import { EditorState, AtomicBlockUtils, convertToRaw } from 'draft-js';
import axios from 'axios';
import * as BlockType from '../constants/blockType';
import brokenImage from '../static/images/broken_image.svg';

const noop = () => {};
const imageURLKeyMap = {};

const INITIAL_IMAGE_BLOCK_PROPS = {
  alignment: 'center',
  width: 'auto'
};

export const addImage = (editorState, url, extraData = {}) => {
  const contentState = editorState.getCurrentContent();
  const entityData = { ...INITIAL_IMAGE_BLOCK_PROPS, ...extraData, uid: Date.now() };
  const contentStateWithEntity = contentState.createEntity(
    BlockType.IMAGE,
    'IMMUTABLE',
    { ...entityData, src: url }
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  imageURLKeyMap[url] = entityKey;
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
  return newEditorState;
};

export const updateImage = (editorState, toMergeData, localURL) => {
  const contentState = editorState.getCurrentContent();
  const entityKey = imageURLKeyMap[localURL];
  const nextContentState = contentState.mergeEntityData(entityKey, toMergeData);
  delete imageURLKeyMap[localURL];
  return EditorState.push(editorState, nextContentState);
};

const makeUpload = (action, file, config = {}, localURL) => {
  const data = new FormData();
  data.append('file', file);
  return axios
    .post(action, data, config)
    .then(res => res.data)
    .catch(err => {
      console.error(err);
      return {
        url: brokenImage.slice(1, -1),
        error: err
      };
    });
};

const mergeImageData = (mergeData, localURL, editor) => {
  const toMergeData = {
    src: mergeData.url,
    uploading: false,
    progress: 100,
    ...mergeData
  };

  editor.blur();
  const newEditorState = updateImage(editor.state.editorState, toMergeData, localURL);
  editor.changeState(newEditorState, () => {
    editor.focus();
    setTimeout(() => {
      URL.revokeObjectURL(localURL);
    }, 1000);
  });
};

export const uploadImage = (action, file, options) => {
  const {
    requestConfig = {},
    onUpload,
    onUploadError = noop,
    editor,
    localURL
  } = options;
  return makeUpload(action, file, requestConfig, localURL)
    .then(res => onUpload(res) || res)
    .then(res => {
      if (res.error) {
        onUploadError(res.error);
      }
      return mergeImageData(res, localURL, editor);
    });
};

export const pasteAndUploadImage = (event, cb) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  // REMIND
  // item is DataTransferItem
  // see https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem

  // fileReader always return same dataURL for same image entity
  for (let item of items) {
    if (item.kind === 'file' && item.type.includes('image/')) {
      const blob = item.getAsFile();
      const url = URL.createObjectURL(blob);
      cb(blob, url);
    }
  }
};
