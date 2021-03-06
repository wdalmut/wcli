# CLI with commands, options and arguments

A javascript CLI with commands and options

## Install it

```sh
npm install wcli --save
```

## Use it

```js
var Cli = require('wcli');
cli = new Cli({
    "serve": {
        log: ["l", 'Enable logging'],
        port: ['p', 'Listen on port', 8080]
    },
    "dump": {
        path: ["p", "Store data at path", "/tmp"],
    },
});

cli.serve = function(options, args) {
    // here your serve code;
}
cli.dump = function(options, args) {
    // here your dump code
}

cli.parse(process.argv.slice(2));
```

Use normally from your terminal

```sh
$ node myapp.js serve --log -p 8081
```

## The help command

The `-h` or `--help` option shows the help.

```sh
$ node myapp.js --help
$ node myapp.js serve -h
```

## Console and colors

You have few helpers to write strings in your console

 * info - normal text
 * error - underline and red
 * fatal - error + exit with code 1

This project includes [colors.js](https://github.com/marak/colors.js/) in order
to write down colored information.

```js
cli.info("hello".inverse);
```

## Init hook

You can execute a script before your command

```js
var Cli = require('wcli');
cli = new Cli({
    "serve": {
        log: ["l", 'Enable logging'],
        port: ['p', 'Listen on port', 8080]
    },
    "dump": {
        path: ["p", "Store data at path", "/tmp"],
    },
});

cli.init = function() {
    // do whatever you want and return the cli

    return this;
};

...
```

