/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import {Config} from '@jest/types';
import {AggregatedResult} from '@jest/test-result';
import chalk from 'chalk';
import slash from 'slash';
import {pluralize} from 'jest-util';
import React, {PureComponent, FC} from 'react';
import {Box, Color, Text} from 'ink';
import {SummaryOptions} from './types';

const PROGRESS_BAR_WIDTH = 40;

export const printDisplayName = (config: Config.ProjectConfig) => {
  const {displayName} = config;

  if (displayName) {
    return chalk.supportsColor
      ? chalk.reset.inverse.white(` ${displayName} `)
      : displayName;
  }

  return '';
};

export const FormattedPath = ({
  pad,
  config,
  testPath,
  columns,
}: {
  pad: number;
  config: Config.ProjectConfig | Config.GlobalConfig;
  testPath: Config.Path;
  columns?: number;
}) => {
  const maxLength = (columns || 0) - pad;
  const relative = relativePath(config, testPath);
  const {basename} = relative;
  let {dirname} = relative;
  dirname = slash(dirname);

  // length is ok
  if ((dirname + '/' + basename).length <= maxLength) {
    return (
      <>
        <Color dim>{dirname}/</Color>
        <Color bold>{basename}</Color>
      </>
    );
  }

  // we can fit trimmed dirname and full basename
  const basenameLength = basename.length;
  if (basenameLength + 4 < maxLength) {
    const dirnameLength = maxLength - 4 - basenameLength;
    dirname =
      '…' + dirname.slice(dirname.length - dirnameLength, dirname.length);
    return (
      <>
        <Color dim>{dirname}/</Color>
        <Color bold>{basename}</Color>
      </>
    );
  }

  if (basenameLength + 4 === maxLength) {
    return (
      <>
        <Color dim>…/</Color>
        <Color bold>{basename}</Color>
      </>
    );
  }

  // can't fit dirname, but can fit trimmed basename
  return (
    <Color bold>
      …{basename.slice(basename.length - maxLength - 4, basename.length)}
    </Color>
  );
};

const SummaryHeading: React.FC = ({children}) => (
  <Box width={13}>
    <Text bold>{children}</Text>
  </Box>
);

export const formatTestPath = (
  config: Config.GlobalConfig | Config.ProjectConfig,
  testPath: Config.Path,
) => {
  const {dirname, basename} = relativePath(config, testPath);
  return slash(chalk.dim(dirname + path.sep) + chalk.bold(basename));
};

export const relativePath = (
  config: Config.GlobalConfig | Config.ProjectConfig,
  testPath: Config.Path,
) => {
  // this function can be called with ProjectConfigs or GlobalConfigs. GlobalConfigs
  // do not have config.cwd, only config.rootDir. Try using config.cwd, fallback
  // to config.rootDir. (Also, some unit just use config.rootDir, which is ok)
  testPath = path.relative(
    (config as Config.ProjectConfig).cwd || config.rootDir,
    testPath,
  );
  const dirname = path.dirname(testPath);
  const basename = path.basename(testPath);
  return {basename, dirname};
};

type SummaryProps = {
  aggregatedResults: AggregatedResult;
  options?: SummaryOptions;
};

export class Summary extends PureComponent<SummaryProps, {runTime: number}> {
  interval?: NodeJS.Timer;
  constructor(props: SummaryProps) {
    super(props);

    this.state = {runTime: this.getRuntime()};
  }

