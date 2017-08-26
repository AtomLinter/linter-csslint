'use babel';

import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';
import linterCsslint from '../lib/main';

const linterProvider = linterCsslint.provideLinter();
const lint = linterProvider.lint;

const badPath = path.join(__dirname, 'fixtures', 'bad.css');
const goodPath = path.join(__dirname, 'fixtures', 'good.css');
const invalidPath = path.join(__dirname, 'fixtures', 'invalid.css');
const emptyPath = path.join(__dirname, 'fixtures', 'empty.css');
const projectPath = path.join(__dirname, 'fixtures', 'project');
const projectBadPath = path.join(projectPath, 'files', 'badWC.css');

const emptyRulesDetails = 'Rules without any properties specified should be ' +
  'removed. (empty-rules)';
const emptRulesUrl = 'https://github.com/CSSLint/csslint/wiki/Disallow-empty-rules';

describe('The CSSLint provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();

    await atom.packages.activatePackage('linter-csslint');
    await atom.packages.activatePackage('language-css');
  });

  describe('checks bad.css and', () => {
    it('verifies the first message', async () => {
      const editor = await atom.workspace.open(badPath);
      const messages = await lint(editor);

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('warning');
      expect(messages[0].excerpt).toBe('Rule is empty.');
      expect(messages[0].details).toBe(emptyRulesDetails);
      expect(messages[0].url).toBe(emptRulesUrl);
      expect(messages[0].location.file).toBe(badPath);
      expect(messages[0].location.position).toEqual([[0, 0], [0, 4]]);
    });
  });

  describe('warns on invalid CSS', () => {
    it('verifies the message', async () => {
      const editor = await atom.workspace.open(invalidPath);
      const messages = await lint(editor);
      const details = 'This rule looks for recoverable syntax errors. (errors)';

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('error');
      expect(messages[0].excerpt).toBe('Unexpected token \'}\' at line 1, col 1.');
      expect(messages[0].details).toBe(details);
      expect(messages[0].url).not.toBeDefined();
      expect(messages[0].location.file).toBe(invalidPath);
      expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
    });
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('handles an empty file', async () => {
    const editor = await atom.workspace.open(emptyPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('respects .csslintrc configurations at the project root', async () => {
    atom.project.addPath(projectPath);
    const editor = await atom.workspace.open(projectBadPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe('Rule is empty.');
    expect(messages[0].details).toBe(emptyRulesDetails);
    expect(messages[0].url).toBe(emptRulesUrl);
    expect(messages[0].location.file).toBe(projectBadPath);
    expect(messages[0].location.position).toEqual([[0, 0], [0, 4]]);
  });

  describe('dynamically determines where to execute from', () => {
    it('uses the bundled version when unspecified and no local version', () => {
      const packagePath = atom.packages.resolvePackagePath('linter-csslint');
      let relativeBinPath = path.join('node_modules', '.bin', 'csslint');
      if (process.platform === 'win32') {
        relativeBinPath += '.cmd';
      }

      const foundPath = linterCsslint.determineExecPath('', '');
      expect(foundPath).toBe(path.join(packagePath, relativeBinPath));
    });

    it('finds a local install if it exists', () => {
      const execProjectPath = path.join(__dirname, 'fixtures', 'execProject');
      let relativeBinPath = path.join('node_modules', '.bin', 'csslint');
      if (process.platform === 'win32') {
        relativeBinPath += '.cmd';
      }

      const foundPath = linterCsslint.determineExecPath('', execProjectPath);
      expect(foundPath).toBe(path.join(execProjectPath, relativeBinPath));
    });

    it('trusts what the user tells it', async () => {
      const foundPath = linterCsslint.determineExecPath('foobar', '');
      expect(foundPath).toBe('foobar');
    });
  });
});
