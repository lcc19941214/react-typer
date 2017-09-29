import { DEFAULT_COLOR, DEFAULT_FONT_SIZE } from './inlineStyles';

export const FIGURE = {
  margin: '1em 0'
};

export const INITIAL_ATOMIC = {
  ...FIGURE
};

export const INITIAL_UNSTYLED = {
  ...DEFAULT_COLOR,
  ...DEFAULT_FONT_SIZE
};

export default contentBlock => {
  const type = contentBlock.getType();
  switch (type) {
    case 'unstyled':
      return 'RichEditor-style__initial-unstyled';
    case 'atomic':
      return 'RichEditor-style__initial-atomic';
    default:
  }
};
