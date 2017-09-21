export default (contentBlock) => {
  const type = contentBlock.getType();
  switch (type) {
    case 'unstyled':
      return 'initial-unstyled';
    default:
  }
}