// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

// Custom reporter to ensure Mocha process exits when we're done with tests.
// This is a hack, however for some reason the process running the tests do not exit.
// The hack is to force it to die when tests are done, if this doesn't work we've got a bigger problem on our hands.

import { WINR, WTF } from './main';
// tslint:disable: no-var-requires no-require-imports
const Mocha = require('mocha');
const { EVENT_RUN_BEGIN, EVENT_RUN_END } = Mocha.Runner.constants;

// tslint:disable-next-line: no-unnecessary-class
class ExitReporter {
    // tslint:disable: no-any
    constructor(runner: any) {
        const stats = runner.stats;
        runner
            .once(EVENT_RUN_BEGIN, () => {
                // tslint:disable: no-console
                console.info('Start form custom PVSC Mocha Reporter.');
            })
            .once(EVENT_RUN_END, () => {
                function dump() {
                    console.info('wft()');
                    WTF.dump();
                    console.info('WINR()');
                    WINR();
                }
                console.info('Will Exit from custom PVSC Mocha Reporter.');
                // dump();
                // // NodeJs generally waits for pending timeouts, however the process running Mocha
                // // (generally this is an instance of VSC), does not exit, hence CI timeouts.
                // // No idea why it times, out. Once again, this is a hack.
                // // Solution (i.e. hack), lets add a timeout with a delay of 10 seconds,
                // // & if this process doesn't die, lets kill it.
                function die() {
                    // setTimeout(() => {
                    console.info('Exiting from custom PVSC Mocha Reporter.');
                    dump();
                    console.info('Bye.');
                    process.exit(stats.failures === 0 ? 0 : 1);
                    console.info('Bye.');
                    process.kill(process.pid, 'SIGTERM');
                    console.info('Bye.');
                    console.info('Bye.');
                    // }, 10000);
                }
                // die();
                try {
                    // Lets just close VSC, hopefully that'll be sufficient (more graceful).
                    const vscode = require('vscode');
                    console.log('Close VSC');
                    vscode.commands.executeCommand('workbench.action.closeWindow');
                    console.log('Bye from VSC');
                    die();
                } catch (ex) {
                    // Worse case scenario, just kill the process.
                    console.error(ex);
                }
            });
    }
}

module.exports = ExitReporter;
