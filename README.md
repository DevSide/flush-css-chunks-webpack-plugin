<div align="center">
<img width="500" height="200"
    src="https://cdn.rawgit.com/mario-jerkovic/flush-css-chunks-webpack-plugin/22d6154e/flush_css.png">
  
  <h1>Flush CSS Chunks Webpack Plugin</h1>
  <p>Generates CSS hash for mapping between Webpack chunks and CSS chunks.</p>
</div>

 # Installation
 
```bash
yarn add flush-css-chunks-webpack-plugin
```
or
```bash
npm install flush-css-chunks-webpack-plugin
```

## Introduction

 If your using awesome [babel-plugin-dual-import](https://github.com/faceyspacey/babel-plugin-dual-import)
 or [babel-plugin-universal-import](https://github.com/faceyspacey/babel-plugin-universal-import)
 and for some reason you cannot implement SSR than this plugin is what you need.
 
 It maps trough webpack stats and generates ```cssHash```:
 
 ```javascript
window.__CSS_CHUNKS__ = {
    Foo: '/static/Foo.css',
    Bar: '/static/Bar.css'
}
```
```cssHash``` will be injected in your ```.js``` or ```hot-update.js``` files 
which are generated by webpack so that means it also works with Hot module replacement (HMR) :thumbsup:

 # Usage
 
```javascript
const FlushCSSChunksWebpackPlugin = require('flush-css-chunks-webpack-plugin');

const config = {
    entry: '...',
    output: {},
    modules: {},
    plugins: [
        new FlushCSSChunksWebpackPlugin({
            assetPath: '/asset/static/', // defaults to output.publichPath defined in webpack.config
            entryOnly: true, // defaults to false,
            entries: ['common'] // defaults to null
        })
    ]
};
```

- **assetPath** - ***default: null*** By default plugin uses output.publichPath defined in webpack.config to generate
asset mapping but if you need custom asset path you can use this property
- **entryOnly** - ***default: false*** By default plugin injects the ```cssHash``` to every ```.js``` 
file produced by webpack as this enables hot swap mapping, if set to ```true``` plugin will only inject the mapping
in the initial ```.js``` bundle (use only for **PRODUCTION**)
- **entries** - ***default: null*** By default, if ```entryOnly``` is specified, plugin injects the ```cssHash``` into every ```.js``` produced by webpack. Using this option you can specify entry chunks in which the CSS mapping will be injected. This is useful if you have common chunks that are already loaded on the page. **Note:** This only works if ```entryOnly``` is set to ```true```, if it is set to ```false```, CSS mapping will be injected in every chunk.

