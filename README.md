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


