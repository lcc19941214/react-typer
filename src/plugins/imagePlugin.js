import decorateComponentWithProps from 'decorate-component-with-props';
import ImageComponent from '../components/blocks/imageBlock';

const defaultTheme = {
  image: {}
};

export default (config = {}) => {
  const theme = config.theme ? config.theme : defaultTheme;
  let Image = config.imageComponent || ImageComponent;
  if (config.decorator) {
    Image = config.decorator(Image);
  }
  const ThemedImage = decorateComponentWithProps(Image, { theme, horizontal: 'absolute' });
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entityKey = block.getEntityAt(0);
        if (!entityKey) return;
        const entity = contentState.getEntity(entityKey);
        const type = entity.getType();
        if (type === 'image') {
          return {
            component: ThemedImage,
            editable: false
          };
        }
      }

      return null;
    }
  };
};
