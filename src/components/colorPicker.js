import React, { Component, PropTypes } from 'react';
import { EditorState, Modifier, RichUtils } from 'draft-js';
import classnames from 'classnames';
import Popover from './popover';
import { COLORS as INLINE_COLORS, DEFAULT_COLOR_KEY } from '../editorUtils/inlineEnhance';

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
    onChange: PropTypes.func
  };

  state = {
    color: DEFAULT_COLOR_KEY,
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

  handleApplyColor = (style, e) => {
    e.preventDefault();
    const { editorState, onChange, onToggle, focus } = this.props;

    if (style !== this.state.color) {
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
        onChange(nextEditorState, () => {
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

        onChange(nextEditorState, () => {
          this.setState({ color: style });
          this.Popover.close();
          focus();
        });
      }
    } else {
      this.Popover.close();
    }
  };

  render() {
    const { editorState } = this.props;
    const { active, color } = this.state;
    const currentStyle = editorState.getCurrentInlineStyle();
    const indicatorStyle = currentStyle.has(color) ? color : DEFAULT_COLOR_KEY;
    return (
      <div className="RichEditor-toolbar__color-picker RichEditor-toolbar-button__wrapped">
        <span
          className={classnames(
            'RichEditor-toolbar-button',
            'RichEditor-toolbar__color-picker__button',
            {
              'RichEditor-toolbar-button__active': active
            }
          )}
          onMouseDown={this.onTogglePopover}
        >
          <i>A</i>
          <div className="color-picker_indicator" style={BLOCK_COLORS[indicatorStyle]} />
        </span>
        <Popover
          className="RichEditor-toolbar__color-picker__popover"
          ref={ref => (this.Popover = ref)}
          placement="bottom"
          onOpen={this.handleOnOpen}
          onClose={this.handleOnClose}
        >
          {COLORS_MAP.map(v => (
            <span
              key={v.key}
              className={classnames('color-picker__item', {
                'color-picker__item__active': indicatorStyle === v.style
              })}
              style={BLOCK_COLORS[v.style]}
              onMouseDown={this.handleApplyColor.bind(this, v.style)}
            />
          ))}
        </Popover>
      </div>
    );
  }
}
