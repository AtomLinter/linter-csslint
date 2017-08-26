'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

// Dependencies
let fs;
let path;
let helpers;

// Internal Variables
let bundledCsslintPath;

const loadDeps = () => {
  if (!fs) {
    fs = require('fs-plus');
  }
  if (!path) {
    path = require('path');
  }
  if (!helpers) {
    helpers = require('atom-linter');
  }
};

export default {
  activate() {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterCsslintDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-csslint');
      }
      loadDeps();

      // FIXME: Remove this after a few versions
      if (atom.config.get('linter-csslint.disableTimeout')) {
        atom.config.unset('linter-csslint.disableTimeout');
      }
    };
    depsCallbackID = window.requestIdleCallback(installLinterCsslintDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe('linter-csslint.executablePath', (value) => {
        this.executablePath = value;
      }),
    );
  },

  deactivate() {
    this.idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'CSSLint',
      grammarScopes: ['source.css', 'source.html'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        loadDeps();
        const filePath = textEditor.getPath();
        const text = textEditor.getText();
        if (!filePath || text.length === 0) {
          // Empty or unsaved file
          return [];
        }

        const parameters = [
          '--format=json',
          filePath,
        ];

        const projectPath = atom.project.relativizePath(filePath)[0];
        let cwd = projectPath;
        if (!cwd) {
          cwd = path.dirname(filePath);
        }

        const execOptions = {
          cwd,
          uniqueKey: `linter-csslint::${filePath}`,
          timeout: 1000 * 30, // 30 seconds
          ignoreExitCode: true,
        };

        const execPath = this.determineExecPath(this.executablePath, projectPath);

        const output = await helpers.exec(execPath, parameters, execOptions);

        if (textEditor.getText() !== text) {
          // The editor contents have changed, tell Linter not to update
          return null;
        }

        const toReturn = [];

        if (output.length < 1) {
          // No output, no errors
          return toReturn;
        }

        let lintResult;
        try {
          lintResult = JSON.parse(output);
        } catch (e) {
          const excerpt = 'Invalid response received from CSSLint, check ' +
            'your console for more details.';
          return [{
            severity: 'error',
            excerpt,
            location: {
              file: filePath,
              position: helpers.generateRange(textEditor, 0),
            },
          }];
        }

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

          const severity = data.type === 'error' ? 'error' : 'warning';

          const msg = {
            severity,
            excerpt: data.message,
            location: {
              file: filePath,
              position: helpers.generateRange(textEditor, line, col),
            },
          };
          if (data.rule.id && data.rule.desc) {
            msg.details = `${data.rule.desc} (${data.rule.id})`;
          }
          if (data.rule.url) {
            msg.url = data.rule.url;
          }

          toReturn.push(msg);
        });

        return toReturn;
      },
    };
  },

  determineExecPath(givenPath, projectPath) {
    let execPath = givenPath;
    if (execPath === '') {
      // Use the bundled copy of CSSLint
      let relativeBinPath = path.join('node_modules', '.bin', 'csslint');
      if (process.platform === 'win32') {
        relativeBinPath += '.cmd';
      }
      if (!bundledCsslintPath) {
        const packagePath = atom.packages.resolvePackagePath('linter-csslint');
        bundledCsslintPath = path.join(packagePath, relativeBinPath);
      }
      execPath = bundledCsslintPath;
      if (projectPath) {
        const localCssLintPath = path.join(projectPath, relativeBinPath);
        if (fs.existsSync(localCssLintPath)) {
          execPath = localCssLintPath;
        }
      }
    } else {
      // Normalize any usage of ~
      fs.normalize(execPath);
    }
    return execPath;
  },
};
