import React, { Component, PropTypes } from 'react';
import Draft from 'draft-js';
import PluginEditor from 'draft-js-plugins-editor';
import Toolbar from './components/toolbar.js';
import {
  publicTyperDecorator,
  textEditDecorator,
  entityEditDecorator,
  composeDecorators
} from './helper/decorators';
import exportToHTMLOptions from './helper/exportToHTML';
import makePlugins, { AlignmentTool } from './plugins/';
import defaultDecorator from './editorUtils/decoratorsEnhance';
import { defaultBlockRenderMap } from './editorUtils/blockEnhance';
import { defaultInlineStyleMap } from './editorUtils/inlineEnhance';

import 'draft-js/dist/Draft.css';
import 'draft-js-alignment-plugin/lib/plugin.css';
import './style/typer.less';

const noop = () => {};
const equalization = val => val;

const {
  Editor: OriginalEditor,
  EditorState,
  ContentState,
  convertToRaw,
  RichUtils
} = Draft;

const Editor = PluginEditor;
// const Editor = OriginalEditor;

const { plugins: defaultPlugins } = makePlugins();

const composedDecorators = composeDecorators(textEditDecorator, entityEditDecorator);

/**
 * For more information, see https://github.com/facebook/draft-js/blob/1ea57ab0b1a7e70f8f6211f96958e3bb74f2663a/docs/APIReference-Editor.md
 * @prop {JSON object}  content - (optional)
 *    content must be a stringified ContentState instance
 * @prop {object}       editorConfig - (optional)
 *    config options:
 *      spellCheck: boolean
 * @prop {string}       placeholder - (optional)
 *    placeholder of editor
 * @prop {array}        decorators - (optional)
 *    decorators are different from Draft decorator, it's a wrapped
 *    prop for draft-js plugin Editor
 *    Draft decorator only affects inline elements
 * @prop {object}       blockRenderMap - (optional)
 *    override default ones and support HTML content pasted from clipboard
 *    every blockRender item require element and wrapper property
 * @prop {func}         blockRendererFn - (optional)
 *    override block-element by given type, return an object with component, 
 *    editable, props and so
 * @prop {func}         blockStyleFn - (optional)
 *    override block-element style by given type, return a custom class name
 * @prop {object}       inlineStyleMap - (optional)
 *    override inline style by given type, return an object with key as style
 *    type and css properties as value
 */
// @textEditDecorator
class Typer extends Component {
  static propTypes = {
    content: PropTypes.string,
    editorConfig: PropTypes.object,
    placeholder: PropTypes.string,
    decorators: PropTypes.array,
    blockRenderMap: PropTypes.object,
    blockRendererFn: PropTypes.func,
    blockStyleFn: PropTypes.func,
    inlineStyleMap: PropTypes.object,
    plugins: PropTypes.array
  };

  static defaultProps = {
    content: '',
    editorConfig: {},
    placeholder: '请输入...',
    decorators: [],
    blockRenderMap: {},
    blockRendererFn: noop,
    blockStyleFn: noop,
    inlineStyleMap: {},
    plugins: []
  };

  Typer = null;
  extendedDefaultProps = {};

  constructor(...args) {
    super(...args);
    this.state = {
      editorState: EditorState.createWithContent(ContentState.createFromText(''))
    };

    composedDecorators(Typer);
    this.fillText = this.fillText.bind(this);
    this.modifyText = this.modifyText.bind(this);
    this.insertText = this.insertText.bind(this);
    this.replaceText = this.replaceText.bind(this);
    this.setBlock = this.setBlock.bind(this);
    this.addEntity = this.addEntity.bind(this);
  }

