import * as vscode from 'vscode';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { GO_MODE } from './goMode';
import { outputChannel } from './goStatus';
import { createTestCoverage, generateHtmlCoverage } from './goTest';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.generateCoverage', async () => {
        try {
            let fileUri: vscode.Uri;
            outputChannel.clear();

            if (vscode.window.activeTextEditor) {
                fileUri = vscode.window.activeTextEditor.document.uri;

                if (!vscode.languages.match(GO_MODE, vscode.window.activeTextEditor.document)) {
                    vscode.window.showWarningMessage('The current filetype is not supported');
                    return;
                }

                const contents = fs.readFileSync(fileUri.fsPath, { encoding: 'utf8' });

                let packageLine = contents.split('\n').shift();
                let packageName = packageLine ? packageLine.split(' ').pop() : null;

                if (packageName === 'main') {
                    vscode.window.showErrorMessage('Cannot generate coverage results for main package');
                }

                const cwd = path.dirname(fileUri.fsPath);
                const tmpPath = path.normalize(path.join(os.tmpdir(), 'go-coverage'));
                outputChannel.appendLine(`Generating coverage results for package ${packageName}...`);

                if (!fs.existsSync(`${tmpPath}`)) {
                    fs.mkdirSync(`${tmpPath}`);
                } else {
                    if (fs.existsSync(`${tmpPath}/coverage.html`)) {
                        fs.unlinkSync(`${tmpPath}/coverage.html`);
                    }

                    if (fs.existsSync(`${tmpPath}/c.out`)) {
                        fs.unlinkSync(`${tmpPath}/c.out`);
                    }
                }

                let testFailed = await createTestCoverage('c.out', tmpPath, cwd);

                if (testFailed) {
                    outputChannel.appendLine(testFailed.message.toString());
                    vscode.window.showErrorMessage(`Failed to generate test coverage for package named ${packageName}`);
                    outputChannel.show();
                    return;
                }

                let coverageFailed = await generateHtmlCoverage(tmpPath, cwd);

                if (coverageFailed) {
                    outputChannel.appendLine(coverageFailed.message.toString());
                    vscode.window.showErrorMessage(`Failed to covert test coverage to HTML for package named ${packageName}`);
                    outputChannel.show();
                    return;
                }

                outputChannel.appendLine(`Displaying Package Coverage from ${tmpPath}/coverage.html`);
                const coverageHTML = fs.readFileSync(`${tmpPath}/coverage.html`, { encoding: 'utf8' });
                const viewPanel = vscode.window.createWebviewPanel('goCoverage', `Package [${packageName}]: Coverage Results`, vscode.ViewColumn.Two, { enableScripts: true });

                viewPanel.webview.html = coverageHTML;
            } else {
                vscode.window.showErrorMessage('No active editor was detected');
            }
        } catch(error) {
            outputChannel.appendLine(error);
            outputChannel.show();
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}