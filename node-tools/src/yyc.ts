#!/usr/bin/env node
// Wrapper for rubber as a CLI
// Has almost the same functionality as
// using it from JS, besides the ability
// to process output.
import * as cli from "cli";
import { default as chalk } from "chalk";
import { readFileSync, existsSync, statSync, readdirSync, PathLike } from "fs";
import { join, resolve } from "path";
import { compile, clearCache, clearCacheRemote, IRubberOptions } from './compiler';

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
    return typeof projectRead === 'object' &&
        ("IsDnDProject" in projectRead) &&
        ("id" in projectRead) &&
        ("mvc" in projectRead) &&
        ("resources" in projectRead) &&
        (projectRead.modelName === "GMProject");
}

const packagejson = JSON.parse(readFileSync(join(__dirname, "../package.json")).toString());

(cli as any).getUsage = () => {
    console.log(`${chalk.bold('yyc')}: GameMaker Project Compiler for Linux. ${chalk.green(`Version ${packagejson.version}`)}`);
    console.log(``);
    console.log(`${chalk.bold('Usage:')}    ${chalk.magenta('yyc [options] [path/to/project.yyp = current directory] [output file]')}`);
    console.log(``);
    console.log(`${chalk.bold('Options:')}`);
    console.log(`  -z, --zip                        Create a ZIP Archive`);
    console.log(`  -i, --installer                  Create a Windows Installer`);
    console.log(`  -y  --yyc                        Use YYC over VM (SLOWER)`);
    console.log(`  -l  --linux                      Set platform = linux`);
    console.log(`  -p  --platform [platform]        Set the platform to something else`);
    console.log(`  -c  --config [config]            Set the configuration`);
    console.log(`  -C  --clear                      Clear cache and exit`);
    console.log(``);
    console.log(`${chalk.bold('Advanced Options:')}`);
    console.log(`      --clear-remote               Clear remote cache and exit`);
    console.log(`      --runtime [runtime]          Use a different runtime`);
    console.log(`  -v  --verbose                    Enable Verbose Mode`);
    console.log(`      --device-config-dir [path]   Path to an alternate devices.json`);
    console.log(`      --target-device-name [name]  Device name to use, default if blank`);
    process.exit();
}

// Prepare CLI Options.
const options = cli.parse({
    "zip": ["z", ""],
    "installer": ["i", ""],
    "yyc": ["y", ""],
    "config": ["c", "", "string"],
    "verbose": ["v", ""],
    "clear": ["C", ""],
    "clear-remote": ["",""],
    "platform":["p","","string"],
    "device-config-dir":["","", "path"],
    "target-device-name":["","","string"],
    "runtime":["","","string"],
    "linux":["l",""],
});

// CLI calls the callback with the arguments and options.
cli.main(async (args, options) => {
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
    let rubberOptions: IRubberOptions = {
        projectPath: path,
        build: buildType,
        outputPath: args[1] || "",
        yyc: options.yyc,
        config: options.config || "default",
        verbose: options.verbose,
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

    options["clear-remote"] ? clearCacheRemote(rubberOptions) : compile(rubberOptions,false);
});
