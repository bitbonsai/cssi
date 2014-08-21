#! /usr/bin/env node
/*
               _ 
              (_)
   ___ ___ ___ _ 
  / __/ __/ __| |
 | (__\__ \__ \ |
  \___|___/___/_|


 * CSsI - CSS Selectors Scene Investigation
 * https://github.com/bitbonsai/cssi
 *
 * Copyright (c) 2014 Mauricio Wolff
 * Licensed under the MIT license.
 */

'use strict';

var 
    dbg = 0,
    colors = require('colors'),
    fs = require('fs'),
    opt = require('minimist')(process.argv.slice(2)),
    url = require('url'),
    cssParser = require('css-parse'),
    run = require('exec-queue'),
    ee = require('event-emitter'),
    emitter = ee({}), 
    files_to_grep = "'*.tmpl' '*.inc' '*.js'",
    tree,
    css_type = '',
    css = '',
    original_selectors = [],
    selectors = {},
    selectors_length = 0,
    sels = { "ids": [], "classes": [] },
    ghosts = { "ids": [], "classes": [] },
    logs = { "ids": [], "classes": [] },
    ghosts_len = 0,
    ghosts_count = 0,
    logs_len = 0,
    logs_count = 0,
    sorted,
    repo;

colors.setTheme({
    warn: 'yellow',
    ok: 'green',
    status: 'green',
    debug: 'blue',
    error: 'red'
});

(function init () {
/* TODO: 
    [ ] --out html report com template
    [ ] --tpl glob para arquivos para pesquisar
*/

    // listeners
    emitter.on('getCss_ok', parseCss);
    emitter.on('parseCss_ok', parseRules);
    emitter.on('parseRules_ok', testGit);
    emitter.on('testGit_ok', grepCss);
    emitter.on('grepCss_ok', gitLogAllTheThings);
    emitter.on('gitLogAllTheThings_ok', createReport);

    // override dbg if used as an argument
    if (opt.debug) {
        dbg = opt.debug;
        log('[d] dbg: %d', dbg);
    }

    //tpl override
    if (opt.tpl) {
        files_to_grep = opt.tpl;
    }

    // check if it's a dir, file or url
    if (!opt.css || !opt.repo) {
        help();
    } else {
        css_type = checkCss(opt.css);
        repo = checkRepo(opt.repo);

        log('[s] Getting css: %s...'.ok, opt.css);
        getCss(css_type);
    }
})();

// only show messages that doesn't contain [s] in debug mode
function log (msg, data) {

    if (data === undefined) {
        data = '';
    }
    if (dbg) {
        if (msg) {
            console.log(addColors(msg), data);
        }
    } else {
        if (msg) {
            if (msg.indexOf('[s]') > -1 || msg.indexOf('[e]') > -1 || msg.indexOf('[w]') > -1) {
                console.log(addColors(msg), data);
            }
        }
    }
}

function addColors (msg) {
    msg = msg.replace('[s]', '[CSSI]'.status);
    msg = msg.replace('[e]', '[CSSI]'.error);
    msg = msg.replace('[w]', '[CSSI]'.warn);
    msg = msg.replace('[d]', '[CSSI]'.debug).replace('[s]', '[CSSI]'.status);

    return msg;
}

// Simplified implementation of "request" npm module
function request(requestOptions, callback) {
    var isHttps = requestOptions.protocol === 'https:',
        client = require(isHttps ? 'https' : 'http');

    log('[d] GET %s', requestOptions.href);
    
    client.get(requestOptions, function(resp) {
        var out = '';
        resp.on('data', function(chunk) {
            out += chunk;
        });
        resp.on('end', function() {
            log('[d] HTTP %d', resp.statusCode);
            log('[d] Headers: %j', resp.headers);
            callback(null, resp, out);
        });
    }).on('error', function(err) {
        log('[e]' + err);
        callback(err);
    });
}

// show Usage TODO: load from external file
function help () {
    
    var h = [];
    h.push('Usage: cssi --css bla.css --repo /path/to/repo'.error);
    h.push('--css'.debug + '     [file | dir | url]'.cyan);
    h.push('--repo'.debug + '    [/full/path/to/local/repo]'.cyan);
    h.push('--reverse'.debug + ' finds not the last, but the first commit where the selector was changed');
    h.push('--exclude'.debug + ' [bicon]'.cyan + ' exclude string from selectors, useful to avoid known false positives - ie: icon fonts');
    h.push('--tpl'.debug + '     ["*.ext"]'.cyan + ' glob of files that should be checked for selectors. Default: "\'*.tmpl\' \'*.inc\' \'*.js\'"');
    h.push('--debug'.debug + '   shows extra debug information');
    h.push('--out'.debug + '     [filename.html]'.cyan + ' different report filename. Default is a normalized version of css_path-filename.html');
    h.push('More info at https://github.com/bitbonsai/cssi'.warn);

    console.log(h.join('\n'));
}

