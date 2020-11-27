
var http = require('http'),
    https = require('https'),
    url = require('url'),
    fs = require('fs'),
    ttr = 1000,
    getMtime = function(stat_response) {
        return +stat_response.mtime;
    },
    srvHost = 'http://127.0.0.1',
    srvPort = 1234,
    isPortTaken = function(port, fn) {
        var net = require('net'),
            tester = net.createServer();
        tester.once('error', function (err) {
            if (err.code != 'EADDRINUSE') return fn(err);
            fn(null, true);
        }).once('listening', function() {
            tester.once('close', function() { fn(null, false) })
            .close();
        }).listen(port);
    },
    referers = [
        'https://www.google.com',
        'http://www.stailamedia.com',
        'http://www.jmvc.org',
        'http://www.freakstyle.it'
    ],
    refererLen = referers.length,
    refererIndex = 0;

function nextReferer() {
    refererIndex = (++refererIndex) % refererLen;
    return referers[refererIndex];
}

function XhrWatch() {
    this.files = {
        relative : {},
        net : {}
    };
}

XhrWatch.prototype.start = function () {
    var BW = this;
    (function findUnusedPort() {
        isPortTaken(srvPort, function(err, taken){
            if (taken) {
                srvPort++;
                findUnusedPort();
            } else {
                start();
            }
        })
    })();
    function start() {
        http.createServer(function (request, response) {
            response.writeHead(200, {
                'Content-Type': 'application/javascript',
                'Access-Control-Allow-Origin' : '*'
            });
            BW.check(function (res) {
                response.end(res ? 'document.location.reload();' : ';');
            });
        }).listen(srvPort);
    }
};

XhrWatch.prototype.addFile = function (type, filePath) {
    var BW = this,
        stats, parse,
        host, pathname, port, params = {}, lib;

    if (!(filePath in this.files[type])) {
        setTimeout(() => {
            try {
                switch (type) {
                    case 'relative':
                        if (fs.existsSync(filePath)) {
                            stats = fs.statSync(filePath);
                            BW.files[type][filePath] = getMtime(stats);
                        } else {
                            delete BW.files[type][filePath];
                        }
                        
                    break;

                    case 'net' :
                        parse = url.parse(filePath);

                        lib = parse.protocol == 'https:' ? https : http;

                        lib.request({
                            method: 'HEAD',
                            host: parse.host,
                            port: parse.port || (lib == http ? 80 : 443),
                            path: parse.pathname
                        }, function(res) {
                            BW.files.net[filePath] = +new Date(res.headers['last-modified']);
                        }).end();
                    break;
                }
            } catch (e) {
                console.log('Malta-browser-refresh [error]:'.red())
                console.log(e);
            }
        }, 100)
    }
};

XhrWatch.prototype.check = function (cb) {
    var res = false,
        BW = this,
        _path, _url,
        updates = {
            relative : {},
            net : {}
        },
        Irelative = 0,
        Inet = 0,
        Nrelative = Object.keys(BW.files.relative).length,
        Nnet = Object.keys(BW.files.net).length;

    // relatives
    for (_path in BW.files.relative) {
        (function (p){
            try {
                if (fs.existsSync(p)) {
                    fs.stat(p, function (err, stats) {
                        if (BW.files.relative[p] < getMtime(stats)) {
                            updates.relative[p] = getMtime(stats);
                            console.log('Malta-browser-refresh ['+ ('modified ' + p).white() + ']')
                            res = true;
                        }
                        Irelative++;
                        innerCheck();
                    });
                } else {
                    Irelative++;
                    delete BW.files.relative[p];
                }
            } catch(e) {
                console.log('Malta-browser-refresh [error]:'.red())
                console.log(e);
            }
        })(_path);
    }

    // online
    for (_url in BW.files.net) {
        (function (u) {
            var parse = url.parse(u),
                lib = u.match(/https:/) ? https : http,
                req;
            try {
                req = lib.request({
                    method: 'HEAD',
                    host: parse.host,
                    port: parse.port || (lib == http ? 80 : 443),
                    path: parse.pathname,
                    headers : {'Referer' : nextReferer()}
                }, function (r) {
                    var d = +new Date(r.headers['last-modified']);
                    
                    if (BW.files.net[u] < d){
                        updates.net[u] = d;
                        console.log('Malta-browser-refresh ['+ ('modified ' + u).white() + ']')
                        res = true; 
                    }
                    Inet++;
                    innerCheck();
                })
                req.on('error', function(err) {
                    console.log('Malta-browser-refresh [error polling ' + u + ']')
                    console.log('... the file will be ignored'.red());
                    delete BW.files.net[u];
                })
                req.end();
            } catch(e){
                console.log('Malta-browser-refresh [error]:'.red())
                console.log(e);
            }
            
        })(_url);
    }
    
    function innerCheck() {
        /**
         * only if every file has been checked
         * invoke the callback passing res
         */
        if (Irelative == Nrelative && Inet ==Nnet) {
            setTimeout(function () {
                for (tmp in updates.relative) {
                    BW.files.relative[tmp] = updates.relative[tmp];
                }
                for (tmp in updates.net) {
                    BW.files.net[tmp] = updates.net[tmp];
                }
            }, ttr);
            cb(res);
        }
    }
};

XhrWatch.script = function () {
    return `(function () {
        var t = window.setInterval(function () {
            var s = document.createElement('script'),
                srvHost = "${srvHost}",
                srvPort = ${srvPort};
            s.onload = function () {document.body.removeChild(s);};
            s.onerror = function () {
                document.body.removeChild(s);
                console.log('Looks like Malta is not running')
                window.clearInterval(t);
            };
            s.src = srvHost + ':' + srvPort + "?" + +new Date;
            document.body.appendChild(s);
        }, ${ttr});
    })()`;
};
module.exports = XhrWatch;
