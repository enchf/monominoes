/**
 * Render abstract class definition. 
 * In fact, a render is a decorator of a jQuery object, adding recursive and
 * iterative definition of sub-elements.
 */
Monominoes.Render = function(){};
Monominoes.Render.prototype.item = null;      /* The underlying jQuery object produced by the render */
Monominoes.Render.prototype.data = null;      /* The data used to produce the render object */
Monominoes.Render.prototype.iterable = false; /* True if the children elements are produced from iterable data */
Monominoes.Render.prototype.children = null;  /* Underlying array of Renders of the children items */
Monominoes.Render.prototype.defaults = {};    /* Default configuration object */
Monominoes.Render.prototype.config = null;    /* Config object used to build the render. */

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

/**
 * Render statics: Extend.
 * Extends a current render, creating a new constructor object overriding its properties.
 * It preserves the type hierarchy keeping a reference to the superclass and the prototype through super property.
 */
Monominoes.Render.extend = function(ext) {
  var extendedType = this;
  var type,holder;
  var constructor = function R(cfg) {
    var instance = Komunalne.util.isInstanceOf(this,R) ? this : new R();
    cfg = (cfg || {});
    Komunalne.util.clone(instance,{ "into": instance.defaults, "deep": true });
    Komunalne.util.clone(cfg,{ "into": instance, "deep": true });
    return instance;
  };
  
  Komunalne.util.clone(extendedType.prototype,{ "into": constructor.prototype, "deep": true });
  Komunalne.util.clone(ext,{ "into": constructor.prototype, "deep": true });
  
  constructor.extend = Monominoes.Render.extend;
  constructor.class = constructor;
  constructor.superclass = extendedType;
  constructor.prototype.class = constructor;
  constructor.prototype.superclass = extendedType;
  
  /* Replicate superclass defaults recursively into constructor.parent object.
  type = constructor;
  holder = constructor.prototype;
  while (type.superclass) {
    holder.parent = Komunalne.util.clone(type.superclass.prototype.defaults, {"deep": true});
    type = type.superclass;
    holder = holder.parent;
  }*/
  
  return constructor;
};