// Check if file is dir, file or url
function checkCss (css) {

    try {
        if (/http.?:\/\//.test(css)) {
            return 'url';
        } else {
            if (fs.existsSync(opt.css)) {
                if (fs.lstatSync(opt.css).isDirectory()) {
                    return 'dir';
                } else if (fs.lstatSync(opt.css).isFile()) {
                    return 'file';
                } else {
                    log('[e] The css %s couldn\'t be recognized as a dir or file.', css);
                    process.exit(255);
                }
            } else {
                log('[e] %s is not a valid URL, dir or file... Fix it or try an absolute path.', opt.css);
                process.exit(255);
            }
        } 
    } catch (e) {
        return false;
    }
}

function checkRepo (repo_path) {
    var ok = fs.existsSync(repo_path);

    if (!ok) {
        log('[e] The git repo %s couldn\'t be found.', opt.repo);
        log('[e] Please provide an existing path for the git repo (not URLs)')
        process.exit(255);
    } else {
        return repo_path;
    }
}

function getCss (css_type) {
    var files = [],
        dir,
        cur_file,
        path;

    // remove extra dots
    path = opt.css.replace('.\/', '');

    // get all css files in dir
    if (css_type === 'dir') {
        files = fs.readdirSync(opt.css);
        
        files.forEach(function (file) {
            dir =  path + '/';
            cur_file = dir + file;
        
            log('[d] Getting %s from ' + dir, file);

            css += fs.readFileSync(cur_file, 'utf-8');
        });
        emitter.emit('getCss_ok');
    }

    if (css_type === 'file') {
        cur_file = path;

        css = fs.readFileSync(cur_file, 'utf-8');
        emitter.emit('getCss_ok');
    }

    if (css_type === 'url') {
        request(url.parse(opt.css), function (err, resp, remote_css) {
            if (err || resp.statusCode !== 200) {
                log('[e] HTTP request failed: ' + (err ? err.toString() : 'received HTTP %s'), resp.statusCode);
            } else {
                css = remote_css;
                emitter.emit('getCss_ok');
            }
        });
    }
}

function parseCss () {
    log('[s] Parsing %s kB of CSS...', (css.length / 1024).toFixed(2));

    try {
        if (css.trim() === '') {
            log('[e] Empty CSS provided');
            throw 'Empty CSS provided';
        }

        tree = new cssParser(css);
    }
    catch(ex) {
        var errMsg = 'CSS parsing failed: ' + ex.toString();
        log('[e] ' + errMsg);
        log('[e] Offending line: ' + css.split('\n')[ex.line-1]);
    }
    
    log('[d] CSS parsed!');
    emitter.emit('parseCss_ok');
}

function parseRules () {
    var rules = tree.stylesheet.rules,
        sel;

    if (rules) {
        rules.forEach(function (rule) {
            // log('[d] %s', JSON.stringify(rule));
            switch(rule.type) {
                case 'media':
                    log('[d] media query');
                    break;
                case 'rule':
                    if (!rule.selectors || !rule.declarations) {
                        return;
                    }

                    rule.selectors.forEach(function(selector) {
                        original_selectors.push(selector);

                        // clean up nested and pseudo selectors
                        sel = cleanUpSelector(selector);

                        sel.forEach(function (s) {

                            if (selectors[s]) {
                                selectors[s]++;
                            } else {
                                selectors[s] = 1;
                            }
                        });
                    });
                    break;
            }
        });
        sortSelectors(selectors);

        sels = makeIdClassArrays(selectors);

        log('[d] selectors: \n', selectors);
        log('[d] selectors that git-grep will use: \n', sels);
        log('[d] original selectors: \n', original_selectors);
        
        emitter.emit('parseRules_ok');
    }
}

