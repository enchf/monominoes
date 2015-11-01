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
Monominoes.Render.prototype.childMap = null;  /* Map for the key mapped children Renders */
Monominoes.Render.prototype.subitems = null;  /* Array of jQuery subitems, appended to the underlying item */
Monominoes.Render.prototype.itemsMap = null;  /* Mapped subitems jQuery objects */
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
  this.buildLayout();
  this.refactorRules();
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
  Komunalne.util.clone(cfg,{ "into": this, "deep": true, "skip": "children" });
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
 * Builds the inner render structure based on the layout definition.
 * It does not create the inner jQuery objects: That is done at render execution.
 */
Monominoes.Render.prototype.buildLayout = function() {
  var config = this.config.children;
  var i,r;
  this.children = [];
  this.childMap = {};
  if (Komunalne.util.isArray(config)) {
    i = new Komunalne.helper.Iterator(config);
    while (i.hasNext()) {
      r = i.next();
      r = (Monominoes.util.isRender(r)) ? Monominoes.util.concrete(r) :
          (Komunalne.util.isInstanceOf(r,Object) && Monominoes.util.isRender(r.render)) ? 
            (Komunalne.util.isFunction(r.render) ? r.render(r.config) : r.render) : null;
      if (r) this.children.push(r);
      if (r.key) this.childMap[r.key] = r;
    }
  }
};

Monominoes.Render.prototype.refactorRules = function() {
  
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
  this.updateData(data);
  this.processLayout();
  this.applyRules();
  this.appendTo(container);
  return this;
};

/**
 * Appends the render to a specific container.
 */
Monominoes.Render.prototype.appendTo = function(container) {
  this.container = (Monominoes.Render.getItemFrom(container) || this.container);
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
 * - Plain object with render (constructor) and config properties, to instantiate a new render.
 * - A render class. A render will be created executing the render class with default parameters.
 * - A render instance. It will be taken itself.
 * - Otherwise: Item is ignored.
 */
Monominoes.Render.prototype.processLayout = function() {
  var child;
  var i = new Komunalne.helper.Iterator(this.children);
  this.clear();
  this.item = this.buildItem();
  while (i.hasNext()) {
    child = i.next();
    if (child.iterable === true) this.buildIterable(child);
    else this.buildChild(child);
  }
};

Monominoes.Render.prototype.buildChild = function(child) {
};

Monominoes.Render.prototype.buildIterable = function(child) {
};

/**
 * Get a child (or child of child ...) by the render key.
 * To get a sub render, use dot notation (i.e. "abc.def.ghi").
 * If the key is inexistent returns null.
 */
Monominoes.Render.prototype.childByKey = function(key) {
  var render = this;
  var i = new Komunalne.helper.Iterator(key.split("."));
  while (i.hasNext()) {
    render = render.childMap[i.next()];
    if (!render) break;
  }
  return render;
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

/**
 * Clears all the inner jQuery objects of this render and its children.
 */
Monominoes.Render.prototype.clear = function() {
  this.item = null;
  if (Komunalne.util.isArray(this.subitems)) this.subitems.length = 0; else this.subitems = [];
  this.itemsMap = {};
  for (var i in this.children) this.children[i].clear();
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
