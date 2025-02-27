import { deepmerge } from 'deepmerge-ts'
import logger from '@wdio/logger'
import type { Capabilities } from '@wdio/types'
import type { BrowserRunnerOptions } from './types'

const log = logger('@wdio/browser-runner')

export function makeHeadless (options: BrowserRunnerOptions, caps: Capabilities.RemoteCapability): Capabilities.RemoteCapability {
    const capability = (caps as Capabilities.W3CCapabilities).alwaysMatch || caps
    if (!capability.browserName) {
        throw new Error(
            'No "browserName" defined in capability object. It seems you are trying to run tests ' +
            'in a non web environment, however WebdriverIOs browser runner only supports web environments'
        )
    }

    if (
        // either user sets headless option implicitly
        (typeof options.headless === 'boolean' && !options.headless) ||
        // or CI environment is set
        (typeof process.env.CI !== 'undefined' && !process.env.CI) ||
        // or non are set
        (typeof options.headless !== 'boolean' && typeof process.env.CI === 'undefined')
    ) {
        return caps
    }

    if (capability.browserName === 'chrome') {
        return deepmerge(capability, {
            'goog:chromeOptions': {
                args: ['headless', 'disable-gpu']
            }
        })
    } else if (capability.browserName === 'firefox') {
        return deepmerge(capability, {
            'moz:firefoxOptions': {
                args: ['-headless']
            }
        })
    } else if (capability.browserName === 'msedge' || capability.browserName === 'edge') {
        return deepmerge(capability, {
            'ms:edgeOptions': {
                args: ['--headless']
            }
        })
    }

    log.error(`Headless mode not supported for browser "${capability.browserName}"`)
    return caps
}
