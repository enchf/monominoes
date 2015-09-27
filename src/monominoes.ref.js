function Monominoes() {}
Monominoes.util = {};
Monominoes.tags = {};
Monominoes.renders = {};

/** Utils **/
Monominoes.util.assert = function(obj, msg) { if (!obj) throw msg || "assertion failed"; };
Monominoes.util.format = function() { return $.validator.format.apply(null,arguments); };
Monominoes.util.append = function(str,app,sep) { return ((str||"") + (sep||" ") + (app||"")).trim(); };
Monominoes.util.currency = function(num,nd,ds,ms){
  Monominoes.util.assert(typeof num == "number", "Formatting a non-number");
  nd = nd !== "" && nd !== null && !isNaN((nd = Math.abs(nd))) ? nd : 2;
  ds = ds != undefined ? ds : ".";
  ms = ms != undefined ? ms : ",";
  var neg = num < 0 ? "-" : "";
  var fix = num.toFixed(nd);
  var ist = Math.abs(parseInt(fix)).toString();
  var dec = Math.abs(fix).toString().substr(ist.length+1,nd);
  dec = (dec.length < nd) ? dec + ((new Array(nd-dec.length+1)).join("0")) : dec;
  var res = "";
  var i = ist.length;
  for (; (i-3)>0; i-=3) res = (ms+ist.substr(i-3,3)) + res;
  res=neg + ist.substring(0,i) + res;
  return res + (dec.length > 0 ? (ds+dec) : "");
};
Monominoes.util.copyIfNot = function(source,target) { 
  for (var x in source) {
    target[x] = target[x] == undefined ? Monominoes.util.clone(source[x]) : target[x];
  }
  return target;
};
Monominoes.util.path = function(obj,path) {
  if (path === "") return obj;
  var paths = path.split(".");
  var el = obj;
  for (var p in paths) {
    if (typeof el === "object" && el[paths[p]] !== undefined) {
      el = el[paths[p]]; 
    } else { 
      el = null;
      break;
    }
  }
  return el;
};
Monominoes.util.self = function(x) { return x; };
Monominoes.util.nothing = function() {};
Monominoes.util.capitalize = function(str) { return str[0].toUpperCase() + str.substr(1); };
Monominoes.util.isDate = function(date) { return date instanceof Date && !isNaN(date.valueOf()); };
Monominoes.util.isIterable = function(obj) { 
  return typeof obj == "object" && obj != undefined && !Monominoes.util.isDate(obj);
};
Monominoes.util.isArray = function(obj) { 
  return Monominoes.util.isIterable(obj) && obj.constructor && obj.constructor == Array; 
};
Monominoes.util.clone = function(obj) {
  var clon,item;
  if (!Monominoes.util.isIterable(obj)) return obj;
  clon = Monominoes.util.isArray(obj) ? [] : {};
  for (var x in obj) { 
    item = obj[x];
    clon[x] = Monominoes.util.isArray(item) ? item.slice(0) : Monominoes.util.clone(item);
  } 
  return clon; 
};
Monominoes.util.apply = function(source,target) {
  for(var x in source) target[x] = Monominoes.util.clone(source[x]); return target;
};
Monominoes.util.recursiveApply = function(source,target) {
  for (var x in source) {
    if (source[x] && typeof source[x] == "object" && target[x] && typeof target[x] == "object") {
      Monominoes.util.recursiveApply(source[x],target[x]);
    } else {
      target[x] = source[x];
    }
  }
};

/** Tags **/
Monominoes.Tag = function(name,simple){
  this.name = name;
  this.simple = simple === true;
  this.tag = Monominoes.util.format(this.getTemplate(),name);
  this.defaultcss = Monominoes.util.format("monominoes monominoes-{0}",name);
};
Monominoes.Tag.prototype.getTemplate = function() { 
  return this.simple ? Monominoes.Tag.open : Monominoes.Tag.template;
};
Monominoes.Tag.prototype.build = function() { return $(this.tag); };

