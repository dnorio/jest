/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Color, Box, Text} from 'ink';
import {Config} from '@jest/types';
import {pluralize} from 'jest-util';
import {SnapshotSummary} from '@jest/test-result';
import {formatTestPath} from './utils';

const ARROW = ' \u203A ';
const DOWN_ARROW = ' \u21B3 ';
const DOT = ' \u2022 ';

export default ({
  snapshots,
  globalConfig,
  updateCommand,
}: {
  snapshots: SnapshotSummary;
  globalConfig: Config.GlobalConfig;
  updateCommand: string;
}) => (
  <Box flexDirection="column">
    <Text bold>Snapshot Summary</Text>
    {snapshots.added && (
      <Box>
        <Color bold green>
          {ARROW}
          {pluralize('snapshot', snapshots.added)} written
        </Color>{' '}
        from {pluralize('test suite', snapshots.filesAdded)}.
      </Box>
    )}
    {snapshots.unmatched && (
      <Box>
        <Color bold red>
          {ARROW}
          {pluralize('snapshot', snapshots.unmatched)} failed
        </Color>{' '}
        from {pluralize('test suite', snapshots.filesUnmatched)}.{' '}
        <Color dim>
          Inspect your code changes or {updateCommand} to update them.
        </Color>
      </Box>
    )}
    {snapshots.updated && (
      <Box>
        <Color bold green>
          {ARROW}
          {pluralize('snapshot', snapshots.updated)} updated
        </Color>{' '}
        from {pluralize('test suite', snapshots.filesUpdated)}.
      </Box>
    )}
    {snapshots.filesRemoved &&
      (snapshots.didUpdate ? (
        <Box>
          <Color bold green>
            {ARROW}
            {pluralize('snapshot file', snapshots.filesRemoved)} removed
          </Color>{' '}
          from {pluralize('test suite', snapshots.filesRemoved)}.
        </Box>
      ) : (
        <Box>
          <Color bold yellow>
            {ARROW}
            {pluralize('snapshot file', snapshots.filesRemoved)} obsolete
          </Color>{' '}
          from {pluralize('test suite', snapshots.filesRemoved)}.{' '}
          <Color dim>
            To remove ${snapshots.filesRemoved === 1 ? 'it' : 'them all'},{' '}
            {updateCommand}.
          </Color>
        </Box>
      ))}
    {snapshots.unchecked &&
      (snapshots.didUpdate ? (
        <Box>
          <Color bold green>
            {ARROW}
            {pluralize('snapshot', snapshots.unchecked)} removed
          </Color>{' '}
          from {pluralize('test suite', snapshots.uncheckedKeysByFile.length)}.
        </Box>
      ) : (
        <Box>
          <Color bold yellow>
            {ARROW}
            {pluralize('snapshot', snapshots.unchecked)} obsolete
          </Color>{' '}
          from {pluralize('test suite', snapshots.uncheckedKeysByFile.length)}.{' '}
          <Color dim>
            To remove ${snapshots.unchecked === 1 ? 'it' : 'them all'},{' '}
            {updateCommand}.
          </Color>
        </Box>
      ))}
    {snapshots.unchecked &&
      snapshots.uncheckedKeysByFile.map(uncheckedFile => (
        <>
          <Box>
            &nbsp;&nbsp;
            {DOWN_ARROW}
            {formatTestPath(globalConfig, uncheckedFile.filePath)}
          </Box>
          <Box>
            {uncheckedFile.keys.map(key => (
              <>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {DOT}
                {key}
              </>
            ))}
          </Box>
        </>
      ))}
  </Box>
);
