#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
// @ts-ignore
const package_json_1 = __importDefault(require("../../package.json"));
const utils_1 = require("./utils");
commander_1.default.version(package_json_1.default.version);
commander_1.default
    .command('build <my-program> [path]')
    .description('Build the solana program.')
    .action(async (program, toPath) => {
    await utils_1.build(program, toPath);
});
commander_1.default.parse(process.argv);
if (commander_1.default.args.length < 1) {
    commander_1.default.outputHelp();
}
