import React, { Component, PropTypes } from 'react';
import { EditorState, Modifier, RichUtils } from 'draft-js';
import classnames from 'classnames';
import Popover from './popover';
import {
  FONT_SIZES as INLINE_FONT_SIZE,
  DEFAULT_FONT_SIZE_KEY
} from '../editorUtils/inlineStyles';

const noop = () => {};

const FONT_SIZE_LABEL = {
  'INLINE-FONT-SIZE-SMALL': '小',
  'INLINE-FONT-SIZE-MEDIUM': '中',
  'INLINE-FONT-SIZE-LARGE': '大',
  'INLINE-FONT-SIZE-SUPER': '超大'
};

const FONT_SIZE_MAP = Object.keys(INLINE_FONT_SIZE).map(v => ({
  key: v,
  label: FONT_SIZE_LABEL[v],
  style: v
}));

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

  onTogglePopover = e => {
    e.preventDefault();
    this.setState(({ active }) => ({ active: !active }));
    this.Popover.open();
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

      let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'reset-inline-size'
      );

      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);

      changeState(nextEditorState, () => {
        this.setState({ fontSize: style });
        this.Popover.close();
        focus();
      });
    }
  };

  render() {
    const { editorState, controlKey } = this.props;
    const { active, fontSize } = this.state;
    const currentStyle = editorState.getCurrentInlineStyle();
    return (
      <div className="RichEditor-toolbar__font-size-changer RichEditor-toolbar-button__wrapped">
        <span
          className={classnames(
            'RichEditor-toolbar-button',
            `RichEditor-toolbar-button-${controlKey}`,
            {
              'RichEditor-toolbar-button__active': active
            }
          )}
          onMouseDown={this.onTogglePopover}
        />
        <Popover
          className="RichEditor-toolbar__font-size-changer__popover"
          ref={ref => (this.Popover = ref)}
          placement="bottom"
          onOpen={this.handleOnOpen}
          onClose={this.handleOnClose}
        >
          {FONT_SIZE_MAP.map(v => (
            <span
              key={v.key}
              className={classnames('font-size-changer__item', {
                'font-size-changer__item__active': fontSize === v.style
              })}
              style={INLINE_FONT_SIZE[v.style]}
              onMouseDown={this.handleApplyFontSize.bind(this, v.style)}
            >
              {v.label}
            </span>
          ))}
        </Popover>
      </div>
    );
  }
}
