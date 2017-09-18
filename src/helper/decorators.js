// class decorators

import Draft from 'draft-js';
import Immutable, { OrderedSet } from 'immutable';
import { stateToHTML } from 'draft-js-export-html';
import makePlugins from '../plugins/';
import defaultDecorator from '../editorUtils/decoratorsEnhance';
import { defaultBlockRenderMap } from '../editorUtils/blockEnhance';
import { defaultInlineStyleMap } from '../editorUtils/inlineEnhance';

const {
  EditorState,
  ContentState,
  Modifier,
  convertToRaw,
  convertFromRaw,
  AtomicBlockUtils
} = Draft;

const { plugins: defaultPlugins } = makePlugins();

const noop = () => {};

// static
export function typerDecorator(target) {
  Object.assign(target, {
    convertToHTML: (contentState, options = {}) => {
      const html = stateToHTML(contentState, options);
      return html;
    },

    convertToJSON: contentState => {
      const raw = convertToRaw(contentState);
      return JSON.stringify(raw);
    },

    convertFromJSON: contentState => {
      const raw = JSON.parse(contentState);
      return convertFromRaw(raw);
    },

    extendBlockRenderMap: blockRenderMap =>
      Draft.DefaultDraftBlockRenderMap.merge(
        Immutable.Map(Object.assign({}, defaultBlockRenderMap, blockRenderMap))
      ),

    extendInlineStyleMap: inlineStyleMap =>
      Object.assign({}, defaultInlineStyleMap, inlineStyleMap),

    extendDecorators: decorators => [].concat(defaultDecorator, decorators),

    extendPlugins: plugins => [].concat(defaultPlugins, plugins)
  });
}

// prototype
export function textEditDecorator(target) {
  const contentModifyType = ['replaceText', 'insertText'];

  Object.assign(target.prototype, {
    /**
     * 
     * @param {object}    contentState
     *    contentState must be an object converted by convertFromRaw or convertFromJSON
     * @param {boolean}   hard
     *    use hard to clear history track while filling text
     */
    fillText(contentState, ...args) {
      let cb = noop;
      let hard = false;

      if (args.length > 1) {
        cb = args[args.length - 1] || cb;
        hard = args[0] || hard;
      }

      const { editorState } = this.state;
      const decorator = editorState.getDecorator();
      let newEditorState;
      if (hard) {
        newEditorState = EditorState.createWithContent(contentState, decorator);
      } else {
        newEditorState = EditorState.push(this.state.editorState, contentState);
      }
      this.onChange(newEditorState, this.focus);
    },

    modifyText(type, text = '', inlineStyles = [], entityKey, cb = noop) {
      if (contentModifyType.includes(type) && Modifier[type]) {
        const { editorState } = this.state;
        const contentState = Modifier[type](
          editorState.getCurrentContent(),
          editorState.getSelection(),
          text,
          OrderedSet.of(inlineStyles),
          entityKey
        );
        const newEditorState = EditorState.push(editorState, contentState);
        this.onChange(newEditorState, cb);
      }
    },

    insertText(text, inlineStyles, entityKey, cb) {
      const { editorState } = this.state;
      let type = '';
      if (editorState.getSelection().isCollapsed()) {
        type = 'insertText';
      } else {
        type = 'replaceText';
      }
      this.modifyText(type, text, inlineStyles, entityKey, cb);
    },

    replaceText(text, inlineStyles, entityKey, cb) {
      this.modifyText('replaceText', text, inlineStyles, entityKey, cb);
    },

    setBlock({ contentState, selectionState, blockType }, cb) {
      if (blockType) {
        const { editorState } = this.state;
        const _contentState = contentState || editorState.getCurrentContent();
        const _selectionState = selectionState || editorState.getSelection();
        const newContentState = Modifier.setBlockType(
          _contentState,
          _selectionState,
          blockType
        );
        const newEditorState = EditorState.push(editorState, newContentState);
        this.onChange(newEditorState, cb);
      }
    },

    insertAtomic({ entityKey, character }, cb) {
      if (entityKey !== undefined) {
        const { editorState } = this.state;
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          character
        );
        this.onChange(AtomicBlockUtils, cb);
      }
    }
  });
}

// prototype
export function entityEditDecorator(target) {
  Object.assign(target.prototype, {
    /**
     * @param {object}    entity
     *    an entity must contain type, mutability, data
     * @param {function}  cb callback after modifying
     */
    addEntity(entity, cb = noop) {
      const { editorState } = this.state;
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const contentStateWithEntity = contentState.createEntity(
        entity.type,
        entity.mutability,
        entity.data
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newContentState = Modifier.applyEntity(
        contentStateWithEntity,
        selectionState,
        entityKey
      );
      const _editorState = EditorState.push(editorState, newContentState);
      this.onChange(_editorState, cb);
      return entityKey;
    }
  });
}
