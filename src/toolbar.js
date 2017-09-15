import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import ColorPicker from './toolbarControls/colorPicker';
// import AddImage from './toolbarControls/addImage';

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
      // { key: 'image', type: 'action', component: AddImage }
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
    controls: ['headline', 'fontStyle', 'list']
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

  getActive = (style, type, { inlineStyles, blockType }) => {
    switch (type) {
      case 'block':
        return style === blockType;
      case 'inline':
        return inlineStyles.has(style);
      default:
    }
  };

  //   <AddImage
  //   editorState={editorState}
  //   onChange={this.onChange}
  //   modifier={imagePlugin.addImage}
  // />

  render() {
    const { controls, editorState, onToggle, focus } = this.props;
    const groups = this.matchStyleControls(controls);
    const { inlineStyles, blockType } = this.getCurrentStyles(editorState);
    return (
      <div className="RichEditor-toolbar">
        {groups.map(group => (
          <div className="RichEditor-toolbar-group" key={group.key}>
            {group.controls.map(control => {
              switch (control.type) {
                case 'action':
                  switch (control.key) {
                    case 'image':
                      break;
                    default:
                  }
                  break;
                default:
                  return (
                    <StyleButton
                      key={control.key}
                      type={control.type}
                      label={control.label}
                      style={control.style}
                      active={this.getActive(control.style, control.type, {
                        inlineStyles,
                        blockType
                      })}
                      onToggle={onToggle}
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
