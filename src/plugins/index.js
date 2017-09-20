import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import createEnhancedResizeablePlugin from './enhancedResizeablePlugin';
import createImageUploadPlugin from './imageUploadPlugin';

import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
// const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;
const enhancedResizeablePlugin = createEnhancedResizeablePlugin();
const imageUploadPlugin = createImageUploadPlugin();

const imageDecorator = composeDecorators(
  focusPlugin.decorator,
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  enhancedResizeablePlugin.decorator,
  imageUploadPlugin.decorator // put imageUploadPlugin on the last to clear className produced by above plugins
  // blockDndPlugin.decorator
);

const imagePlugin = createImagePlugin({ decorator: imageDecorator });

const PLUGINS = {
  focusPlugin,
  alignmentPlugin,
  imagePlugin,
  imageUploadPlugin,
  resizeablePlugin,
  enhancedResizeablePlugin
};

export { PLUGINS, AlignmentTool };

const defaultPlugins = [
  'focusPlugin',
  'alignmentPlugin',
  'imagePlugin',
  'resizeablePlugin',
  'enhancedResizeablePlugin',
  'imageUploadPlugin'
];

export default function makePlugins(enabledPlugins = []) {
  const enabled = enabledPlugins
    .concat(defaultPlugins)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const plugins = enabled.map(key => PLUGINS[key]);
  return { plugins };
}
