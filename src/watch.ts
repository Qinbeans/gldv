import { exec, spawn } from 'child_process'
import { watch } from 'chokidar'
import { config } from './types'
import { C } from './utils'

export class Watcher {
    private is_running = false;
    private processes_finished = 0;
    private pid: number = -1;
    constructor() {
        this.checkTools()
        console.log(`<${C.B}Info${C.C}> Starting watcher...`)
        const watcher = watch(config.getWatch(), {
            ignored: config.getIgnore(),
            persistent: true
        })

        watcher
        .on('add', path => {
            console.log(`<${C.B}Info${C.C}> ${path} has been added`)
        })
        .on('change', path => {
            console.log(`<${C.B}Info${C.C}> ${path} has been changed`)
            this.runCommands()
        })
        .on('unlink', path => {
            console.log(`<${C.B}Info${C.C}> ${path} has been removed`)
        })

        process.on('SIGINT', () => {
            console.log(`<${C.M}Stop${C.C}> Watcher is stopping`)
            if (this.is_running) {
                this.kill(() => {
                    watcher.close()
                    process.exit(0)
                })
            }
            watcher.close()
            process.exit(0)
        })

        this.runCommands()
    }
    /**
     * Check if the tools are installed
     */
    private checkTools = () => {
        const tools = new Set()
        config.getCmds().forEach(command => {
            const tool = command.split(' ')[0] + ' --version'
            // run the command with --version to check if the tool is installed
            exec(tool, (err, _stdout, stderr) => {
                if (err) {
                    console.error(`<${C.R}Error${C.C}> ${err}`)
                    console.error(`<${C.R}Error${C.C}> ${tool.split(' ')[0]} is not installed`)
                    process.exit(1)
                }
                if (stderr) {
                    console.error(`<${C.R}Error${C.C}> ${stderr}`)
                    console.error(`<${C.R}Error${C.C}> ${command.split(' ')[0]} is not installed`)
                    process.exit(1)
                }
                tools.add(command.split(' ')[0])
            })
        })
    }

    /**
     * Run the commands and restart the process
     */
    private runCommands = () => {
        this.processes_finished = 0
        config.getCmds().forEach(command => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`<${C.R}Error${C.C}> ${err}`)
                    this.processes_finished++
                    return
                }
                if (stderr) {
                    console.debug(`<${C.Y}Warning${C.C}> ${stderr}`)
                    this.processes_finished++
                    return
                }
                console.debug(stdout)
                console.debug(`<${C.G}Success${C.C}> \`${command}\` has been executed`)
                this.processes_finished++
            })
        })
        this.prerun()
    }

    
    // takes in some function
    private kill = (func: () => void) => {
        if (this.is_running) {
            if (this.pid === -1) {
                console.error(`<${C.R}Error${C.C}> No running process to kill`)
                return
            }
            // replace $run_pid with the pid of the running process
            if (process.platform === 'win32') {
                console.debug(`<${C.M}Kill${C.C}> performing \`${config.getKill().windows}\``)
                // get child processes of the running process
                const tasklist = `wmic process where (ParentProcessId=${this.pid}) get ProcessId`
                exec(tasklist, (err, stdout, _stderr) => {
                    if (err) {
                        console.error(`<${C.R}Error${C.C}> ${err}`)
                        return
                    }
                    const pid = stdout.split('\n').slice(1).filter(Boolean)[0]
                    console.debug(`<${C.M}Kill${C.C}>\tChild: ${pid}`)
                    const kill = config.getKill().windows.replace('$run_pid', pid.trim())
                    exec(kill, (err, _stdout, _stderr) => {
                        if (err) {
                            console.error(`<${C.R}Error${C.C}> ${err}`)
                            return
                        }
                        console.debug(`<${C.G}Success${C.C}> \`${config.getKill().windows}\` has been executed`)
                    })
                    func()
                })
                return
            }
            console.debug(`<${C.M}Kill${C.C}> performing \`${config.getKill().unix}\``)
            const kill = config.getKill().unix.replace('$run_pid', this.pid.toString())
            exec(kill, (err, _stdout, _stderr) => {
                if (err) {
                    console.error(`<${C.R}Error${C.C}> ${err}`)
                    return
                }
                console.debug(`<${C.G}Success${C.C}> \`${config.getKill().unix}\` has been executed`)
                func()
            })
        } else {
            func()
        }
    }

    private prerun = () => {
        if (this.processes_finished < config.getCmds().length) {
            setTimeout(this.prerun, 100)
            return
        }
        this.kill(this.run)
    }

    private run = () => {
        if (this.is_running) {
            setTimeout(this.run, 100)
            return
        }
        this.is_running = true
        const [command, ...args] = config.getRun().split(/\s+/);
        // block stdin but allow stdout and stderr to be inherited
        const gleam = spawn(command, args, { stdio: ['ignore', 'inherit', 'inherit'] })
        if (!gleam.pid) {
            console.error(`<${C.R}Error${C.C}> Failed to start \`${config.getRun()}\``)
            process.exit(1)
        }
        this.pid = gleam.pid
        console.debug(`<${C.M}Launch${C.C}> \`${config.getRun()}\` is ${this.pid}`)
        gleam.on('close', () => {
            this.is_running = false
        })
    }
}