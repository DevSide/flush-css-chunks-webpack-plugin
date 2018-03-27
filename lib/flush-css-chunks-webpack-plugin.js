'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('webpack-sources'),
    ConcatSource = _require.ConcatSource;

var _require2 = require('webpack/lib/ModuleFilenameHelpers'),
    matchObject = _require2.matchObject;

var pluginName = 'flush-css-chunks-webpack-plugin';

function isInitial(chunk) {
  var parentCount = 0;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = chunk.groupsIterable[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var chunkGroup = _step.value;

      parentCount += chunkGroup.getNumberOfParents();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return chunk.isOnlyInitial() || parentCount === 0;
}

function generateAssetMapping(path, assets) {
  var mapping = {};
  var assetKeys = Object.keys(assets);

  assetKeys.forEach(function (assetKey) {
    if (Array.isArray(assets[assetKey])) {
      assets[assetKey].forEach(function (assetPath) {
        if (assetPath.includes('.css')) {
          Object.assign(mapping, { [assetKey]: `${path}${assetPath}` });
        }
      });
    }
  });

  return mapping;
}

function generateAssetsHook() {
  var mapping = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return `
        if (typeof window === "object") {
            window.__CSS_CHUNKS__ = ${JSON.stringify(mapping)};
        }
    `.trim();
}

var FlushCSSChunks = function () {
  function FlushCSSChunks() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, FlushCSSChunks);

    if (options.entries != null && !Array.isArray(options.entries)) {
      throw new Error('Invalid Options\n\noptions.entries should be array\n');
    }

    this.options = Object.assign({
      entryOnly: false,
      assetPath: null,
      entries: null
    }, options);
  }

  _createClass(FlushCSSChunks, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.thisCompilation.tap(pluginName, function (compilation) {
        compilation.hooks.optimizeChunkAssets.tapAsync(pluginName, function (chunks, callback) {
          var publicPath = compiler.options.output.publicPath;

          var _compilation$getStats = compilation.getStats().toJson(),
              assetsByChunkName = _compilation$getStats.assetsByChunkName;

          var assetMapping = generateAssetsHook(generateAssetMapping(_this.options.assetPath || publicPath, assetsByChunkName));

          chunks.forEach(function (chunk) {
            if (_this.options.entryOnly && !isInitial(chunk)) {
              return;
            }

            if (_this.options.entryOnly && _this.options.entries && !_this.options.entries.includes(chunk.name)) {
              return;
            }

            chunk.files.filter(function (file) {
              return matchObject({ test: new RegExp(/^(.(.*.js))*$/) }, file);
            }).forEach(function (file) {
              return FlushCSSChunks.injectAssetsMapping(compilation, file, assetMapping);
            });
          });

          callback();
        });
      });
    }
  }], [{
    key: 'injectAssetsMapping',
    value: function injectAssetsMapping(compilation, file, assetMapping) {
      var newSource = new ConcatSource(assetMapping);

      newSource.add(compilation.assets[file]);

      return Object.assign(compilation.assets, { [file]: newSource });
    }
  }]);

  return FlushCSSChunks;
}();

module.exports = FlushCSSChunks;