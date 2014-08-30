![cssi](https://dl.dropboxusercontent.com/u/463427/cssi_logo.png)

cssi: **CSS Selector Scene Investigation**. Analyses a git codebase for unused CSS selectors

## Getting Started
Install the module with: `npm -g install cssi`

## Documentation
```
cssi
Usage: cssi --css bla.css --repo /path/to/repo [options]

--css:     file | dir | url - css to be parsed
--repo:    /full/path/to/local/repo - local repo where git-grep will search for css
--reverse: finds not the last, but the first commit where the selector was changed
--exclude: "string" or ["array", "of", "strings"] - exclude selectors that contains these strings, to avoid known false positives like icon fonts
--tpl:     "*.ext" - glob of files that should be checked for selectors. Default = "'*.tmpl' '*.inc' '*.js'"
--debug:   shows extra debug information
--out:     filename.html - different report filename. Default is a normalized version of css_path-filename.html
--link:    "https://github.com/bitbonsai/cssi/commit/{sha}" - link to web git show. Can be any valid URL, {sha} is replaced with commit hash
--config:  file.json - load or replace arguments from config file (must be valid json)
```

## Examples
1. `cssi --css css/sample_gen_profile.css --repo /Users/local_repo/ --exclude bicon`
2. `cssi --css css/ --repo /Users/local_repo/`
3. `cssi --css css/ --repo /Users/local_repo/ --tpl "'*.html' '*.php'" --out myreportname.html --reverse`
4. `cssi --css css/ --repo /Users/local_repo/ --config filename.json`
5. `cssi --css http://example.com/site.css --repo /Users/local_repo/ --debug`


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
- 0.5.x - --exclude now accepts string or array of strings to ignore
- 0.4.x - Added counter and report for original_selectors
- 0.3.x - Added --link, js sort to table, selector count
- 0.2.x - Added option to load config file
- 0.1.x - BrazilJS 2014 version

## License
Copyright (c) 2014 Mauricio Wolff  
Licensed under the MIT license.
