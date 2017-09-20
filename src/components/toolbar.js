import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { RichUtils } from 'draft-js';
import ColorPicker from './colorPicker';
import { UploadImageButton, AddImageLinkButton } from './addImageButton';

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
      { key: 'underline', type: 'inline', label: <u>U</u>, style: 'UNDERLINE' },
      { key: 'color', type: 'action', component: ColorPicker }
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
      { key: 'imageUpload', type: 'action', component: UploadImageButton },
      { key: 'imageLink', type: 'action', component: AddImageLinkButton },
    ]
  }
];

// common button for both inline and block style
const StyleButton = ({ style, type, active, label, onToggle, focus }) => (
  <span
    className={classnames('RichEditor-toolbar-button', {
      'RichEditor-toolbar-button__active': active
    })}
    onMouseDown={e => {
      e.preventDefault();
      onToggle(style, type, type === 'block' ? focus : noop);
    }}
  >
    {label}
  </span>
);

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
    const { controls, editorState, onChange, focus, blur, toggleToolbar } = this.props;
    const groups = this.matchStyleControls(controls);
    const currentStyles = this.getCurrentStyles(editorState);
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
                      onToggle={toggleToolbar}
                      focus={focus}
                      blur={blur}
                    />
                  );
                default:
                  return (
                    <StyleButton
                      key={control.key}
                      type={control.type}
                      label={control.label}
                      style={control.style}
                      active={this.getButtonActive(
                        control.style,
                        control.type,
                        currentStyles
                      )}
                      onToggle={toggleToolbar}
                      focus={focus}
                      blur={blur}
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
