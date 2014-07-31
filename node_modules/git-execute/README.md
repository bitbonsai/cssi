# git-execute

Utility module over `child_process.exec` for git commands.

## Usage

```js
gitExecute(repoPath, execArguments, callback)
```

Example:

```js
var gitExecute = require('git-execute');

// get the total number of commits
gitExecute(repoPath, [
  'rev-list',
  'HEAD',
  '--count'
], function(err, stdout, stderr) {
  if (err) { throw err; }

  console.log(stdout);
});
```

# License

MIT
