import nodeResolve from "@rollup/plugin-node-resolve";
import { uglify } from "@microsoft/applicationinsights-rollup-plugin-uglify3-js";
import replace from "@rollup/plugin-replace";
import cleanup from "rollup-plugin-cleanup";
import dynamicRemove from "@microsoft/dynamicproto-js/tools/rollup/node/removedynamic";
import { es3Poly, es3Check, importCheck } from "@microsoft/applicationinsights-rollup-es3";
import { updateDistEsmFiles } from "../../tools/updateDistEsm/updateDistEsm";

const version = require("./package.json").version;
const outputName = "applicationinsights-clickanalytics-js";
const verParts = version.split("-")[0].split(".")
if (verParts.length != 3) {
  throw "Invalid Version! [" + version + "]"
}
const majorVersion = verParts[0]

const banner = [
  "/*!",
  ` * Application Insights JavaScript SDK - Click Analytics, ${version}`,
  " * Copyright (c) Microsoft and contributors. All rights reserved.",
  " */"
].join("\n");

const replaceValues = {
  "// Copyright (c) Microsoft Corporation. All rights reserved.": "",
  "// Licensed under the MIT License.": ""
};

function doCleanup() {
  return cleanup({
    comments: [
      'some', 
      /^.\s*@DynamicProtoStub/i,
      /^\*\*\s*@class\s*$/
    ]
  })
}

const browserRollupConfigFactory = (isProduction, libVersion, format = 'umd', postfix = '') => {
  const browserRollupConfig = {
    input: `dist-esm/${outputName}.js`,
    output: {
      file: `browser/ai.clck.${libVersion}${postfix}.js`,
      banner: banner,
      format: format,
      name: "Microsoft.ApplicationInsights",
      extend: true,
      freeze: false,
      sourcemap: true
    },
    plugins: [
      dynamicRemove(),
      replace({
        preventAssignment: true,
        delimiters: ["", ""],
        values: replaceValues
      }),
      importCheck({ exclude: [ "applicationinsights-clickanalytics-js" ] }),
      nodeResolve({
        browser: false,
        preferBuiltins: false
      }),
      doCleanup(),
      es3Poly(),
      es3Check()
    ]
  };

  if (isProduction) {
    browserRollupConfig.output.file = `browser/ai.clck.${libVersion}${postfix}.min.js`;
    browserRollupConfig.plugins.push(
      uglify({
        ie8: true,
        toplevel: true,
        compress: {
          passes:3,
          unsafe: true
        },
        output: {
          preamble: banner,
          webkit:true
        }
      })
    );
  }

  return browserRollupConfig;
};

const nodeUmdRollupConfigFactory = (isProduction) => {
  const nodeRollupConfig = {
    input: `dist-esm/${outputName}.js`,
    output: {
      file: `dist/${outputName}.js`,
      banner: banner,
      format: "umd",
      name: "Microsoft.ApplicationInsights",
      extend: true,
      freeze: false,
      sourcemap: true
    },
    plugins: [
      dynamicRemove(),
      replace({
        preventAssignment: true,
        delimiters: ["", ""],
        values: replaceValues
      }),
      importCheck({ exclude: [ "applicationinsights-clickanalytics-js" ] }),
      nodeResolve(),
      doCleanup(),
      es3Poly(),
      es3Check()
    ]
  };

  if (isProduction) {
    nodeRollupConfig.output.file = `dist/${outputName}.min.js`;
    nodeRollupConfig.plugins.push(
      uglify({
        ie8: true,
        toplevel: true,
        compress: {
          passes:3,
          unsafe: true
        },
        output: {
          preamble: banner,
          webkit:true
        }
      })
    );
  }

  return nodeRollupConfig;
};

updateDistEsmFiles(replaceValues, banner);

export default [
  browserRollupConfigFactory(true, version),
  browserRollupConfigFactory(false, version),
  browserRollupConfigFactory(true, majorVersion),
  browserRollupConfigFactory(false, majorVersion),
  browserRollupConfigFactory(true, majorVersion, 'cjs', '.cjs'),
  browserRollupConfigFactory(false, majorVersion, 'cjs', '.cjs'),
  browserRollupConfigFactory(true, version, 'cjs', '.cjs'),
  browserRollupConfigFactory(false, version, 'cjs', '.cjs'),
  browserRollupConfigFactory(true, majorVersion, 'iife', '.gbl'),
  browserRollupConfigFactory(false, majorVersion, 'iife', '.gbl'),
  browserRollupConfigFactory(true, version, 'iife', '.gbl'),
  browserRollupConfigFactory(false, version, 'iife', '.gbl'),
  nodeUmdRollupConfigFactory(true),
  nodeUmdRollupConfigFactory(false)
];
