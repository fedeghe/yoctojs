Y(function () {
    (function () {
        var t = Y('#one span')
        t.style({
            color:'red'
        }).setAttrs({
            title: function (el) {
                return el.innerHTML
            }
        }).on('click', function (e, el) {
            Y(el).html('yeah')
        })
    })();

    (function () {
        var b = Y('#two button'),
            p = Y('#two p');
        b.on('click', function (){
            p.toggle();
        });
    })();

    (function () {
        var b = Y('<button>click</button>'),
            p = Y('<p></p>');
        Y('#three').append(b)   
        Y('#three').append(p)
        p.html('some content');

        b.on('click', function (){
            p.toggle();
        });
    })();



    (function () {
        var b = Y('<button>click</button>');
        Y('#four').append(b);
        b.on('click', function () {
            var self = Y(this),
                position = self.style(['left', 'right'])
            self.move(position[0].right === '10px' ? 'left' : 'right');
        })
        Y.extend(function move(where) {
            where === 'right' 
            ? this.style({position:'absolute', [where]: '10px', left:'', top: '10px'})
            : this.style({position:'absolute', [where]: '10px', right: '', top: '10px'});
        });
    })();
/*
    t.get(0).on('click', function () {
        p.toggle()
    })
    t.once('click', function () {
        console.log(this)
    })

    

    var e = t.get(0)
    var p = Y('p')
    p.removeAttrs( 'title').once('click', function _(e) {
        console.log(e)
    })
    var u = Y('<span class="ciccio">hello there</span>') 
    u.addClass('a', 'b', 'c', 'foofoo')
    u.removeClass('b', 'c', 'foo')
    u.replaceClass('foofoo', 'bar')
    Y.extend(function al(name){
        console.log(name, this.get(0).html())
    })
    u.al('miiii')
    e.al('miiii')
    p.append(Y('<strong>XXX</strong>').style({color:'green'}))
*/
})