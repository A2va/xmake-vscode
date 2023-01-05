
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as process from './process';
import { config } from './config';

const eol = os.platform() == 'win32' ? "\r\n" : "\n";

interface TargetInformations {
    rundir: string;
    path: string;
    name: string;
    envs;
}

interface ExplorerInformations {
    options: []
    targets: [{
        files: [string];
        group: string;
        kind: string;
        scriptdir: string;
    }];
}

interface Config {
    plat: string;
    arch: string;
    mode: string;
}

/**
 * Get xmake configuration
 * @returns xmake config
 */
export async function getConfig(): Promise<Config> {
    return executeScript("config");
}

/**
 * Get xmake configuration
 * @returns xmake config
 */
export async function getNewFiles(): Promise<string[]> {
    return executeScript("newfiles");
}

/**
 * Get the Gnu Debugger path
 * @returns gbd path
 */
export async function getGdbPath(): Promise<string> {
    return executeScript("find_gdb");
}


/**
 * Get array of all archs
 * @returns array of archs
 */
export async function getArchs(): Promise<string[]> {
    return (await executeScript("archs")).split(eol);
}

/**
 * Get array of all languages
 * @returns array of languages
 */
export async function getLanguages(): Promise<string[]> {
    return (await executeScript("languages")).split(eol);
}

/**
 * Get array of all templates
 * @returns array of templates
 */
export async function getTemplates(): Promise<string[]> {
    return (await executeScript("templates")).split(eol);
}

/**
 * Get array of all toolchains
 * @returns array of toolchains
 */
export async function getToolchains(): Promise<string[]> {
    return (await executeScript("toolchains")).split(eol);
}

/**
 * Get array of all modes
 * @returns array of modes
 */
export async function getModes(): Promise<string[]> {
    return (await executeScript("modes")).split(eol);
}

/**
 * Get array of all the targets
 * @param targetName xmake target
 * @returns array of targets
 */
export async function getTargets(): Promise<string[]> {
    return (await executeScript("targets")).split(eol);
}

/**
 * Get default target
 * @returns default target
 */
export async function getDefaultTarget(): Promise<string> {
    return executeScript("default_target");
}

/**
 * Get target informations
 * @param targetName
 * @returns target informations
 */
export async function getTargetInformations(targetName: string): Promise<TargetInformations> {
    return executeScript("target_informations", [targetName]);
}

/**
 * Get target running directory
 * @param targetName
 * @returns target running directory
 */
export async function getTargetRunDir(targetName: string): Promise<string> {
    return executeScript("target_rundir", [targetName]);
}

/**
 * Get target environment
 * @param targetName
 * @returns target environment
 */
export async function getTargetRunEnvs(targetName: string): Promise<[{ name: string, value: string }]> {
    return executeScript("target_rundir", [targetName]);
}

/**
 * Get target path
 * @param targetName
 * @returns target path
 */
export async function getTargetPath(targetName: string): Promise<string> {
    return executeScript("targetpath", [targetName]);
}

/**
 * Get explorer informations
 * @returns explorer informations
 */
export async function getExplorerInformations(): Promise<ExplorerInformations> {
    return executeScript("explorer");
}

/**
 * Update Intellisense
 */
export async function updateIntellisense() {
    executeScript("update_intellisense");
}

/**
 * Convert the lua ouput into a string or object
 * depending if we can parse it with JSON 
 * @param str 
 * @returns string or Object 
 */
function getOutput(str: string): string | Object {
    let converted = str;
    try {
        converted = JSON.parse(str);
    } catch (e) {
        // Fallback if the string is deserializable
        return str;
    }
    return converted;
}

async function executeScript(scriptName: string, args: Array<string> = []): Promise<any | null> {
    const scriptPath = `../../assets/${scriptName}.lua`;
    const getScript = path.join(__dirname, scriptPath);

    if (fs.existsSync(getScript)) {
        let output = (await process.iorunv(config.executable, ["l", getScript].concat(args), { "COLORTERM": "nocolor" }, config.workingDirectory)).stdout.trim();
        if (output) {
            output = output.split("__end__")[0].trim();
        }

        return getOutput(output);
    }

    return null;
}

