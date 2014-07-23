'use strict';
var grep = require('gulp-grep-stream');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var gulp = require('gulp');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');

function runMocha(source) {
  return source.pipe(grep('**/test/**/*.js'))
    .pipe(mocha());
}

function isModified(file) {
  if (file.event) {
    console.log(file.event);
  }
  return file.event === 'changed' || file.event === 'added';
}

function runJSHint(source) {
  return source.pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
}

gulp.task('watch', function () {
  process.env.AZURE_ACCOUNT = process.env.AZURE_ACCOUNT || require('yargs').argv.azureAccount;
  process.env.AZURE_KEY = process.env.AZURE_KEY || require('yargs').argv.azureKey;
  if(!(process.env.AZURE_ACCOUNT&&process.env.AZURE_KEY))
  {
    throw new Error('Usage: gulp --azureAccount=<azureaccount> --azureKey=<azurekey>');
  }
  runJSHint(gulp.src(['lib/**/*.js', 'test/**/*.js', '*.js']));
  watch({
    glob: ['lib/**/*.js', 'test/**/*.js','*.js'],
    emit: 'all'
  }, function (files) {
    runMocha(files).on('error', function (err) {
      if (!/tests? failed/.test(err.stack)) {
        console.log(err.stack);
      }
    });
    runJSHint(files.pipe(filter(isModified)));

  });
});
gulp.task('test-mocha',function(){
  process.env.AZURE_ACCOUNT = process.env.AZURE_ACCOUNT || require('yargs').argv.azureAccount;
  process.env.AZURE_KEY = process.env.AZURE_KEY || require('yargs').argv.azureKey;
  if(!(process.env.AZURE_ACCOUNT&&process.env.AZURE_KEY))
  {
    throw new Error('Usage: gulp --azureAccount=<azureaccount> --azureKey=<azurekey>');
  }
  return runMocha(gulp.src('test/**/*.js'));
});
gulp.task('test-jshint',function(){
  return runJSHint(gulp.src(['lib/**/*.js', 'test/**/*.js', '*.js']))
  .pipe(jshint.reporter('fail'));
});
gulp.task('test', ['test-jshint','test-mocha']);
gulp.task('default', ['watch']);
