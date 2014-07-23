var grep = require('gulp-grep-stream');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var gulp = require('gulp');
var debug = require('gulp-debug');

function runMocha(source) {
  return source.pipe(grep('**/test/**/*.js'))
    .pipe(mocha());
}

gulp.task('watch', function () {
  watch({
    glob: ['lib/**/*.js', 'test/**/*.js'],
    emit: 'all'
  }, function (files) {
    runMocha(files).on('error', function (err) {
      if (!/tests? failed/.test(err.stack)) {
        console.log(err.stack);
      }
    });
  });
});
gulp.task('test', function () {
  runMocha(gulp.src('test/**/*.js'));
})
