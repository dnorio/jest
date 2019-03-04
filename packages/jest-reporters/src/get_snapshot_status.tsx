/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {TestResult} from '@jest/types';

import React, {FC} from 'react';
import {Box, Color} from 'ink';

import {pluralize} from 'jest-util';

const Arrow: FC = () => <>' \u203A '</>;
const Dot: FC = () => <>' \u2022 '</>;

const FailColor: FC = ({children}) => (
  <Color bold red>
    {children}
  </Color>
);
const SnapshotAdded: FC = ({children}) => (
  <Color bold green>
    {children}
  </Color>
);
const SnapshotUpdated: FC = ({children}) => (
  <Color bold green>
    {children}
  </Color>
);
const SnapshotOutdated: FC = ({children}) => (
  <Color bold yellow>
    {children}
  </Color>
);

const SnapshotStatus = ({
  snapshot,
  afterUpdate,
}: {
  snapshot: TestResult.TestResult['snapshot'];
  afterUpdate: boolean;
}) => (
  <>
    {snapshot.added > 0 && (
      <SnapshotAdded>
        <Arrow /> {pluralize('snapshot', snapshot.added)} written.
      </SnapshotAdded>
    )}
    {snapshot.updated > 0 && (
      <SnapshotUpdated>
        <Arrow /> {pluralize('snapshot', snapshot.updated)} updated.
      </SnapshotUpdated>
    )}
    {snapshot.unmatched > 0 && (
      <FailColor>
        <Arrow /> {pluralize('snapshot', snapshot.unmatched)} failed.
      </FailColor>
    )}
    {snapshot.unchecked > 0 ? (
      afterUpdate ? (
        <SnapshotUpdated>
          <Arrow /> {pluralize('snapshot', snapshot.unchecked)} removed.
        </SnapshotUpdated>
      ) : (
        <SnapshotOutdated>
          <Arrow /> {pluralize('snapshot', snapshot.unchecked)} obsolete.
        </SnapshotOutdated>
      )
    ) : null}
    {snapshot.unchecked > 0 &&
      snapshot.uncheckedKeys.map(key => (
        <Box key={key}>
          &nbsp;&nbsp;
          <Dot />
          {key}
        </Box>
      ))}
    {snapshot.fileDeleted && (
      <SnapshotUpdated>
        <Arrow /> snapshot file removed.
      </SnapshotUpdated>
    )}
  </>
);

export default SnapshotStatus;
