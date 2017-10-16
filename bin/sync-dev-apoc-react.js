#!/usr/bin/env node
const path = require('path');
const cpx = require('cpx');
const apocReactRelativePath = process.argv[2];

if (!apocReactRelativePath) {
    process.stdout.write('Missing: First argument which should be relative path to source of apoc-react');
    process.exit(1);
}

const isSilent = process.argv.includes('--silent');
const isDebug = process.argv.includes('--debug');
const isTest = process.argv.includes('--test');

const apocReactSrcPath = path.resolve(apocReactRelativePath);
const apocReactDstPath = path.resolve(__dirname, '../node_modules/apoc-react');

const srcCpxPaths = {
    from: `${apocReactSrcPath}/src/*/**`,
    to: `${apocReactDstPath}/src`
};
const distCpxPaths = {
    from: `${apocReactSrcPath}/dist/*`,
    to: `${apocReactDstPath}/dist`
};

doCpx(srcCpxPaths);
doCpx(distCpxPaths);

function doCpx(paths) {
    let eventEmitter;


    if (!isTest) {
        eventEmitter = cpx.watch(paths.from, paths.to);
        eventEmitter.on('watch-error', (err) => process.stderr.write(`(error) ${err}\n`));
    }

    if (isTest || !isSilent) {
        process.stdout.write(`(init) ${paths.from} -> ${paths.to}\n\n`);
    }

    if (isDebug && !isSilent && !isTest) {
        eventEmitter.on('copy', (e) => process.stdout.write(`(copy) ${e.srcPath} -> ${e.dstPath}\n`))
            .on('remove', (e) => process.stdout.write(`(remove) ${e.path}\n`))
            .on('watch-ready', (e) => process.stdout.write(`(watch-ready)\n`))
    }


}
