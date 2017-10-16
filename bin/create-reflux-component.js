#!/usr/bin/env node

/**
 * This script creates all necessary files to make React Component work with Reflux.
 * It creates following files:
 * - File with Reflux Actions
 * - Presentational Component with LESS file and simple test suite (snapshot test)
 * - Container Component
 * - Reflux Store
 */

const fs = require('fs');
const path = require('path');
const changeCase = require('change-case');
const objectValues = require('object.values');

const originalComponentName = 'ComponentName';
const originalComponentInCamelCaseCase = 'componentName';
const componentTypes = {
    PURE_REACT: 'pure-react',
    REFLUX: 'reflux'
};

/*
 * INITIALIZING CLI arguments
 */
const targetPath = process.argv[2];
const componentName = changeCase.pascalCase(process.argv[3]);   //e.g. TestComponent
const componentNameInCamelCase = changeCase.camelCase(componentName);     //e.g. testComponent

const componentType = process.argv[4] || componentTypes.PURE_REACT;
/*
 * VALIDATION CLI arguments
 */
if (objectValues(componentTypes).indexOf(componentType) === -1) {
    process.stdout.write(`Third argument should be empty (default is "${componentTypes.PURE_REACT}") or 
    one of ${objectValues(componentTypes).map(x => `"${x}"`).join(', ')}\n`);
    process.exit(1);
}

if (!targetPath) {
    process.stdout.write('Missing: First argument has to be path where component going to be created\n');
    process.exit(1);
}

if (!componentName) {
    process.stdout.write('Missing: Second argument has to be name of component\n');
    process.exit(1);
}

/*
 * Setting necessary file paths base on CLI arguments
 */
const componentSourcePath = path.resolve(__dirname, originalComponentName);
const componentTargetPath = path.join(targetPath, componentName);

processDirectory(componentSourcePath);

/**
 * @param {string} dirPath
 */
function processDirectory(dirPath) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            throw Error(err);
        }

        processFiles(files, dirPath);
    });
}

/**
 * @param {String[]} files
 * @param {String} dirPath
 */
function processFiles(files, dirPath) {
    files.forEach(file => {
        const absPath = path.resolve(dirPath, file);
        fs.stat(absPath, (err, stats) => {
            if (err) {
                throw new Error(err);
            }
            if (stats.isFile() && isValidForComponentType(file)) {
                processFile(absPath);
            }
            if (stats.isDirectory()) {
                processDirectory(absPath);
            }
        });
    });
}

/**
 * @param {string} fileName
 * @returns {boolean}
 */
function isValidForComponentType(fileName) {
    if (componentType === componentTypes.PURE_REACT) {
        return new RegExp('^' + originalComponentName + '\\.').test(fileName);
    }
    return true; //all files in the scaffolding source works for componentTypes.REFLUX
}

/**
 * @param {String} absPath
 */
function processFile(absPath) {
    const relativeFilePath = absPath
        .replace(componentSourcePath, '')
        .replace(originalComponentName, componentName)
        .replace(originalComponentInCamelCaseCase, componentNameInCamelCase);
    const absPathToWrite = path.join(componentTargetPath, relativeFilePath);

    const content = fs.readFileSync(absPath, 'utf8');
    const replacedContnent = replaceFileContent(content, absPath);
    writeFile(replacedContnent, absPathToWrite);
}

/**
 * @param {string} content
 * @param {string} absPath
 */
function writeFile(content, absPath) {
    ensureDirectoryExistence(absPath);
    fs.writeFileSync(absPath, content);
}

function replaceFileContent(content) {
    return content
        .replace(new RegExp(originalComponentName, 'g'), componentName)
        .replace(new RegExp(changeCase.paramCase(originalComponentName), 'g'), changeCase.paramCase(componentName))
        .replace(new RegExp(originalComponentInCamelCaseCase, 'g'), componentNameInCamelCase);
}

/**
 * @param {string} absPath - absolute path of file
 */
function ensureDirectoryExistence(absPath) {
    const dirname = path.dirname(absPath);
    if (fs.existsSync(dirname)) {
        return;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
