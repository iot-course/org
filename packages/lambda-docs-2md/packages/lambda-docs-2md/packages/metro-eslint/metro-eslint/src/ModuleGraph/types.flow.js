/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */
'use strict';

import type {Ast} from 'babel-core';
import type {BabelSourceMap} from 'babel-core';
import type {Console} from 'console';
import type {FBSourceMap, MetroSourceMap} from 'metro-source-map';

export type BuildResult = {|
  ...GraphResult,
  prependedScripts: $ReadOnlyArray<Module>,
|};

export type Callback<A = void, B = void> = (Error => void) &
  ((null | void, A, B) => void);

type Dependency = {|
  id: string,
  +isAsync: boolean,
  path: string,
|};

export type File = {|
  code: string,
  map: ?BabelSourceMap,
  path: string,
  type: CodeFileTypes,
|};

type CodeFileTypes = 'module' | 'script';

export type GraphFn = (
  entryPoints: Iterable<string>,
  platform: string,
  options?: ?GraphOptions,
) => Promise<GraphResult>;

type GraphOptions = {|
  log?: Console,
  optimize?: boolean,
  skip?: Set<string>,
|};

export type GraphResult = {|
  entryModules: $ReadOnlyArray<Module>,
  modules: $ReadOnlyArray<Module>,
|};

export type ModuleIds = {|
  /**
   * The module ID is global across all bundles and identifies the module
   * uniquely. This is useful to cache modules that has been loaded already at
   * the app level.
   */
  +moduleId: number,
  /**
   * The local ID is local to each bundle. For example bundle zero may have a
   * module with local ID 1, and bundle one a module with the same local ID.
   * This is useful so that RAM bundles tables start at zero, but the `moduleId`
   * will be used otherwise.
   */
  +localId: number,
|};

/**
 * Indempotent function that gets us the IDs corresponding to a particular
 * module identified by path.
 */
export type IdsForPathFn = ({path: string}) => ModuleIds;

export type LoadResult = {
  file: File,
  dependencies: $ReadOnlyArray<TransformResultDependency>,
};

export type LoadFn = (
  file: string,
  options: LoadOptions,
) => LoadResult | Promise<LoadResult>;

type LoadOptions = {|
  log?: Console,
  optimize?: boolean,
  platform?: string,
|};

export type Module = {|
  dependencies: Array<Dependency>,
  file: File,
|};

export type PostProcessModules = (
  modules: Iterable<Module>,
  entryPoints: Array<string>,
) => Iterable<Module>;

export type OutputFn<
  M: FBSourceMap | MetroSourceMap = FBSourceMap | MetroSourceMap,
> = ({|
  filename: string,
  idsForPath: IdsForPathFn,
  modules: Iterable<Module>,
  requireCalls: Iterable<Module>,
  sourceMapPath?: ?string,
|}) => OutputResult<M>;

type OutputResult<M: FBSourceMap | MetroSourceMap> = {|
  code: string | Buffer,
  extraFiles?: Iterable<[string, string | Buffer]>,
  map: M,
|};

export type PackageData = {|
  browser?: Object | string,
  main?: string,
  name?: string,
  'react-native'?: Object | string,
|};

export type ResolveFn = (
  id: string,
  source: ?string,
  platform: string,
  options?: ResolveOptions,
) => string;

type ResolveOptions = {
  log?: Console,
};

export type TransformerResult = {|
  ast: ?Ast,
  code: string,
  map: ?BabelSourceMap,
|};

export type TransformResultDependency = {|
  /**
   * The literal name provided to a require or import call. For example 'foo' in
   * case of `require('foo')`.
   */
  +name: string,
  /**
   * If `true` this dependency is due to a dynamic `import()` call. If `false`,
   * this dependency was pulled using a synchronous `require()` call.
   */
  +isAsync: boolean,
|};

export type TransformResult = {|
  code: string,
  dependencies: $ReadOnlyArray<TransformResultDependency>,
  dependencyMapName?: string,
  map: ?BabelSourceMap,
|};

export type TransformResults = {[string]: TransformResult};

export type TransformVariants = {+[name: string]: {}};

export type TransformedCodeFile = {|
  +file: string,
  +hasteID: ?string,
  package?: PackageData,
  +transformed: TransformResults,
  +type: CodeFileTypes,
|};

export type ImageSize = {|+width: number, +height: number|};

export type AssetFile = {|
  /**
   * The path of the asset that is shared by all potential variants
   * of this asset. For example `foo/bar@3x.png` would have the
   * asset path `foo/bar.png`.
   */
  +assetPath: string,
  /**
   * The content is encoded in Base64 so that it can be stored in JSON files,
   * that are used to communicate between different commands of a Buck
   * build worker, for example.
   */
  +contentBase64: string,
  /**
   * Guessed from the file extension, for example `png` or `html`.
   */
  +contentType: string,
  /**
   * The path of the original file for this asset. For example
   * `foo/bar@3x.ios.png`. This is most useful for reporting purposes, such as
   * error messages.
   */
  +filePath: string,
  /**
   * If the asset is an image, this contain the size in physical pixels (ie.
   * regarless of whether it's a `@2x` or `@3x` version of a smaller image).
   */
  +physicalSize: ?ImageSize,
  /**
   * The platform this asset is designed for, for example `ios` if the file name
   * is `foo.ios.js`. `null` if the asset is not platform-specific.
   */
  +platform: ?string,
  /**
   * The scale this asset is designed for, for example `2`
   * if the file name is `foo@2x.png`.
   */
  +scale: number,
|};

export type TransformedSourceFile =
  | {|
      +type: 'code',
      +details: TransformedCodeFile,
    |}
  | {|
      +type: 'asset',
      +details: AssetFile,
    |}
  | {|
      +type: 'unknown',
    |};

export type LibraryOptions = {|
  dependencies?: Array<string>,
  optimize: boolean,
  platform?: string,
  rebasePath: string => string,
|};

export type Base64Content = string;
export type AssetContents = {
  +data: Base64Content,
  +outputPath: string,
};
export type AssetContentsByPath = {
  +[moduleFilePath: string]: $ReadOnlyArray<AssetContents>,
};

export type ResolvedCodeFile = {|
  +codeFile: TransformedCodeFile,
  /**
   * Imagine we have a source file that contains a `require('foo')`. The library
   * will resolve the path of the module `foo` and store it in this field along
   * all the other dependencies. For example, it could be
   * `{'foo': 'bar/foo.js', 'bar': 'node_modules/bar/index.js'}`.
   */
  +filePathsByDependencyName: {+[dependencyName: string]: string},
|};

/**
 * Describe a set of JavaScript files and the associated assets. It could be
 * depending on modules from other libraries. To be able to resolve these
 * dependencies, these libraries need to be provided by callsites (ex. Buck).
 */
export type Library = {|
  +files: Array<TransformedCodeFile>,
  /* cannot be a Map because it's JSONified later on */
  +assets: AssetContentsByPath,
|};

/**
 * Just like a `Library`, but it also contains module resolutions. For example
 * if there is a `require('foo')` in some JavaScript file, we keep track of the
 * path it resolves to, ex. `beep/glo/foo.js`.
 */
export type ResolvedLibrary = {|
  +files: $ReadOnlyArray<ResolvedCodeFile>,
  /* cannot be a Map because it's JSONified later on */
  +assets: AssetContentsByPath,
|};
