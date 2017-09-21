import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { RichUtils } from 'draft-js';
import Tooltip from './tooltip';
import ColorPicker from './colorPicker';
import FontSizeChanger from './fontSizeChanger';
import { UploadImageButton, AddImageLinkButton } from './addImageButton';

const noop = () => {};

const STYLE_TYPES = [
  {
    key: 'headline',
    controls: [
      { key: 'h1', type: 'block', label: 'H1', style: 'header-one', tooltip: '一级标题' },
      { key: 'h2', type: 'block', label: 'H2', style: 'header-two', tooltip: '二级标题' },
      { key: 'h3', type: 'block', label: 'H3', style: 'header-three', tooltip: '三级标题' }
    ]
  },
  {
    key: 'fontStyle',
    controls: [
      { key: 'bold', type: 'inline', label: <b>B</b>, style: 'BOLD', tooltip: '粗体' },
      {
        key: 'italic',
        type: 'inline',
        label: <i style={{ fontFamily: 'serif' }}>I</i>,
        style: 'ITALIC',
        tooltip: '斜体'
      },
      {
        key: 'underline',
        type: 'inline',
        label: <u>U</u>,
        style: 'UNDERLINE',
        tooltip: '下划线'
      }
    ]
  },
  {
    key: 'advancedFontStyle',
    controls: [
      { key: 'color', type: 'action', component: ColorPicker, tooltip: '字体颜色' },
      { key: 'fontSize', type: 'action', component: FontSizeChanger, tooltip: '字号' }
    ]
  },
  {
    key: 'list',
    controls: [
      {
        key: 'ul',
        type: 'block',
        label: 'UL',
        style: 'unordered-list-item',
        tooltip: '无序列表'
      },
      {
        key: 'ol',
        type: 'block',
        label: 'OL',
        style: 'ordered-list-item',
        tooltip: '有序列表'
      }
    ]
  },
  {
    key: 'action',
    controls: [
      { key: 'imageUpload', type: 'action', component: UploadImageButton, tooltip: '图片' },
      { key: 'imageLink', type: 'action', component: AddImageLinkButton, tooltip: '图片链接' }
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
    controls: ['headline', 'fontStyle', 'advancedFontStyle', 'list', 'action']
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
    const {
      controls,
      editorState,
      changeState,
      focus,
      blur,
      toggleToolbar,
      showTooltip,
      config = {}
    } = this.props;
    const groups = this.matchStyleControls(controls);
    const currentStyles = this.getCurrentStyles(editorState);
    return (
      <div className="RichEditor-toolbar">
        {groups.map(group => (
          <div className="RichEditor-toolbar-group" key={group.key}>
            {group.controls.map(control => {
              let content;
              switch (control.type) {
                case 'action':
                  const Elem = control.component;
                  content = (
                    <Elem
                      key={control.key}
                      editorState={editorState}
                      changeState={changeState}
                      onToggle={toggleToolbar}
                      focus={focus}
                      blur={blur}
                      {...config[control.key] || {}}
                    />
                  );
                  break;
                default:
                  content = (
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
              return showTooltip ? (
                <Tooltip placement="bottom" key={control.key} placement="bottom" content={control.tooltip}>
                  {content}
                </Tooltip>
              ) : (
                content
              );
            })}
          </div>
        ))}
      </div>
    );
  }
}
