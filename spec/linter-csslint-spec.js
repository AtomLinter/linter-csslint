'use babel';

import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';

const badPath = path.join(__dirname, 'fixtures', 'bad.css');
const goodPath = path.join(__dirname, 'fixtures', 'good.css');
const invalidPath = path.join(__dirname, 'fixtures', 'invalid.css');
const emptyPath = path.join(__dirname, 'fixtures', 'empty.css');
const projectPath = path.join(__dirname, 'fixtures', 'project');
const projectBadPath = path.join(projectPath, 'files', 'badWC.css');

describe('The csslint provider for Linter', () => {
  const lint = require('../lib/main.js').provideLinter().lint;

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
      expect(messages[0].type).toBe('Warning');
      expect(messages[0].text).toBe('Rule is empty.');
      expect(messages[0].filePath).toBe(badPath);
      expect(messages[0].range).toEqual([[0, 0], [0, 4]]);
    });
  });

  describe('warns on invalid CSS', () => {
    it('verifies the message', async () => {
      const editor = await atom.workspace.open(invalidPath);
      const messages = await lint(editor);

      expect(messages.length).toBe(1);
      expect(messages[0].type).toBe('Error');
      expect(messages[0].text).toBe('Unexpected token \'}\' at line 1, col 1.');
      expect(messages[0].filePath).toBe(invalidPath);
      expect(messages[0].range).toEqual([[0, 0], [0, 1]]);
    });
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodPath);
    const messages = await lint(editor);

    expect(messages.length).toEqual(0);
  });

  it('handles an empty file', async () => {
    const editor = await atom.workspace.open(emptyPath);
    const messages = await lint(editor);

    expect(messages.length).toEqual(0);
  });

  it('respects .csslintrc configurations at the project root', async () => {
    atom.project.addPath(projectPath);
    const editor = await atom.workspace.open(projectBadPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].type).toBeDefined();
    expect(messages[0].type).toEqual('Error');
    expect(messages[0].text).toBeDefined();
    expect(messages[0].text).toEqual('Rule is empty.');
  });
});
