'use strict';
var gulp = require('gulp');
//var debug = require('gulp-debug');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');


//var changed = require('gulp-changed');
var mocha = require('gulp-spawn-mocha');

var paths = {
  tests: ['test/unit_tests/*.js'],
  app: ['start.js', 'lib/**/*.js']
};


gulp.on('err', function (err) {
  console.log(err);
});

gulp.task('jshint:app', function () {
  gulp.src(paths.app)
  //.pipe(changed)
  .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});
gulp.task('jshint:tests', function () {
  gulp.src(paths.tests)
  //.pipe(changed)
  .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

function test() {
  return gulp.src(paths.tests, {
      read: false
    })
    .pipe(mocha({
      bin: 'node_modules/.bin/mocha',
      reporter: 'spec',
      colors: true,
      require: 'test/testSetup.js',
      growl: true
    }))
    .on('error', console.warn.bind(console));
}

gulp.task('test:no_fail', ['jshint'], function () {
  test();
});

gulp.task('test', ['jshint'], function () {
  test().on('error', function (err) {
    throw err;
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.app, ['jshint:app', 'test:no_fail']);
  gulp.watch(paths.tests, ['jshint:tests', 'test:no_fail']);
});

gulp.task('package', shell.task([
  'docker build -t hoist/executor .'
]));

gulp.task('jshint', ['jshint:app', 'jshint:tests']);
gulp.task('default', ['test:no_fail', 'watch']);
