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

export const DEFAULT_COLOR_KEY = 'INLINE-COLOR-02';

export const COLORS = {
  'INLINE-COLOR-01': {
    color: '#ffffff'
  },
  [DEFAULT_COLOR_KEY]: {
    color: '#3b3e44'
  },
  'INLINE-COLOR-03': {
    color: '#fe2c23'
  },
  'INLINE-COLOR-04': {
    color: '#ff9900'
  },
  'INLINE-COLOR-05': {
    color: '#ffd900'
  },
  'INLINE-COLOR-06': {
    color: '#a3e043'
  },
  'INLINE-COLOR-07': {
    color: '#37d9f0'
  },
  'INLINE-COLOR-08': {
    color: '#4da8ee'
  },
  'INLINE-COLOR-09': {
    color: '#aa17d0'
  }
};

export const DEFAULT_COLOR = COLORS[DEFAULT_COLOR_KEY];

export const defaultInlineStyleMap = {
  LABEL,
  'LABEL-HIGHLIGHT': LABEL_HIGHLIGHT,
  ...COLORS
};
