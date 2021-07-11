'use strict'

/**
 * Simple script for adjusting several files with relative imports after "yarn build" in order to easily test some jest unreleased features.
 * Usage: node patch.js
 */

const fs = require('fs')
const path = require('path')

const replacements = [
  {
    requireValue: '@jest/console',
    destination: 'jest-console/build/index.js'
  },
  {
    requireValue: '@jest/core',
    destination: 'jest-core/build/jest.js'
  },
  {
    requireValue: '@jest/fake-timers',
    destination: 'jest-fake-timers/build/index.js'
  },
  {
    requireValue: '@jest/test-result',
    destination: 'jest-test-result/build/index.js'
  },
  {
    requireValue: '@jest/transform',
    destination: 'jest-transform/build/index.js'
  },
  {
    requireValue: '@jest/reporters',
    destination: 'jest-reporters/build/index.js'
  },
  {
    requireValue: '@jest/source-map',
    destination: 'jest-source-map/build/index.js'
  },
  {
    requireValue: 'diff-sequences',
    destination: 'diff-sequences/build/index.js'
  },
  {
    requireValue: 'expect',
    destination: 'expect/build/index.js'
  },
  {
    requireValue: 'expect/build/utils',
    destination: 'expect/build/utils.js'
  },
  {
    requireValue: 'jest-circus/runner',
    destination: 'jest-circus/runner.js'
  },
  {
    requireValue: 'jest-cli',
    destination: 'jest-cli/build/index.js'
  },
  {
    requireValue: 'jest-config',
    destination: 'jest-config/build/index.js'
  },
  {
    requireValue: 'jest-diff',
    destination: 'jest-diff/build/index.js'
  },
  {
    requireValue: 'jest-docblock',
    destination: 'jest-docblock/build/index.js'
  },
  {
    requireValue: 'jest-each',
    destination: 'jest-each/build/index.js'
  },
  {
    requireValue: 'jest-environment-node',
    destination: 'jest-environment-node/build/index.js'
  },
  {
    requireValue: 'jest-get-type',
    destination: 'jest-get-type/build/index.js'
  },
  {
    requireValue: 'jest-haste-map',
    destination: 'jest-haste-map/build/index.js'
  },
  {
    requireValue: 'jest-matcher-utils',
    destination: 'jest-matcher-utils/build/index.js'
  },
  {
    requireValue: 'jest-message-util',
    destination: 'jest-message-util/build/index.js'
  },
  {
    requireValue: 'jest-leak-detector',
    destination: 'jest-leak-detector/build/index.js'
  },
  {
    requireValue: 'jest-regex-util',
    destination: 'jest-regex-util/build/index.js'
  },
  {
    requireValue: 'jest-resolve',
    destination: 'jest-resolve/build/index.js'
  },
  {
    requireValue: 'jest-resolve-dependencies',
    destination: 'jest-resolve-dependencies/build/index.js'
  },
  {
    requireValue: 'jest-runtime',
    destination: 'jest-runtime/build/index.js'
  },
  {
    requireValue: 'jest-serializer',
    destination: 'jest-serializer/build/index.js'
  },
  {
    requireValue: 'jest-snapshot',
    destination: 'jest-snapshot/build/index.js'
  },
  {
    requireValue: 'jest-snapshot-serializer-raw',
    destination: 'jest-snapshot-serializer-raw/lib/index.js'
  },
  {
    requireValue: 'jest-util',
    destination: 'jest-util/build/index.js'
  },
  {
    requireValue: 'jest-validate',
    destination: 'jest-validate/build/index.js'
  },
  {
    requireValue: 'jest-watcher',
    destination: 'jest-watcher/build/index.js'
  },
  {
    requireValue: 'jest-worker',
    destination: 'jest-worker/build/index.js'
  },
  {
    requireValue: 'jest-changed-files',
    destination: 'jest-changed-files/build/index.js'
  },
  {
    requireValue: 'jest-mock',
    destination: 'jest-mock/build/index.js'
  }
]

const dirsToProcess = [
  './babel-jest/build',
  './babel-plugin-jest-hoist/build',
  './babel-preset-jest',
  './diff-sequences/build',
  './expect/build',

  // './jest/bin',
  './jest/build',

  './jest-changed-files/build',
  './jest-circus/build',
  './jest-circus/build/legacy-code-todo-rewrite',
  // './jest-cli/bin',
  './jest-cli/build/cli',
  './jest-cli/build/init',
  './jest-cli/build',
  './jest-config/build',
  './jest-config/build/vendor',
  './jest-console/build',
  './jest-core/build/assets',
  './jest-core/build/cli',
  './jest-core/build/lib',
  './jest-core/build/plugins',
  './jest-core/build',
  './jest-create-cache-key-function/build',
  './jest-diff/build',
  './jest-docblock/build',
  './jest-each/assets',
  './jest-each/build',
  './jest-each/build/table',
  './jest-environment/build',
  './jest-environment-jsdom/build',
  './jest-environment-node/build',
  './jest-fake-timers/build',
  './jest-get-type/build',
  './jest-globals/build',
  './jest-haste-map/build',
  './jest-haste-map/build/crawlers',
  './jest-haste-map/build/lib',
  './jest-haste-map/build/watchers',
  './jest-jasmine2/build',
  './jest-jasmine2/build/jasmine',
  './jest-leak-detector/build',
  './jest-matcher-utils/build',
  './jest-message-util/build',
  './jest-mock/build',
  './jest-phabricator/build',
  './jest-regex-util/build',
  './jest-repl/bin',
  './jest-repl/build',
  './jest-repl/build/cli',
  './jest-reporters/build',
  './jest-resolve/build',
  './jest-resolve-dependencies/build',
  './jest-resolve-dependencies/__mocks__',
  './jest-runner/build',
  './jest-runtime/build',
  './jest-serializer/build',
  './jest-snapshot/build',
  './jest-source-map/build',
  './jest-test-result/build',
  './jest-test-sequencer/build',
  './jest-transform/build',
  './jest-types/build',
  './jest-util/build',
  './jest-validate/build',
  './jest-watcher/build',
  './jest-watcher/build/lib',
  './jest-worker/build',
  './jest-worker/build/base',
  './jest-worker/build/workers',
  './jest-worker/build/__performance_tests__',
  './jest-worker/build/__performance_tests__/workers',
  './pretty-format/build',
  './pretty-format/perf',
  './pretty-format/build/plugins',
  './pretty-format/build/plugins/lib',
  './test-utils/build'
]

