var gitExecute = require('git-execute');

// get the total number of commits
gitExecute('/Users/mwolff/dev/app/', [
  'rev-list',
  'HEAD',
  '--count'
], function(err, stdout, stderr) {
  if (err) { throw err; }

  console.log(stdout);
});

