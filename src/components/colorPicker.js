import React, { Component, PropTypes } from 'react';
import { EditorState, Modifier, RichUtils } from 'draft-js';
import classnames from 'classnames';
import Popover from './popover';
import { COLORS as INLINE_COLORS } from '../editorUtils/inlineEnhance';

const noop = () => {};

const BLOCK_COLORS = {};
Object.keys(INLINE_COLORS).forEach(v => {
  BLOCK_COLORS[v] = { backgroundColor: INLINE_COLORS[v].color };
});

const COLORS_MAP = [
  { key: 'Black', label: 'black', style: 'INLINE-COLOR-BLACK' },
  { key: 'White', label: 'white', style: 'INLINE-COLOR-WHITE' },
  { key: 'Red', label: 'red', style: 'INLINE-COLOR-RED' },
  { key: 'Orange', label: 'orange', style: 'INLINE-COLOR-ORANGE' },
  { key: 'Yellow', label: 'yellow', style: 'INLINE-COLOR-YELLOW' },
  { key: 'Green', label: 'green', style: 'INLINE-COLOR-GREEN' },
  { key: 'Blue', label: 'blue', style: 'INLINE-COLOR-BLUE' },
  { key: 'Indigo', label: 'indigo', style: 'INLINE-COLOR-INDIGO' },
  { key: 'Violet', label: 'violet', style: 'INLINE-COLOR-VIOLET' }
];
const COLORS_STYLE = COLORS_MAP.map(v => v.style);

/**
 * REMIND
 *    unable to set initial inline style for editor state
 *    when editor gets blur and selection is collapsed, inline style may get lost.
 */

export default class ColorPicker extends Component {
  static propTypes = {
    onToggle: PropTypes.func,
    onChange: PropTypes.func
  };

  state = {
    color: 'INLINE-COLOR-BLACK',
    active: false
  };

  onTogglePopover = e => {
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
        // TODO
        // set next character color
        return;
        const nextCurrentStyle = COLORS_MAP.map(v => v.style).reduce(
          (currentStyle, color) => currentStyle.delete(color),
          currentStyle
        );
        const nextEditorState = EditorState.setInlineStyleOverride(
          editorState,
          nextCurrentStyle.add(style)
        );
        focus();
        setTimeout(() => {
          onChange(nextEditorState, () => this.setState({ color: style }));
        }, 50);
      }

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
  };

  render() {
    const { editorState } = this.props;
    const { active, color } = this.state;
    const currentStyle = editorState.getCurrentInlineStyle().toJS();
    const indicatorStyle =
      currentStyle.find(style => COLORS_STYLE.some(v => v === style)) ||
      'INLINE-COLOR-BLACK';
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
          onClick={this.onTogglePopover}
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
                'color-picker__item__active': color === v.style
              })}
              style={BLOCK_COLORS[v.style]}
              onClick={this.handleApplyColor.bind(this, v.style)}
            />
          ))}
        </Popover>
      </div>
    );
  }
}
