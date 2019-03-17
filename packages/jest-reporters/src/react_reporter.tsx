/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import React, {FC, Fragment, PureComponent} from 'react';
import {Box, Color, ColorProps, render, Static, StdoutContext} from 'ink';
import slash from 'slash';
import {Config} from '@jest/types';
import {AggregatedResult, TestResult} from '@jest/test-result';
import {ConsoleBuffer, LogType} from '@jest/console';
import BaseReporter from './base_reporter';
import {FormattedPath, Summary} from './utils';
import SnapshotStatus from './get_snapshot_status';
import {ReporterOnStartOptions, Test} from './types';

const TitleBullet = () => <Color bold>&#9679;</Color>;

const DisplayName = ({
  displayName,
}: Pick<Config.ProjectConfig, 'displayName'>) => {
  if (!displayName) {
    return null;
  }

  return (
    <Color white inverse>
      {displayName}{' '}
    </Color>
  );
};

const Status: FC<ColorProps> = ({children, ...props}) => (
  <Color inverse bold {...props}>
    &nbsp;
    {children}
    &nbsp;
  </Color>
);

const Runs: FC = () => <Status yellow>RUNS</Status>;

const Fails: FC = () => <Status red>FAIL</Status>;

const Pass: FC = () => <Status green>PASS</Status>;

const TestStatus = ({testResult}: {testResult: TestResult}) => {
  if (testResult.skipped) {
    return null;
  }

  if (testResult.numFailingTests > 0 || testResult.testExecError) {
    return <Fails />;
  }

  return <Pass />;
};

const ColoredConsole: FC<ColorProps & {type: LogType}> = ({
  type,
  ...props
}: {
  type: LogType;
}) => <Color yellow={type === 'warn'} red={type === 'error'} {...props} />;

const TestConsoleOutput = ({
  console,
  verbose,
  cwd,
}: {console?: ConsoleBuffer | null} & Pick<Config.ProjectConfig, 'cwd'> &
  Pick<Config.GlobalConfig, 'verbose'>) => {
  if (!console || console.length === 0) {
    return null;
  }

  const TITLE_INDENT = verbose ? '\xa0'.repeat(2) : '\xa0'.repeat(4);
  const CONSOLE_INDENT = TITLE_INDENT + '\xa0'.repeat(2);

  const content = console.map(({type, message, origin}) => {
    origin = slash(path.relative(cwd, origin));
    message = message
      .split(/\n/)
      .map(line => CONSOLE_INDENT + line)
      .join('\n');

    return (
      <Box key={message} flexDirection="column" paddingBottom={1}>
        <Box>
          {TITLE_INDENT}{' '}
          <ColoredConsole type={type} dim>
            console.
            {type}
          </ColoredConsole>{' '}
          <Color dim>{origin}</Color>
        </Box>
        <ColoredConsole type={type}>{message}</ColoredConsole>
      </Box>
    );
  });

  return (
    <Box flexDirection="column">
      <Box paddingBottom={1}>
        &nbsp;&nbsp;
        <TitleBullet /> Console:
      </Box>
      {content}
    </Box>
  );
};

const CompletedTests = ({
  completedTests,
  width,
  globalConfig,
  done,
}: {
  completedTests: Array<{
    testResult: TestResult;
    config: Config.ProjectConfig;
  }>;
  width?: number;
  globalConfig: Config.GlobalConfig;
  done: boolean;
}) => {
  if (completedTests.length === 0) {
    return null;
  }
  const didUpdate = globalConfig.updateSnapshot === 'all';

  return (
    <Box paddingBottom={done ? 0 : 1} flexDirection="column">
      <Static>
        {completedTests.map(({testResult, config}) => (
          <Fragment key={testResult.testFilePath}>
            <Box>
              <TestStatus testResult={testResult} />{' '}
              <DisplayName displayName={(config || globalConfig).displayName} />
              <FormattedPath
                pad={8}
                columns={width}
                config={config || globalConfig}
                testPath={testResult.testFilePath}
              />
            </Box>
            <TestConsoleOutput
              console={testResult.console}
              verbose={globalConfig.verbose}
              cwd={config.cwd}
            />
            {testResult.failureMessage &&
              testResult.failureMessage.replace(/ /g, '\xa0')}
            <SnapshotStatus
              snapshot={testResult.snapshot}
              afterUpdate={didUpdate}
            />
          </Fragment>
        ))}
      </Static>
    </Box>
  );
};

