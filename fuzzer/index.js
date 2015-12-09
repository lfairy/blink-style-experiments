var erlnmyr = require('erlenmeyer');
var seedrandom = require('seedrandom');

var domgen = require('./domgen');

function typeVar(s) {
  return function(v) {
    if (!v[s]) {
      v[s] = erlnmyr.types.newTypeVar();
    }
    return v[s];
  };
}

module.exports.range = erlnmyr.phase(
  {
    input: erlnmyr.types.unit,
    output: erlnmyr.types.number,
    arity: '0:N',
  },
  function() {
    if (this.options.step > 0) {
      for (var i = this.options.start; i < this.options.end; i += this.options.step) {
        this.put(i);
      }
    } else {
      for (var i = this.options.start; i > this.options.end; i += this.options.step) {
        this.put(i);
      }
    }
  },
  {start: 0, end: 10, step: 1});

module.exports.map = erlnmyr.phase(
  {
    input: typeVar('a'),
    output: typeVar('b'),
    arity: '1:1',
  },
  function(it, tags) {
    if (!this.callback)
      this.callback = (new Function('it', 'tags', 'return ' + this.options.expr)).bind(this);
    return this.callback(it, tags);
  },
  {expr: 'it'});

module.exports.parseInt = erlnmyr.phase(
  {
    input: erlnmyr.types.string,
    output: erlnmyr.types.number,
    arity: '1:1',
  },
  function(s) {
    return parseInt(s, this.options.base);
  },
  {base: 10});

module.exports.generateDOM = erlnmyr.phase(
  {
    input: erlnmyr.types.number,
    output: erlnmyr.types.string,
    arity: '1:1',
  },
  function(size) {
    var seed = +(this.options.seed || process.hrtime()[1]);
    // The Alea algorithm is fastest
    var random = seedrandom.alea(seed);
    // `seedrandom` doesn't provide a function for picking an item from a list,
    // so let's monkey-patch our own.
    random.choice = function(items) {
      var index = Math.floor(this.double() * items.length);
      return items[index];
    };
    var result = domgen(random, size);
    this.tags.tag('seed', seed);
    this.tags.tag('size', size);
    return result.dom;
  },
  {seed: null});