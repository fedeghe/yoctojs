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
            Y(el).style({color:'green'}).html('yeah')
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
        b.on('click', function (e, el) {
             // use b || Y(this) || Y(el)
            var position = b.style(['right'])
            b.move(position[0].right === '10px' ? 'left' : 'right');
        })
        Y.extend(function move(where) {
            where === 'right' 
            ? this.style({position:'absolute', [where]: '10px', left:'', top: '10px'})
            : this.style({position:'absolute', [where]: '10px', right: '', top: '10px'});
        });
    })();

})