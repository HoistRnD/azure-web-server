'use strict';
var azure = require('azure');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var q = require('q');
q.longStackSupport = true;
before(function (done) {
  this.timeout(5000);
  var err;
  if (!(process.env.AZURE_ACCOUNT && process.env.AZURE_KEY)) {
    console.error('Tests require environment varaibles for AZURE_ACCOUNT and AZURE_KEY for a test blob storage account');
    err = new Error('Tests require environment varaibles for AZURE_ACCOUNT and AZURE_KEY for a test blob storage account');
  }
  global.container = 'azure-web-server-test-container-' + Date.now();
  //create the container
  var blobService = azure.createBlobService(process.env.AZURE_ACCOUNT, process.env.AZURE_KEY);
  blobService.createContainerIfNotExists(global.container, function (err) {
    //upload the test package to azure
    if (err) {
      done(err);
      return;
    }
    glob('test/fixtures/site/**/*', function (er, files) {
      if (er) {
        done(er);
        return;
      }
      q.all(_.map(files, function uploadFile(file) {
        var filePath = path.join(process.cwd(), file);
        if (fs.statSync(filePath).isFile()) {
          return q.ninvoke(blobService, 'putBlockBlobFromFile', global.container, file.replace('test/fixtures/site/', ''), filePath);
        } else {
          return q();
        }
      })).then(function () {
        done();
      }).fail(function (err) {
        done(err);
      });
    });
  });
});
after(function (done) {
  if (global.container) {
    var blobService = azure.createBlobService(process.env.AZURE_ACCOUNT, process.env.AZURE_KEY);
    blobService.deleteContainer(global.container, done);
  }
});
