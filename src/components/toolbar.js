import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import decorateComponentWithProps from 'decorate-component-with-props';
import Tooltip from './tooltip';
import ColorPicker from './colorPicker';
import FontSizeChanger from './fontSizeChanger';
import TextAlignment from './textAlignment';
import { UploadImageButton, AddImageLinkButton } from './addImageButton';

const noop = () => {};

const STYLE_TYPES = [
  {
    key: 'headline',
    controls: [
      { key: 'h1', type: 'block', style: 'header-one', tooltip: '一级标题' },
      { key: 'h2', type: 'block', style: 'header-two', tooltip: '二级标题' },
      { key: 'h3', type: 'block', style: 'header-three', tooltip: '三级标题' }
    ]
  },
  {
    key: 'fontStyle',
    controls: [
      { key: 'bold', type: 'inline', style: 'BOLD', tooltip: '粗体' },
      {
        key: 'italic',
        type: 'inline',
        style: 'ITALIC',
        tooltip: '斜体'
      },
      {
        key: 'underline',
        type: 'inline',
        style: 'UNDERLINE',
        tooltip: '下划线'
      }
    ]
  },
  {
    key: 'advancedFontStyle',
    controls: [
      { key: 'colorPicker', type: 'action', component: ColorPicker, tooltip: '字体颜色' },
      { key: 'fontSize', type: 'action', component: FontSizeChanger, tooltip: '字号' }
    ]
  },
  {
    key: 'list',
    controls: [
      {
        key: 'ul',
        type: 'block',
        style: 'unordered-list-item',
        tooltip: '无序列表'
      },
      {
        key: 'ol',
        type: 'block',
        style: 'ordered-list-item',
        tooltip: '有序列表'
      }
    ]
  },
  {
    key: 'image',
    controls: [
      { key: 'imageUpload', type: 'action', component: UploadImageButton, tooltip: '图片' },
      { key: 'imageLink', type: 'action', component: AddImageLinkButton, tooltip: '图片链接' }
    ]
  },
  {
    key: 'textAlign',
    controls: [
      {
        key: 'text-align-left',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'left' }),
        tooltip: '左对齐'
      },
      {
        key: 'text-align-center',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'center' }),
        tooltip: '居中对齐'
      },
      {
        key: 'text-align-right',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'right' }),
        tooltip: '右对齐'
      },
      {
        key: 'text-align-justify',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'justify' }),
        tooltip: '分散对齐'
      }
    ]
  }
];

// common button for both inline and block style
const StyleButton = ({
  controlKey,
  style,
  type,
  active,
  label,
  onToggle,
  focus,
  blur,
  getEditor,
  ...extraProps
}) => (
  <span
    className={classnames(
      'RichEditor-toolbar-button',
      `RichEditor-toolbar-button-${controlKey}`,
      {
        'RichEditor-toolbar-button__active': active
      }
    )}
    {...extraProps}
    onMouseDown={e => {
      e.preventDefault();
      onToggle(style, type, type === 'block' ? focus : noop);
    }}
  >
    {label || null}
  </span>
);

// buttons grouped by style type
export default class Toolbar extends Component {
  static propTypes = {
    controls: PropTypes.array,
    editorState: PropTypes.object,
    onToggle: PropTypes.func
  };

  static controls = [
    'headline',
    'fontStyle',
    'advancedFontStyle',
    'list',
    'textAlign',
    'image'
  ];

  matchStyleControls = controls => {
    const cts = STYLE_TYPES.filter(v => controls.includes(v.key));
    cts.sort((a, b) => controls.indexOf(a.key) - controls.indexOf(b.key));
    return cts;
  };

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
      getEditor,
      toggleToolbar,
      showTooltip,
      config = {}
    } = this.props;
    const groups = this.matchStyleControls(controls);
    const currentStyles = this.getCurrentStyles(editorState);
    return groups.length ? (
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
                      controlKey={control.key}
                      editorState={editorState}
                      changeState={changeState}
                      onToggle={toggleToolbar}
                      focus={focus}
                      blur={blur}
                      getEditor={getEditor}
                      {...config[control.key] || {}}
                    />
                  );
                  break;
                default:
                  content = (
                    <StyleButton
                      key={control.key}
                      controlKey={control.key}
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
                      getEditor={getEditor}
                    />
                  );
              }
              return showTooltip ? (
                <Tooltip placement="bottom" key={control.key} content={control.tooltip}>
                  {content}
                </Tooltip>
              ) : (
                content
              );
            })}
          </div>
        ))}
      </div>
    ) : null;
  }
}
