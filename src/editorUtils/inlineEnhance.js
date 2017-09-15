const LABEL = {
  borderRadius: '2px',
  padding: '0 4px',
  margin: '0 4px',
  color: '#666',
  backgroundColor: '#f1f1f1',
  cursor: 'default'
};

const LABEL_HIGHLIGHT = Object.assign({}, LABEL, {
  backgroundColor: '#ffeb22'
});

export const defaultInlineStyleMap = {
  LABEL,
  'LABEL-HIGHLIGHT': LABEL_HIGHLIGHT
};
