/**
 * Monominoes definition.
 * Modules:
 * .util: Common util functions used in renderers.
 * .tags: HTML tags objects.
 * .renders: Base renders.
 */
function Monominoes() {}
Monominoes.util = {};
Monominoes.tags = {};
Monominoes.renders = {};

/**
 * Placeholder replacer formatter, replica from jquery.validator.format.
 * @see http://jqueryvalidation.org/jQuery.validator.format/
 */
Monominoes.util.format = function() { 
  return $.validator.format.apply(null,arguments);
};

/**
 * Returns what the first argument passed.
 * @param x Argument to be returned as it is.
 */
Monominoes.util.self = function(x) { return x; };

/**
 * Executes the first argument if it is a function, otherwise returns it.
 * @param fn Object to check whether it is a function.
 * @param scope Scope to use if the first argument needs to be executed, null otherwise.
 * @param arguments... Pass any number of arguments after scope if they are required to execute the function.
 */
Monominoes.util.concrete = function(fn,scope) { 
  return K.util.isFunction(fn) ? fn.apply(scope,Array.prototype.slice.call(arguments,2)) : fn; 
};

/** Tags **/
Monominoes.Tag = function(name,simple){
  this.name = name;
  this.simple = simple === true;
  this.tag = Monominoes.util.format(this.getTemplate(),name);
  this.defaultcss = Monominoes.util.format("monominoes monominoes-{0}",name);
};
Monominoes.Tag.prototype.getTemplate = function() { 
  return this.simple ? Monominoes.Tag.open : Monominoes.Tag.template;
};
Monominoes.Tag.prototype.build = function() { return $(this.tag); };

/* Statics */
Monominoes.Tag.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","i","p","pre","code"];
Monominoes.Tag.list = ["ul","ol","li"];
Monominoes.Tag.item = ["div","form","button","a","label"];
Monominoes.Tag.selfclose = ["img","input","br","hr"];
Monominoes.Tag.all = Monominoes.Tag.text.concat(Monominoes.Tag.list).concat(Monominoes.Tag.item).concat(Monominoes.Tag.selfclose);
Monominoes.Tag.open = "<{0}>";
Monominoes.Tag.close = "</{0}>";
Monominoes.Tag.template = Monominoes.Tag.open + Monominoes.Tag.close;
Monominoes.Tag.isSimple = function(tag) { return Monominoes.Tag.selfclose.indexOf(tag) >= 0; };

(function() {
  var tags = Monominoes.Tag.all;
  for(var i in tags) {
    Monominoes.tags[tags[i].toUpperCase()] = new Monominoes.Tag(tags[i],Monominoes.Tag.isSimple(tags[i]));
  }
})();

