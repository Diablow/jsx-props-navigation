// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const whitespace = /\s/;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	let cursorRight = vscode.commands.registerCommand('jsxPropsNavigation.cursorRight', () => {
		const editor = vscode.window.activeTextEditor;
		const position = editor.selection.active;
		try {
			const next = findNextProp(editor.document, position);
			editor.selection = new vscode.Selection(next, next);
			editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
		} catch (error) {
			console.log(error);
		}

	});

	let cursorLeft = vscode.commands.registerCommand('jsxPropsNavigation.cursorLeft', () => {
		const editor = vscode.window.activeTextEditor;
		const position = editor.selection.active;
		try {
			const prev = findPrevProp(editor.document, position);
			editor.selection = new vscode.Selection(prev, prev);
			editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
		} catch (error) {
			console.log(error);
		}
	});

	context.subscriptions.push(cursorRight, cursorLeft);
}
exports.activate = activate;


function findPrevProp(document, position) {
	const totalLines = document.lineCount;
	let textLine = document.lineAt(position);

	function getPrevCursor(pos) {
		if (pos.line > 0) {
			if (pos.character > 0) {
				return pos.translate(0, -1);
			} else {
				let newPos = document.lineAt(pos.line - 1, 0).range.end;
				textLine = document.lineAt(newPos);
				return newPos;
			}
		} else {
			if (pos.character > 0) {
				return pos.translate(0, -1);
			} else {
				let newPos = document.lineAt(totalLines - 1, 0).range.end;
				textLine = document.lineAt(newPos);
				return newPos;
			}
		}
	}

	let startPosition = getPrevCursor(position);
	textLine = document.lineAt(startPosition);
	let match = false;

	while (!match) {
		if (startPosition.isEqual(position)) {
			return position;
		}

		startPosition = getPrevCursor(startPosition);
		if (isMatch(startPosition, textLine.text)) {
			match = true;
			return document.getWordRangeAtPosition(startPosition).start;
		}
	}

	return startPosition;
}

function findNextProp(document, position) {
	const totalLines = document.lineCount;
	let textLine = document.lineAt(position);

	function getNextCursor(pos) {
		if (pos.line + 1 < totalLines) {
			if (textLine.range.end.isAfter(pos)) {
				return pos.translate(0, 1);
			} else {
				let newPos = new vscode.Position(pos.line + 1, 0);
				textLine = document.lineAt(newPos);
				return newPos;
			}
		} else {
			if (textLine.range.end.isAfter(pos)) {
				return pos.translate(0, 1);
			} else {
				let newPos = new vscode.Position(0, 0);
				textLine = document.lineAt(newPos);
				return newPos;
			}
		}
	}

	let startPosition =  getNextCursor(position);
	textLine = document.lineAt(startPosition);
	let match = false;

	while (!match) {
		if (startPosition.isEqual(position)) {
			return position;
		}

		startPosition = getNextCursor(startPosition);
		if (isMatch(startPosition, textLine.text)) {
			const wordRange = document.getWordRangeAtPosition(startPosition);
			if (!wordRange.contains(position)) {
				match = true;
				return wordRange.start;
			}
		}
	}

	return startPosition;
}

function isMatch(p, text) {
	const prevChar = text[p.character - 1];
	const curChar = text[p.character];
	const nextChar = text[p.character + 1];
	if ((
		curChar === '=' && nextChar === `{` ||
		curChar === '=' && nextChar === `"` ||
		curChar === '=' && nextChar === `'`)
		&& !whitespace.test(prevChar)) {
		return true;
	}
	return false;
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
