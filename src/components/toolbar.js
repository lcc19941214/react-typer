import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Tooltip from './tooltip';
import util from '../utils/util';
import ToolbarButtons from '../constants/toolbar';

const shortcuts = require('../constants/shortcuts.json')[util.getOS()] || {};

const noop = () => {};

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
    className={classnames('RichEditor-button', `RichEditor-button-${controlKey}`, {
      'RichEditor-button__active': active
    })}
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

  static controls = ['headline', 'fontStyle', 'advancedFontStyle', 'list', 'textAlign', 'insert'];

  matchStyleControls = controls => {
    const cts = ToolbarButtons.filter(v => controls.includes(v.key));
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
                      active={this.getButtonActive(control.style, control.type, currentStyles)}
                      onToggle={toggleToolbar}
                      focus={focus}
                      blur={blur}
                      getEditor={getEditor}
                    />
                  );
              }
              const shortcut = shortcuts[control.key] && shortcuts[control.key].tips;
              const tips = shortcut ? ` (${shortcut})` : '';
              return showTooltip ? (
                <Tooltip
                  placement="bottom"
                  key={control.key}
                  content={`${control.tooltip}${tips}`}
                >
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
