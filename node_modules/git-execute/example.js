"use strict";

var gitExecute = require('./');
var path = require('path');
var repoPath = path.resolve(process.env.REPO || __dirname + '/.git');

// get the total number of commits
gitExecute(repoPath, [
  'rev-list',
  'HEAD',
  '--count'
], function(err, stdout, stderr) {
  if (err) { throw err; }

  console.log(stdout);
});
