<img class="logo" alt="cssi" src="https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e4156fa4-573c-46b4-9567-de0a1d78e790/cssi.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20211013%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211013T012242Z&X-Amz-Expires=86400&X-Amz-Signature=f80274462eeb37d32652cb11fcd46b71478f9f6fce9f39e1d2e59a546d9b92ef&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22cssi.png%22" />

`cssi`: **CSS Selector Scene Investigation**. Analyses a git codebase for unused CSS selectors

Give it a css file and a git repo, and CSSI will find unused selectors and put it in a report for you, with selectors, commit date and commit messages.

You can specify a template extension, like `.tmpl`, `.html` or `.inc` to find where selectors are applied, a well as exclude certain selectors.

All options can be passed in a JSON file with the `--config` flag.

### Why not just delete them?
Because too much automation is not always a good thing. With CSSI report you can check dates and commit messages, delete the selector if you want as a new commit and revert if something breaks.

## Getting Started
Install the module with: `npm -g install cssi`

[https://www.npmjs.org/package/cssi](https://www.npmjs.org/package/cssi)

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
1. `cssi --css css/sample_gen_profile.css --repo /Users/local_repo/ --exclude icon`
2. `cssi --css css/ --repo /Users/local_repo/`
3. `cssi --css css/ --repo /Users/local_repo/ --tpl "'*.html' '*.php'" --out myreportname.html --reverse`
4. `cssi --css css/ --repo /Users/local_repo/ --config filename.json`
5. `cssi --css http://example.com/site.css --repo /Users/local_repo/ --debug`

## Testing it
There's a `test` directory with few files:

- test.css
- test_template.html

Clone this repo to your machine and run the following command:

`cssi --css test.css --repo [/FULL/PATH/TO/CSSI/REPO] --tpl "*.html"`

You'll see:

![CSSI output]([https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d2a1ae1c-c161-4b15-9df4-808b0b842631/carbon_%281%29.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20211013%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211013T025821Z&X-Amz-Expires=86400&X-Amz-Signature=a277c3130b6a303a49157201c6febbe79e945bd0f8f8bcda417d471ee3a51795&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22carbon%2520%281%29.png%22](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d2a1ae1c-c161-4b15-9df4-808b0b842631/carbon_%281%29.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220526%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220526T035129Z&X-Amz-Expires=86400&X-Amz-Signature=3f77bf006b2cbe9891dc297f669323996808833714ac497019583b4fe268553c&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22carbon%2520%281%29.png%22&x-id=GetObject))

And `cssi` will have generated a report called `test.html`, that will look like this:

![Report output]([https://s3.us-west-2.amazonaws.com/secure.notion-static.com/cd6a107f-0901-4909-a6d8-7fe16a23cd86/Screen_Shot_2021-10-13_at_1.24.09_pm.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20211013%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211013T022434Z&X-Amz-Expires=86400&X-Amz-Signature=28a592abbc02ed5bc0a084f501746eb7f1391f7aec4f2b954febb66f1ca37ef3&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screen%2520Shot%25202021-10-13%2520at%25201.24.09%2520pm.png%22](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/cd6a107f-0901-4909-a6d8-7fe16a23cd86/Screen_Shot_2021-10-13_at_1.24.09_pm.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220526%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220526T035148Z&X-Amz-Expires=86400&X-Amz-Signature=53fc7f0c3f7e84a5523386aea107d12186944d7eebc51a3f265e1a3cb17ad8c1&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Screen%2520Shot%25202021-10-13%2520at%25201.24.09%2520pm.png%22&x-id=GetObject))

Tip: if you try to run again won't work, because the missing selector appears on the report 😂. Delete the report and run again.

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
