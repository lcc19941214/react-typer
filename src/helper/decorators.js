// class decorators

import Draft from 'draft-js';
import Immutable, { OrderedSet } from 'immutable';
import { stateToHTML } from 'draft-js-export-html';

const {
  EditorState,
  ContentState,
  Modifier,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  AtomicBlockUtils
} = Draft;

const noop = () => {};

export function composeDecorators(...decorators) {
  return target =>
    decorators.forEach(d => {
      if (typeof d === 'function') {
        d(target);
      }
    });
}

// public typer method
export function publicTyperDecorator(target) {
  Object.assign(target, {
    convertToHTML: (contentState, options = {}) => {
      // stateToHTML option api only support current contentBlock,
      // must manually inject contentState to stateToHTML options
      const _options = Object.assign({}, options, { blockRenderers: {} });
      Object.keys(options.blockRenderers).forEach(key => {
        _options.blockRenderers[key] = options.blockRenderers[key].bind(
          undefined,
          contentState
        );
      });
      const html = stateToHTML(contentState, _options);
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

    extendBlockRenderMap: (blockRenderMap, defaultBlockRenderMap = {}) =>
      Draft.DefaultDraftBlockRenderMap.merge(
        Immutable.Map(Object.assign({}, defaultBlockRenderMap, blockRenderMap))
      ),

    extendInlineStyleMap: (inlineStyleMap, defaultInlineStyleMap = {}) =>
      Object.assign({}, defaultInlineStyleMap, inlineStyleMap),

    extendDecorators: (decorators, defaultDecorator = []) =>
      [].concat(defaultDecorator, decorators),

    extendPlugins: (plugins, defaultPlugins = []) => [].concat(defaultPlugins, plugins)
  });
}

// content state edit method
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
          inlineStyles.length > 0 ? OrderedSet.of(inlineStyles) : undefined,
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
        // isCollapsed means no selection
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

// entity
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

// editor toolbar
export function editorToolbarDecorator(target) {
  Object.assign(target.prototype, {
    toggleToolbar(style, type, cb = noop) {
      const { editorState } = this.state;
      switch (type) {
        case 'block':
          this.onChange(RichUtils.toggleBlockType(editorState, style), cb);
          break;
        case 'inline':
          if (this.isFocus) {
            // prevent onblur inline style apply
            this.onChange(RichUtils.toggleInlineStyle(editorState, style), cb);
          }
          break;
        default:
      }
    }
  });
}