/* Statics */
Monominoes.Tag.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","p","pre","code"];
Monominoes.Tag.list = ["ul","ol","li"];
Monominoes.Tag.item = ["div","form","button","a","label"];
Monominoes.Tag.selfclose = ["img","input","br","hr"];
Monominoes.Tag.all = Monominoes.Tag.text.concat(Monominoes.Tag.list).concat(Monominoes.Tag.item).concat(Monominoes.Tag.selfclose);
Monominoes.Tag.open = "<{0}>";
Monominoes.Tag.close = "</{0}>";
Monominoes.Tag.template = Monominoes.Tag.open + Monominoes.Tag.close;
Monominoes.Tag.isSimple = function(tag) { return Monominoes.Tag.selfclose.indexOf(tag) >= 0; };

(function() {
  var tags = Monominoes.Tag.all;
  for(var i in tags) {
    Monominoes.tags[tags[i].toUpperCase()] = new Tag(tags[i],Monominoes.Tag.isSimple(tags[i]));
  }
})();

/** Renders **/
/* Render abstract class */
Monominoes.Render = function(){};

/* Static methods */
Monominoes.Render.extend = function(ext) {
  var SuperClass = this;
  var render = function F(cfg) {
    var instance = (this instanceof F) ? this : new F();
    Monominoes.util.apply(instance,instance.defaults);
    cfg = (cfg || {});
    return Monominoes.util.recursiveApply(cfg,instance);
  };
  
  ext = (ext || {});
  ext.class = render;
  ext.superclass = SuperClass;
  
  Monominoes.util.apply(SuperClass.prototype,render.prototype.super);
  Monominoes.util.apply(SuperClass.prototype,render.prototype);
  Monominoes.util.apply(ext,render.prototype);
  
  render.extend = Monominoes.Render.extend;
  render.superclass = SuperClass;
  render.class = render;
  return render;
};
Monominoes.Render.append = function(item,parent) {
  if (parent) (typeof parent == "string" ? $("#"+parent) : $(parent)).html(item);
  return item;
};
Monominoes.Render.concrete = function(render,cfg) { 
  return typeof render == "function" ? render(cfg) : render;
};
Monominoes.Render.path = function(path) { return function(item) { return Monominoes.util.path(item,path); }; };
Monominoes.Render.currency = function(nd,ds,ms) { 
  return function(num) { return Monominoes.util.currency(num,nd,ds,ms); };
};
Monominoes.Render.isRender = function(object) {
  var isrender = false;
  var clazz = object.class;
  
  while (clazz) {
    if (object.class === Monominoes.Render) { isrender = true; break; }
    else clazz = clazz.superclass;
  }
  
  return isrender;
};
Monominoes.Render.multitype = function(obj,renderType) {
  return function(item,parent) {
    var isFn,isRn;
    isFn = typeof obj == "function";
    isRn = Monominoes.Render.isRender(obj);
    return (isRn ? Monominoes.Render.concrete(obj).render(item,parent) :
            isFn ? obj(item,parent) : renderType(obj).render(item,parent));
  };
};

/* Class prototype */
Monominoes.Render.prototype.iterable = false;
Monominoes.Render.prototype.superclass = null;
Monominoes.Render.prototype.class = Monominoes.Render;
Monominoes.Render.prototype.properties = {};
Monominoes.Render.prototype.style = {};
Monominoes.Render.prototype.super = {};
Monominoes.Render.prototype.defaults = {};
Monominoes.Render.prototype.css = "";
Monominoes.Render.prototype.extracss = null;
Monominoes.Render.prototype.layout = null; // LAYOUT_RENDER config, a function, a Render constructor or a Render itself.
Monominoes.Render.prototype.item = null; // Used only on iterable renders.
Monominoes.Render.prototype.render = function(item,parent) {
  var ret;
  var itemRender
  var data;
  
  if (this.iterable) {
    itemRender = (Monominoes.Render.isRender(this.item)) ? this.item : this.item.render(this.item.config);
    data = item;
    ret = [];
    for (var i = 0; i < data.length; i++) {
      ret.push(itemRender.render(data[i],parent));
    }
  } else {
    ret = Monominoes.Render.append(item,parent);
  }
  if (this.layout) {
    ret = Monominoes.Render.multitype(this.layout,Monominoes.renders.LAYOUT_RENDER)(item,parent);
  }
  
  return ret;
};

