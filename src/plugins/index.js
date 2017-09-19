import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import createEnhancedResizeablePlugin from './enhancedResizeablePlugin';

import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
// const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;
const enhancedResizeablePlugin = createEnhancedResizeablePlugin();

const decorator = composeDecorators(
  focusPlugin.decorator,
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  enhancedResizeablePlugin.decorator
  // blockDndPlugin.decorator
);

const imagePlugin = createImagePlugin({ decorator });

const PLUGINS = {
  focusPlugin,
  resizeablePlugin,
  alignmentPlugin,
  imagePlugin,
  enhancedResizeablePlugin
};

export { PLUGINS, AlignmentTool };

const defaultPlugins = [
  'focusPlugin',
  'alignmentPlugin',
  'imagePlugin',
  'resizeablePlugin',
  'enhancedResizeablePlugin'
];

export default function makePlugins(enabledPlugins = []) {
  const enabled = enabledPlugins
    .concat(defaultPlugins)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const plugins = enabled.map(key => PLUGINS[key]);
  return { plugins };
}
