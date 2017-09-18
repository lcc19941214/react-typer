import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { RichUtils } from 'draft-js';
import ColorPicker from './colorPicker';
import AddImageButton from './addImageButton';
import { PLUGINS } from '../plugins/';

const { imagePlugin } = PLUGINS;

const noop = () => {};

const STYLE_TYPES = [
  {
    key: 'headline',
    controls: [
      { key: 'h1', type: 'block', label: 'H1', style: 'header-one' },
      { key: 'h2', type: 'block', label: 'H2', style: 'header-two' },
      { key: 'h3', type: 'block', label: 'H3', style: 'header-three' }
    ]
  },
  {
    key: 'fontStyle',
    controls: [
      { key: 'bold', type: 'inline', label: <b>B</b>, style: 'BOLD' },
      {
        key: 'italic',
        type: 'inline',
        label: <i style={{ fontFamily: 'serif' }}>I</i>,
        style: 'ITALIC'
      },
      { key: 'underline', type: 'inline', label: <u>U</u>, style: 'UNDERLINE' }
    ]
  },
  {
    key: 'list',
    controls: [
      { key: 'ul', type: 'block', label: 'UL', style: 'unordered-list-item' },
      { key: 'ol', type: 'block', label: 'OL', style: 'ordered-list-item' }
    ]
  },
  {
    key: 'action',
    controls: [
      // { key: 'color', component: ColorPicker },
      { key: 'image', type: 'action', component: AddImageButton }
    ]
  }
];

// common button for both inline and block style
const StyleButton = props => {
  const { type, active, style, label } = props;

  function onToggle(e) {
    e.preventDefault();

    let cb = noop;
    switch (type) {
      case 'block':
        cb = props.focus;
        break;
      default:
    }
    props.onToggle(style, type, cb);
  }

  return (
    <span
      className={classnames('RichEditor-toolbar-button', {
        'RichEditor-toolbar-button__active': active
      })}
      onMouseDown={onToggle}
    >
      {label}
    </span>
  );
};

// buttons grouped by style type
export default class Toolbar extends Component {
  static propTypes = {
    controls: PropTypes.array,
    editorState: PropTypes.object,
    onToggle: PropTypes.func
  };

  static defaultProps = {
    controls: ['headline', 'fontStyle', 'list', 'action']
  };

  toggleToolbar = (style, type, cb = noop) => {
    const { onChange, editorState } = this.props;
    switch (type) {
      case 'block':
        onChange(RichUtils.toggleBlockType(editorState, style), cb);
        break;
      case 'inline':
        onChange(RichUtils.toggleInlineStyle(editorState, style), cb);
        break;
      default:
    }
  };

  matchStyleControls = controls => STYLE_TYPES.filter(v => controls.includes(v.key));

  getCurrentStyles = editorState => {
    const selectionState = editorState.getSelection();
    const inlineStyles = this.props.editorState.getCurrentInlineStyle();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selectionState.getStartKey())
      .getType();
    return { inlineStyles, blockType };
  };

  getButtonActive = (style, type, { inlineStyles, blockType }) => {
    switch (type) {
      case 'block':
        return style === blockType;
      case 'inline':
        return inlineStyles.has(style);
      default:
    }
  };

  render() {
    const { controls, editorState, onChange, focus } = this.props;
    const groups = this.matchStyleControls(controls);
    const { inlineStyles, blockType } = this.getCurrentStyles(editorState);
    return (
      <div className="RichEditor-toolbar">
        {groups.map(group => (
          <div className="RichEditor-toolbar-group" key={group.key}>
            {group.controls.map(control => {
              switch (control.type) {
                case 'action':
                  const Elem = control.component;
                  return (
                    <Elem
                      key={control.key}
                      editorState={editorState}
                      onChange={onChange}
                      modifier={imagePlugin.addImage}
                      focus={focus}
                    />
                  );
                default:
                  return (
                    <StyleButton
                      key={control.key}
                      type={control.type}
                      label={control.label}
                      style={control.style}
                      active={this.getButtonActive(control.style, control.type, {
                        inlineStyles,
                        blockType
                      })}
                      onToggle={this.toggleToolbar}
                      focus={focus}
                    />
                  );
              }
            })}
          </div>
        ))}
      </div>
    );
  }
}
