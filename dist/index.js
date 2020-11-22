/*
~3.1KB
*/
!function(t){var n;"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):(n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n.Y=t.call(n))}(function(){function t(t){return[].slice.call(t)}function n(t){if(Array.isArray&&Array.isArray(t))return!0;var n=String(t)!==t,e={}.toString.call(t).match(/\[object\sArray\]/);return n&&!(!e||!e.length)}function e(t){return"object"==typeof HTMLElement?t instanceof HTMLElement:t&&"object"==typeof t&&void 0!==t.nodeType&&1===t.nodeType&&"string"==typeof t.nodeName}function i(t){return new r(t)}var r=function(i,r){this.els=[];var o=typeof i;if("function"===o)this.ready(i);else if("string"===o)if(i.match(/^\</)){var s=document.createElement("div");s.innerHTML=i,this.els=[].slice.call(s.children)}else this.els=t((r||document).querySelectorAll(i));else e(i)?this.els=[i]:n(i)&&(this.els=i)},o=r.prototype;return o.forEach=function(t){this.els.forEach(function(n){t.bind(n)()})},o.ready=function(t){document.addEventListener("DOMContentLoaded",t,!1)},o.style=function(t){return this.forEach(function(){for(var n in t)this.style[n]=t[n]}),this},o.setAttrs=function(t){return this.forEach(function(){for(var n in t)this.setAttribute(n,"function"==typeof t[n]?t[n](this):t[n])}),this},o.getAttrs=function(){var n=t(arguments);return this.els.map(function(t){return n.reduce(function(n,e){return n[e]=t.getAttribute(e),n},{})})},o.removeAttrs=function(){var n=t(arguments);return this.forEach(function(){var t=this;n.forEach(function(n){t.removeAttribute(n)})}),this},o.on=function(t,n){return this.forEach(function(){this.addEventListener(t,n,!1)})},o.off=function(t,n){return this.forEach(function(){this.removeEventListener(t,n,!1)})},o.once=function(t,n){var e=this;return this.forEach(function(){e.on(t,function i(r){n(r),e.off(t,i)},!1)}),this},o.parent=function(){return this.els.map(function(t){return t.parentNode})},o.get=function(t){return t<this.els.length?new r(this.els[t]):null},o.addClass=function(){var n=t(arguments);return this.forEach(function(){var t=this,e=t.className.split(/\s/);n.forEach(function(t){e.indexOf(t)<0&&e.push(t)}),t.className=e.join(" ")}),this},o.removeClass=function(){var n=t(arguments);return this.forEach(function(){var t=this,e=t.className.split(/\s/);n.forEach(function(t){var n=e.indexOf(t);n>=0&&e.splice(n,1)}),t.className=e.join(" ")}),this},o.replaceClass=function(t,n){return this.forEach(function(){var e=this,i=e.className.split(/\s/),r=i.indexOf(t);r>=0&&(i.splice(r,1),i.push(n),e.className=i.join(" "))}),this},o.html=function(t){return"undefined"==typeof v?this.els.map(function(t){return t.innerHTML}):(this.forEach(function(){this.innerHTML=t}),this)},o.show=function(){return this.forEach(function(){this.style.display="none"}),this},o.hide=function(){return this.forEach(function(){this.style.display=""}),this},o.toggle=function(){return this.forEach(function(){this.style.display="none"===this.style.display?"":"none"}),this},i.extend=function(n){n.name in r.prototype||(r.prototype[n.name]=function(){n.apply(this,t(arguments))})},i});