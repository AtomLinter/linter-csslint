'use babel';

import * as path from 'path';

const badPath = path.join(__dirname, 'fixtures', 'bad.css');
const goodPath = path.join(__dirname, 'fixtures', 'good.css');
const invalidPath = path.join(__dirname, 'fixtures', 'invalid.css');
const projectPath = path.join(__dirname, 'fixtures', 'project');
const projectBadPath = path.join(projectPath, 'files', 'badWC.css');

describe('The csslint provider for Linter', () => {
  const lint = require('../lib/main').provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-csslint');
      return atom.packages.activatePackage('language-css').then(() =>
        atom.workspace.open(goodPath)
      );
    });
  });

  describe('checks bad.css and', () => {
    let editor = null;
    beforeEach(() =>
      waitsForPromise(() =>
        atom.workspace.open(badPath).then(openEditor => editor = openEditor)
      )
    );

    it('finds at least one message', () =>
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBeGreaterThan(0)
        )
      )
    );

    it('verifies the first message', () =>
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Warning');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual('Rule is empty.');
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+bad\.css$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[0, 0], [0, 0]]);
        })
      )
    );
  });

  describe('warns on invalid CSS', () => {
    let editor = null;
    beforeEach(() =>
      waitsForPromise(() =>
        atom.workspace.open(invalidPath).then(openEditor => editor = openEditor)
      )
    );

    it('finds one message', () =>
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBe(1)
        )
      )
    );

    it('verifies the message', () =>
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual('Unexpected token \'}\' at line 1, col 1.');
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+invalid\.css$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[0, 0], [0, 0]]);
        })
      )
    );
  });

  it('finds nothing wrong with a valid file', () =>
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toEqual(0)
        )
      )
    )
  );

  it('respects .csslintrc configurations at the project root', () => {
    atom.project.addPath(projectPath);
    waitsForPromise(() =>
      atom.workspace.open(projectBadPath).then(editor =>
        lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual('Rule is empty.');
        })
      )
    );
  });
});
