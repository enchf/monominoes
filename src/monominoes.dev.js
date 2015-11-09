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
 * Render abstract class definition. 
 * In fact, a render is a decorator of a jQuery object, adding recursive and
 * iterative definition of sub-elements.
 */
Monominoes.Render = function(){};
Monominoes.Render.prototype.data = null;      /* The global data used to produce the render object */
Monominoes.Render.prototype.path = null;      /* The path to be used to get the rendered data */
Monominoes.Render.prototype.iterable = false; /* True if the children elements are produced from iterable data */
Monominoes.Render.prototype.items = null;     /* The underlying objects produced by the render. If iterable is an array */
Monominoes.Render.prototype.defaults = null;  /* Default configuration object */
Monominoes.Render.prototype.config = null;    /* Config object used to build the render. */
Monominoes.Render.prototype.layout = null;    /* Configuration of the sub-elements */
Monominoes.Render.prototype.key = null;       /* Internal sub-render id */
Monominoes.Render.prototype.parent = null;    /* Render parent in layout */

/**
 * Render Type hierarchy definition:
 * - class: The Render class. Present in all Render definitions after invoking .extend method.
 * - superclass: The Render class from which the Render extends.
 * - super: Methods and attributes from the Parent class.
 */
Monominoes.Render.prototype.class = Monominoes.Render; 
Monominoes.Render.prototype.superclass = null;
Monominoes.Render.prototype.super = null;
Monominoes.Render.class = Monominoes.Render;
Monominoes.Render.superclass = null;

/**
 * Item class. Wrapper of item creation during rendering.
 */
Monominoes.Item = function(parent,render,data,index){
  this.reset();
  this.container = Monominoes.Item.getContainerFrom(parent);
  this.render = render;
  this.data = data;
  this.index = index;
  this.layout  = render.layout.children;
  this.parent = (Komunalne.util.isInstanceOf(parent,Monominoes.Item)) ? parent : null;
};
Monominoes.Item.prototype.container = null; /* Item container */
Monominoes.Item.prototype.render = null;    /* Render builder which produced this item */
Monominoes.Item.prototype.data = null;      /* Data which produced the item */
Monominoes.Item.prototype.index = null;     /* Item index or key. Identifier on render holder */
Monominoes.Item.prototype.layout = null;    /* Children renders definition */
Monominoes.Item.prototype.children = null;  /* Children items. */
Monominoes.Item.prototype.childMap = null;  /* Children map for key mapped items */
Monominoes.Item.prototype.item = null;      /* Underlying item produced by the rendering process. */
Monominoes.Item.prototype.parent = null;    /* Parent item of this entry, if any. */

/**
 * Destroy the underlying rendered item and its children.
 */
Monominoes.Item.prototype.reset = function() { 
  if (this.children) this.children.forEach(function(child) { child.reset(); });
  this.children = [];
  if (this.item) this.item.remove();
  this.item = null;
  this.childMap = {};
  this.container = null;
  this.parent = null;
};

/**
 * Returns true if the underlying item has been drawn.
 */
Monominoes.Item.prototype.isDrawn = function() {
  return Komunalne.util.isInstanceOf(this.item,jQuery);
};

/**
 * Draw the item.
 */
Monominoes.Item.prototype.draw = function() {
  this.item = this.render.buildItem();
  this.render.customize(this.item,this.data);
  if (this.container) this.container.append(this.item);
  this.drawChildren();
};

/**
 * Draw the underlying children using master render layout.
 */
Monominoes.Item.prototype.drawChildren = function() {
  var render,data,index;
  var i,j,baseIndex;
  i = new Komunalne.helper.Iterator(this.layout);
  while (i.hasNext()) {
    render = i.next();
    data = render.extractData(this.data);
    index = i.currentKey();
    if (render.isIterable()) {
      j = new Komunalne.helper.Iterator(data);
      baseIndex = index + ".";
      while (j.hasNext()) this.pushChildren(render,j.next(),baseIndex + j.currentKey());
    } else this.pushChildren(render,data,index);
  }
};

/**
 * Recursive assignment and drawing of children items.
 */
Monominoes.Item.prototype.pushChildren = function(render,data,index) {
  var item;
  item = new Monominoes.Item(this,render,data,index);
  this.children.push(item);
  if (render.key) {
    if (!(render.key in this.childMap)) this.childMap[render.key] = [];
    this.childMap[render.key].push(item);
  }
  item.draw();
};

