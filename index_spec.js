var Cli = require('.');
var streams = require('memory-streams');

describe("The whole cli process", function() {
  var cli = null;
  beforeEach(function() {
    cli = new Cli({
      http: {
        log:   ['l', 'Enable logging'],
        port:  ['p', 'Listen on this port', 8080],
        serve: [false, 'Serve static files from PATH', './public'],
      },
    });
    cli.http = function(options, args) {
      this.stdout.write("http command");
    };
    cli.stdout = new streams.WritableStream();
  });

  it("should get a list of parameters", function() {
    expect(cli.commands.http.log.help).toEqual("Enable logging");
  });

  it("should complete with default values", function() {
    expect(cli.commands.http.log.default).toBe(false);
  });

  it("should represent the help", function() {
    cli.parse(["-h"]);
    expect(cli.stdout.toString()).toMatch(/USAGE/);
  });

  it("should execute a simple command", function() {
    cli.parse(["http"]);
    expect(cli.stdout.toString()).toMatch(/http command/);
  });

  it("should execute the help command on missing command", function() {
    cli.parse(["missing-command"]);
    expect(cli.stdout.toString()).toMatch(/USAGE/);
  });

  it("should pass my default options", function() {
    spyOn(cli, "http");

    cli.parse(["http"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: false, serve: "./public", });
    expect(cli.http.calls[0].args[1]).toEqual([]);
  });

  it("should parse boolean options", function() {
    spyOn(cli, "http");

    cli.parse(["http", "--log"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: true, serve: "./public", });
    expect(cli.http.calls[0].args[1]).toEqual([]);
  });

  it("should parse valued options", function() {
    spyOn(cli, "http");

    cli.parse(["http", "--serve", "/tmp/public"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: false, serve: "/tmp/public", });
  });

  it("should parse multiple option types", function() {
    spyOn(cli, "http");

    cli.parse(["http", "--log", "--serve", "/tmp/public"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: true, serve: "/tmp/public", });
  });

  it("should parse command and options in a strange order", function() {
    spyOn(cli, "http");

    cli.parse(["--log", "http", "--serve", "/tmp/public"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: true, serve: "/tmp/public", });
  });

  it("should receive the argument list", function() {
    spyOn(cli, "http");

    cli.parse(["http", "--log", "my-arg", "a-temp", "./path"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: true, serve: "./public", });
    expect(cli.http.calls[0].args[1]).toEqual(["my-arg", "a-temp", "./path"]);
  });

  it("should shows the help on missing option", function() {
    cli.parse(["http", "--do-something"]);
    expect(cli.stdout.toString()).toMatch(/missing option: do-something/i);
  });

  it("should shows the help on missing command", function() {
    cli.parse(["https"]);
    expect(cli.stdout.toString()).toMatch(/missing command: https/i);
  });

  it("should parse the short option key", function() {
    spyOn(cli, "http");

    cli.parse(["http", "-l"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: true, serve: "./public", });
    expect(cli.http.calls[0].args[1]).toEqual([]);
  });

  it("should shows the help on missing option", function() {
    cli.parse(["http", "-k"]);
    expect(cli.stdout.toString()).toMatch(/missing option: k/i);
  });

  it("should parse valued options and arguments", function() {
    spyOn(cli, "http");

    cli.parse(["http", "--serve", "/tmp/public", "path/to/something"]);

    expect(cli.http.calls.length).toBe(1);
    expect(cli.http.calls[0].args[0]).toEqual({port: 8080, log: false, serve: "/tmp/public", });
    expect(cli.http.calls[0].args[1]).toEqual(["path/to/something"]);
  });
});
