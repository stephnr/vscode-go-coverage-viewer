import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.generateCoverage', () => {
        vscode.window.showInformationMessage('Generating Coverage Results...');
        // 1. Get the path to the current file
        var editor = vscode.window.activeTextEditor
        // 2. Determine the Go Package name
        // 3. If package name is main, do not generate
        // 4. Run command to generate coverage and output to temp folder
        // 5. Open WebView with contents of coverage file
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}