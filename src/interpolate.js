const replaceVariable = variables => function(line, item) {
  const name = item.match(/{(.*?)}/)[1];
  return line.split(item).join(variables[name]);
}

function format(value, points) {
  const zeroes = '0000000000' + value;
  return zeroes.substr(zeroes.length - points, points);
}

const replacePointVariable = variables => function(line, item) {
  const parse = item.match(/{(.*?)\.(.*?)}/);
  const name = parse[1];
  const points = parse[2];

  return line.split(item).join(format(variables[name], parseInt(points)));
}

const interpolate = variables => line => {
  const vars      = line.match(/\${\w+}/g) || [] ;
  const pointVars = line.match(/\${\w+\.\d+}/g) || [];

  const step1 = vars.reduce(replaceVariable(variables), line);
  const step2 = pointVars.reduce(replacePointVariable(variables), step1);

  return step2;
}

module.exports = function(args, variables) {
  return args.map(interpolate(variables));
}
