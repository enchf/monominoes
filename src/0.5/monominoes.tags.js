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
  "buildItem": function(data,target) {
    var config = Komunalne.util.clone(this.config.def || {}, { "deep": true });
    config.class = (config.class || this.defaultcss);
    config.extracss = this.extracss;
    config.data = data;
    config.text = (this.text || config.text);
    this.preConfig(config,target);
    this.buildConfig(config,target);
    this.postConfig(config,target);
    return this.tag.build(config);
  },
  "preConfig": function(config,target) {},
  "postConfig": function(config,target) {},
  "buildConfig": function(config,target) {
    var vfd = Monominoes.util.extractValue;
    var render = this;
    var data = config.data; delete config.data;
    var processVfd = function(val,key,arr) { arr[key] = vfd(val,render,target,data); };
    var bindEvent = function(val,key,arr) { arr[key] = val.bind(render,target); };
    
    config.class = Komunalne.util.append(vfd(config.class,this,target,data),vfd(config.extracss,this,target,data));
    delete config.extracss;
    config.text = vfd(config.text,this,target,data);
    if (config.attrs) Komunalne.util.forEach(config.attrs,processVfd);
    if (config.style) Komunalne.util.forEach(config.style,processVfd);
    if (config.events) Komunalne.util.forEach(config.events,bindEvent);
  }
});

(function() {
  var tag;
  for (var t in Monominoes.tags) {
    tag = Monominoes.tags[t];
    Monominoes.renders[t] = Monominoes.renders.TAG.extend({
      "tag": tag,
      "defaultcss": Monominoes.util.format("monominoes-{0}",tag.name),
      "name": t
    });
  }
})();

/* LI extensions for Lists with UL or OL. */
Monominoes.renders.LIST = Monominoes.renders.TAG.extend({
  "name": "LIST",
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
  "name": "IMAGE_BLOCK",
  "align": "center",
  "valign": "middle",
  "sourceDir": null,
  "defaultImg": null,
  "extension": null,
  "imgLayout": null, // Config object for IMG child render.
  "sourceFn": function(render,target,data) { // Data will be the image name.
    var dir,ext,name,dot,slash,path;
    if (data != null) {
      dir = (Monominoes.util.extractValue(this.sourceDir,this,target,data) || "");
      ext = (this.extension || "");
      slash = dir[dir.length-1];
      slash = dir != "" && slash !== "/" && slash !=="\\" ? "/" : "";
      dot = ext != "" && ext[0] != "." ? "." : "";
      name = data.toString();
      path = Monominoes.util.format("{0}{1}{2}{3}{4}",dir,slash,name,dot,ext);
    } else path = this.defaultImg;
    return path;
  },
  "errorHandler": function(img) {
    var val;
    if (this.defaultImg != null) {
      img.onerror = "";
      img.target.src = this.defaultImg;
      val = true;
    } else val = false;
    return val;
  },
  "buildLayout": function() {
    var config,spancfg;
    var seeker;
    
    // DIV configuration.
    this.config.def = (this.config.def || {});
    this.config.def.style = (this.config.def.style || {});
    if (this.align) this.config.def.style["text-align"] = this.align;
    
    // SPAN configuration.
    spancfg = { "def": { "class": "monominoes-spanimgblock", "style": {} } };
    
    // IMG configuration.
    this.imgLayout = this.imgLayout || {};
    this.imgLayout.def = (this.imgLayout.def || {});
    this.imgLayout.def.attrs = (this.imgLayout.def.attrs || {});
    this.imgLayout.def.attrs.src = this.sourceFn.bind(this);
    this.imgLayout.def.class = Komunalne.util.append(this.imgLayout.def.class,"monominoes-imgblock");
    config = Komunalne.util.clone(this.imgLayout,{ "deep": true });
    
    seeker = function(render) {
      while (render.name != "IMAGE_BLOCK") render = render.parent;
      return render;
    };
    
    // Error on load image.
    config.buildItem = function(data,target) {
  	  var item;
      var base = seeker(this);
  	  item = this.defaults.buildItem(data,target);
  	  item.error(base.errorHandler.bind(base));
  	  return item;
    };
    
    if (this.valign) {
      spancfg.def.style["vertical-align"] = this.valign;
      config.def.style = (config.style || {});
      config.def.style["vertical-align"] = this.valign;
    }
    
    this.config.children = [
      new Monominoes.renders.SPAN(spancfg),
      new Monominoes.renders.IMG(config)
    ];
    this.super.buildLayout();
  }
});

Monominoes.renders.TEXT_BLOCK = Monominoes.renders.SPAN.extend({
  "name": "TEXT_BLOCK",
  "defaultcss": "monominoes-text-block",
  "fontcolor": null,
  "background": null,
  "bold": true,
  "buildLayout": function() {
    this.config.def = (this.config.def || {});
    this.config.def.style = (this.config.def.style || {});
    if (this.fontcolor) this.config.def.style.color = this.fontcolor;
    if (this.background) this.config.def.style["background-color"] = this.background;
    this.config.def.style["font-weight"] = this.bold === true ? "700" : "400";
    this.text = (this.text || Monominoes.util.data);
    this.super.buildLayout();
  }
});
