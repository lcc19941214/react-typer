import React, { Component, PropTypes } from 'react';
import { EditorState, Modifier, RichUtils } from 'draft-js';
import classnames from 'classnames';
import Popover from './popover';
import { COLORS as INLINE_COLORS, DEFAULT_COLOR_KEY } from '../editorUtils/inlineStyles';

const noop = () => {};

const BLOCK_COLORS = {};
Object.keys(INLINE_COLORS).forEach(v => {
  BLOCK_COLORS[v] = { backgroundColor: INLINE_COLORS[v].color };
});

const COLORS_MAP = Object.keys(INLINE_COLORS).map(v => ({
  key: v,
  label: v,
  style: v
}));

const COLORS_STYLE = COLORS_MAP.map(v => v.style);

/**
 * REMIND
 *    it's unable to set initial inline style for editor state
 *    when editor gets blur and selection is collapsed, inline style may get lost.
 *    must use onMouseDown and preventDefault to keep editor always on focus
 */

export default class ColorPicker extends Component {
  static propTypes = {
    onToggle: PropTypes.func,
    changeState: PropTypes.func
  };

  state = {
    color: DEFAULT_COLOR_KEY,
    active: false
  };

  handleOnOpen = () => {
    this.setState(({ active }) => ({ active: true }));
  };

  handleOnClose = () => {
    this.setState(({ active }) => ({ active: false }));
  };

  handleApplyColor = (style, e) => {
    e.preventDefault();
    const { editorState, changeState, onToggle, focus } = this.props;

    const selection = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();

    if (selection.isCollapsed()) {
      // REMIND
      // manually call setInlineStyleOverride to keep other inline styles
      const nextCurrentStyle = COLORS_MAP.map(v => v.style).reduce(
        (currentStyle, color) => currentStyle.delete(color),
        currentStyle
      );
      const nextEditorState = EditorState.setInlineStyleOverride(
        editorState,
        nextCurrentStyle.add(style)
      );
      changeState(nextEditorState, () => {
        this.setState({ color: style });
        this.Popover.close();
      });
    } else {
      // turn off all active colors but apply only one color
      const nextContentState = COLORS_MAP.map(v => v.style).reduce(
        (contentState, color) =>
          Modifier.removeInlineStyle(contentState, selection, color),
        editorState.getCurrentContent()
      );

      let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'reset-inline-color'
      );

      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);

      changeState(nextEditorState, () => {
        this.setState({ color: style });
        this.Popover.close();
        focus();
      });
    }
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
    const { active, color } = this.state;
    const currentStyle = editorState.getCurrentInlineStyle();
    const indicatorStyle = currentStyle.has(color) ? color : DEFAULT_COLOR_KEY;
    return (
      <Popover
        className="RichEditor-toolbar__color-picker__popover"
        ref={ref => (this.Popover = ref)}
        placement="bottom"
        onOpen={this.handleOnOpen}
        onClose={this.handleOnClose}
        overlay={COLORS_MAP.map(v => (
          <span
            key={v.key}
            className={classnames('color-picker__item', {
              'color-picker__item__active': indicatorStyle === v.style
            })}
            style={BLOCK_COLORS[v.style]}
            onMouseDown={this.handleApplyColor.bind(this, v.style)}
          />
        ))}
      >
        <div
          className="RichEditor-toolbar__color-picker RichEditor-toolbar-button__wrapped"
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
          >
            <div
              className="color-picker_indicator"
              style={BLOCK_COLORS[indicatorStyle]}
            />
          </span>
        </div>
      </Popover>
    );
  }
}