Monominoes.renders.SELF = Monominoes.Render.extend({ 
  "render": function(item,parent) {
    return Monominoes.Render.append(item,parent);
  }
}); 

Monominoes.renders.LAYOUT_RENDER = Monominoes.Render.extend({
  "elements": [],
  "render": function(item,parent) {
    var data;
    var cfg;
    var items = [];
    for (var i in this.elements) {
      cfg = this.elements[i];
      data = cfg.path ? Monominoes.util.path(item,cfg.path) : item;
      items.push(Monominoes.Render.concrete(cfg.render,cfg.config).render(data,parent));
    }
    return items;
  }
});

/* Tag renderers */
Monominoes.renders.TAG = Monominoes.Render.extend({
  "render": function(item,parent) {
    var tag = this.type.build().addClass(this.css);
    if (this.extracss) tag.addClass(this.extracss);
    if (this.events) for (var e in this.events) tag.on(e,this.events[e]);
    if (this.properties) {
      for (var a in this.properties) {
        tag.attr(a, typeof this.properties[a] == "function" ? this.properties[a](item) : this.properties[a]);
      }
    }
    if (this.style) {
      for (var s in this.style) tag.css(s, this.style[s]);
    }
    
    // Invoking parent render to append layout to the tag, only if the tag is not self closing.
    if (!this.type.simple) this.super.render(item,tag);
    Monominoes.Render.append(tag,parent); // Appends the tag to the parent if any.
    return tag;
  }
});

(function() {
  var tag;
  for (var t in Monominoes.tags) {
    tag = Monominoes.tags[t];
    Monominoes.renders[t] = Monominoes.renders.TAG.extend({
      "type": tag,
      "css": tag.defaultcss
    });
  }
})();

/* Overwrite of default tag renderers */
Monominoes.renders.LIST = Monominoes.renders.TAG.extend({
  "ordered": false,
  "iterable": true,
  "marker": undefined,
  "item": {
    "render": Monominoes.renders.LI,
    "config": {}
  },
  "render": function(item,parent) {
    this.type = this.ordered ? Monominoes.tags.OL : Monominoes.tags.UL;
    if (this.marker != undefined && this.marker !== true) {
    	if (this.marker === false) this.marker = "none";
    	if (typeof this.marker == "string") this.css["list-style-type"] = this.marker;
    } 
    this.super.render(item,parent); 
  }
});
Monominoes.renders.UL = Monominoes.renders.LIST.extend({ "ordered": false });
Monominoes.renders.OL = Monominoes.renders.LIST.extend({ "ordered": true });

/* Custom tags renderers */
Monominoes.renders.TEXT_BLOCK = Monominoes.renders.SPAN.extend({
  "class": "monominoes-text-block",
  "font-color": "white",
  "background": "black",
  "render": function(item,parent) {
    this.css.color = this["font-color"];
    this.css["background-color"] = this.background;
    this.super.render(item,parent);
  }
});

Monominoes.renders.LABELED = Monominoes.renders.TAG.extend({
  "inline": false,
  "bold": true,
  "layout": {
    "elements": [{
      "path": "",
      "layout": function(item,parent) { return Monominoes.Render.append(item + ": ",parent); },
      "config": {},
      "render": Monominoes.renders.SPAN
    },{
      "path": "",
      "render": Monominoes.renders.SPAN
    }]
  },
  "render": function(item,parent) {
    var weight = (typeof this.bold == "string") ? this.bold :
                 (this.bold === true) ? "700" : "400";
    this.layout.elements[0].config.css["font-weight"] = weight;
    this.type = this.inline ? Monominoes.tags.SPAN : Monominoes.tags.DIV;
    this.super.render(item,parent);
  }
});

/* Bootstrap renderers */
Monominoes.renders.LIST_GROUP = Monominoes.renders.LIST.extend({
  "class": "list-group",
  "marker": "none",
  "item": {
    "config": {
      "class": "list-group-item"
    }
  }
});
