// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { join } from "path";
import * as vscode from "vscode";
import { ExtensionContext, ExtensionMode, Uri, Webview } from "vscode";
import { MessageHandlerData } from "@estruyf/vscode";
import { readFile } from "fs/promises";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-react-webview-starter.openWebview",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "react-webview",
        vscode.l10n.t("React Webview"),
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      panel.webview.onDidReceiveMessage(
        (message) => {
          const { command, requestId, payload } = message;

          if (command === "GET_DATA") {
            // Do something with the payload

            // Send a response back to the webview
            panel.webview.postMessage({
              command,
              requestId, // The requestId is used to identify the response
              payload: vscode.l10n.t("Hello from the extension!"),
            } as MessageHandlerData<string>);
          } else if (command === "GET_DATA_ERROR") {
            panel.webview.postMessage({
              command,
              requestId, // The requestId is used to identify the response
              error: vscode.l10n.t("Oops, something went wrong!"),
            } as MessageHandlerData<string>);
          } else if (command === "POST_DATA") {
            vscode.window.showInformationMessage(
              vscode.l10n.t("Received data from the webview {0}", payload.msg)
            );
          } else if (command === "GET_LOCALIZATION") {
            if (vscode.l10n.uri?.fsPath) {
              readFile(vscode.l10n.uri?.fsPath, "utf-8").then((fileContent) => {
                panel.webview.postMessage({
                  command,
                  requestId, // The requestId is used to identify the response
                  payload: fileContent,
                } as MessageHandlerData<string>);
              });
            } else {
              // No localization file means we should use the default language
              panel.webview.postMessage({
                command,
                requestId, // The requestId is used to identify the response
                payload: undefined,
              } as MessageHandlerData<undefined>);
            }
          }
        },
        undefined,
        context.subscriptions
      );

      panel.webview.html = getWebviewContent(context, panel.webview);
    }
  );

  const message = vscode.l10n.t(
    "Your extension got activated with the {0} language!",
    vscode.env.language
  );
  vscode.window.showInformationMessage(message);
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

const getWebviewContent = (context: ExtensionContext, webview: Webview) => {
  const jsFile = "webview.js";
  const localServerUrl = "http://localhost:9000";

  let scriptUrl = null;
  let cssUrl = null;

  const isProduction = context.extensionMode === ExtensionMode.Production;
  if (isProduction) {
    scriptUrl = webview
      .asWebviewUri(Uri.file(join(context.extensionPath, "dist", jsFile)))
      .toString();
  } else {
    scriptUrl = `${localServerUrl}/${jsFile}`;
  }

  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ""}
	</head>
	<body>
		<div id="root"></div>

		<script src="${scriptUrl}" />
	</body>
	</html>`;
};
