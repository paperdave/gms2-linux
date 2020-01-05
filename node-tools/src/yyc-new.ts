#!/usr/bin/env node
import { makeBlankProject } from "./make-project";
import { default as chalk } from "chalk";
import { basename, join, resolve } from "path";
import { readFileSync } from "fs-extra";

// Handles creating projects from the command line
// this is the entry point.
const args = process.argv;

let path = args[2];

const packagejson = JSON.parse(readFileSync(join(__dirname, "../package.json")).toString());

if(!path) {
  console.log(`${chalk.bold('yyc-new')}: GameMaker Project Generator. ${chalk.green(`Version ${packagejson.version}`)}`);
  console.log(``);
  console.log(`${chalk.bold('Usage:')}    ${chalk.magenta('yyc-new [project name]')}`);
  console.log(``);
  console.log(`${chalk.bold('Options:')}`);
  console.log(`  (there are no options; it's that easy)`);
  process.exit(1);
}

path = resolve(path);

if (!path.endsWith(".yyp")) path = join(path, basename(path) + ".yyp");

console.log("Generating project at " + path);

makeBlankProject(path).then(() => {
  console.log("Finished.\n  Remember that not all metadata is generated at this point, make sure you open this in the IDE at least once before doing anything with it.");
});
