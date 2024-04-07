import { Watcher } from "./watch" 
import { config } from "./types"
import { C } from "./utils"

// parse args
const actionMap: { [key: string]: () => void } = {
    dev: () => {
        config.loadConfig()
        new Watcher()
    },
    create: () => {
        config.createConfig()
    },
    help: () => {
        console.log('Usage:')
        console.log(`   - ${C.G}dev${C.C} - Start the development server`)
        console.log(`   - ${C.M}create${C.C} - Create a new config file`)
        console.log(`   - ${C.B}help${C.C} - Display this help message`)
    }
}

export const parseArgs = (args: string[]) => {
    const action = args[2]
    if (!action) {
        console.error('No action provided')
        actionMap.help()
    } else if (actionMap[action]) {
        actionMap[action]()
    } else {
        console.error('Invalid action')
        actionMap.help()
    }
}