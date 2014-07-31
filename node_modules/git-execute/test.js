"use strict";

var proxyquire = require('proxyquire');
var should = require('should');

describe('git-execute', function() {
  it('should delegate properly', function(done) {
    var repoPath = '/home/node.git';
    var execArgs = ['one', 'two', 'three'];

    var gitExecute = proxyquire.load('./', {
      child_process: {
        exec: function(cmd, opts, cb) {
          cmd.should.eql('git --git-dir=' + repoPath + ' ' + execArgs.join(' ') + ' ');
          cb();
        }
      }
    });

    gitExecute(repoPath, execArgs, function(err, stdout) {
      done();
    });
  });
});