/**
 * Gets a jQuery object using the following rules, regarding the type of 'object' argument:
 * - String: Used as a selector, retrieving the first object selected, using jQuery $ function.
 * - HTML String: Used to build a newly HTML jQuery object, using jQuery $ function.
 * - jQuery Object: Returned itself.
 * - DOM Element: Creates a jQuery object from it.
 * - Render: Returns the inner Render jQuery item.
 * - Otherwise: Returns null.
 */
Monominoes.Item.getContainerFrom = function(object) {
  var aux;
  return (Komunalne.util.isInstanceOf(object,"string")) ? ((aux = $(object)).length > 0 ? $($(aux).get(0)) : null) :
         (Komunalne.util.isInstanceOf(object,jQuery)) ? object :
         (object instanceof Element) ? $(object) :
         (Komunalne.util.isInstanceOf(object,Monominoes.Item)) ? (object.isDrawn() ? object.item : null) :
         (Monominoes.util.isRenderInstance(object) ? (object.isBuilt() ? object.items[0].item : null) : null);
};

/* Render Functions definition, overridable at extension point, and available in defaults and super objects */

/**
 * Overridable initialization function, used in constructor.
 */
Monominoes.Render.prototype.init = function(cfg) {
  cfg = (cfg || {});
  this.populateDefaults();
  this.applyConfig(cfg);
  this.buildSuper();
  this.preInit();
  this.buildLayout();
  this.postInit();
  if (this.data != null) this.updateGlobalData();
  return this;
};

/**
 * Returns true if the render is marked as iterable.
 */
Monominoes.Render.prototype.isIterable = function() { return this.iterable === true; };

/**
 * Returns true if the render path is absolute.
 */
Monominoes.Render.prototype.isAbsolute = function() { return this.absolute === true; };

/**
 * Returs true if render items have been built.
 */
Monominoes.Render.prototype.isBuilt = function() { 
  return Komunalne.util.isArray(this.items) && Komunalne.util.isInstanceOf(this.items[0],Monominoes.Item); 
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
  Komunalne.util.clone(cfg,{ "into": this, "deep": true, "skip": "children" });
  this.config = cfg;
};

/**
 * Replicates superclass defaults recursively into constructor.super object.
 */
Monominoes.Render.prototype.buildSuper = function() {
  var type,holder;
  type = this.class;
  holder = this;
  while (type.superclass) {
    holder.super = {};
    Komunalne.util.clone(type.superclass.prototype,{"deep": true,"into": holder.super});
    type = type.superclass;
    holder = holder.super;
  }
};

/**
 * Pre layout build custom execution.
 */
Monominoes.Render.prototype.preInit = function() {};

/**
 * Builds the inner render structure based on the layout definition.
 * It does not create the inner jQuery objects: That is done at render execution.
 */
Monominoes.Render.prototype.buildLayout = function() {
  var config = this.config.children;
  var i,r;
  this.layout = {};
  this.layout.children = [];
  this.layout.childMap = {};
  if (Komunalne.util.isArray(config)) {
    i = new Komunalne.helper.Iterator(config);
    while (i.hasNext()) {
      r = i.next();
      r = (Monominoes.util.isRender(r)) ? 
            Monominoes.util.concrete(r) :
            (
              (Komunalne.util.isInstanceOf(r,Object) && Monominoes.util.isRender(r.render)) ? 
              (Komunalne.util.isFunction(r.render) ? r.render(r.config) : r.render) 
              : null
            );
      if (r) {
        this.layout.children.push(r);
        if (r.key) this.layout.childMap[r.key] = r;
        r.parent = this;
      }
    }
  }
};

/**
 * Post layout build custom execution.
 */
Monominoes.Render.prototype.postInit = function() {};

/**
 * Renders the object. Takes care of the render children, and its attachment to the container object.
 * @param data Data to be used during the render. Can be any type of object.
 * @param container Container object. Can be any of the following types:
 * - string: Used as a jQuery selector, creating a jQuery object from it and used as container.
 * - jQuery object: Used directly as the inner render item container.
 * - DOM Object: Transformed to a jQuery object to be used as the container.
 * - Render Object: If the function detects it is a Render, 
 * - Otherwise, render function ignores the parameter.
 * To keep the existing data or container, pass null or no argument when invoking render function.
 * @return Returns the Render object itself.
 */
Monominoes.Render.prototype.render = function(data,container) {
  this.updateGlobalData(data);
  this.createItems(container);
  return this;
};

/**
 * Updates the base global data of the render.
 */
