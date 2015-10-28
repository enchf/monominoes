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
 * Tag class definition.
 * @param config A string with the tag name or a configuration object with the following properties:
 * - name (mandatory):  Tag name.
 * - noend (optional): True to build as a no close empty tag, otherwise is determined using Monominoes.Tag.requireEnd.
 */
Monominoes.Tag = function(cfg) {
  if (Komunalne.util.isInstanceOf(cfg,"string")) {
    this.name = cfg;
    this.requireEnd = Monominoes.Tag.requireEnd(cfg);
  } else if (cfg != null && Komunalne.util.isInstanceOf(cfg,"object")) {
    if (!("name" in cfg)) throw Monominoes.Tag.missingName;
    this.name = cfg.name;
    this.requireEnd = (cfg.noEnd === true) ? false : Monominoes.Tag.requireEnd(cfg.name);
  } else throw Monominoes.util.format(Monominoes.Tag.invalidArguments,((cfg == null) ? cfg : typeof cfg));
  this.tag = Monominoes.util.format(this.template(),this.name);
};

Monominoes.Tag.invalidArguments = "Invalid constructor argument type: {0}";
Monominoes.Tag.missingName = "Missing name in tag configuration";

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

/**
 * Render abstract class definition. 
 * In fact, a render is a decorator of a jQuery object, adding recursive and
 * iterative definition of sub-elements.
 */
Monominoes.Render = function(){};
Monominoes.Render.prototype.data = null;      /* The data used to produce the render object */
Monominoes.Render.prototype.path = null;      /* The path to be used to get the rendered data */
Monominoes.Render.prototype.iterable = false; /* True if the children elements are produced from iterable data */
Monominoes.Render.prototype.item = null;      /* The underlying jQuery object produced by the render */
Monominoes.Render.prototype.container = null; /* Render item container, if any formally defined */
Monominoes.Render.prototype.children = null;  /* Underlying array of Renders of the children items */
Monominoes.Render.prototype.defaults = null;  /* Default configuration object */
Monominoes.Render.prototype.config = null;    /* Config object used to build the render. */
Monominoes.Render.prototype.layout = null;    /* Configuration of the sub-elements */
Monominoes.Render.prototype.rules = null;     /* Rules to assign to key-mapped elements */
Monominoes.Render.prototype.key = null;       /* Internal sub-render id */

/**
 * Render Type hierarchy definition:
 * - class: The Render class. Present in all Render definitions after invoking .extend method.
 * - superclass: The Render class from which the Render extends.
 * - parent: Methods and attributes from the Parent class.
 */
Monominoes.Render.prototype.class = Monominoes.Render; 
Monominoes.Render.prototype.superclass = null;
Monominoes.Render.prototype.parent = null;
Monominoes.Render.class = Monominoes.Render;
Monominoes.Render.superclass = null;

/* Render Functions definition, overridable at extension point, and available in defaults and parent objects */

/**
 * Overridable initialization function, used in constructor.
 */
Monominoes.Render.prototype.init = function(cfg) {
  cfg = (cfg || {});
  this.populateDefaults();
  this.applyConfig(cfg);
  this.buildParent();
  return this;
};

/**
 * Creates the defaults object, holding the original prototype defined for the Render.
 */
Monominoes.Render.prototype.populateDefaults = function() {
  this.defaults = {};
  Komunalne.util.clone(this,{ "into": this.defaults, "deep": true });
};

/**
 * Applies the instance configuration object.
 * Overridable to apply custom rules for overriden properties.
 * Children property is excluded from deep cloning to avoid recloning subrenders.
 */
Monominoes.Render.prototype.applyConfig = function(cfg) {
  cfg = (cfg || {});
  if (cfg.children) {
	this.children = Komunalne.util.clone(cfg.children);
	delete cfg.children;
	// TODO Avoid deleting and instead of use clone with skip config property.
  }
  Komunalne.util.clone(cfg,{ "into": this, "deep": true });
  this.config = cfg;
};

/**
 * Replicates superclass defaults recursively into constructor.parent object.
 */
Monominoes.Render.prototype.buildParent = function() {
  var type,holder;
  type = this.class;
  holder = this;
  while (type.superclass) {
    holder.parent = {};
    Komunalne.util.clone(type.superclass.prototype,{"deep": true,"into": holder.parent});
    type = type.superclass;
    holder = holder.parent;
  }
};

/**
 * Renders the object. Takes care of the render children, and its attachment to the container object.
 * @param data Data to be used during the render. Can be any type of object.
 * @param container Container object. Can be any of the following types:
 * - string: Used as a jQuery selector, creating a jQuery object from it and used as container.
 * - jQuery object: Used directly as the inner render item container.
 * - DOM Object: Transformed to a jQuery object to be used as the container.
 * - Render Object: If the function detects it is a Render, 
 * - Otherwise, render function ignores the parameter.
 * @return Returns the Render object itself.
 */
Monominoes.Render.prototype.render = function(data,container) {
  this.appendTo(container);
  this.updateData(data);
  this.clear();
  this.buildItem();
  this.processLayout();
  this.updateKeyMap();
  this.applyRules();
  return this;
};

