const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const ExitCode = {
    Success: 0,
    Error: 1
};

function convertHtmlToPdf(pathToHtmlFile, outputPath, isDebug) {
    const launchArgs = {
        args: ['--no-sandbox'],
        headless: true
    };

    const pdfArgs = {
        path: outputPath,
        width: '8.5in',
        height: '11in',
        printBackground: true
    };

    const splitScript = fs.readFileSync(path.resolve(__dirname, 'splitReportIntoPages.dist.js')).toString();

    console.log('start', new Date());

    return puppeteer.launch(launchArgs)
        .then(browser => Promise.all([browser, browser.newPage()]))
        .then(([browser, page]) => {
            console.log('browser launched and page created', new Date());
            const process = page.goto(`file://${pathToHtmlFile}`, { waitUntil: 'load' })
                .then(() => page.emulateMedia('print'))
                .then(() => page.setViewport({
                    width: 840,
                    height: 1056
                }))
                .then(() => page.evaluate(splitScript))
                .then(() => page.pdf(pdfArgs));

            if (isDebug) {
                const openUrl = require('openurl');
                return process
                    .then(() => browser.wsEndpoint())
                    .then(endpoint => {
                        console.log(endpoint);
                        const urlToOpen = 'http:' + endpoint.match(/\/\/127.0.0.1:\d+/)[0];
                        console.log('Opening url: ', urlToOpen);
                        openUrl.open(urlToOpen);
                    });
            }
            return process.then(() => console.log('End', new Date())).then(() => browser.close());
        });
}

function main(inputPath, outputPath, isDebug) {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`No such file: '${inputPath}'`);
    }
    const absoluteInputPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
    const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);

    Promise.all([
        convertHtmlToPdf(absoluteInputPath, absoluteOutputPath, isDebug)
    ]).then(() => {
        return ExitCode.Success;
    }).catch(e => {
        console.error(e);
        return ExitCode.Error;
    }).then(exitCode => {
        !isDebug && process.exit(exitCode);
    });
}

const args = process.argv.slice(2);

const isDebug = process.argv.includes('--debug');

main(args[0], args[1], isDebug);
