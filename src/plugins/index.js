import { composeDecorators } from 'draft-js-plugins-editor';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
// import createImagePlugin from 'draft-js-image-plugin';
import createImagePlugin from './imagePlugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';
import createEnhancedResizeablePlugin from './enhancedResizeablePlugin';
import createImageUploadPlugin from './imageUploadPlugin';

import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;
const enhancedResizeablePlugin = createEnhancedResizeablePlugin();
const imageUploadPlugin = createImageUploadPlugin();

const imageDecorator = composeDecorators(
  focusPlugin.decorator,
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  enhancedResizeablePlugin.decorator,
  blockDndPlugin.decorator,
  imageUploadPlugin.decorator // put imageUploadPlugin on the last to clear className produced by above plugins
);

const imagePlugin = createImagePlugin({
  decorator: imageDecorator,
  props: {
    horizontal: 'absolute'
  }
});

const PLUGINS = {
  focusPlugin,
  alignmentPlugin,
  imagePlugin,
  imageUploadPlugin,
  resizeablePlugin,
  enhancedResizeablePlugin,
  blockDndPlugin
};

export { PLUGINS, AlignmentTool };

const defaultPlugins = [
  'focusPlugin',
  'alignmentPlugin',
  'imagePlugin',
  'resizeablePlugin',
  'enhancedResizeablePlugin',
  'imageUploadPlugin',
  'blockDndPlugin'
];

export default function makePlugins(enabledPlugins = []) {
  const enabled = enabledPlugins
    .concat(defaultPlugins)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const plugins = enabled.map(key => PLUGINS[key]);
  return { plugins };
}
