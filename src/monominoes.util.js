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
  return Komunalne.util.isFunction(fn) ? fn.apply(scope,Array.prototype.slice.call(arguments,2)) : fn; 
};

/**
 * Checks if a class or an object is part of a Render hierarchical structure.
 * @param obj Object to compare, either a Render constructor or instance.
 * @param type (optional) Render constructor to compare against. Checks if the constructor/instance is a subclass
 * or instance of a subclass of this type. The type is itself validated to be a Render constructor.
 */
Monominoes.util.isRender = function(obj,type) {
  var is = false;
  var seen = [];
  var Type = (type || Monominoes.Render);
  if (Type !== Monominoes.Render) {
    if (!Monominoes.util.isRender(Type)) throw "Type comparison against a non Render type";
  }
  while (!is && obj != null && obj.class != null) {
    if (seen.indexOf(obj.class) >= 0) break;
    seen.push(obj.class);
    is = obj.class === Type && 
         (obj === Type || Komunalne.util.isInstanceOf(obj,Type));
    obj = obj.superclass;
  }
  return is;
};
