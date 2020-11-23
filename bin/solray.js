#!/usr/bin/env node
var program = require('commander');

var appInfo = require('../package.json');

var utils = require('./utils');

program.version(appInfo.version);

program
  .command('build <my-program> [path]')
  .description('Build the solana program.')
  .action(function(program, toPath) {
    utils.build(program, toPath);
  });

program.parse(process.argv);

if (program.args.length < 1) {
  program.outputHelp();
}