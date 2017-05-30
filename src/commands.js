const rp = require('request-promise');
const cheerio = require('cheerio');
const interpolate = require('./interpolate');

function removeQuotes(string) {
  return string.substr(1, string.length - 2).split('\\"').join('"');
}

function open(args, context) {
  if (args[0]) {
    return rp(removeQuotes(args[0]));
  }
  else {
    return rp(context);
  }
}

function find(args, context) {
  const selector = removeQuotes(args.join(' '));
  const $ = cheerio.load(context);
  const result = $(selector);

  return Promise.resolve(result);
}

function attr(args, context) {
  const attribute = removeQuotes(args[0]);
  if (context.attr) {
    return Promise.resolve(context.attr(attribute));
  }
  else {
    return Promise.resolve(context.attribs[attribute]);
  }
}

function filter(args, context) {
  const attrib = args[0];
  const part = removeQuotes(args.slice(1).join(' '));
  const filtered = context.filter(function() {
    return this.attribs[attrib].includes(part);
  });

  return Promise.resolve(filtered);
}

function first(args, context) {
  return filter(args, context).then(items => items[0])
}

function innerHTML(args, context) {
  if (context.html) {
    return Promise.resolve(context.html());
  }
  return Promise.resolve(context);
}

function invalidCommand(command) {
  return Promise.reject({error: 'INVALID_COMMAND', command});
}

function run(command, rawArgs, context, variables) {
  const args = interpolate(rawArgs, variables);
  switch(command) {
    case 'open':
      return open(args, context);
    case 'find':
      return find(args, context);
    case 'attr':
      return attr(args, context);
    case 'filter':
      return filter(args, context);
    case 'first':
      return first(args, context);
    case 'inner-html':
      return innerHTML(args, context);
    default:
      return invalidCommand(command);
  }
}

module.exports = {run}