  getRuntime() {
    const {aggregatedResults, options} = this.props;

    let runTime = (Date.now() - aggregatedResults.startTime) / 1000;

    if (options && options.roundTime) {
      runTime = Math.floor(runTime);
    }

    return runTime;
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const runTime = this.getRuntime();

      this.setState({runTime});
    }, 1000);

    this.interval.unref();
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const {aggregatedResults, options} = this.props;
    const {runTime} = this.state;

    const estimatedTime = (options && options.estimatedTime) || 0;
    const snapshotResults = aggregatedResults.snapshot;
    const snapshotsAdded = snapshotResults.added;
    const snapshotsFailed = snapshotResults.unmatched;
    const snapshotsOutdated = snapshotResults.unchecked;
    const snapshotsFilesRemoved = snapshotResults.filesRemoved;
    const snapshotsDidUpdate = snapshotResults.didUpdate;
    const snapshotsPassed = snapshotResults.matched;
    const snapshotsTotal = snapshotResults.total;
    const snapshotsUpdated = snapshotResults.updated;
    const suitesFailed = aggregatedResults.numFailedTestSuites;
    const suitesPassed = aggregatedResults.numPassedTestSuites;
    const suitesPending = aggregatedResults.numPendingTestSuites;
    const suitesRun = suitesFailed + suitesPassed;
    const suitesTotal = aggregatedResults.numTotalTestSuites;
    const testsFailed = aggregatedResults.numFailedTests;
    const testsPassed = aggregatedResults.numPassedTests;
    const testsPending = aggregatedResults.numPendingTests;
    const testsTodo = aggregatedResults.numTodoTests;
    const testsTotal = aggregatedResults.numTotalTests;
    const width = (options && options.width) || 0;

    return (
      <Box flexDirection="column">
        <Box>
          <SummaryHeading>Test Suites:</SummaryHeading>
          <Box>
            {suitesFailed > 0 && (
              <>
                <Color bold red>
                  {suitesFailed} failed
                </Color>
                ,{' '}
              </>
            )}
            {suitesPending > 0 && (
              <>
                <Color bold yellow>
                  {suitesPending} skipped
                </Color>
                ,{' '}
              </>
            )}
            {suitesPassed > 0 && (
              <>
                <Color bold green>
                  {suitesPassed} passed
                </Color>
                ,{' '}
              </>
            )}
            {suitesRun !== suitesTotal && suitesRun + ' of '}
            {suitesTotal} total
          </Box>
        </Box>
        <Box>
          <SummaryHeading>Tests:</SummaryHeading>
          <Box>
            {testsFailed > 0 && (
              <>
                <Color bold red>
                  {testsFailed} failed
                </Color>
                ,{' '}
              </>
            )}
            {testsPending > 0 && (
              <>
                <Color bold yellow>
                  {testsPending} skipped
                </Color>
                ,{' '}
              </>
            )}
            {testsTodo > 0 && (
              <>
                <Color bold magenta>
                  {testsTodo} todo
                </Color>
                ,{' '}
              </>
            )}
            {testsPassed > 0 && (
              <>
                <Color bold green>
                  {testsPassed} passed
                </Color>
                ,{' '}
              </>
            )}
            {testsTotal} total
          </Box>
        </Box>
        <Box>
          <SummaryHeading>Snapshots:</SummaryHeading>
          <Box>
            {snapshotsFailed > 0 && (
              <>
                <Color bold red>
                  {snapshotsFailed} failed
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsOutdated > 0 && !snapshotsDidUpdate && (
              <>
                <Color bold yellow>
                  {snapshotsOutdated} obsolete
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsOutdated > 0 && snapshotsDidUpdate && (
              <>
                <Color bold green>
                  {snapshotsOutdated} removed
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsFilesRemoved > 0 && !snapshotsDidUpdate && (
              <>
                <Color bold yellow>
                  {pluralize('file', snapshotsFilesRemoved)} obsolete
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsFilesRemoved > 0 && snapshotsDidUpdate && (
              <>
                <Color bold green>
                  {pluralize('file', snapshotsFilesRemoved)} removed
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsUpdated > 0 && (
              <>
                <Color bold green>
                  {snapshotsUpdated} updated
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsAdded > 0 && (
              <>
                <Color bold green>
                  {snapshotsAdded} written
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsPassed > 0 && (
              <>
                <Color bold green>
                  {snapshotsPassed} passed
                </Color>
                ,{' '}
              </>
            )}
            {snapshotsTotal} total
          </Box>
        </Box>

        <Box>
          <SummaryHeading>Time:</SummaryHeading>

          <Time runTime={runTime} estimatedTime={estimatedTime} />
        </Box>
        <ProgressBar
          runTime={runTime}
          estimatedTime={estimatedTime}
          width={width}
        />
      </Box>
    );
  }
}

const ProgressBar: FC<{
  runTime: number;
  estimatedTime: number;
  width?: number;
}> = ({estimatedTime, runTime, width}) => {
  // Only show a progress bar if the test run is actually going to take
  // some time.
  if (estimatedTime <= 2 || runTime >= estimatedTime || !width) {
    return null;
  }
  const availableWidth = Math.min(PROGRESS_BAR_WIDTH, width);

  if (availableWidth < 2) {
    return null;
  }

  const length = Math.min(
    Math.floor((runTime / estimatedTime) * availableWidth),
    availableWidth,
  );

  return (
    <Box>
      <Color green>{'█'.repeat(length)}</Color>
      <Color white>{'█'.repeat(availableWidth - length)}</Color>
    </Box>
  );
};

const Time: FC<{runTime: number; estimatedTime: number}> = ({
  runTime,
  estimatedTime,
}) => {
  // If we are more than one second over the estimated time, highlight it.
  const renderedTime =
    estimatedTime && runTime >= estimatedTime + 1 ? (
      <Color bold yellow>
        {runTime}s
      </Color>
    ) : (
      <Text>{runTime}s</Text>
    );

  return (
    <Box>
      {renderedTime}
      {runTime < estimatedTime && <>, estimated {estimatedTime}s</>}
    </Box>
  );
};

// word-wrap a string that contains ANSI escape sequences.
// ANSI escape sequences do not add to the string length.
export const wrapAnsiString = (string: string, terminalWidth: number) => {
  if (terminalWidth === 0) {
    // if the terminal width is zero, don't bother word-wrapping
    return string;
  }

  const ANSI_REGEXP = /[\u001b\u009b]\[\d{1,2}m/g;
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = ANSI_REGEXP.exec(string))) {
    const ansi = match[0];
    const index = match['index'];
    if (index != lastIndex) {
      tokens.push(['string', string.slice(lastIndex, index)]);
    }
    tokens.push(['ansi', ansi]);
    lastIndex = index + ansi.length;
  }

  if (lastIndex != string.length - 1) {
    tokens.push(['string', string.slice(lastIndex, string.length)]);
  }

  let lastLineLength = 0;

  return tokens
    .reduce(
      (lines, [kind, token]) => {
        if (kind === 'string') {
          if (lastLineLength + token.length > terminalWidth) {
            while (token.length) {
              const chunk = token.slice(0, terminalWidth - lastLineLength);
              const remaining = token.slice(
                terminalWidth - lastLineLength,
                token.length,
              );
              lines[lines.length - 1] += chunk;
              lastLineLength += chunk.length;
              token = remaining;
              if (token.length) {
                lines.push('');
                lastLineLength = 0;
              }
            }
          } else {
            lines[lines.length - 1] += token;
            lastLineLength += token.length;
          }
        } else {
          lines[lines.length - 1] += token;
        }

        return lines;
      },
      [''],
    )
    .join('\n');
};
