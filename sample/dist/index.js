(function(fn) {
            var root
	if (typeof exports === "object" && typeof module !== "undefined") {
		module.exports = fn();
	} else if (typeof define === "function" && define.amd) {
		define([], fn);
	} else {
		if (typeof window !== "undefined") {
			root = window;
		} else if (typeof global !== "undefined") {
			root = global;
		} else if (typeof self !== "undefined") {
			root = self;
		} else {
			root = this;
		}
		root.Y = fn.call(root);
	}
})(function _() {
    function toArr(args) {
        return [].slice.call(args)
    }
    function isArray(o) {
        if (Array.isArray && Array.isArray(o)) {
            return true;
        }
        var t1 = String(o) !== o,
            t2 = ({}).toString.call(o).match(/\[object\sArray\]/);
        return t1 && !!(t2 && t2.length);
    }
    function isElement(o) {
        return (
            typeof HTMLElement === 'object'
                ? o instanceof HTMLElement
                : o && typeof o === 'object' && // DOM2
                    typeof o.nodeType !== 'undefined' && o.nodeType === 1 &&
                    typeof o.nodeName === 'string'
        );
    }

    var Y = function (s) {
        this.els = [];
        var type = typeof s;
        
        // if a function then let's treat that as a ready
        //
        if (type === 'function') {
            this.ready(s);

        // if it's a string could be 
        // 1) selector
        // 2) tag to be created
        } else if ( type === 'string') {
            if (s.match(/^\</)) {
                var tmp = document.createElement('div');
                tmp.innerHTML = s;
                this.els = [].slice.call(tmp.children);
            } else {
                this.els = toArr(document.querySelectorAll(s));
            }
        } else if (isElement(s)) {
            this.els = [s];
        } else if (isArray(s)) {
            this.els = s;
        }
    };

    Y.prototype = {
        forEach: function (f) {
            this.els.forEach(function(el, i) {
                f.bind(el)(i)
            })
        },

        ready: function (f) {
            document.addEventListener('DOMContentLoaded', f, false);
        },
        style: function (v) {
            if (isArray(v)) {
                var ret = []
                this.forEach(function (i) {
                    var el = this
                    ret[i] = v.reduce(function (acc, val){
                        acc[val] = el.style[val]
                        return acc
                    }, {})
                })
                return ret
            }
            this.forEach(function () {
                for (var k in v) {
                    this.style[k] = v[k];
                }
            });
            return this
        },
        setAttrs: function (a) {
            this.forEach(function () {
                for (var n in a) {
                    this.setAttribute(n, typeof a[n] === 'function' ? a[n](this) : a[n]);
                }
            });
            return this;
        },
        getAttrs: function () {
            var a = toArr(arguments);
            return this.els.map(function (el){
                return a.reduce(function (acc, attr) {
                    acc[attr] = el.getAttribute(attr);
                    return acc;
                }, {})
            });
        },
        removeAttrs: function () {
            var a = toArr(arguments);
            this.forEach(function () {
                var self = this;
                a.forEach(function (attr) {
                    self.removeAttribute(attr);
                });
            });
            return this;
        },
        on: function (eventType, fn) {
            var $ = this
            this.forEach(function () {
                var el = this;
                this.addEventListener(eventType, function (e){
                    return fn.bind(el)(e, el);
                }, false);
            });
            return this
        },
        off: function (type, fn) {
            this.forEach(function () {
                this.removeEventListener(type, fn, false);
            });
            return this;
        },
        once: function (eventType, fn) {
            this.forEach(function () {
                var $ = this;
                this.addEventListener(eventType, function h(e) {
                    fn(e);
                    $.removeEventListener(eventType, h, false);
                }, false);
            });
            return this;
        },
        parent: function () {
            return this.els.map(function (el) {
                return el.parentNode;
            })
        },
        get: function(n) {
            return n < this.els.length ? new Y(this.els[n]) : null;
        },
        addClass: function () {
            var adds = toArr(arguments);
            this.forEach(function () {
                var $ = this,
                    cls = $.className.split(/\s/);
                adds.forEach(function (add) {
                    if (cls.indexOf(add) < 0) {
                        cls.push(add);
                    }
                });
                $.className = cls.join(' ');
            });
            return this;
        },
        removeClass: function () {
            var rms = toArr(arguments);
            this.forEach(function () {
                var $ = this,
                    cls = $.className.split(/\s/);
                rms.forEach(function (rm) {
                    var index = cls.indexOf(rm);
                    if (index >= 0) {
                        cls.splice(index, 1);
                    }
                });
                $.className = cls.join(' ');
            });
            return this;
        },
        replaceClass: function (outClass, inClass) {
            this.forEach(function () {
                var $ = this,
                    cls = $.className.split(/\s/),
                    index = cls.indexOf(outClass);
                if (index >= 0) {
                    cls.splice(index, 1);
                    cls.push(inClass)
                    $.className = cls.join(' ')
                }
            });
            return this;
        },
        html : function (h) {
            if (typeof h === 'undefined') {
                return this.els.map(function (el) {
                    return el.innerHTML
                })
            }
            this.forEach(function () {
                this.innerHTML = h
            })
            return this
        },
        show : function () {
            this.forEach(function () {
                this.style.display = 'none';
            });
            return this;
        },
        hide : function () {
            this.forEach(function () {
                this.style.display = '';
            });
            return this;
        },
        toggle : function () {
            this.forEach(function () {
                this.style.display = this.style.display === 'none' ? '' : 'none'
            })
            return this;
        },
        append: function (what) {
            this.forEach(function () {
                var p = this;
                what.forEach(function () {
                    p.appendChild(this)
                })
            })
            return this;
        },
        // wrap: function (what) {
        //     this.forEach(function () {
        //         var p = this.parentNode;
        //         what.
        //     })
        //     return this;
        // }
    };
    function factory(sel) {
        return new Y(sel);
    };

    factory.extend = function (f) {
        if (!(f.name in Y.prototype))
            Y.prototype[f.name] = function () {
                f.apply(this, toArr(arguments));
            };
    };
    return factory
}
);