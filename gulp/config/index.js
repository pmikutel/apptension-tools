var _ = require('lodash');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var _userConfig = {};

function Config() {
  var cwd = _.get(_userConfig, 'paths.cwd', process.cwd());
  var dist = path.join(cwd, _.get(_userConfig, 'paths.dist', 'dist'));
  var app = path.join(cwd, _.get(_userConfig, 'paths.app', 'app'));
  var tmp = path.join(cwd, _.get(_userConfig, 'paths.tmp', '.tmp'));
  var publicAssets = path.join(app, _.get(_userConfig, 'paths.public', 'public/**/*'));
  var srcDirName = 'src';
  var src = path.join(app, srcDirName);

  var imagesDirName = 'images';
  var spritesDirName = 'sprites';
  var sprites = path.join(app, imagesDirName, spritesDirName, '**/*.png');
  var spritesCssPath = path.join(imagesDirName, spritesDirName);
  var testIndex = path.resolve(app, 'spec', 'test.index.js');
  var environment = path.join(src, 'environment');
  var karmaPreprocessors = {};
  karmaPreprocessors[testIndex] = ['webpack', 'sourcemap'];

  var webpackEntry = _.extend({
    main: path.join(src, 'main.js')
  }, _.get(_userConfig, 'webpack.entry', {}));

  var webpackLoaders = [
    {
      test: /\.jsx?$/,
      exclude: /node_modules|bower_components/,
      loader: 'babel'
    },
    {
      test: /\.html$/,
      loader: 'html'
    },
    {
      test: /\.hbs$/,
      loader: 'handlebars'
    },
    {
      test: /\.json$/,
      loader: 'json'
    },
    {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
    }
  ];

  var karmaWebpackLoaders = webpackLoaders.concat([
    {
      test: /\.jsx?$/,
      include: src,
      exclude: /.spec.jsx?$/,
      loader: 'isparta'
    }
  ]).concat(_.get(_userConfig, 'karma.webpack.module.loaders', []));

  webpackLoaders = webpackLoaders.concat(_.get(_userConfig, 'webpack.module.loaders', []));

  var webpackPlugins = [
    new ExtractTextPlugin(path.join(srcDirName, 'vendor.css'))
  ];
  var karmaWebpackPlugins = webpackPlugins.concat(_.get(_userConfig, 'karma.webpack.plugins', []));

  webpackPlugins = webpackPlugins.concat(_.get(_userConfig, 'webpack.plugins', []));

  var sassIncludePaths = _.flattenDeep([tmp].concat(_.get(_userConfig, 'sass.includePaths', [])));

  return Object.freeze(_.defaultsDeep({
    sprity: {
      src: sprites,
      cssPath: '/' + spritesCssPath
    },
    paths: {
      cwd: cwd,
      dist: dist,
      app: app,
      tmp: tmp,
      sass: path.join(app, '**/*.scss'),
      sprity: sprites,
      spritesCss: spritesCssPath,
      eslint: src + '/**/*.js',
      index: path.join(app, 'index.hbs'),
      images: [
        path.join(app, imagesDirName, '**/*.{png,jpg,gif,svg}'),
        '!' + sprites
      ],
      htaccess: path.join(cwd, '.htaccess-prod'),
      publicAssets: publicAssets,
      jsConfig: {
        development: path.join(environment, 'development.js'),
        production: path.join(environment, 'production.js'),
        test: path.join(environment, 'test.js')
      }
    },
    webpack: {entry: webpackEntry, module: {loaders: webpackLoaders}, plugins: webpackPlugins},
    karma: {webpack: {module: {loaders: karmaWebpackLoaders}, plugins: karmaWebpackPlugins}},
    sass: {
      includePaths: sassIncludePaths
    }
  }, _userConfig, {
    webpack: {
      output: {
        path: tmp,
        filename: srcDirName + '/[name].js'
      }
    },

    webpackDevServer: {
      contentBase: tmp,
      proxy: {
        '/api/*': 'http://localhost:8080'
      }
    },

    port: 8000,
    domain: 'localhost',

    revManifest: {
      merge: false
    },

    sass: {
      noCache: false,
      style: 'compact'
    },

    sprity: {
      style: 'sprites.scss',
      processor: 'sprity-sass',
      'style-type': 'scss',
      dimension: [{
        ratio: 1, dpi: 72
      }, {
        ratio: 2, dpi: 192
      }],
      prefix: 'icon',
      split: true,
      engine: 'sprity-gm'
    },

    karma: {
      basePath: '',
      frameworks: ['jasmine'],
      files: [testIndex],
      preprocessors: karmaPreprocessors,
      webpack: {
        devtool: 'inline-source-map'
      },
      webpackMiddleware: {
        stats: {
          colors: true
        }
      },
      reporters: ['progress', 'coverage'],

      coverageReporter: {
        type: 'html',
        dir: 'coverage/'
      },
      port: 9876,
      colors: true,
      logLevel: 'INFO',
      autoWatch: false,
      browsers: ['PhantomJS'],
      captureTimeout: 60000,
      singleRun: true,
      plugins: [
        require('jasmine'),
        require('karma-webpack'),
        require('karma-coverage'),
        require('karma-jasmine'),
        require('karma-sourcemap-loader'),
        require('karma-spec-reporter'),
        require('karma-chrome-launcher'),
        require('karma-phantomjs-launcher'),
        require('karma-jasmine-matchers')
      ]
    }
  }));
}

Config.setUserConfig = function (_config) {
  _userConfig = _config;
};

module.exports = Config;
