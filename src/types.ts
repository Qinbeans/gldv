import { existsSync, readFileSync, writeFileSync } from "fs";
import { C } from "./utils";

const configPath = process.cwd() + '/glew.json'

/**
 * Glew Configuration
 * 
 * @class GlewConfig
 */
class GlewConfig {
    private watch: string[] = [
        "src/**/*.gleam",
    ]
    private cmds: string[] = [
        "gleam build",
    ]
    private run: string = "gleam run"
    private kill: {
        unix: string,
        windows: string
    } = {
        unix: "kill $(pgrep -P $run_pid)",
        windows: "taskkill /F /PID $run_pid",
    }
    private ignore: RegExp = /(^|[\/\\])\../ // Ignores hidden files

    constructor() {}
    

    private checkConfig = () => {
        // check the config file from project root directory
        if (existsSync(configPath)) {
            console.debug(`<${C.G}Success${C.C}> Config file found`)
            return true
        }
        console.debug(`<${C.G}Warning${C.C}> Config file not found`)
        return false
    }

    loadConfig = () => {
        // load the config file from project root directory
        if (this.checkConfig()) {
            // read the config file
            const configContent = readFileSync(configPath, 'utf8')
            // parse the config file
            const configData = JSON.parse(configContent)
            if (configData.watch) this.watch = configData.watch
            if (configData.cmds) this.cmds = configData.cmds
            if (configData.run) this.run = configData.run
            if (configData.kill) this.kill = configData.kill
            if (configData.ignore) this.ignore = configData.ignore
        }
    }

    createConfig = () => {
        // create a new config file in the project root directory
        console.debug(`<${C.G}Success${C.C}> Creating a new config file`)
        // write the default config to the config file
        const configContent = JSON.stringify(this, null, 4)
        // write the config file
        writeFileSync(configPath, configContent)
    }

    getWatch = () => this.watch
    getCmds = () => this.cmds
    getRun = () => this.run
    getKill = () => this.kill
    getIgnore = () => this.ignore
}


export const config = new GlewConfig()