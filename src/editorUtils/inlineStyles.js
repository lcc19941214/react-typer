export const LABEL = {
  borderRadius: '2px',
  padding: '0 6px',
  margin: '0 4px',
  color: '#666',
  backgroundColor: '#f1f1f1',
  cursor: 'default',
  display: 'inline-block',
  pointerEvents: 'none'
};

export const LABEL_HIGHLIGHT = Object.assign({}, LABEL, {
  backgroundColor: '#ffeb22'
});

export const DEFAULT_COLOR_KEY = 'INLINE-COLOR-01';
export const COLORS = {
  [DEFAULT_COLOR_KEY]: {
    color: '#3b3e44'
  },
  'INLINE-COLOR-02': {
    color: '#ffffff'
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

export const DEFAULT_FONT_SIZE_KEY = 'INLINE-FONT-SIZE-MEDIUM';
export const FONT_SIZES = {
  'INLINE-FONT-SIZE-SMALL': {
    fontSize: '12px'
  },
  [DEFAULT_FONT_SIZE_KEY]: {
    fontSize: '14px'
  },
  'INLINE-FONT-SIZE-LARGE': {
    fontSize: '18px'
  },
  'INLINE-FONT-SIZE-SUPER': {
    fontSize: '32px'
  }
};
export const DEFAULT_FONT_SIZE = FONT_SIZES[DEFAULT_FONT_SIZE_KEY];

export const defaultStyleRules = {
  ...DEFAULT_COLOR,
  ...DEFAULT_FONT_SIZE,
  lineHeight: '1.8'
};

const defaultInlineStyleMap = {
  LABEL,
  'LABEL-HIGHLIGHT': LABEL_HIGHLIGHT,
  ...COLORS,
  ...FONT_SIZES
};

export default defaultInlineStyleMap;
