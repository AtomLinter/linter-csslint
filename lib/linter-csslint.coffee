linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"

class LinterCsslint extends Linter

  # The syntax that the linter handles. May be a string or
  # list/tuple of strings. Names should be all lowercase.
  @syntax: ['source.css', 'source.html']

  # A string, list, tuple or callable that returns a string, list or tuple,
  # containing the command line (with arguments) used to lint.
  cmd: 'csslint --format=compact'

  linterName: 'csslint'

  # A regex pattern used to extract information from the executable's output.
  regex:
    '.+:\\s*' + # filename
    # csslint emits errors that pertain to the code as a whole,
    # in which case there is no line/col information, so that
    # part is optional.
    '(line (?<line>\\d+), col (?<col>\\d+), )?' +
    '((?<error>Error)|(?<warning>Warning)) - (?<message>.*)'

  #isNodeExecutable: yes

  constructor: (editor)->
    super(editor)

    @configSubscription = atom.config.observe 'linter-csslint.csslintExecutablePath', =>
      @executablePath = atom.config.get 'linter-csslint.csslintExecutablePath'

  destroy: ->
    super
    @configSubscription.dispose()

module.exports = LinterCsslint
