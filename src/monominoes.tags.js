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
  if (config.text != null) Komunalne.$.elementText(tag,config.text);
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
  "text": null,  // Text for tag, also it can be set on config.def.text, which is set will be overriden by this.
  "buildItem": function(data) {
    var config = Komunalne.util.clone(this.config.def || {});
    config.class = (config.class || this.defaultcss);
    config.extracss = this.extracss;
    config.data = data;
    config.text = (this.text || config.text);
    this.preConfig(config);
    this.buildConfig(config);
    this.postConfig(config);
    return this.tag.build(config);
  },
  "preConfig": function(config) {},
  "postConfig": function(config) {},
  "buildConfig": function(config) {
    var vfd = Monominoes.renders.TAG.valueForDef;
    var render = this;
    var data = config.data; delete config.data;
    var processVfd = function(item,key,arr) { arr[key] = vfd(item,render,data); };
    config.class = Komunalne.util.append(vfd(config.class,this,data),vfd(config.extracss,this,data));
    delete config.extracss;
    config.text = vfd(config.text,this,data);
    if (config.attrs) Komunalne.util.forEach(config.attrs,processVfd);
    if (config.style) Komunalne.util.forEach(config.style,processVfd);
  }
});

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
Monominoes.renders.TAG.valueForDef = function(object,render,data) {
  return object == null ? null :
         Komunalne.util.isAnyOf(typeof object,"string","boolean","number") ? object :
         Komunalne.util.isFunction(object) ? object.call(render,render,data) :
         Komunalne.util.isInstanceOf(object,Object) ? Monominoes.renders.TAG.configValue(object,render,data) :
         object.toString();
};

/**
 * Extracts a value from a config object, using rules defined in valueForDef.
 */
Monominoes.renders.TAG.configValue = function(object,render,data) {
  data = object.path ? Komunalne.util.path(data,object.path) : data;
  var scope = object.scope || render;
  return object.handler ? object.handler.call(scope,render,data) :
         Monominoes.renders.TAG.valueForDef(data,render);
};

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

/* LI extensions for Lists with UL or OL. */
Monominoes.renders.LIST = Monominoes.renders.TAG.extend({
  "ordered": false,
  "itemsLayout": null, // Config object for LI children. Iterable is set as true internally.
  "marker": null,
  "buildLayout": function() {
	var config;
    this.tag = (this.ordered === true) ? Monominoes.tags.OL : Monominoes.tags.UL;
    this.defaultcss = Monominoes.util.format("monominoes-{0}",this.tag.name);
    this.itemsLayout = (this.itemsLayout || {});
	if (this.marker != undefined && this.marker !== true) {
      if (this.marker === false) this.marker = "none";
      if (typeof this.marker == "string") {
        this.itemsLayout.def = (this.itemsLayout.def || {});
        this.itemsLayout.def.style = (this.itemsLayout.def.style || {});
        this.itemsLayout.def.style["list-style-type"] = this.marker;
      }
    }
    config = Komunalne.util.clone(this.itemsLayout,{ "into": { "iterable": true }, "deep": true, "safe": true });
	this.config.children = [{ "render": Monominoes.renders.LI, "config": config }];
    this.super.buildLayout();
  }
});

Monominoes.renders.IMAGE_BLOCK = Monominoes.renders.DIV.extend({
  "align": "center",
  "valign": "center",
  "source": null,
  "defaultImg": null,
  "extension": null,
  "imgLayout": null, // Config object for IMG child render.
  "sourceFn": function(render,data) {
    var dir,ext,name,dot,slash;
    dir = (this.source || "");
    ext = (this.extension || "");
    slash = dir[dir.length-1];
    slash = slash !== "/" && slash !=="\\" ? "/" : "";
    dot = ext[0] === "." ? "" : ".";
    name = data ? data.toString() : this.defaultImg;
    return Monominoes.util.format("{0}{1}{2}{3}{4}",dir,slash,name,dot,ext);
  },
  "errorHandler": function(img) {
    if (this.hasDefault()) {
      img.onerror = "";
      img.src = this.sourceFn(this.defaultImg());
      return true;
    } else return img;
  },
  "buildLayout": function() {
    var config;
    this.imgLayout = this.imgLayout || {};
    config = Komunalne.util.clone(this.imgLayout, { "deep": true, "safe": true });
    config.def = (config.def || {});
    config.def.attrs = (config.def.attrs || {});
    config.def.attrs.src = { "handler": this.sourceFn, "scope": this };
    config.def.class = Komunalne.util.append(config.def.class,"monominoes-imgblock");
    this.def = (this.def || {});
    this.def.error = (this.def.error || this.errorHandler.bind(this));
    if (this.centered) this.def.class = Komunalne.util.append(this.def.class,"monominoes-centered");
    this.children = [
      { "render": Monominoes.renders.SPAN, "config": { "def": { "class": "monominoes-spanimgblock" } } },
      { "render": Monominoes.renders.IMG,  "config": config }
    ];
    this.super.buildLayout();
  }
});

Monominoes.renders.TEXT_BLOCK = Monominoes.renders.SPAN.extend({
  "defaultcss": "monominoes-text-block",
  "fontcolor": "white",
  "background": "black",
  "buildLayout": function() {
    this.def = (this.def || {});
    this.def.style = (this.def.style || {});
    this.def.style.color = this.fontcolor;
    this.def.style["background-color"] = this.background;
    this.super.buildLayout();
  }
});