type DateEvents =
  | {type: 'TestStart'; payload: {test: Test}}
  | {
      type: 'TestResult';
      payload: {
        aggregatedResults: AggregatedResult;
        test: Test;
        testResult: TestResult;
      };
    }
  | {type: 'TestComplete'};

type Props = {
  register: (cb: (events: DateEvents) => void) => void;
  aggregatedResults: AggregatedResult;
  globalConfig: Config.GlobalConfig;
  options: ReporterOnStartOptions;
};

class Reporter extends PureComponent<
  Props,
  {
    aggregatedResults: AggregatedResult;
    completedTests: Array<{
      testResult: TestResult;
      config: Config.ProjectConfig;
    }>;
    currentTests: Array<[Config.Path, Config.ProjectConfig]>;
    done: boolean;
  }
> {
  constructor(props: Props) {
    super(props);

    props.register(this.onNewData.bind(this));

    this.state = {
      aggregatedResults: props.aggregatedResults,
      completedTests: [],
      currentTests: [],
      done: false,
    };
  }

  onNewData(data: DateEvents) {
    switch (data.type) {
      case 'TestStart':
        this.setState({
          currentTests: [
            ...this.state.currentTests,
            [data.payload.test.path, data.payload.test.context.config],
          ],
        });
        break;
      case 'TestResult': {
        const {aggregatedResults, test, testResult} = data.payload;
        const currentTests = this.state.currentTests.filter(
          ([testPath]) => test.path !== testPath,
        );
        this.setState({
          aggregatedResults,
          completedTests: testResult.skipped
            ? this.state.completedTests
            : this.state.completedTests.concat({
                config: test.context.config,
                testResult,
              }),
          currentTests,
        });
        break;
      }
      case 'TestComplete': {
        this.setState({done: true});
        break;
      }
    }
  }

  render() {
    const {currentTests, completedTests, aggregatedResults, done} = this.state;
    const {globalConfig, options} = this.props;
    const {estimatedTime = 0} = options;

    return (
      <Box flexDirection="column">
        <StdoutContext.Consumer>
          {({stdout}) => {
            const width = stdout.columns;

            return (
              <>
                <CompletedTests
                  completedTests={completedTests}
                  width={width}
                  globalConfig={globalConfig}
                  done={done}
                />
                {currentTests.length > 0 && (
                  <Box paddingBottom={1} flexDirection="column">
                    {currentTests.map(([path, config]) => (
                      <Box key={path}>
                        <Runs />{' '}
                        <FormattedPath
                          pad={8}
                          columns={width}
                          config={config || globalConfig}
                          testPath={path}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
                {!done && (
                  <Summary
                    aggregatedResults={aggregatedResults}
                    options={{estimatedTime, roundTime: true, width}}
                  />
                )}
              </>
            );
          }}
        </StdoutContext.Consumer>
      </Box>
    );
  }
}

export default class ReactReporter extends BaseReporter {
  private _globalConfig: Config.GlobalConfig;
  private _components: Array<(events: DateEvents) => void>;
  private _unmount?: () => void;
  private _waitUntilExit?: () => Promise<void>;

  constructor(globalConfig: Config.GlobalConfig) {
    super();
    this._globalConfig = globalConfig;
    this._components = [];
  }

  onRunStart(
    aggregatedResults: AggregatedResult,
    options: ReporterOnStartOptions,
  ) {
    const {unmount, waitUntilExit} = render(
      <Reporter
        register={cb => this._components.push(cb)}
        aggregatedResults={aggregatedResults}
        options={options}
        globalConfig={this._globalConfig}
      />,
    );

    this._unmount = unmount;
    // @ts-ignore: https://github.com/vadimdemedes/ink/pull/161
    this._waitUntilExit = waitUntilExit;
  }

  onTestStart(test: Test) {
    this._components.forEach(cb => cb({payload: {test}, type: 'TestStart'}));
  }

  onTestResult(
    test: Test,
    testResult: TestResult,
    aggregatedResults: AggregatedResult,
  ) {
    this._components.forEach(cb =>
      cb({payload: {aggregatedResults, test, testResult}, type: 'TestResult'}),
    );
  }

  async onRunComplete() {
    this._components.forEach(cb => cb({type: 'TestComplete'}));
    if (this._unmount) {
      this._unmount();
    }
    if (this._waitUntilExit) {
      await this._waitUntilExit();
    }
  }
}
