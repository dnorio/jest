/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {RawSourceMap} from 'source-map';
import {GlobalConfig, Path, ProjectConfig} from '@jest/config-utils';

export type ShouldInstrumentOptions = Pick<
  GlobalConfig,
  | 'collectCoverage'
  | 'collectCoverageFrom'
  | 'collectCoverageOnlyFrom'
  | 'coverageProvider'
> & {
  changedFiles?: Set<Path>;
};

export type Options = ShouldInstrumentOptions &
  Partial<{
    isCoreModule: boolean;
    isInternalModule: boolean;
  }>;

// This is fixed in source-map@0.7.x, but we can't upgrade yet since it's async
interface FixedRawSourceMap extends Omit<RawSourceMap, 'version'> {
  version: number;
}

export type TransformedSource = {
  code: string;
  map?: FixedRawSourceMap | string | null;
};

export type TransformResult = {
  code: string;
  originalCode: string;
  mapCoverage: boolean;
  sourceMapPath: string | null;
};

export type TransformOptions = {
  instrument: boolean;
};

export type CacheKeyOptions = {
  config: ProjectConfig;
  instrument: boolean;
  rootDir: string;
};

export interface Transformer {
  canInstrument?: boolean;
  createTransformer?: (options?: any) => Transformer;

  getCacheKey?: (
    fileData: string,
    filePath: Path,
    configStr: string,
    options: CacheKeyOptions,
  ) => string;

  process: (
    sourceText: string,
    sourcePath: Path,
    config: ProjectConfig,
    options?: TransformOptions,
  ) => string | TransformedSource;
}
