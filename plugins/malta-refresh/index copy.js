/**
 * load dependencies and whatever needed
 */
const path = require('path'),
    fs = require('fs'),
    xhrWatch = require('./xhrWatch'),
    wsWatch = require('./wsWatch'),
    strategies = {
        xhr: xhrWatch,
        ws: wsWatch
    },
    
    createbWatch = function (type) {
        bW = new strategies[type]();
        script = strategies[type].script(type);
		bW.start();
    };
let script = null,
    bW = null;
    
function malta_refresh(obj, options) {
    
    options = options || {};
    if (!('files' in options)) {
		options.files = [];
    }
    
    const self = this,
        defaultMode = 'xhr',
        mode = (options.mode && Object.keys(strategies).includes(options.mode))
            ? options.mode
            : defaultMode,
		start = new Date(),
		pluginName = path.basename(path.dirname(__filename)),
        baseFolder = path.dirname(obj.name);
    
    !bW && createbWatch(mode);

    let msg,
		fileNum,
		tmp,
        fileI = 0;
        
    function digForFiles(type) {
        var rex = {
                js : {
                    outer : /<script[^>]*?src=\"([^"]*)\"[^>]*?>[\s\S]*?<\/script>/gi,
                    inner : /src=\"([^"]*)\"/
                },
                css : {
                    outer : /<link[^>]*?href=\"([^"]*)\"[^>]*?\/?>/gi,
                    inner : /href=\"([^"]*)\"/
                }
            },
            scripts = obj.content.match(rex.js.outer),
            styles = obj.content.match(rex.css.outer),
            i, l, tmp, rel;

        if (scripts) {
            for (i = 0, l = scripts.length; i < l; i++) {
                tmp = scripts[i].match(rex.js.inner);
                if (tmp) {
                    tmp[1] = tmp[1].replace(/^\/\//, 'http://');
                    tmp[1] = tmp[1].replace(/^\//, '');
                    rel = isRelative(tmp[1]);

                    if (rel ? type.match(/relative|\*/) : type.match(/net|\*/)) {
                        bW.addFile(
                            rel ? 'relative' : 'net',
                            rel ? path.resolve(baseFolder, tmp[1]) : tmp[1]
                        );
                    }
                }
            }
        }
        if (styles) {
            for (i = 0, l = styles.length; i < l; i++) {
                tmp = styles[i].match(rex.css.inner);
                if (tmp) {
                    tmp[1] = tmp[1].replace(/^\/\//, 'http://');
                    tmp[1] = tmp[1].replace(/^\//, '');

                    rel = isRelative(tmp[1]);
                    if (rel ? type.match(/relative|\*/) : type.match(/net|\*/)) {
                        bW.addFile(
                            rel ? 'relative' : 'net',
                            rel ? path.resolve(baseFolder, tmp[1]) : tmp[1]
                        );
                    }
                }
            }
        }
    }
    
    try {
        obj.content = obj.content.replace(/\<\/body\>/, '<script>' + script + '</script></body>');
    } catch (err) {
        self.doErr(err, obj, pluginName);
    }
	
	function isRelative(path) {
		return !(path.match(/^http|\/\//));
	}    

    // add the html by default
    //
	bW.addFile('relative', path.resolve(baseFolder, obj.name));
	if (options.files == "*") {
		digForFiles("*");
	} else if (options.files == "net") {
		digForFiles("net");
	} else if (options.files == "relative") {
		digForFiles("relative");
	} else {
		fileNum = options.files.length;
		for (fileI = 0; fileI < fileNum; fileI++) {
			
			tmp = isRelative(options.files[fileI]);
			bW.addFile(
				tmp ? 'relative' : 'net',
				tmp ? path.resolve(baseFolder, options.files[fileI]) : options.files[fileI]
			);
		}
    }

	return (solve, reject) => {
        fs.writeFile(obj.name, obj.content, err => {
            err && self.doErr(err, obj, pluginName);
            msg = 'plugin ' + pluginName.white() + ' wrote ' + obj.name + ' (' + self.getSize(obj.name) + ')';
            solve(obj);
            self.notifyAndUnlock(start, msg);
        });
	};
}
malta_refresh.ext = ['html', 'md', 'pug'];
module.exports = malta_refresh;