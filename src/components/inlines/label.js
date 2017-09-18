import React, { Component } from 'react';
import classnames from 'classnames';

export default props => {
  const data = props.contentState.getEntity(props.entityKey).getData();
  const { label, highlight } = data;
  return (
    <span className={classnames(
      'RichEditor-style-block__label',
      {
        'RichEditor-style-block__label__highlight': highlight
      }
    )}
      data-highlight={!!highlight}>
      {props.children}
    </span>
  );
};