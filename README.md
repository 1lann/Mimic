# Mimic

### Mimic is no longer being maintained (if you haven't figured it out already).

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

A fully featured emulator for the [Minecraft](http://minecraft.net) mod [ComputerCraft](http://computercraft.info) that runs straight in your browser.

Mimic makes use of
* [Emscripten](https://github.com/kripken/emscripten) - allowing a direct port of Lua 5.1 into JavaScript
* [asm.js](http://asmjs.org/) - the engine behind Emscripten
* [lua5.1.js](https://github.com/logiceditor-com/lua5.1.js/) - a library built by Emscripten
* [Jquery](http://jquery.com/) - a masterful DOM manipulation library
* [Ace Editor](http://ace.c9.io/) - a pure JavaScript editor
* [Bootstrap](http://getbootstrap.com/) - a CSS framework
* [BrowserFS.js](https://github.com/jvilk/BrowserFS) - an emulation of the Node.JS filesystem API using LocalStorage and read-only ZIP backends
* [Purl](https://github.com/allmarkedup/purl) - parsing of URL parameters
* [PrefixFree](http://leaverou.github.io/prefixfree/) - removes the need for vendor prefixes in CSS
* [xdRequest](https://code.google.com/p/xdrequest/) - allows cross site HTTP requests
* [FileSaver.js Polyfill](https://github.com/eligrey/FileSaver.js) - library to download content to the computer
* [Blob.js Polyfill](https://github.com/eligrey/Blob.js) - a FileSaver.js dependency
* The default rom files that come with ComputerCraft


### Credits

* Made by [GravityScore](https://github.com/GravityScore) and [1lann](https://github.com/1lann)
* ComputerCraft by dan200 (Twitter: [@DanTwoHundred](https://twitter.com/dan200))
* lua5.1.js by [Alexander Gladysh](https://github.com/agladysh)


### License

Mimic is (as of October 2016, now) licensed under The MIT license

```
Copyright (c) 2016 Jason Chu (1lann) and Bennett Anderson (GravityScore).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

Note this license does not (necessarily) apply for material used in Mimic that we do not own.


### lua5.1.js License

lua5.1.js is licensed under the MIT license, shown above.

```
lua5.1.js: Copyright (c) 2013, LogicEditor <info@logiceditor.com>
           Copyright (c) 2013, lua5.1.js authors (see AUTHORS)
```

Link: [lua5.1.js](https://github.com/logiceditor-com/lua5.1.js/)


### Emscripten License

Emscripten is licensed under the MIT license, shown above.

```
Copyright (c) 2010-2014 Emscripten authors, see AUTHORS file.
```

Link: [Emscripten](https://github.com/kripken/emscripten)

### Purl License

Purl is licensed under the MIT license, shown above.

```
Copyright (c) 2012 Mark Perkins, http://allmarkedup.com/
```

Link: [Purl](https://github.com/allmarkedup/purl)
