# js0n

## TL;DR

Binary javascript data structures encoder/decoder. It supports JSON + TypedArrays
+ custom structures and encodings like compression etc.

<pre>
    const input = {...};
    const encoded = js0n.dump(input);
    // encoded is an ArrayBuffer
    const decoded = js0n.load(encoded);
    // decoded == input
</pre>

## Introduction

This software is the javascript implementation of the **js0n** specification.

It was designed for optimised transfer and caching of large amount of
scientific visualisation data inside browser. It was originally developed for
a WebGL visualisation project inside National ICT Australia. In addition to
said purpose, it allowed direct transfer of texture data into GPU, allowed
browser to not crash from having large amount of data in text form and provided
performance benefits from not having too many in memory items. This
implementation correlates to an updated specification with additional
optimisation options. It is turned into a seperate project to increase its
reuse across internal and external NICTA projects.

## License

The MIT License (MIT)
Copyright (c) 2014-2016 National ICT Australia

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
