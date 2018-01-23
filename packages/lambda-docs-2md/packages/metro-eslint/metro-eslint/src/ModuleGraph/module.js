/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
'use strict';



exports.empty = () => virtual('');

// creates a virtual module (i.e. not corresponding to a file on disk)
// with the given source code.
const virtual = exports.virtual = code => ({
  dependencies: [],
  file: {
    code,
    map: null,
    path: '',
    type: 'script' } });