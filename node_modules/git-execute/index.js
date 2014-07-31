"use strict";

var debug = require('debug')('git-execute');
var exec = require('child_process').exec;

module.exports = function(repoPath, args, callback) {
  var cmd = 'git --git-dir=' + repoPath + ' ';

  args.forEach(function(item) {
    cmd += item + ' ';
  });

  debug('cmd', cmd);

  exec(cmd, { cwd: repoPath }, callback);
};
