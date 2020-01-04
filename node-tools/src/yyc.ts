#!/usr/bin/env node
// Wrapper for rubber as a CLI
// Has almost the same functionality as
// using it from JS, besides the ability
// to process output.
import * as cli from "cli";
import { default as chalk } from "chalk";
import { readFileSync, existsSync, statSync, readdirSync, PathLike } from "fs";
import { join, resolve } from "path";
import { compile, clearCache, clearCacheRemote } from './compiler';
cli.setUsage("yyc [options] path/to/project.yyp [output file]");

/**
 * Preform basic checks to see if a .yyp is actually valid.
 */
function validateYYP(path: PathLike) {
    let projectRead;
    try {
        projectRead = JSON.parse(readFileSync(path).toString());
    } catch (e) {
        projectRead = {};
    }
    return ("IsDnDProject" in projectRead) &&
        ("id" in projectRead) &&
        ("mvc" in projectRead) &&
        ("resources" in projectRead) &&
        (projectRead.modelName === "GMProject");
}

// Prepare CLI Options.
const options = cli.parse({
    zip: ["Z", "Creates a zip archive"],
    installer: ["I", "Creates a installer package"],
    yyc: ["y", "Compiles with YYC"],
    config: ["c", "Sets the configuration", "string"],
    version: ["v", "Display the current version"],
    clear: ["", "Clears cache for project and exits."],
    "clear_remote": ["","Clears the remote client cache."],
    "gms-dir":["","Alternative GMS installation directory","path"],
    "platform":["p","Export platform","string"],
    "device-config-dir":["","Target device config file directory", "path"],
    "target-device-name":["","Target device name","string"],
    "runtime":["","The runtime to use","string"],
    "ea":["","Toggle whether to use Early Access version"],
    "linux":["l","Equal to --platform linux"],
});
// CLI calls the callback with the arguments and options.
cli.main(async (args, options) => {
    if (options.version) {
        // Output version and if build tools are all set.
        const packagejson = JSON.parse(readFileSync(join(__dirname, "../package.json")).toString());
        console.log(`YoYoProject Compiler ` + chalk.green(`v${packagejson.version}`));
        return;
    }
    if (args.length == 0) {
        args[0] = '.';
    }
    let path = resolve(args[0]);
    // !!! #4 Removed the yyz check from an older verison. This can
    //        be fixed by adding it again, extracting it somewhere temporary.
    if (statSync(path).isDirectory()) {
        // Check inside the directory
        for (const name of readdirSync(path)) {
            if (!statSync(join(path, name)).isDirectory()) {
                if (validateYYP(join(path, name))) {
                    path = join(path, name);
                    break;
                }
            }
        }
    }
    if (!existsSync(path)) {
        cli.fatal("Project does not exist at " + chalk.yellow(path) + ". Exiting");
        return;
    }

    // Preform some checks to the project.
    
    if (!validateYYP(path)) {
        cli.fatal("Project invalid, or in a newer format. Exiting");
    }

    // We have a probably valid project. Time to pass it to rubber
    let buildType: "test" | "zip" | "installer" = "test";
    if (options.zip && options.installer) {
        // why did you even?
        cli.fatal("Cannot make a zip and installer :)   Use two different cli calls. Exiting")
    }
    if (options.zip) {
        buildType = "zip";
    }
    if (options.installer) {
        buildType = "installer";
    }

    // Alternative GMS install dir
    let gamemakerLocation: string = "";
    if (options["gms-dir"]){
        gamemakerLocation = options["gms-dir"];
    }

    let deviceConfigFileLocation: string = "";
    if (options["device-config-dir"]){
        deviceConfigFileLocation = options["device-config-dir"];
    }

    // Choose a target device among the available devices. Will grab the first one if left empty
    let targetDeviceName: string = "";
    if (options["target-device-name"]){
        targetDeviceName = options["target-device-name"];
    }

    let platform: "windows" | "mac" | "linux" | "ios" | "android" | "ps4" | "xboxone" | "switch" | "html5" | "uwp" = options.linux ? 'linux' : "windows";
    if (options.platform){
        platform = options.platform;
    }

    let theRuntime: string = "";
    if (options["runtime"]){
        theRuntime = options["runtime"];
    }

    //
    let rubberOptions = {
        projectPath: path,
        build: buildType,
        outputPath: args[1] || "",
        yyc: options.yyc,
        config: options.config || "default",
        verbose: options.debug,
        gamemakerLocation,
        platform,
        deviceConfigFileLocation,
        targetDeviceName,
        theRuntime,
        ea: options.ea
    }

    // Clear build machine's cache
    if(options.clear) {
        clearCache(path).then(() => {
            cli.info("Cleared Project Cache.");
        });
        return;
    }

    options["clear_remote"] ? clearCacheRemote(rubberOptions) : compile(rubberOptions,false);
});