/**
 * Appends the render to a specific container.
 */
Monominoes.Render.prototype.appendTo = function(container) {
  this.container = Monominoes.Render.getItemFrom(container);
  if (this.container) this.container.append(this.item);
};

/**
 * Updates the data to be rendered.
 * Throws an exception if the data results into null/undefined.
 */
Monominoes.Render.prototype.updateData = function(data) {
  this.data = (data || this.data);
  this.data = this.path ? Komunalne.util.path(this.data,this.path) : this.data;
  if (this.data == null) throw "No data to render";
};

/**
 * Build item function. Mandatory to be overriden if not defined yet.
 * Takes the constructor configuration and builds the inner object, returning it.
 * It is limited to only create the underlying render object, not its children or the attachment to its container.
 */
Monominoes.Render.prototype.buildItem = function(config) { 
  throw "M.Render.buildItem should be overriden by subclass Render";
};

/**
 * Process the layout definition, creating the children renders array with the newly instantiated sub-renders
 * and appending children renders into the render item object. It is processed only in the immediate lower dimension.
 * Each Render will recursively iterating over its immediate lower dimension by themselves.
 * Children config property is an array of any of the following:
 * - Plain object with "render" and "config" properties: A render will be created with the render constructor using configuration object.
 * - A render class. A render will be created executing the render class with default parameters.
 * - A render instance. It will be taken itself.
 */
Monominoes.Render.prototype.processLayout = function() {
  
};

/**
 * Update the key map with the sub-renders identifiers (key attribute).
 */
Monominoes.Render.prototype.updateKeyMap = function() {
};

/**
 * Apply the Render rules to the underlying elements according to the rules array.
 */
Monominoes.Render.prototype.applyRules = function() {
};

/**
 * Redraws the inner produced objects using new data. 
 * Takes care of removing from the DOM the existing objects and mantains the same parent object.
 * @param data Data to be used to redraw the object.
 * @param key (optional) The key of the children render to be updated, remaining the rest intact.
 */
Monominoes.Render.prototype.redraw = function(data,key) {
};

/**
 * Appends a render to the children object.
 * Validates that the render argument is one of the accepted types defined in M.R.render function.
 */
Monominoes.Render.prototype.append = function(render) {
};

/** Statics **/

/**
 * Gets a jQuery object using the following rules, regarding the type of 'object' argument:
 * - String: Used as a selector, retrieving the first object selected, using jQuery $ function.
 * - HTML String: Used to build a newly HTML jQuery object, using jQuery $ function.
 * - jQuery Object: Returned itself.
 * - DOM Element: Creates a jQuery object from it.
 * - Render: Returns the inner Render jQuery item.
 * - Otherwise: Returns null.
 */
Monominoes.Render.getItemFrom = function(object) {
  var aux;
  return (Komunalne.util.isInstanceOf(object,"string")) ? ((aux = $(object)).length > 0 ? $(aux).get(0) : null) :
         (Komunalne.util.isInstanceOf(object,jQuery)) ? object :
         (object instanceof Element) ? $(object) :
         (Monominoes.util.isRender(object)) ? object.item : null;
};

/**
 * Render statics: Extend.
 * Extends a current render, creating a new constructor object overriding its properties.
 * It preserves the type hierarchy keeping a reference to the superclass and the prototype through super property.
 */
Monominoes.Render.extend = function(ext) {
  var extendedType = this;
  var constructor = function R(cfg) {
    return (Komunalne.util.isInstanceOf(this,R)) ? this.init(cfg) : new R(cfg);
  };
  Komunalne.util.clone(extendedType.prototype,{ "into": constructor.prototype, "deep": true });
  Komunalne.util.clone(ext,{ "into": constructor.prototype, "deep": true });
  constructor.extend = Monominoes.Render.extend;
  constructor.class = constructor;
  constructor.superclass = extendedType;
  constructor.prototype.class = constructor;
  constructor.prototype.superclass = extendedType;
  return constructor;
};

/* Tag renderers */
Monominoes.renders.TAG = Monominoes.Render.extend({
  "tag": null, // To be overriden by concrete Tag render definition.
  "def": null, // Object containing Tag configuration as per defined in Monominoes.Tag.
  "defaultcss": null, // Default class. Used if no class is specified in config.def.class.
  "extracss": null, // Extra class. Used to append a class without removing the default one.
  "buildItem": function(config) {
    config = config || {};
    config.def = config.def || {};
    var tagcfg = Komunalne.util.clone(config.def);
    tagcfg.class = Komunalne.util.append((config.def.class || this.defaultcss),config.extracss);
    return this.tag.build(tagcfg);
  }
});

(function() {
  var tag;
  for (var t in Monominoes.tags) {
    tag = Monominoes.tags[t];
    Monominoes.renders[t] = Monominoes.renders.TAG.extend({
      "tag": tag,
      "defaultcss": Monominoes.util.format("monominoes-{0}",tag.name)
    });
  }
})();