Monominoes.Render.prototype.updateGlobalData = function(data) {
  this.data = data = (data || this.data);
  if (this.data == null) throw "No global data specified";
  this.layout.children.forEach(function(child) { child.updateGlobalData(data); });
};

/**
 * Process the layout definition, creating the children renders array with the newly instantiated sub-renders
 * and appending children renders into the render item object. It is processed only in the immediate lower dimension.
 * Each Render will recursively iterating over its immediate lower dimension by themselves.
 * Children config property is an array of any of the following:
 * - Plain object with render (constructor) and config properties, to instantiate a new render.
 * - A render class. A render will be created executing the render class with default parameters.
 * - A render instance. It will be taken itself.
 * - Otherwise: Item is ignored.
 */
Monominoes.Render.prototype.createItems = function(container) {
  var data;
  var i;
  var item;
  this.clear();
  this.items = [];
  data = this.extractData();
  data = this.isIterable() ? data : [data];
  i = new Komunalne.helper.Iterator(data);
  while (i.hasNext()) {
    item = new Monominoes.Item(container,this,i.next(),i.currentKey());
    this.items.push(item);
    item.draw();
  }
};

/**
 * Extract data from the absolute base path or the specified data object.
 * Data object is free to allow iterability assignment and separate the layout and the items.
 */
Monominoes.Render.prototype.extractData = function(data) {
  var base,result;
  base = (this.isAbsolute() || data == null) ? this.data : data;
  return this.path ? Komunalne.util.path(base,this.path) : base;
};

/**
 * Clears all the inner jQuery objects of this render and its children.
 */
Monominoes.Render.prototype.clear = function() {
  if (this.items) this.items.forEach(function(item) { item.reset(); });
  this.items = null;
};

/**
 * Build item function. Mandatory to be overriden if not defined yet.
 * Takes the constructor configuration and builds the inner object, returning it.
 * It is limited to only create the underlying render object, not its children or the attachment to its container.
 */
Monominoes.Render.prototype.buildItem = function() { 
  throw "M.Render.buildItem should be overriden by subclass Render";
};

/**
 * Gets a child mapped render using simple key.
 * This works only for the immediate children, not child of children.
 */
Monominoes.Render.prototype.getMappedRender = function(key) {
  return this.layout.childMap[key];
};

/**
 * Get a child (or child of child ...) by the render key.
 * To get a sub render, use dot notation (i.e. "abc.def.ghi").
 * If the key is inexistent returns null.
 */
Monominoes.Render.prototype.renderByKey = function(key) {
  var render = this;
  var i = new Komunalne.helper.Iterator(key.split("."));
  while (i.hasNext()) {
    render = render.getMappedRender(i.next());
    if (!render) break;
  }
  return render;
};

/**
 * Gets a child item by its index.
 */
Monominoes.Render.prototype.getItemByIndex = function(index) {};

/**
 * Gets a child item by its key, getting sub-items using dot-notation.
 * In case of iterable renders, can return the array of all mapped items or an specific one with the child index.
 * In unexisting keys or out of bounds indexes, returns null.
 */
Monominoes.Render.prototype.getItemByKey = function(key) {
  var i = new Komunalne.helper.Iterator(key.split("."));
  var render = this;
  var item = this;
  var token = null;
  var index;
  
  while (i.hasNext()) {
    item = (item.childMap) ? item.childMap[(token = i.next())] : item.items;
    if (item == null) break;
    if (token != null) render = render.getMappedRender(token);
    if (render.isIterable()) {
      if (!i.hasNext()) break;
      index = i.next();
    } else index = 0;
    item = item[index];
  }
  
  return (item === undefined) ? null : item;
};

/**
 * Apply Render customization rules, defined by default or during instantiation.
 * Method to be overriden from M.Render defaults. The scope of the function is the Render object.
 * @param item Individual item to be customized.
 * @param itemdata Individual item data of the individual object.
 */
Monominoes.Render.prototype.customize = function(item,itemdata) {};

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

/* Tag renderers */
Monominoes.renders.TAG = Monominoes.Render.extend({
  "tag": null, // To be overriden by concrete Tag render definition.
  "def": null, // Object containing Tag configuration as per defined in Monominoes.Tag.
  "defaultcss": null, // Default class. Used if no class is specified in config.def.class.
  "extracss": null, // Extra class. Used to append a class without removing the default one.
  "buildItem": function() {
    var config = Komunalne.util.clone(this.config.def || {});
    config.class = Komunalne.util.append((config.class || this.defaultcss),this.extracss);
    return this.tag.build(config);
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
