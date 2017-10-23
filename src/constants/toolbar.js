import decorateComponentWithProps from 'decorate-component-with-props';
import ColorPicker from '../components/colorPicker';
import FontSizeSelector from '../components/fontSizeSelector';
import TextAlignment from '../components/textAlignment';
import { UploadImage, AddImageLink } from '../components/imageModifier';
import LinkModifier from '../components/linkModifier/';

export default [
  {
    key: 'headline',
    controls: [
      { key: 'h1', type: 'block', style: 'header-one', tooltip: '一级标题' },
      { key: 'h2', type: 'block', style: 'header-two', tooltip: '二级标题' },
      { key: 'h3', type: 'block', style: 'header-three', tooltip: '三级标题' }
    ]
  },
  {
    key: 'fontStyle',
    controls: [
      { key: 'bold', type: 'inline', style: 'BOLD', tooltip: '粗体' },
      {
        key: 'italic',
        type: 'inline',
        style: 'ITALIC',
        tooltip: '斜体'
      },
      {
        key: 'underline',
        type: 'inline',
        style: 'UNDERLINE',
        tooltip: '下划线'
      }
    ]
  },
  {
    key: 'advancedFontStyle',
    controls: [
      { key: 'colorPicker', type: 'action', component: ColorPicker, tooltip: '字体颜色' },
      { key: 'fontSize', type: 'action', component: FontSizeSelector, tooltip: '字号' }
    ]
  },
  {
    key: 'list',
    controls: [
      {
        key: 'ul',
        type: 'block',
        style: 'unordered-list-item',
        tooltip: '无序列表'
      },
      {
        key: 'ol',
        type: 'block',
        style: 'ordered-list-item',
        tooltip: '有序列表'
      }
    ]
  },
  {
    key: 'insert',
    controls: [
      { key: 'link', type: 'action', component: LinkModifier, tooltip: '链接' },
      { key: 'imageUpload', type: 'action', component: UploadImage, tooltip: '图片' },
      { key: 'imageLink', type: 'action', component: AddImageLink, tooltip: '图片链接' }
    ]
  },
  {
    key: 'textAlign',
    controls: [
      {
        key: 'textAlignLeft',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'left' }),
        tooltip: '左对齐'
      },
      {
        key: 'textAlignCenter',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'center' }),
        tooltip: '居中对齐'
      },
      {
        key: 'textAlignRight',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'right' }),
        tooltip: '右对齐'
      },
      {
        key: 'textAlignJustify',
        type: 'action',
        component: decorateComponentWithProps(TextAlignment, { textAlign: 'justify' }),
        tooltip: '分散对齐'
      }
    ]
  }
];