function cleanUpSelector (selector) {
    var ret = [],
        s = selector.split(/[\s>]+/),
        tmp;

    s.forEach(function (a) {
        tmp = a.replace(/:link|:visited|:hover|:active|:focus|:hover|:target|:enabled|:disabled|:checked|:indeterminate|:root|:first-child|:last-child|:nth-child\([a-z1-9-+]+\)|:nth-of-type\([a-z1-9-+]+\)|:first-of-type|:last-of-type|:nth-last-of-type\([a-z1-9-+]+\)|:nth-last-child\([a-z1-9-+]+\)|:only-of-type|:not\([a-z1-9-+.:#]+\)|::first-letter|::first-line|:lang|::before|::after|:before|:after|::selection/g, '');
        tmp = tmp.match(/[#|.][a-z1-9_-]+/gi);

        if (tmp) {
            ret = ret.concat(tmp);
        }
    });

    selectors_length += ret.length;
    return ret;
}

function makeIdClassArrays (selectors) {
    var s,
        ret = { 'ids': [], 'classes': [] };

    for (s in selectors) {
        if (s.indexOf('#') > -1) {
            s = s.replace('#', '');

            if (ret['ids'].indexOf(s) < 0) {
                ret['ids'].push(s);
            }
        }
        if (s.indexOf('.') > -1) {
            s = s.replace('.', '');
           
           if (ret['classes'].indexOf(s) < 0) {
                ret['classes'].push(s);
            }
        }
    }

    return ret;
}

// keep track of order on global var sorted, from most used to less, for the report
function sortSelectors (selectors) {
    sorted = Object.keys(selectors).sort(function(a, b) {
        return -(selectors[a] - selectors[b]);
    });
    return sorted;
}

// just test if it's a valid repo
function testGit () {
    run ('cd ' + repo + ' && git branch', function (err) {
        if (err) {
            log('[e] '+ repo +': %s', err);
        } else {
            emitter.emit('testGit_ok');
        }
    });
}

function grepCss () {
    log('[s] The original CSS has %d selectors', original_selectors.length);
    log('[s] Getting nested, removing :pseudos and duplicates, %d were found ('+ Object.keys(sels['ids']).length +' ids and '+ Object.keys(sels['classes']).length +' classes)', Object.keys(selectors).length);
    log('[s] Executing git-grep on '+ repo +' for each selector...');

    var ids_len = (sels['ids'].length -1);

    // unite all selectors
    var all_s = sels['ids'].concat(sels['classes']);

    if (opt.exclude) {
        log('[s] --exclude detected. Will not match selectors with "%s"', opt.exclude);
    }

    all_s.forEach(function (sel, idx) {
        grepMe(sel, idx, (all_s.length -1), ids_len);
    });
}

function grepMe (str, idx, all_len, ids_len) {
    var id_or_class,
        ghost_key,
        cmd;

    log('[d] grepping %s', str);

    cmd = "cd "+ repo +" && git grep -q '"+ str +"' -- " + files_to_grep;

    run(cmd, function (err) {

        if (err) {
            if (idx < ids_len) {
                id_or_class = '[id]    #';
                ghost_key = 'ids';
            } else {
                id_or_class = '[class] .';
                ghost_key = 'classes';
            }

            if (opt.exclude) {
                if (str.indexOf(opt.exclude) < 0) {
                    ghosts[ghost_key].push(str);
                    ghosts_len++;
                    log('[w] NOT FOUND: '+ id_or_class +'%s', str);
                }
            } else {
                ghosts[ghost_key].push(str);
                ghosts_len++;
                log('[w] NOT FOUND: '+ id_or_class +'%s', str);
            }
        }
        if (ghosts_count === all_len) {
            emitter.emit('grepCss_ok');
        }
        ghosts_count++;
    });
}

function gitLogAllTheThings () {
    log('[s] %d 👻  selectors found', ghosts_len);
    log('[s] Now git logs will be checked against the ghosts...');
    if (opt.reverse) {
        log('[s] --reverse option detected, will be passed to git-log');
    }
    log('[s] This could take some time, go grab a ☕️');

    var prefix,
        all_ghosts,
        ids_len = (ghosts['ids'].length);

    // bind them
    all_ghosts = ghosts['ids'].concat(ghosts['classes']);

    all_ghosts.forEach(function (g, idx) {
        prefix = (idx < ids_len) ? '#' : '.';
        logMe(prefix + g, idx, prefix);
    });

}

function logMe (str, idx, prefix) {
    log('[d] Checking logs for %s...', str);

    var ghost_key = (prefix === '#') ? 'ids' : 'classes',
        otmp = {},
        reverse = (opt.reverse) ? '--reverse' : '',
        cmd;

    cmd = "cd "+ repo +" && git log -S"+ str +" "+ reverse +" --format='%h||%s||%aN||%ar' -- '*.css' | head -1";
    
    run(cmd, function (err, out) {
        if (err) {
            log('[e] %s', err);
            return;
        }

        logs_count++;

        if (out) {
            otmp[str] =  out.toString().trim();
            logs[ghost_key].push(otmp);
            logs_len++;

            if (opt.reverse) {
                log('[w] First trace of '+ str +': %s', out.toString().trim().replace(/\|\|/g, ' - '));
            } else {
                log('[w] Latest trace of '+ str +': %s', out.toString().trim().replace(/\|\|/g, ' - '));
            }
        }

        if (logs_count === ghosts_len) {
            emitter.emit('gitLogAllTheThings_ok');
        }
    });
}

function reportName () {
    return opt.css.replace('//','').replace(':','').replace('/','-').replace('.css','.html');
}

function createReport () {
    log('[s] Reported generated on %s', reportName());
}