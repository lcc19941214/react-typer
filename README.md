# React Typer

> a rich text editor for react based on [draft-js](https://github.com/facebook/draft-js/) and [draft-js-plugins](https://www.draft-js-plugins.com/plugin/)

## Introduction
![intro](https://github.com/lcc19941214/react-typer/blob/master/intro.png)

React Typer is a rich text editor with basic inline and block styles. Also extended with color, font size, text alignment, hyperlink, and image upload.




## draft-js-plugins-editor
React Typer is based on [draft-js-plugins-editor](https://github.com/draft-js-plugins/draft-js-plugins/blob/master/draft-js-plugins-editor/src/Editor/index.js#L16). Most props is as same as draft-js required, see the differences [here](https://github.com/draft-js-plugins/draft-js-plugins#draft-js-plugins-editor).



## Usage

```javascript
import React, { Component } from 'react';
import ReactTyper from 'react-typer';

export default Typer extends Component {
  logState = (editorState) => console.log(editorState);

  mergeImageData =  res =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = res.url;
      img.onload = () => {
        resolve({
          src: res.url, // src is required for image block
        });
      };
    });

  handleOnUploadError = err => console.error(err);

  render {
    const COMMON_TYPER_PROPS = {
      onUpload: this.mergeImageData,
      onUploadError: this.handleOnUploadError,
      imageUploadAction: 'http://achuan.me/api/upload_image/'
    };
    return (
      <Typer
        ref={ref => (this.Typer = ref)}
        {...COMMON_TYPER_PROPS}
        exportToHTMLOptions={{}}
        onChange={this.logState}
      />
    );
  }
}
```
## Plugins

If you need to write some custom plugins, just refer to this [Guide](https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md) of draft-js-plugins.



## Export contentState
React Typer has `exportState` function to convert `contentState` into `json`, `html` or just an `object`.



### Usage

```javascript
const js = this.Typer.exportState('');
const html = this.Typer.exportState('html');
const json = this.Typer.exportState('json');
```
Use `exportToHTMLOptions` if you need to custom your own export content with React Typer.

React Typer has already preset some export options, if you want to customize your own options, just pass `exportToHTMLOptions` to the component.



### Notice

1. Methods below in `exportToHTMLOptions` would be wrapped with preset `exportToHTMLOptions` result as last parametter.

`inlineStyles`, `blockRenderers`, `blockStyleFn`, `entityStyleFn`.

e.g.

```javascript
const options = {
  entityStyleFn: (entity, presetResult) => {
    const entityType = entity.get('type').toLowerCase();
    if (entityType === 'image') {
      const data = entity.getData();
      if (data.error) {
      	return {
          element: 'div',
          stye: ...
        }
      }
      return presetResult;
    }
  },
};
```

2. For some trick reasons, `blockRenderers`  is called with contentState as first parametter.


3. Each property would be just assign into default configs.

For more details, see [draft-js-export-html](https://www.npmjs.com/package/draft-js-export-html).



## Update
Now you can use React Typer to insert hyperlinks.
![link1](https://github.com/lcc19941214/react-typer/blob/master/public/link1.png)
![link2](https://github.com/lcc19941214/react-typer/blob/master/public/link2.png)
