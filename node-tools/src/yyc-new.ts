#!/usr/bin/env node
import { makeBlankProject } from "./make-project";
import { basename, join, resolve } from "path";

// Handles creating projects from the command line
// this is the entry point.
const args = process.argv;

let path = args[2];

if(!path) {
  console.log("Usage: yyc-new <path to target folder or yyp>");
  console.log("yyc-new creates a new GameMaker Studio 2 Project.");
    process.exit(1);
}

path = resolve(path);

if (!path.endsWith(".yyp")) path = join(path, basename(path) + ".yyp");

console.log("Generating project at " + path);

makeBlankProject(path).then(() => {
  console.log("Finished.\n  Remember that not all metadata is generated at this point, make sure you open this in the IDE at least once before doing anything with it.");
});
