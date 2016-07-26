var _ = require('underscore');
var color = require('colors');

module.exports = function(def) {
  return {
    "app": require('path').basename(__filename),
    "stdout": process.stdout,
    "commands": function (def) {
      var options = {};
      _.each(_.keys(def), function(command) {
        options[command] = {};
        _.each(_.keys(def[command]), function(longKey) {
          var base = [false, 'Missing description', false];
          def[command][longKey] = def[command][longKey].concat(base.slice(def[command][longKey].length));
          options[command][longKey] = _.object(['key', 'help', 'default'], def[command][longKey]);
        }, this);
     }, this);
      return options;
    }(def),
    "options": {},
    "args": [],
    "isHelp": function(arg) {
      var isHelp = false;
      switch(arg) {
        case "-h":
        case "--help":
          isHelp = true;
        break;
      }
      return isHelp;
    },
    "exit": function(intCode) {
      process.exit(intCode);
    },
    "fatal": function(message) {
      this.error(message);
      this.exit(1);
    },
    "error": function(message) {
      this.stdout.write(message.underline.red + "\n");
    },
    "info": function(message) {
      this.stdout.write(message + "\n");
    },
    "showHelp": function(command, message) {
      this.stdout.write("USAGE: " + this.app + " [COMMAND] [OPTIONS] [args...]\n\n");

      if (message) {
        this.error("ERROR: " + message + "\n");
      }
      this.stdout.write("\n");
      if (!command) {
        this.stdout.write("Commands:\n".bold);
        _.each(this.commands, function(value, key) {
          this.showCommandHelp(key);
        }, this);
      } else {
        this.showCommandHelp(command);
      }
    },
    "showCommandHelp": function(command) {
      this.stdout.write("  " + command + "\n");
      _.each(this.commands[command], function(def, optName) {
        this.stdout.write("    " + "--" + optName + ((def.key) ? ", -"+def.key : "") + " " + def.help + "\n");
      }, this);
    },
    "init": function(args) {
      return this;
    },
    "parse": function(args) {
      return this.init(args).findTheCommand(args);
    },
    "findTheCommand": function(args) {
      var command = function(args) {
        var index = _.findIndex(args, function(arg) {
          if (arg.indexOf("-") < 0) {
            return true;
          }
        }, this);

        var command = args[index];

        if (index >= 0) {
          return args[index];
        } else {
          return false;
        }
      }(args);

      return this.validateCommand(command, args);
    },
    "validateCommand": function(command, args) {
      // command is not provided
      if (!command) {
        return this.showHelp();
      }

      // user require an help
      if (_.findIndex(args, this.isHelp, this) >= 0) {
        return this.showHelp();
      }

      // the command is not in the commands list
      if (!this.commands[command]) {
        return this.showHelp(false, "Missing command: " + command);
      }

      return this.removeTheCommand(command, args);
    },
    "removeTheCommand": function(command, args) {
      // remove the command
      var commandIndex = _.indexOf(args, command);
      args[commandIndex] = false;
      args = _.compact(args);

      return this.resolveTheOptionsList(command, args);
    },
    "resolveTheOptionsList": function(command, args) {
      _.each(args, function(key, index) {
        if (!key.match(/^([-]{1}[^-]{1})/g)) {
          return;
        }

        var optionName = key.replace(/^\-*/g, ""); // drop -- or -
        _.each(this.commands[command], function(option, key) {
          if (option.key == optionName) {
            args[index] = "--" + key;
          }
       }, this);
      }, this);

      return this.prepareTheOptionsList(command, args);
    },
    "prepareTheOptionsList": function(command, args) {
      // prepare defaults
      var options = function(commandOptions) {
        var options = {};
        _.each(_.keys(commandOptions), function(optionName) {
          options[optionName] = commandOptions[optionName].default;
        });
        return options;
      }(this.commands[command]);

      // options override
      for (var i=0; i<args.length; i++) {
        // skip if it is not an option
        if (!args[i].match(/^[-]{1,2}/)) {
          continue;
        }

        var optionName = args[i].replace(/^\-*/g, ""); // drop -- or -
        if (this.commands[command][optionName] === undefined) {
          return this.showHelp(false, "Missing option: " + optionName);
        }

        option = this.commands[command][optionName];
        if (_.isBoolean(option.default)) {
          options[optionName] = true;
        } else {
          options[optionName] = args[i+1];
          i += 1;
        }
      }

      return this.prepareTheArgumentList(command, options, args);
    },
    "prepareTheArgumentList": function(command, options, args) {
      var drops = [];
      _.each(options, function(val, key) {
        if (val) {
          drops.push(val);
          drops.push("--" + key);
        }
      });

      args = _.difference(args, drops);

      // prepare args
      var commandArgs = _.filter(args, function(arg) {
        if (!arg.match(/^[-]{1,2}/)) {
          return true;
        }
        return false;
      });
      return this.userCommandRun(command, options, args);
    },
    "userCommandRun": function(command, options, args) {
      return this[command](options, args);
    },
  };
};
