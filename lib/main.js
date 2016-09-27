'use babel';

/* eslint-disable import/extensions, import/no-extraneous-dependencies */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/extensions, import/no-extraneous-dependencies */

let helpers = null;
let path = null;

export default {
  activate() {
    require('atom-package-deps').install('linter-csslint');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe('linter-csslint.disableTimeout', (value) => {
        this.disableTimeout = value;
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'CSSLint',
      grammarScopes: ['source.css', 'source.html'],
      scope: 'file',
      lintOnFly: true,
      lint(textEditor) {
        if (!helpers) {
          helpers = require('atom-linter');
        }
        if (!path) {
          path = require('path');
        }
        const filePath = textEditor.getPath();
        const text = textEditor.getText();
        if (text.length === 0) {
          return Promise.resolve([]);
        }
        const parameters = ['--format=json', '-'];
        const exec = path.join(__dirname, '..', 'node_modules', 'atomlinter-csslint', 'cli.js');
        const projectPath = atom.project.relativizePath(filePath)[0];
        let cwd = projectPath;
        if (!(cwd)) {
          cwd = path.dirname(filePath);
        }
        const options = { stdin: text, cwd };
        if (this.disableTimeout) {
          options.timeout = Infinity;
        }
        return helpers.execNode(exec, parameters, options).then((output) => {
          if (textEditor.getText() !== text) {
            // The editor contents have changed, tell Linter not to update
            return null;
          }

          const toReturn = [];
          if (output.length < 1) {
            // No output, no errors
            return toReturn;
          }

          const lintResult = JSON.parse(output);

          if (lintResult.messages.length < 1) {
            // Output, but no errors found
            return toReturn;
          }

          lintResult.messages.forEach((data) => {
            let line;
            let col;
            if (!(data.line && data.col)) {
              // Use the file start if a location wasn't defined
              [line, col] = [0, 0];
            } else {
              [line, col] = [data.line - 1, data.col - 1];
            }

            const msg = {
              type: data.type.charAt(0).toUpperCase() + data.type.slice(1),
              text: data.message,
              filePath,
              range: helpers.rangeFromLineNumber(textEditor, line, col),
            };

            if (data.rule.id && data.rule.desc) {
              msg.trace = [{
                type: 'Trace',
                text: `[${data.rule.id}] ${data.rule.desc}`,
              }];
            }
            toReturn.push(msg);
          });
          return toReturn;
        });
      },
    };
  },
};
