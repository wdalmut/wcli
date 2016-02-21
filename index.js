var _ = require('underscore');

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
    "showHelp": function(command, message) {
      this.stdout.write("USAGE: " + this.app + " [COMMAND] [OPTIONS] [args...]\n\n");

      if (message) {
        this.stdout.write("ERROR: " + message + "\n");
      }
      this.stdout.write("\n");
      if (!command) {
        this.stdout.write("Commands:\n");
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
    "parse": function(args) {
      return this.findTheCommand(args);
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

      return this.preapareTheArgumentList(command, args);
    },
    "preapareTheArgumentList": function(command, args) {
      // prepare args
      var commandArgs = _.filter(args, function(arg) {
        if (!arg.match(/^[-]{1,2}/)) {
          return true;
        }
        return false;
      });
      return this.resolveTheOptionsList(command, commandArgs, args);
    },
    "resolveTheOptionsList": function(command, commandArgs, args) {
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

      return this.prepareTheOptionsList(command, commandArgs, args);
    },
    "prepareTheOptionsList": function(command, commandArgs, args) {
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

      return this.userCommandRun(command, options, commandArgs);
    },
    "userCommandRun": function(command, options, args) {
      return this[command].apply(this, [options, args]);
    },
  };
};
