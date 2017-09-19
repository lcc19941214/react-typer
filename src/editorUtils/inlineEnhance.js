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

export const COLORS = {
  'INLINE-COLOR-BLACK': {
    color: '#3b3e44'
  },
  'INLINE-COLOR-WHITE': {
    color: 'white'
  },
  'INLINE-COLOR-RED': {
    color: 'red'
  },
  'INLINE-COLOR-ORANGE': {
    color: 'orange'
  },
  'INLINE-COLOR-YELLOW': {
    color: 'yellow'
  },
  'INLINE-COLOR-GREEN': {
    color: 'green'
  },
  'INLINE-COLOR-BLUE': {
    color: 'blue'
  },
  'INLINE-COLOR-INDIGO': {
    color: 'indigo'
  },
  'INLINE-COLOR-VIOLET': {
    color: 'violet'
  }
};

export const defaultInlineStyleMap = {
  LABEL,
  'LABEL-HIGHLIGHT': LABEL_HIGHLIGHT,
  ...COLORS
};
