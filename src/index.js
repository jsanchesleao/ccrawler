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

  return loop(script.trim().split('\n'), Promise.resolve(null))
}

function execFile(file, variables) {
  return load(file).then(script => exec(script, variables));
}

module.exports = {exec, execFile}
