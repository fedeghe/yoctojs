/**
 * load dependencies and whatever needed
 */
const path = require('path'),
    fs = require('fs'),
    xwatch = require('./xwatch'),
    createbWatch = function (type) {
        bW = new xwatch(type);
        script = bW.getScript();
		bW.start();
    };

let script = null,
    bW = null;

function malta_refresh(obj, options) {
    options = options || {};
    const self = this,
        defaultMode = 'ws',
        mode = options.mode || defaultMode,
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
                    bW.addFile(path.resolve(baseFolder, tmp[1]));
                }
            }
        }
        if (styles) {
            for (i = 0, l = styles.length; i < l; i++) {
                tmp = styles[i].match(rex.css.inner);
                if (tmp) {
                    bW.addFile(path.resolve(baseFolder, tmp[1]));
                }
            }
        }
    }
    
    try {
        obj.content = obj.content.replace(/\<\/body\>/, '<script>' + script + '</script></body>');
    } catch (err) {
        self.doErr(err, obj, pluginName);
    }
	
	// function isRelative(path) {
	// 	return !(path.match(/^http|\/\//));
	// }    

    // add the html by default
    //
    bW.addFile(path.resolve(baseFolder, obj.name));
    digForFiles();

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