const processImports = (sourceStr = '', depth = 3, filePath) => {
  const sourceStrLines = sourceStr.split('\n')
  let newSourceStr = ''
  const replacementsDone = new Set()
  for (let i = 0; i < sourceStrLines.length; i++) {
    newSourceStr += sourceStrLines[i] + '\n'
    for (const replacement of replacements) {
      const searchValue = `require('${replacement.requireValue}')`
      while (newSourceStr.includes(searchValue)) {
        const newValue = `require('${path.join(...Array(depth).fill('../'), replacement.destination)}')`
        newSourceStr = newSourceStr.replace(searchValue, newValue)
        replacementsDone.add(`${filePath}:${i + 1}: ${searchValue} -> ${newValue}`)
      }
    }
  }
  if (filePath) {
    const totalReplaces = [...replacementsDone.values()].join('\n')
    if (totalReplaces) console.log(totalReplaces)
  }
  return newSourceStr
}

const processResolves = (sourceStr = '', depth = 3, filePath) => {
  const sourceStrLines = sourceStr.split('\n')
  let newSourceStr = ''
  const replacementsDone = new Set()
  for (let i = 0; i < sourceStrLines.length; i++) {
    newSourceStr += sourceStrLines[i] + '\n'
    for (const replacement of replacements) {
      const searchValue = `require.resolve('${replacement.requireValue}')`
      while (newSourceStr.includes(searchValue)) {
        const newValue = `require.resolve('${path.join(...Array(depth).fill('../'), replacement.destination)}')`
        newSourceStr = newSourceStr.replace(searchValue, newValue)
        replacementsDone.add(`${filePath}:${i + 1}: ${searchValue} -> ${newValue}`)
      }
    }
  }
  if (filePath) {
    const totalReplaces = [...replacementsDone.values()].join('\n')
    if (totalReplaces) console.log(totalReplaces)
  }
  return newSourceStr
}

const processFile = file => {
  let depth = file.split('/').length - 2
  if (depth < 0) depth = 0
  const filePath = path.join(__dirname, file)
  const sourceStr = fs.readFileSync(filePath).toString()
  let newSourceStr = processImports(sourceStr, depth, filePath)
  newSourceStr = processResolves(newSourceStr, depth, filePath)
  fs.writeFileSync(filePath, newSourceStr)
}

const processFileWithCustomReplacements = (file, replacements = []) => {
  const filePath = path.join(__dirname, file)
  const sourceStr = fs.readFileSync(filePath).toString()

  const sourceStrLines = sourceStr.split('\n')
  let newSourceStr = ''
  const replacementsDone = new Set()
  for (let i = 0; i < sourceStrLines.length; i++) {
    newSourceStr += sourceStrLines[i] + '\n'
    for (const replacement of replacements) {
      const { searchValue, newValue } = replacement
      while (newSourceStr.includes(searchValue)) {
        newSourceStr = newSourceStr.replace(searchValue, newValue)
        replacementsDone.add(`${filePath}:${i + 1}: ${searchValue} -> ${newValue}`)
      }
    }
  }
  if (filePath) {
    const totalReplaces = [...replacementsDone.values()].join('\n')
    if (totalReplaces) console.log(totalReplaces)
  }

  fs.writeFileSync(filePath, newSourceStr)
  return newSourceStr
}

let files = []
for (const dirToProcess of dirsToProcess) {
  files.push(...fs.readdirSync(path.join(__dirname, dirToProcess)).filter(dir => dir.endsWith('.js')).map(t => `${dirToProcess}/${t}`))
  files = [...new Set(files)]
}
console.log(
  files
)
files.map(file => processFile(file))

processFileWithCustomReplacements('./jest-config/build/Defaults.js', [
  {
    searchValue: `testEnvironment: 'jest-environment-node',`,
    newValue: `testEnvironment: '../../jest-environment-node/build/index.js',`
  },
  {
    searchValue: `runner: 'jest-runner',`,
    newValue: `runner: '../../jest-runner/build/index.js',`
  },
  {
    searchValue: `testRunner: 'jest-circus/runner',`,
    newValue: `testRunner: '../../jest-circus/runner.js',`
  },
  {
    searchValue: `testSequencer: '@jest/test-sequencer',`,
    newValue: `testSequencer: '../../jest-test-sequencer/build/index.js',`
  }
])

processFileWithCustomReplacements('./test-utils/build/config.js', [
  {
    searchValue: `testRunner: 'jest-circus/runner',`,
    newValue: `testRunner: '../../jest-circus/runner.js',`
  }
])