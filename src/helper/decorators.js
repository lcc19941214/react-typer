// class decorators

import Draft from 'draft-js';
import Immutable, { OrderedSet } from 'immutable';
import classnames from 'classnames';
import makePlugins from '../plugins/';
import convertToHTML from './exportToHTML';
import defaultDecorator from '../defaultEditorOptions/editorDecorators';
import defaultBlockRenderMap from '../defaultEditorOptions/blockRenderMap';
import defaultInlineStyleMap from '../defaultEditorOptions/inlineStyles';
import defaultBlockStyleFn from '../defaultEditorOptions/blockStyleFn';
import defaultBlockRendererFn from '../defaultEditorOptions/blockRendererFn';
import defaultKeyCommandHandlers from '../defaultEditorOptions/keyCommandHandlers';
import defaultKeyBindingFn from '../defaultEditorOptions/keyBindingFn';
const { plugins: defaultPlugins } = makePlugins();

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
    convertToHTML(contentState, options = {}) {
      // stateToHTML option api only support current contentBlock,
      // must manually inject contentState to stateToHTML options
      const _options = { ...options, blockRenderers: {} };
      Object.keys(options.blockRenderers).forEach(key => {
        _options.blockRenderers[key] = options.blockRenderers[key].bind(undefined, contentState);
      });
      const html = convertToHTML(contentState, _options);
      return html;
    },

    convertToJSON(contentState) {
      const raw = convertToRaw(contentState);
      return JSON.stringify(raw);
    },

    convertFromJSON(contentState) {
      const raw = JSON.parse(contentState);
      return convertFromRaw(raw);
    },

    extendBlockRenderMap(blockRenderMap = {}) {
      return Draft.DefaultDraftBlockRenderMap.merge(
        Immutable.Map({ ...defaultBlockRenderMap, ...blockRenderMap })
      );
    },

    extendBlockStyleFn(blockStyleFn = noop) {
      return function(contentBlock) {
        const defaultVal = defaultBlockStyleFn(contentBlock) || {};
        return classnames(
          defaultBlockStyleFn(contentBlock) || '',
          blockStyleFn(contentBlock, defaultVal) || ''
        );
      };
    },

    extendBlockRendererFn(blockRendererFn = noop) {
      return function(contentBlock) {
        const defaultVal = defaultBlockRendererFn(contentBlock) || {};
        return Object.assign({}, defaultVal, blockRendererFn(contentBlock, defaultVal) || {});
      };
    },

    extendKeyBindingFn(keyBindingFn = noop) {
      return function(event) {
        const command = defaultKeyBindingFn(event) || '';
        return keyBindingFn(event, command) || command;
      };
    },

    extendKeyCommandHandlers(keyCommandHandlers = {}) {
      return Object.assign({}, defaultKeyCommandHandlers, keyCommandHandlers);
    },

    extendInlineStyleMap(inlineStyleMap = {}) {
      return Object.assign({}, defaultInlineStyleMap, inlineStyleMap);
    },
    extendDecorators(decorators = []) {
      return [].concat(defaultDecorator, decorators);
    },
    extendPlugins(plugins = []) {
      return [].concat(defaultPlugins, plugins);
    },

    extendDefaultProps({
      decorators = [],
      plugins = [],
      blockRenderMap = {},
      blockStyleFn = noop,
      blockRendererFn = noop,
      inlineStyleMap = {},
      keyBindingFn = noop,
      keyCommandHandlers = {}
    }) {
      return {
        decorators: this.extendDecorators(decorators),
        plugins: this.extendPlugins(plugins),
        blockRenderMap: this.extendBlockRenderMap(blockRenderMap),
        blockRendererFn: this.extendBlockRendererFn(blockRendererFn),
        blockStyleFn: this.extendBlockStyleFn(blockStyleFn),
        customStyleMap: this.extendInlineStyleMap(inlineStyleMap),
        keyBindingFn: this.extendKeyBindingFn(keyBindingFn)
      };
    }
  });
}

// content state edit method
export function contentStateDecorator(target) {
  const contentModifyType = ['replaceText', 'insertText'];

  Object.assign(target.prototype, {
    /**
     *
     * @param {object}    contentState
     *    contentState must be an object converted by convertFromRaw or convertFromJSON
     * @param {boolean}   hard
     *    use hard to clear history track while filling text
     */
    fillContentState(contentState, ...args) {
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
        newEditorState = EditorState.push(this.state.editorState, contentState, 'insert-fragment');
      }
      this.changeState(newEditorState, cb);
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
        const newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
        this.changeState(newEditorState, cb);
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
        const newContentState = Modifier.setBlockType(_contentState, _selectionState, blockType);
        const newEditorState = EditorState.push(editorState, newContentState);
        this.changeState(newEditorState, cb);
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
        this.changeState(AtomicBlockUtils, cb);
      }
    }
  });
}

// entity
export function entityDecorator(target) {
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
      const nextEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
      this.changeState(nextEditorState, cb);
      return entityKey;
    }
  });
}

// content style
export function contentStyleDecorator(target) {
  Object.assign(target.prototype, {
    toggleToolbar(style, type, cb = noop) {
      const { editorState } = this.state;
      switch (type) {
        case 'block':
          this.changeState(RichUtils.toggleBlockType(editorState, style), cb);
          break;
        case 'inline':
          if (this.isFocus) {
            // prevent onblur inline style apply
            this.changeState(RichUtils.toggleInlineStyle(editorState, style), cb);
          }
          break;
        default:
      }
    }
  });
}

export default composeDecorators(contentStateDecorator, entityDecorator, contentStyleDecorator);
