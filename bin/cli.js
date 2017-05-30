#!/usr/bin/env node

const minimist = require('minimist')
const ccrawler = require('../src/');

function main() {
  const argv = minimist(process.argv.slice(2));

  const file = argv.file || argv.f;

  ccrawler.execFile(file, argv)
    .then(x => console.log(x)).catch(err => console.log(err))
}

main();
