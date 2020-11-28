const WebSocket = require('ws'),
    http = require('http'),
    fs = require('fs'),
    ttr = 1000,
    getMtime = function(stat_response) {
        return +stat_response.mtime;
    },
    srvHost = '127.0.0.1',
    srvPort = 2345,
    scripts = {
        xhr: `(function () {
    var t = window.setInterval(function () {
        var s = document.createElement('script'),
            srvHost = "http://${srvHost}",
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
})()`,
        ws: `(function () {
    var socket = new WebSocket('ws://${srvHost}:${srvPort}');

    socket.addEventListener('message', function (event) {
        var d = JSON.parse(event.data);
        if (d.reload) {
            console.log('Reloading browser: ', +new Date);
            document.location.reload()
        }
    });
    window.onbeforeunload = function() {
        console.log('closing')
        socket.onclose = function () {};
        socket.close();
    };
})()`
    },
    starters = {
        xhr: function start() {
            const inst = this;
            http.createServer(function (request, response) {
                response.writeHead(200, {
                    'Content-Type': 'application/javascript',
                    'Access-Control-Allow-Origin' : '*'
                });
                inst.setChangeListener(function (res) {
                    response.end(res ? 'document.location.reload();' : ';');
                });
            }).listen(srvPort);
        },
        ws: function start() {
            const inst = this;
            if (!wss) {
                console.log('created; ', +new Date)
                wss = new WebSocket.Server({port: srvPort});
                wss.on('connection', function connection(ws) {
                    inst.setChangeListener(function (res) {
                        wss.clients.forEach(function each(client) {
                            if (client.readyState === WebSocket.OPEN) {
                              client.send(res ? JSON.stringify({reload: true}) : '{}');
                            }
                        });
                    });
                });
                wss.on('close', (/* ws */) =>  {
                    inter && clearInterval(inter);
                });
            }
        }
    };

let wss = null,         // WS
    inter = null;       // WS

function Xwatch(mode) {
    this.mode = mode;
    this.files = [];
}
Xwatch.prototype.setChangeListener = function (cb) {
    this.files.forEach(file => {
        fs.watch(file, () => {
            cb(true)
        })
    })
};
Xwatch.prototype.start = function () {
    const BW = this,
        isPortTaken = (port, fn) => {
            const net = require('net'),
                tester = net.createServer();
            tester.once('error',  err => {
                if (err.code != 'EADDRINUSE') return fn(err);
                fn(null, true)
            }).once('listening', () => {
                tester.once('close', function() { fn(null, false) })
                .close()
            }).listen(port)
        };

    (function findUnusedPort() {
        isPortTaken(srvPort, (err, taken) => {
            if (taken) {
                srvPort++;
                findUnusedPort();
            } else {
                starters[BW.mode].call(BW);
            }
        })
    })();
};

Xwatch.prototype.getScript = function () {
    return scripts[this.mode];
}

Xwatch.prototype.addFile = function (filePath) {   
    const index = this.files.indexOf(filePath) 
    if (index < 0) {
        setTimeout(() => {
            try {        
                if (fs.existsSync(filePath)) {
                    this.files.push(filePath);
                }
            } catch (e) {
                console.log('Malta-browser-refresh [error]:'.red())
                console.log(e);
            }
        }, 100)
    }
};


module.exports = Xwatch;