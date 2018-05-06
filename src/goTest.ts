import * as cp from 'child_process';

import { outputChannel } from './goStatus';

export const createTestCoverage = (fname: string ,tmpPath: string, cwd: string): Promise<Error | null> => {
    return new Promise((resolve, reject) => {
        try {
            const output = cp.execSync(`go test -coverprofile=${tmpPath}/${fname}`, { cwd });
            const lines = output.toString().split('\n');
            outputChannel.appendLine(`${cwd}> finished generating coverage results:`);
            for (const line of lines) { outputChannel.appendLine(line); }

            return resolve();
        } catch(err) {
            outputChannel.appendLine('Error while generating coverage output:');
            outputChannel.appendLine(err.toString());
            reject(err);
        }
    });
}

export const generateHtmlCoverage = (tmpPath: string, cwd: string): Promise<Error | null> => {
    return new Promise((resolve, reject) => {
        try {
            const output = cp.execSync(`go tool cover -html=${tmpPath}/c.out -o ${tmpPath}/coverage.html`, { cwd });

            let lines = output.toString().split('\n');
            outputChannel.appendLine(`${cwd}> finished converting coverage results to HTML:`);
            for (const line of lines) { outputChannel.appendLine(line); }

            resolve();
        } catch(err) {
            outputChannel.appendLine('Error while converting coverage results to HTML:');
            outputChannel.appendLine(err.toString());
            reject(err);
        }
    });
}