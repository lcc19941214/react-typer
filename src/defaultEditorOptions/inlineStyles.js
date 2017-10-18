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

export const LABEL_HIGHLIGHT = { ...LABEL, backgroundColor: '#ffeb22' };

export const LINK = {
  color: '#0000ee',
  textDecoration: 'underline'
};

export const DEFAULT_COLOR_KEY = 'INLINE_COLOR_01';
export const COLORS = {
  [DEFAULT_COLOR_KEY]: {
    color: '#3b3e44'
  },
  INLINE_COLOR_02: {
    color: '#ffffff'
  },
  INLINE_COLOR_03: {
    color: '#fe2c23'
  },
  INLINE_COLOR_04: {
    color: '#ff9900'
  },
  INLINE_COLOR_05: {
    color: '#ffd900'
  },
  INLINE_COLOR_06: {
    color: '#a3e043'
  },
  INLINE_COLOR_07: {
    color: '#37d9f0'
  },
  INLINE_COLOR_08: {
    color: '#4da8ee'
  },
  INLINE_COLOR_09: {
    color: '#aa17d0'
  }
};
export const DEFAULT_COLOR = COLORS[DEFAULT_COLOR_KEY];

export const DEFAULT_FONT_SIZE_KEY = 'INLINE_FONT_SIZE_MEDIUM';
export const FONT_SIZES = {
  INLINE_FONT_SIZE_SMALL: {
    fontSize: '12px'
  },
  [DEFAULT_FONT_SIZE_KEY]: {
    fontSize: '14px'
  },
  INLINE_FONT_SIZE_LARGE: {
    fontSize: '18px'
  },
  INLINE_FONT_SIZE_SUPER: {
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
  LABEL_HIGHLIGHT: LABEL_HIGHLIGHT,
  ...COLORS,
  ...FONT_SIZES
};

export default defaultInlineStyleMap;
