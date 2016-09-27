'use babel';

import * as path from 'path';

const badPath = path.join(__dirname, 'fixtures', 'bad.css');
const goodPath = path.join(__dirname, 'fixtures', 'good.css');
const invalidPath = path.join(__dirname, 'fixtures', 'invalid.css');
const emptyPath = path.join(__dirname, 'fixtures', 'empty.css');
const projectPath = path.join(__dirname, 'fixtures', 'project');
const projectBadPath = path.join(projectPath, 'files', 'badWC.css');

describe('The csslint provider for Linter', () => {
  const lint = require('../lib/main.js').provideLinter().lint;

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
        atom.workspace.open(badPath).then((openEditor) => { editor = openEditor; })
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
        lint(editor).then((messages) => {
          expect(messages[0].type).toBe('Warning');
          expect(messages[0].text).toBe('Rule is empty.');
          expect(messages[0].filePath).toBe(badPath);
          expect(messages[0].range).toEqual([[0, 0], [0, 4]]);
        })
      )
    );
  });

  describe('warns on invalid CSS', () => {
    let editor = null;
    beforeEach(() =>
      waitsForPromise(() =>
        atom.workspace.open(invalidPath).then((openEditor) => { editor = openEditor; })
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
        lint(editor).then((messages) => {
          expect(messages[0].type).toBe('Error');
          expect(messages[0].text).toBe('Unexpected token \'}\' at line 1, col 1.');
          expect(messages[0].filePath).toBe(invalidPath);
          expect(messages[0].range).toEqual([[0, 0], [0, 1]]);
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

  it('handles an empty file', () =>
    waitsForPromise(() =>
      atom.workspace.open(emptyPath).then(editor =>
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
        lint(editor).then((messages) => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual('Rule is empty.');
        })
      )
    );
  });
});
