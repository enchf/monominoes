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
Monominoes.Item = function(container,render,data,index){ 
  this.container = Monominoes.Item.getContainerFrom(container);
  this.render = render;
  this.data = data;
  this.index = index;
  this.layout  = render.layout.children;
  this.reset();
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
  var container,render,data,index;
  var i,j,baseIndex;
  container = this;
  i = new Komunalne.helper.Iterator(this.layout);
  while (i.hasNext()) {
    render = i.next();
    data = render.extractData(this.data);
    index = i.currentKey();
    if (render.iterable === true) {
      j = new Komunalne.helper.Iterator(data);
      baseIndex = index + ".";
      while (j.hasNext()) this.pushChildren(container,render,j.next(),baseIndex + j.currentKey());
    } else this.pushChildren(container,render,data,index);
  }
};

/**
 * Recursive assignment and drawing of children items.
 */
Monominoes.Item.prototype.pushChildren = function(container,render,data,index) {
  var item;
  item = new Monominoes.Item(container,render,data,index);
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
         (Komunalne.util.isInstanceOf(object,Monominoes.Item)) ? object.item :
         (Monominoes.util.isRender(object)) ? (object.iterable === true ? object.items[0] : object.items) : null;
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
  base = (this.absolute === true || data == null) ? this.data : data;
  result = this.path ? Komunalne.util.path(base,this.path) : base;
  result = (this.iterable === true) ? result : [result];
  return result;
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
