{CompositeDisposable} = require 'atom'
helpers = null
path = null

module.exports =
  activate: ->
    require('atom-package-deps').install('linter-csslint')
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-csslint.disableTimeout',
      (disableTimeout) =>
        @disableTimeout = disableTimeout

  deactivate: ->
    @subscriptions.dispose()

  provideLinter: ->
    provider =
      name: 'CSSLint'
      grammarScopes: ['source.css', 'source.html']
      scope: 'file'
      lintOnFly: true
      lint: (textEditor) ->
        helpers ?= require('atom-linter')
        path ?= require('path')
        filePath = textEditor.getPath()
        text = textEditor.getText()
        return Promise.resolve([]) if text.length is 0
        parameters = ['--format=json', '-']
        exec = path.join(__dirname, '..', 'node_modules', 'atomlinter-csslint', 'cli.js')
        paths = atom.project.relativizePath(filePath)
        cwd = paths[0]
        if not (cwd)
          cwd = path.dirname(textEditor.getPath())
        options = {stdin: text, cwd: cwd}
        if @disableTimeout
          options.timeout = Infinity
        helpers.execNode(exec, parameters, options).then (output) ->
          toReturn = []
          return toReturn if output.length < 1
          lintResult = JSON.parse(output)
          if lintResult.messages.length < 1
            return toReturn
          for data in lintResult.messages
            msg = {}
            if not (data.line and data.col)
              # Use the file start if location not defined
              msg.range = helpers.rangeFromLineNumber(textEditor, 0)
            else
              line = data.line - 1
              col = data.col - 1
              msg.range = [[line, col], [line, col]]
            msg.type = data.type.charAt(0).toUpperCase() + data.type.slice(1)
            msg.text = data.message
            msg.filePath = filePath
            if data.rule.id and data.rule.desc
              msg.trace = [{
                type: "Trace",
                text: '[' + data.rule.id + '] ' + data.rule.desc
              }]
            toReturn.push(msg)
          return toReturn
