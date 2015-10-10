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

/**
 * Tag class definition.
 * @param name Tag name.
 * @param noEnd True to build as a no close empty tag. 
 *        If no flag specified, it will be determined using Monominoes.Tag.requireEnd method.
 */
Monominoes.Tag = function(name,noEnd){
  this.name = name;
  this.requireEnd = (noEnd === true) ? false : Monominoes.Tag.requireEnd(name);
  this.tag = Monominoes.util.format(this.template(),name);
};

/**
 * Determines the string template to use depending tag self-closability.
 */
Monominoes.Tag.prototype.template = function() { 
  return this.requireEnd ? Monominoes.Tag.open : Monominoes.Tag.full;
};

/**
 * Build a new HTML DOM jQuery object for the tag, applying the specified configuration.
 * @param config A configuration object that can contain the following optional properties:
 * - class: String with the CSS class names to apply to the tag.
 * - events: Object with key-value pairs of valid events, being key = name as string and value = function handler.
 * - attrs: Object with key-value string pairs of tag attributes, being key = attribute name and value = attribute value.
 * - style: Object with key-value pairs of CSS properties, being key = property name and value = CSS valid value.
 */
Monominoes.Tag.prototype.build = function(config) { 
  var tag;
  config = config || {};
  tag = $(this.tag).addClass(config.class || "")
    .attr(config.attrs || {})
    .css(config.style || {});
  Komunalne.util.forEach((config.events || {}), function(val,key) { tag.on(key,val); });
  return tag;
};

/* Statics */
Monominoes.Tag.content = ["address","article","header","h1","h2","h3","h4","h5","h6","nav","section"];
Monominoes.Tag.text = ["dl","dd","div","dl","dt","hr","li","main","ol","p","pre","ul"];
Monominoes.Tag.inline = ["a","abbr","b","br","cite","code","data","em","i",
                         "mark","q","span","strong","sub","sup","time","u","var"];
Monominoes.Tag.embed = ["embed","iframe","img","object"];
Monominoes.Tag.form = ["button","form","input","label","legend","output","textarea"];
Monominoes.Tag.noend = ["hr","br","img","input","embed"];
Monominoes.Tag.requireEnd = function(tag) { return !Komunalne.util.arrayContains(tag,this.noend); };
Monominoes.Tag.open = "<{0}>";
Monominoes.Tag.full = Monominoes.Tag.open + "</{0}>";

(function() {
  var Tag = Monominoes.Tag;
  Tag.all = Komunalne.util.arrayConcat(Tag.content,Tag.text,Tag.inline,Tag.embed,Tag.form);
  var tag;
  for(var i in Tag.all) {
    tag = Tag.all[i];
    Monominoes.tags[tag.toUpperCase()] = new Monominoes.Tag(tag);
  }
})();

