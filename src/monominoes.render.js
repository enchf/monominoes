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
Monominoes.Render.prototype.defaults = null;  /* Default configuration object */
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

/* Render Functions definition, overridable at extension point, and available in defaults and parent objects */

/**
 * Build item function. Mandatory to be overriden if not defined yet.
 * Takes the constructor configuration and builds the inner object, returning it.
 * It is limited to only create the underlying render object, not its children or the attachment to its container.
 */
Monominoes.Render.prototype.buildItem = function(config) { return null; }; 

/**
 * Renders the object. Takes care of the render children, and its attachment to the container object.
 * @param container Container object. Can be any of the following types:
 * - string: Used as a jQuery selector, creating a jQuery object from it and used as container.
 * - jQuery object: Used directly as the inner render item container.
 * - DOM Object: Transformed to a jQuery object to be used as the container.
 * - Render Object: If the function detects it is a Render, 
 * - Otherwise, render function ignores the parameter.
 * @param data Data to be used during the render. Can be any type of object.
 * @return Returns the Render object itself.
 */
Monominoes.Render.prototype.render = function(container,data) {
  return this;
};

/**
 * Redraws the inner produced objects using new data. 
 * Takes care of removing from the DOM the existing objects and mantains the same parent object.
 * @param data Data to be used to redraw the object.
 * @param key (optional) The key of the children render to be updated, remaining the rest intact.
 */
Monominoes.Render.prototype.redraw = function(data,key) {};

/**
 * Render statics: Extend.
 * Extends a current render, creating a new constructor object overriding its properties.
 * It preserves the type hierarchy keeping a reference to the superclass and the prototype through super property.
 */
Monominoes.Render.extend = function(ext) {
  var extendedType = this;
  var constructor = function R(cfg) {
    var instance;
    var type,holder;
    cfg = (cfg || {});
    if (Komunalne.util.isInstanceOf(this,R)) {
      instance = this;
      instance.defaults = {};
      Komunalne.util.clone(instance,{ "into": instance.defaults, "deep": true });
      Komunalne.util.clone(cfg,{ "into": instance, "deep": true });
      instance.config = cfg;

      // Replicate superclass defaults recursively into constructor.parent object.
      type = instance.class;
      holder = instance;
      while (type.superclass) {
        holder.parent = {};
        Komunalne.util.clone(type.superclass.prototype,{"deep": true,"into": holder.parent});
        type = type.superclass;
        holder = holder.parent;
      }
    } else instance = new R(cfg);
    return instance;
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
  "defaultcss": "", // Default class. Used if no class is specified in config.def.class.
  "extracss": "", // Extra class. Used to append a class without removing the default one.
  "buildItem": function(config) {
    var tagcfg = Komunalne.util.clone(config.def || {});
    tagcfg.class = Komunalne.util.append((config.def.class || config.defaultcss),config.extracss);
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
