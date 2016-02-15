var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

var browserSync = require('./utils/browserSyncInstance');
var env = require('./utils/env');

var config = require('./config');

module.exports = function () {
  var pathsConfig = config.getPathsConfig();
  var handlebarsConfig = config.getHandlebarsConfig();

  var templateData = {
    development: !env.isProduction(),
    configType: gutil.env.env || (env.isProduction() ? 'production' : 'development')
  };
  var stream = gulp.src(path.join(pathsConfig.paths.app, pathsConfig.filePatterns.index))
    .pipe(handlebars(templateData, handlebarsConfig))
    .pipe(rename({extname: '.html'}));

  if (env.isProduction()) {
    stream = stream.pipe(gulp.dest(pathsConfig.paths.dist));
  } else {
    stream = stream.pipe(gulp.dest(pathsConfig.paths.tmp));
  }

  return stream.pipe(browserSync.stream());
};
