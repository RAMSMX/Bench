# Bench <sup>v0.1.0</sup>

Bench doesn't aim to be a full benchmarking tool. It's for simple testing and comparision purposes. Don't rely on it's results as a statistic tool.

## Why Bench?

While developing javascript web apps, I found the need to compare some pieces of code trying to get the best performance.

While [Benchmark.js](http://benchmarkjs.com/) is a very accurate and full-featured tool, that was simply too much for my needs. I needed something simple and fast.

## Usage

In the browser, just add:

```html
<script type='text/javascript' src='/path/to/Bench.js'></script>
```
To run a simple piece of code, you can try out something like this:

```js
var fn = function () {
    // Some complex code here
    console.log('List of arguments: ' + Array.prototype.slice.call(arguments).join(','));
};

Bench.run(fn, null, 'one', 'two', 'three');
// -> List of arguments: one,two,three
// -> 135 (the number of milliseconds)
```

Besides, Bench can be used as a class.

```js
var fn = function () {
    // More fancy complex code here
    console.log('List of arguments: ' + Array.prototype.slice.call(arguments).join(','));
};

var test = new Bench(fn);

test.run('one', 'two', 'three');
// -> List of arguments: one,two,three
// -> 135 (the number of milliseconds)

test.opsPerSecond();
// -> (will print hundreds of times the 'List of arguments...' line)
// -> 1234567.8 (the number of operations performed in exactly one second)
```

## Docs

I'm working out a full list of function names, attributes and so, but for now, you can check out the code, it's got a lot of comments and it's pretty easy to use.