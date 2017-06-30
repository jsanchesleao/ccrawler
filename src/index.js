const fs = require('fs')
const commands = require('./commands')

function load(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, 'utf-8', function(err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

function runLine(line, context, variables) {
  const parts = line.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  return commands.run(command, args, context, variables);
}

function isAltDeclaration(line) {
  return line.trim().match(/^::/);
}

function getAltName(line) {
  if (isAltDeclaration(line)) {
    return line.replace(/^::/, '').toLowerCase().trim();
  }
  else {
    throw new Error('Line [' + line + '] is not an alt declaration');
  }
}

function findAllAlts(script) {
  const alts = script.trim().split('\n').filter(isAltDeclaration).map(getAltName);
  if (!alts || alts.length === 0) {
    return ['default'];
  }
  else {
    return alts;
  }
}

function parseAlts(script) {
  const lines = script.trim().split('\n');
  const alts = {};

  let curAlt = 'default';
  lines.forEach(function(line) {
    if (isAltDeclaration(line)) {
      const altName = line.replace(/^::/, '').toLowerCase().trim();
      curAlt = altName;
    }
    else if (line.trim() !== '') {
      if (!alts[curAlt]) {alts[curAlt] = []};
      alts[curAlt].push(line.trim());
    }
  });

  return alts;
}

function parseSelectedAlts(script, variables) {
  const altArg = variables.alts || variables.a;
  if (!altArg || altArg === 'all') {
    return findAllAlts(script);
  }
  else {
    return altArg.split(':').map(x => x.toLowerCase());
  }
}

function exec(script, variables) {
  function loop(lines, result) {
    if (lines.length === 0) {
      return result;
    }
    else {
      const head = lines[0];
      const tail = lines.slice(1);
      const step = runLine(head, result, variables);
      return step.then( value => loop(tail, value) );
    }
  }

  function runAlts(selectedAlts, alts, variables) {
    const alt = selectedAlts[0];

    if (!alt) {
      return Promise.reject({cause: 'all alternatives failed'});
    }

    if (!variables.silent) {
      console.log('Crawling [', alt, ']');
    }

    const otherAlts = selectedAlts.slice(1);
    const lines = alts[alt];
    
    const result = loop(lines, Promise.resolve(null));

    return result.catch(function(err) {
      return runAlts(otherAlts, alts, variables);
    })
  }

  const alts = parseAlts(script);
  const selectedAlts = parseSelectedAlts(script, variables);

  return runAlts(selectedAlts, alts, variables);
}

function execFile(file, variables) {
  return load(file).then(script => exec(script, variables));
}

module.exports = {exec, execFile}
