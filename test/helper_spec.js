'use strict';
before(function (done) {
  console.log('uploading to azure');
  done();
});
after(function (done) {
  console.log('deleting from azure');
  done();
});
