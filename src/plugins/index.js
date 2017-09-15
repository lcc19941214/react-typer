import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createImagePlugin from 'draft-js-image-plugin';

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
// const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;

const decorator = composeDecorators(
  focusPlugin.decorator,
  resizeablePlugin.decorator,
  alignmentPlugin.decorator
  // blockDndPlugin.decorator
);

const imagePlugin = createImagePlugin({ decorator });

const PLUGINS = {
  focusPlugin,
  resizeablePlugin,
  alignmentPlugin,
  imagePlugin
};

export { PLUGINS, AlignmentTool };

const defaultPlugins = [
  'focusPlugin',
  'alignmentPlugin',
  'imagePlugin',
  'resizeablePlugin'
];

export default function makePlugins(enabledPlugins = []) {
  const enabled = enabledPlugins
    .concat(defaultPlugins)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const plugins = enabled.map(key => PLUGINS[key]);
  return { plugins };
}
