import React, { Component, PropTypes } from 'react';
import Draft from 'draft-js';
import PluginEditor from 'draft-js-plugins-editor';
import classnames from 'classnames';
import Toolbar from './components/toolbar';
import {
  publicTyperDecorator,
  textEditDecorator,
  entityEditDecorator,
  editorToolbarDecorator,
  composeDecorators
} from './helper/decorators';
import { exportToHTMLOptions } from './helper/exportToHTML';
import { AlignmentTool } from './plugins/';
import {
  addImage,
  updateImage,
  uploadImage,
  pasteAndUploadImage
} from './editorUtils/imageUtil';

import 'draft-js/dist/Draft.css';
import 'draft-js-alignment-plugin/lib/plugin.css';
import './style/typer.less';

const noop = () => {};
const equalization = val => val;

const { EditorState, ContentState, convertToRaw, RichUtils } = Draft;

const Editor = PluginEditor;

const composedDecorators = composeDecorators(
  textEditDecorator,
  entityEditDecorator,
  editorToolbarDecorator
);

/**
 * For more information, see https://github.com/facebook/draft-js/blob/master/docs/APIReference-Editor.md
 * @prop {JSON object}  content - (optional)
 *    content must be a stringified ContentState instance
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
 * @prop {func}         [eventHandler]: onFocus, onBlur, onPaste
 * @prop {string}       imageUploadAction - required
 *    action for upload request url
 */
// @textEditDecorator
class Typer extends Component {
  static propTypes = {
    content: PropTypes.string,
    placeholder: PropTypes.string,
    controls: PropTypes.array,
    showTooltip: PropTypes.bool,
    decorators: PropTypes.array,
    blockRenderMap: PropTypes.object,
    blockRendererFn: PropTypes.func,
    blockStyleFn: PropTypes.func,
    inlineStyleMap: PropTypes.object,
    plugins: PropTypes.array,
    onChange: PropTypes.func,
    onUpload: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onPaste: PropTypes.func,
    autoFocus: PropTypes.bool,
    behavior: PropTypes.object,
    className: PropTypes.string,
    imageUploadAction: PropTypes.string.isRequired
  };

  static defaultProps = {
    content: '',
    placeholder: '请输入...',
    controls: Toolbar.controls,
    showTooltip: true,
    decorators: [],
    blockRenderMap: {},
    blockRendererFn: noop,
    blockStyleFn: noop,
    inlineStyleMap: {},
    plugins: [],
    onChange: noop,
    onUpload: noop,
    onFocus: noop,
    onBlur: noop,
    onPaste: noop,
    autoFocus: false,
    behavior: {
      readOnly: false,
      spellCheck: false
    },
    className: '',
    imageUploadAction: 'http://localhost:3000'
  };

  Typer = null;
  isFocus = false;

  constructor(...args) {
    super(...args);
    this.state = {
      editorState: EditorState.createWithContent(ContentState.createFromText(''))
    };

    composedDecorators(Typer);
    this.fillContentState = this.fillContentState.bind(this);
    this.modifyText = this.modifyText.bind(this);
    this.insertText = this.insertText.bind(this);
    this.replaceText = this.replaceText.bind(this);
    this.setBlock = this.setBlock.bind(this);
    this.addEntity = this.addEntity.bind(this);
    this.toggleToolbar = this.toggleToolbar.bind(this);
  }

  componentDidMount() {
    // REMIND
    // editor takes some time to apply plugins and decorators
    if (this.props.autoFocus) {
      setTimeout(() => {
        this.focus();
      }, 100);
    }

    document.addEventListener('paste', this.handleOnPaste, false);
  }

  componentWillUnmount() {
    document.removeEventListener('paste', this.handleOnPaste, false);
  }

  changeState = (editorState, cb = noop) => this.setState({ editorState }, cb);
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
      this.changeState(newState);
      return true;
    }
    return false;
  };

  handleOnChange = (editorState, enhancedEditor) => {
    this.changeState(editorState, this.props.onChange);
  };
  handleOnFocus = e => {
    this.isFocus = true;
    this.props.onFocus(e);
  };
  handleOnBlur = e => {
    this.isFocus = false;
    this.props.onBlur(e);
  };
  handleOnPaste = e => {
    if (this.isFocus) {
      pasteAndUploadImage(e, this.handleOnPasteAndUploadImage);
      this.props.onPaste(e);
    }
  };
  handleOnPasteAndUploadImage = (file, url) => {
    const nextEditorState = addImage(this.state.editorState, url, {
      uploading: true,
      progress: 0
    });
    this.changeState(nextEditorState, () => {
      const config = {
        onUploadProgress: event => {
          const progress = Math.round(event.loaded / event.total * 100);
          if (progress !== 100) {
            this.changeState(updateImage(this.state.editorState, { progress }, url));
          }
        }
      };
      uploadImage(this.props.imageUploadAction, file, config).then(res => {
        const extraMergeData = this.props.onUpload(res) || {};
        const toMergeData = {
          src: res.url,
          uploading: false,
          progress: 100,
          ...extraMergeData
        };

        this.blur();
        const newEditorState = updateImage(this.state.editorState, toMergeData, url);
        this.changeState(newEditorState, () => {
          this.focus();

          // release url
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        });
      });
    });
  };

  exportState = (type = '') => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    let content = null;
    switch (type.toLowerCase()) {
      case 'json':
        content = Typer.convertToJSON(contentState);
        break;
      case 'html':
        content = Typer.convertToHTML(contentState, exportToHTMLOptions);
        break;
      default:
        content = convertToRaw(contentState);
    }
    console.log(content);
    return content;
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
    const { placeholder, behavior, className, controls, showTooltip } = this.props;
    const { editorState } = this.state;
    const EditorClassName = this.hidePlaceholder(editorState, 'RichEditor-editor');
    const eventHandler = {
      onFocus: this.handleOnFocus,
      onBlur: this.handleOnBlur,
      onChange: this.handleOnChange
    };

    // const html = this.exportState('html');

    return (
      <div>
        <div className={classnames('RichEditor-root', className)}>
          <Toolbar
            controls={controls}
            showTooltip={showTooltip}
            editorState={editorState}
            changeState={this.changeState}
            focus={this.focus}
            blur={this.blur}
            toggleToolbar={this.toggleToolbar}
            config={{
              imageUpload: {
                action: this.props.imageUploadAction,
                onUpload: this.props.onUpload
              }
            }}
          />
          <div className={EditorClassName} onClick={this.focus}>
            <Editor
              editorState={editorState}
              ref={ref => (this.Editor = ref)}
              handleKeyCommand={this.handleKeyCommand}
              placeholder={placeholder}
              {...behavior}
              {...eventHandler}
              {...Typer.extendDefaultProps(this.props)}
            />
            {/* <AlignmentTool /> */}
          </div>
        </div>
        <div
          className="action-form"
          style={{
            maxWidth: '700px',
            minWidth: '600px',
            margin: '20px auto'
          }}
        >
          <button onClick={this.exportState.bind(this, '')}>log state</button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={this.exportState.bind(this, 'json')}>log JSON state</button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={this.exportState.bind(this, 'html')}>getHTML</button>
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
        </div>
        <div
          className="html-previewer"
          style={{
            maxWidth: '680px',
            minWidth: '580px',
            margin: '40px auto',
            padding: '10px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        >
          {/* <div dangerouslySetInnerHTML={{ __html: html }} /> */}
        </div>
      </div>
    );
  }
}

publicTyperDecorator(Typer);

export default Typer;
