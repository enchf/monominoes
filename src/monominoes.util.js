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

/**
 * Returns true if the object is a Render instance, not constructor only.
 */
Monominoes.util.isRenderInstance = function(obj,type) {
  return Monominoes.util.isRender(obj,type) && !Komunalne.util.isFunction(obj);
};

/**
 * Helper function to return data itself for Tag render customization.
 */
Monominoes.util.data = function(render,data) { return data; };

/**
 * Helper function to return data itself for Tag render customization.
 */
Monominoes.util.property = function(path) { 
  return function(render,data) { return Komunalne.util.path(data,path); };
};

/**
 * Iterate over an object and transform the functions into binded functions with render as scope.
 */
Monominoes.util.bindFunctions = function(render,iterable) {
  var fix = function(val,key) {
    if (Komunalne.util.isFunction(val) && !Monominoes.util.isRender(val)) iterable[key] = val.bind(render);
  }
  Komunalne.util.forEach(iterable,fix);
};

/**
 * Returns a value for the Tag definition object when rendering.
 * Rules:
 * - A null or undefined is returned as null.
 * - A primitive of type string, boolean or number is returned itself.
 * - A function will be invoked using render as this, passing render and item as arguments.
 * - An Array, Date or complex object is returned as its string representation using toString method.
 * - An object is processed in the following way:
 *   - If path, it is extracted from item.data, otherwise item.data is used itself.
 *   - If scope, it is used as handler scope, otherwise render is used. If no handler this is ignored.
 *   - If handler, it is invoked using scope as above, having render, item and data from path if path is defined, 
 *     otherwise this function executed with the resulting data from path as object argument is returned.
 */
Monominoes.util.extractValue = function(object,render,data) {
  var getFromConfig = function(object,render,data) {
    var d = object.path ? Komunalne.util.path(data,object.path) : data;
    return object.handler ? object.handler.call(render,render,d) : Monominoes.util.extractValue(d,render);
  };
  return object == null ? null :
         Komunalne.util.isAnyOf(typeof object,"string","boolean","number") ? object :
         Komunalne.util.isFunction(object) ? object.call(render,render,data) :
         Komunalne.util.isInstanceOf(object,Object) ? getFromConfig(object,render,data) :
         object.toString();
};