  componentWillMount() {
    this.extendedDefaultProps = this.extendDefaultProps(this.props);
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.content !== this.props.content) {
  //     const contentState = Typer.convertFromJSON(nextProps.content);
  //     this.fill(contentState);
  //   }
  // }

  onEditorChange = (editorState, enhancedEditor) => {
    this.onChange(editorState);
  };
  onChange = (editorState, cb = noop) => this.setState({ editorState }, cb);
  focus = () => this.Editor.focus();
  blur = () => this.Editor.blur();

  hidePlaceholder = (editorState, className = '') => {
    let cls = className;
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        cls += ' RichEditor-hidePlaceholder';
      }
    }
    return cls;
  };

  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  };

  getContent = (type = '', options) => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    let content = null;
    switch (type.toLowerCase()) {
      case 'json':
        content = Typer.convertToJSON(contentState, options);
        break;
      case 'html':
        content = Typer.convertToHTML(contentState, options);
        break;
      default:
        content = convertToRaw(contentState);
    }
    console.log(content);
    return content;
  };

  extendBlockRendererFn = blockRendererFn => {
    return contentBlock => {
      const type = contentBlock.getType();
      switch (type) {
        default:
          const { blockRendererFn } = this.props;
          return blockRendererFn(contentBlock);
      }
    };
  };

  extendDefaultProps = props => {
    const { decorators, plugins, blockRenderMap, blockStyleFn, inlineStyleMap } = props;
    return {
      decorators: Typer.extendDecorators(decorators, defaultDecorator),
      plugins: Typer.extendPlugins(plugins, defaultPlugins),
      blockRenderMap: Typer.extendBlockRenderMap(blockRenderMap, defaultBlockRenderMap),
      customStyleMap: Typer.extendInlineStyleMap(inlineStyleMap, defaultInlineStyleMap)
    };
  };

  addLabel = (val, cb) => {
    if (val) {
      const highlight = val.length > 5;
      const entityKey = this.addEntity(
        {
          type: 'labelBlock',
          mutability: 'IMMUTABLE',
          data: {
            label: val,
            highlight
          }
        },
        cb
      );

      this.insertText(val, [], entityKey, this.focus);
    }
  };

  render() {
    const { editorConfig, placeholder, blockStyleFn, blockRendererFn } = this.props;
    const { editorState } = this.state;
    const EditorClassName = this.hidePlaceholder(editorState, 'RichEditor-editor');
    const extendedBlockRendererFn = this.extendBlockRendererFn(blockRendererFn);

    return (
      <div>
        <div className="RichEditor-root">
          <Toolbar
            editorState={editorState}
            onChange={this.onChange}
            focus={this.focus}
          />
          <div className={EditorClassName} onClick={this.focus}>
            <Editor
              editorState={editorState}
              ref={ref => (this.Editor = ref)}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onEditorChange}
              placeholder={placeholder}
              blockRendererFn={extendedBlockRendererFn}
              blockStyleFn={blockStyleFn}
              {...this.extendedDefaultProps}
              {...editorConfig}
            />
            <AlignmentTool />
          </div>
        </div>
        <button onClick={this.getContent.bind(this, '')}>log state</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.getContent.bind(this, 'json')}>log JSON state</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.getContent.bind(this, 'html', exportToHTMLOptions)}>
          getHTML
        </button>
        <br />
        <br />
        <input type="text" id="input-add-label" />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          onClick={() => {
            const input = document.querySelector('#input-add-label');
            const val = input.value;
            this.addLabel(val, () => {
              input.value = '';
            });

            setTimeout(() => {
              this.insertText(' ');
            }, 10);
          }}
        >
          addLabel
        </button>
        <br />
        <br />
        <input type="text" id="input-insert-text" />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          onClick={() => {
            const input = document.querySelector('#input-insert-text');
            const val = input.value;
            this.insertText(val, undefined, undefined, this.focus);
          }}
        >
          insertText
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          onClick={() => {
            this.setBlock(
              {
                blockType: 'header-one'
              },
              this.focus
            );
          }}
        >
          insertType
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
      </div>
    );
  }
}

publicTyperDecorator(Typer);

export default Typer;

// function blockStyleFn(block) {
//   switch (block.getType()) {
//     case 'blockquote':
//       return 'style-block-blockquote';
//     default:
//       return null;
//   }
// }
