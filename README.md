# YoctoJs

A light weight DOM utility library.

## Try it

Fork me and run
``` 
> yarn buildev
```

then navigate to the example at http://127.0.0.1:3001  
tune the code in the example (or the core) to see it live.

## documentation (wip)

### function Y

Y is the main function to be used as starter/ selector / constructor
``` js
var b = Y('body p');                            // get all paragraphs in the body (wrapped in Y)
var myNode = Y('<span>New paragraph</span>');   // creates a span tag (wrapped in Y)
Y(function () { console.log('ready'); });       // dom ready
```
or combine them adding an event handler and some styles

``` js
var s = Y('<span>Hello world</span>');
s.style({
    color:'red',
    'font-family': 'verdana'
}).on('click', function () {
    Y(this).style({color: 'green'});
});
Y('body').append(s);
```

---
###### Better documentation will come asap, btw this is just an experiment ;)