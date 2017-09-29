import React, { Component } from 'react';
import { LABEL, LABEL_HIGHLIGHT } from '../../utils/inlineStyles';

export default props => {
  const data = props.contentState.getEntity(props.entityKey).getData();
  const { label, highlight } = data;
  const style = Object.assign({}, LABEL, highlight ? LABEL_HIGHLIGHT : {});
  return (
    <span style={style} data-highlight={!!highlight}>
      {props.children}
    </span>
  );
};
