import { DEFAULT_COLOR, DEFAULT_FONT_SIZE } from './inlineStyles';

export default contentBlock => {
  const type = contentBlock.getType();
  switch (type) {
    case 'unstyled':
      return 'RichEditor-style__initial-unstyled';
    default:
  }
};

export const INITIAL_UNSTYLED = {
  ...DEFAULT_COLOR,
  ...DEFAULT_FONT_SIZE
};
