/**
 * Placeholder replacer formatter, replica from jquery.validator.format.
 * @see http://jqueryvalidation.org/jQuery.validator.format/
 */
Monominoes.util.format = function() {
  for (var i = 1; i < arguments.length; i++) {
    if (arguments[i] == null) arguments[i] = "" + arguments[i];
  }
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

/**
 * Checks if a class or an object is part of a Render hierarchical structure.
 */
Monominoes.util.isRender = function(obj) {
  var is = false;
  var seen = [];
  while (!is && obj != null && obj.class != null) {
    if (seen.indexOf(obj.class) >= 0) break;
    seen.push(obj.class);
    is = obj.class === Monominoes.Render && 
         (obj === Monominoes.Render || Komunalne.util.isInstanceOf(obj,Monominoes.Render));
    obj = obj.superclass;
  }
  return is;
};
