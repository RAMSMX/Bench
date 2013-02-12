/*
 *  Bench.js
 *  --------
 *  (c) 2013 Juan Lorenzo Hernandez Cruz
 *  Bench.js is freely distributable under the terms of the BSD license
 *  
 *  Bench doesn't aim to be a full benchmarking tool. It's for simple
 *  testing purposes. Don't rely on it's results as a statistic tool.
*/
(function () {
    var me = this,
        op = Object.prototype,
        slice = Array.prototype.slice,
        isFn = function (obj) {
            return op.toString.call(obj) === '[object Function]';
        };
    /**
     * Class Bench
     *
     * Bench is originally meant to be used as a class.
     * It wraps all the available tests inside it's prototype.
     *
     * An example of use would be:
     *
     *     var fn = function () {
     *         var a = Array.prototype.slice.call(arguments);
     *         // Some fancy code
     *         console.log('Arguments: "' + a.join(',') + '"');
     *         // More fancy code
     *     };
     *     var test = new Bench(fn, this, ['one', 'two', 'three']);
     *     test.run();
     *     // -> Arguments: "one,two,three"
     *
     * @param times (optional) {Integer} The number of repetitions
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     * @param args (optional) {Array} The arguments to be sent to the function when
     * it's executed
     */
    function Bench(times, fn, scope, args) {
        if (isFn(times)) {
            args = scope;
            scope = fn;
            fn = times;
            times = Bench.DEFAULT_REPETITIONS;
        }
        if (!isFn(fn)) throw new Error('You must provide a valid function');
        this.fn = fn;
        this.times = times;
        this.scope = scope || me;
        this.args = args || [];
    };
    /**
     * Current version of the file.
     */
    Bench.VERISION = '0.1.0';
    /**
     * If true, attempts to catch all exceptions thrown when calling
     * a function. Otherwise, the exceptions won't be handled.
     */
    Bench.CATCH_ERRORS = false;
    /**
     * The default number of repetitions when the argument 'times'
     * is not provided. The bigger, the better.
     */
    Bench.DEFAULT_REPETITIONS = 10;
    /**
     * Save the previous reference of the 'Bench' object.
     */
    var previousBench = me.Bench;
    /**
     * Returns the ownership of the global object 'Bench'
     * to the previous reference.
     *
     * @returns {Function} The previous reference to the global
     * 'Bench' object
     */
    Bench.noConflict = function () {
        me.Bench = previousBench;
        return Bench;
    };
    /**
     * Private function that invokes a given function.
     * If CATCH_ERRORS is true and an error occurs,
     * returns the error, otherwise, it returns the result of
     * the function.
     */
    function exec(fn, scope, args) {
        if (!isFn(fn)) throw new Error('The object "' + fn + '" is not a function.');
        var res;
        if (Bench.CATCH_ERRORS) {
            try {
                res = fn.apply(scope || me, args);
            } catch (e) {
                return e;
            }
        } else {
            res = fn.apply(scope || me, args);
        }
        return res;
    }
    /**
     * Measures the amount of milliseconds a given function takes to finish.
     * Only works for synchronous functions.
     * Example:
     *
     *     var fn = function () {
     *         // Some fancy complex code here
     *     };
     *     var ms = Bench.run(fn);
     *     console.log(ms);
     *     // -> 1 (number of milliseconds)
     *
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     * @returns {Integer} The number of milliseconds the function took
     * to finish
     */
    Bench.run = function (fn, scope) {
        var now = new Date().getTime();
        exec(fn, scope, slice.call(arguments, 2));
        return new Date().getTime() - now;
    };
    /**
     * Measures asynchronously the amount of milliseconds
     * a given function takes to finish.
     * Example:
     *
     *     var fn = function () {
     +         // Fancy complex code
     *     };
     *     var callback = function (ms) {
     *         console.log('The function took: ' + ms + ' ms to finish.');
     *     };
     *     Bench.runAsync(callback, fn);
     *     // After some time, the console will print
     *     // -> The function took 1 ms to finish.
     *
     * @param callback {Function} The callback to invoke when the
     * asynchronous process ends. The arguments of the callback are
     * defined as follows:
     *
     *     - milliseconds {Number} The number of milliseconds the function
     *       took to finish
     *     - result {Mixed} The result of the invoked function
     *     - fn {Function} The invoked function
     *     - scope {Mixed} The scope applied to the function when invoked
     *     - args {Array} The list of arguments passed to the function
     *
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     */
    Bench.runAsync = function (callback, fn, scope) {
        var args = slice.call(arguments, 3);
        setTimeout(function () {
            var now = new Date().getTime(),
                val = exec(fn, scope, args);
            callback.call(me, new Date().getTime() - now, val, fn, scope, args);
        }, 1);
    };
    /**
     * Executes 'n' times a invoked function and returns the time it took
     * to execute them all.
     * Example:
     *
     *     var i = 0;
     *     var fn = function () {
     *         console.log(i++);
     *     };
     *     Bench.repeat(3, fn);
     *     // -> 0
     *     // -> 1
     *     // -> 2
     *     // -> 1 (number of milliseconds)
     *     
     *
     * @param times (optional) {Integer} The number of times the function will
     * be executed
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     * @returns {Array} An array containing the results of each call
     */
    Bench.repeat = function (times, fn, scope) {
        var now = new Date().getTime(),
            args = slice.call(arguments, 3);
        while(times-- > 0) {
            exec(fn, scope, args);
        }
        return new Date().getTime() - now;
    };
    /**
     * Determines how many times can a function be called
     * per second.
     *
     * The return value is not 100% reliable, though; every time the
     * function is called, a call to 'new Date().getTime()' is also performed,
     * so the actual number of times the specified function can be called
     * within a second, is larger than the one this function returns.
     * This function is only for comparision purposes.
     * Example:
     *
     *     var fn = function () {
     *         // Fancy complex code
     *     };
     *     Bench.opsPerSecond(fn);
     *     // After one second, the function will return:
     *     // -> 1000000 (number of ops)
     *
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     * @returns {Integer} The number of times the specified function was called
     */
    Bench.opsPerSecond = function (fn, scope) {
        var ops = 0,
	    now = new Date().getTime(),
	    args = slice.call(arguments, 2);
        while (new Date().getTime() - now < 1000) {
            exec(fn, scope, args);
            ops++;
        }
        return ops;
    };
    /**
     * Calculates the average of times a function was called
     * per second, 'n' times.
     * Example:
     *
     *     var fn = function () {
     *         // Fancy complex code
     *     };
     *     Bench.opsPerSecond(3, fn);
     *     // After three seconds, the function will return:
     *     // -> 1234567.8 (number of avg ops)
     *
     * @param times (optional) {Integer} The number of repetitions
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     * @returns {Integer} The number of times the specified function was called
     */
    Bench.avgOpsPerSecond = function (times, fn, scope) {
        var results,
            avg = 0,
            ts = times,
            args = slice.call(arguments, 2);
        if (isFn(times)) {
            scope = fn;
            fn = times;
            ts = times = Bench.DEFAULT_REPETITIONS;
        } else args.shift();
        while(ts-- > 0) {
            avg += Bench.opsPerSecond.apply(null, [fn, scope].concat(args));
        }
        return avg / times;
    };
    /**
     * Measures the fastest average of operations per second
     * for multiple functions, returns the fastest function.
     * Example:
     *
     *     var fn1 = function () {
     *         // Some fast code
     *     };
     *     var fn2 = function () {
     *         // Complex code
     *     };
     *     Bench.fastest(fn1, fn2)
     *     // -> (will return the reference to fn1, since it's faster)
     *
     * @param times (optional) {Integer} The number of repetitions
     * @returns {Function} The function with the highest average of ops per second
     */
    Bench.fastest = function (times) {
        var f, t = Number.MAX_VALUE, fns = slice.call(arguments);
        if (isFn(times)) {
            times = Bench.DEFAULT_REPETITIONS;
        } else fns.shift();
        for (var i = 0; i < fns.length; i++) {
            var tmp = Bench.avgOpsPerSecond.call(Bench, times, fns[i]);
            if (tmp < t) {
                t = tmp;
                f = fns[i];
            }
        }
        return f;
    };
    /**
     * Determines if the first function executes faster than the rest of
     * the arguments.
     * Example:
     *
     *     var fn1 = function () {
     *         // Some fast code
     *     };
     *     var fn2 = function () {
     *         // Complex code
     *     };
     *     Bench.faster(fn1, fn2)
     *     // -> true
     *
     * @param times (optional) {Integer} The number of repetitions
     * @param fn {Function} The function that will be compared
     * @returns {Boolean} True if the first function is faster than
     * the rest; otherwise, false
     */
    Bench.faster = function (times, fn) {
        var f = isFn(times) ? times : fn;
        return f === Bench.fastest.apply(null, slice.call(arguments));
    };
    /**
     * Runs all available tests on a given function.
     * Example:
     *
     *     var fn = function () {
     *         // Some simple code here
     *     };
     *     Bench.diagnose(fn);
     *     // -> {
     *     // ->     run: 1,
     *     // ->     repeat: 123,
     *     // ->     opsPerSecond: 123456,
     *     // ->     avgOpsPerSecond: 123456.78
     *     // -> }
     *
     * @param times (optional) {Integer} The number of repetitions
     * @param fn {Function} The function to be executed
     * @param scope (optional) {Mixed} The context to apply to the given function
     * @returns {Object} The results. Each key is associated with the name of the test
     */
    Bench.diagnose = function (times, fn, scope) {
        var r = {}, args = slice.call(arguments, 2),
            // Diagnosable methods
            d = ['run', 'repeat', 'opsPerSecond', 'avgOpsPerSecond'];
        if (isFn(times)) {
            scope = fn;
            fn = times;
            times = Bench.DEFAULT_REPETITIONS;
        } else args.shift();
        for (var i = 0; i < d.length; i++) {
            r[d[i]] = Bench[d[i]].apply(null, (Bench[d[i]].length === 2 ? [fn, scope] : [times, fn, scope]).concat(args));
        }
        return r;
    };
    /**
     * Wraps together a set of functions so they can be executed with one call.
     * Useful when you know many functions will be executed
     * consecutively.
     * Example:
     *
     *     var fn1 = function () {
     *         console.log('function 1');
     *     };
     *     var fn2 = function () {
     *         console.log('function 2');
     *     };
     *     var fn = Bench.wrap(fn1, fn2);
     *     fn();
     *     // -> function 1
     *     // -> function 2
     *
     * @returns {Function} A new function that, when executed,
     * invokes all the set of functions previously defined
     */
    Bench.wrap = function () {
        var fns = slice.call(arguments);
        for (var i = 0; i < fns.length; i++) {
            if (!isFn(fns[i])) throw new Error('The object "' + fns[i] + '" is not a function.');
        }
        return function () {
            var args = slice.call(arguments);
            for (var i = 0; i < fns.length; i++) {
                fns[i].apply(me, args);
            }
        };
    };
    /**
     * Dinamically add the methods available in Bench to it's prototype.
     * All the functions will work the same as the static one.
     */
    var sp = Bench.prototype;
    for (var i in Bench) if (op.hasOwnProperty.call(Bench, i) && isFn(Bench[i]) && i !== 'fastest' && i !== 'faster' && i !== 'runAsync' && i !== 'wrap' && i !== 'noConflict') {
        if (Bench[i].length === 2) {
            sp[i] = (function (f) {
                return function () {
                    return Bench[f].apply(null, [this.fn, this.scope].concat(this.args).concat(slice.call(arguments)));
                };
            }(i));
        } else {
            sp[i] = (function (f) {
                return function () {
                    return Bench[f].apply(null, [this.times, this.fn, this.scope].concat(this.args ).concat(slice.call(arguments)));
                };
            }(i));
        }
    }
    sp.faster = function () {
        return Bench.faster.apply(null, [this.fn].concat(slice.call(arguments)));
    };
    sp.runAsync = function (callback) {
        Bench.runAsync.apply(null, [callback, this.fn, this.scope].concat(slice.call(arguments)));
    };
    /**
     * Retrieves the current function.
     *
     * @returns {Function} The current function
     */
    sp.getFunction = function () {
        return this.fn;
    };
    /**
     * Replaces the function to invoke.
     *
     * @param {Function} The function to invoke
     * @returns {Bench} A reference to the class itself
     */
    sp.setFunction = function (fn) {
        if (!isFn(fn)) throw new Error('The object "' + fn + '" is not a function.');
        this.fn = fn;
        return this;
    };
    /**
     * Retrieves the current scope used to invoke the
     * function.
     *
     * @returns {Mixed} The current scope
     */
    sp.getScope = function () {
        return this.scope;
    };
    /**
     * Sets a new scope for which the function will be invoked.
     *
     * @param {Mixed} The current scope
     * @returns {Bench} A reference to the class itself
     */
    sp.setScope = function (scope) {
        this.scope = scope;
        return this;
    };
    /**
     * Get the number of times the function will be
     * executed when needed.
     *
     * @returns {Number} The current number of times
     */
    sp.getTimes = function () {
        return this.times;
    };
    /**
     * Sets the number of times the function will be
     * executed when needed.
     *
     * @param {Number} The new number of times
     * @returns {Bench} A reference to the class itself
     */
    sp.setTimes = function (times) {
        this.times = times;
        return this;
    };
    /**
     * Retrieves the current list of arguments to prepend
     * when invoking the function.
     *
     * @returns {Array} The current list of arguments
     */
    sp.getArgs = function () {
        return [].concat(this.args);
    };
    /**
     * Sets a whole new list of arguments to prepend when
     * the function is invoked.
     *
     * @returns {Bench} A reference to the class itself
     */
    sp.setArgs = function () {
        this.args = slice.call(arguments);
        return this;
    };
    /**
     * Appends values to the arguments list.
     *
     * @returns {Bench} A reference to the class itself
     */
    sp.addArgs = sp.appendArgs = function () {
        this.args = this.args.concat(slice.call(arguments));
        return this;
    };
    /**
     * Prepends values to the arguments list.
     *
     * @returns {Bench} A reference to the class itself
     */
    sp.prependArgs = function () {
        this.args.unshift.apply(this.args, slice.call(arguments));
        return this;
    };
    /**
     * Clears the list of arguments.
     *
     * @returns {Bench} A reference to the class itself
     */
    sp.clearArgs = function () {
        this.args = [];
        return this;
    };
    // Finally expose the object
    me.Bench = Bench;
}.call(this));
