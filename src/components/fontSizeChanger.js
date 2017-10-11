import React, { Component, PropTypes } from 'react';
import { EditorState, Modifier, RichUtils } from 'draft-js';
import classnames from 'classnames';
import Popover from './popover';
import { FONT_SIZES as INLINE_FONT_SIZE, DEFAULT_FONT_SIZE_KEY } from '../utils/inlineStyles';

const noop = () => {};

const FONT_SIZE_LABEL = {
  INLINE_FONT_SIZE_SMALL: '小',
  INLINE_FONT_SIZE_MEDIUM: '中',
  INLINE_FONT_SIZE_LARGE: '大',
  INLINE_FONT_SIZE_SUPER: '超大'
};

const FONT_SIZE_MAP = Object.keys(INLINE_FONT_SIZE).map(v => ({
  key: v,
  label: FONT_SIZE_LABEL[v],
  style: v
}));

const FONT_SIZE_STYLE = FONT_SIZE_MAP.map(v => v.style);

/**
 * REMIND
 *    it's unable to set initial inline style for editor state
 *    when editor gets blur and selection is collapsed, inline style may get lost.
 *    must use onMouseDown and preventDefault to keep editor always on focus
 */

export default class FontSizeChanger extends Component {
  static propTypes = {
    onToggle: PropTypes.func,
    changeState: PropTypes.func
  };

  state = {
    fontSize: DEFAULT_FONT_SIZE_KEY,
    active: false
  };

  handleOnOpen = () => {
    this.setState(({ active }) => ({ active: true }));
  };

  handleOnClose = () => {
    this.setState(({ active }) => ({ active: false }));
  };

  handleApplyFontSize = (style, e) => {
    e.preventDefault();
    const { editorState, changeState, onToggle, focus } = this.props;

    const selection = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();

    if (selection.isCollapsed()) {
      // REMIND
      // manually call setInlineStyleOverride to keep other inline styles
      const nextCurrentStyle = FONT_SIZE_MAP.map(v => v.style).reduce(
        (currentStyle, size) => currentStyle.delete(size),
        currentStyle
      );
      const nextEditorState = EditorState.setInlineStyleOverride(
        editorState,
        nextCurrentStyle.add(style)
      );
      changeState(nextEditorState, () => {
        this.setState({ fontSize: style });
        this.Popover.close();
      });
    } else {
      // turn off all active size but apply only one size
      const nextContentState = FONT_SIZE_MAP.map(v => v.style).reduce(
        (contentState, size) => Modifier.removeInlineStyle(contentState, selection, size),
        editorState.getCurrentContent()
      );

      let nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style');

      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);

      changeState(nextEditorState, () => {
        this.setState({ fontSize: style });
        this.Popover.close();
        focus();
      });
    }
  };

  getActiveFontSize = (fontSize, currentStyle) => {
    let style = DEFAULT_FONT_SIZE_KEY;
    if (currentStyle.has(fontSize)) {
      style = fontSize;
    } else {
      const currentStyleToJS = currentStyle.toJS();
      const current = currentStyleToJS.find(x => FONT_SIZE_STYLE.some(y => x === y));
      if (current) {
        style = current;
        setTimeout(() => {
          this.setState({ fontSize: current });
        }, 10);
      }
    }
    return style;
  };

  render() {
    const {
      editorState,
      changeState,
      controlKey,
      onToggle,
      focus,
      blur,
      getEditor,
      ...extraProps
    } = this.props;
    const { active, fontSize } = this.state;
    const currentStyle = editorState.getCurrentInlineStyle();
    const activeFontSize = this.getActiveFontSize(fontSize, currentStyle);
    return (
      <Popover
        className="RichEditor-toolbar__font-size-changer__popover"
        ref={ref => (this.Popover = ref)}
        placement="bottom"
        onOpen={this.handleOnOpen}
        onClose={this.handleOnClose}
        overlay={FONT_SIZE_MAP.map(v => (
          <span
            key={v.key}
            className={classnames('font-size-changer__item', {
              'font-size-changer__item__active': activeFontSize === v.style
            })}
            style={INLINE_FONT_SIZE[v.style]}
            onMouseDown={this.handleApplyFontSize.bind(this, v.style)}
          >
            {v.label}
          </span>
        ))}
      >
        <div
          className="RichEditor-toolbar__font-size-changer RichEditor-toolbar-button__wrapped"
          {...extraProps}
        >
          <span
            className={classnames(
              'RichEditor-toolbar-button',
              `RichEditor-toolbar-button-${controlKey}`,
              {
                'RichEditor-toolbar-button__active': active
              }
            )}
            onMouseDown={e => e.preventDefault()}
          />
        </div>
      </Popover>
    );
  }
}
