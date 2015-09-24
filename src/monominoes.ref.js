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
Monominoes.util.isIterable = function(obj) { return typeof obj == "object" && obj != undefined && !Monominoes.util.isDate(obj); };
Monominoes.util.isArray = function(obj) { return Monominoes.util.isIterable(obj) && obj.constructor && obj.constructor == Array; };
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
Monominoes.util.apply = function(source,target) { for(var x in source) target[x] = Monominoes.util.clone(source[x]); return target; };

/** Tags **/
Monominoes.tags.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","p","pre","code"];
Monominoes.tags.list = ["ul","ol","li"];
Monominoes.tags.item = ["div","form","button","a","label"];
Monominoes.tags.simple = ["br","hr"];
Monominoes.tags.noclose = ["img","input"].concat(Monominoes.tags.simple);
Monominoes.tags.all = Monominoes.tags.text.concat(Monominoes.tags.list).concat(Monominoes.tags.item).concat(Monominoes.tags.noclose);
Monominoes.tags.open = "<{0}>";
Monominoes.tags.close = "</{0}>";
Monominoes.tags.template = Monominoes.tags.open + Monominoes.tags.close;
Monominoes.tags.isSimple = function(tag) { return Monominoes.tags.noclose.indexOf(tags[i]) >= 0; };
Monominoes.tags.create = function(tag,simple) {
  var Tag = function(){};
  var t = new Tag();
  Tag.prototype.name = tag;
  Tag.prototype.simple = simple === true;
  Tag.prototype.template = (simple === true) ? Monominoes.tags.open : Monominoes.tags.template;
  Tag.prototype.tag = Monominoes.util.format(Tag.prototype.template,tag);
  Tag.prototype.build = function() { return $(this.tag); };
  Tag.prototype.class = Tag;
  Tag.prototype.defaultcss = Monominoes.util.format("monominoes-{0}",tag);
  return t;
};

(function() {
  var tags = Monominoes.tags.all;
  for(var i in tags) {
    Monominoes.tags[tags[i].toUpperCase()] = Monominoes.tags.create(tags[i], Monominoes.tags.isSimple(tags[i]));
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
    return Monominoes.util.apply(cfg,instance);
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
Monominoes.Render.concrete = function(render) { return typeof render == "function" ? render() : render; };
Monominoes.Render.path = function(path) { return function(item) { return Monominoes.util.path(item,path); }; };
Monominoes.Render.isRender = function(object) {
  var isrender = false;
  var clazz = object.class;
  
  while (clazz) {
    if (object.class === Monominoes.Render) { isrender = true; break; }
    else clazz = clazz.superclass;
  }
  
  return isrender;
};

/* Class prototype */
Monominoes.Render.prototype.superclass = null;
Monominoes.Render.prototype.class = Monominoes.Render;
Monominoes.Render.prototype.properties = {};
Monominoes.Render.prototype.super = {};
Monominoes.Render.prototype.defaults = {};
Monominoes.Render.prototype.css = "";
Monominoes.Render.prototype.extracss = null;
Monominoes.Render.prototype.render = function(item,parent) {
  var layoutrender;
  var ret;
  var isFn,isRn;
  if (this.layout) {
    isFn = typeof this.layout == "function";
    isRn = Monominoes.Render.isRender(this.layout);
    ret = (isRn ? Monominoes.Render.concrete(this.layout).render(item,parent) :
           isFn ? this.layout(item,parent) : Monominoes.renders.LAYOUT_RENDER(this.layout).render(item,parent));
  } else {
    ret = Monominoes.Render.append(subitem,parent);
  }
  return ret;
};
// Can be a LAYOUT_RENDER config, a function, a Render constructor or a Render itself.
Monominoes.Render.prototype.layout = null;

Monominoes.renders.LAYOUT_RENDER = Monominoes.Render.extend({
  "elements": [],
  "render": function(item,parent) {
    var data;
    var cfg;
    var items = [];
    for (var i in this.elements) {
      cfg = this.elements[i];
      data = cfg.path ? Monominoes.util.path(item,cfg.path) : item;
      items.push(Monominoes.Render.concrete(cfg.render).render(data,parent));
    }
    return items;
  }
});

Monominoes.renders.ARRAY_RENDER = Monominoes.Render.extend({
  "render": function(items,parent) {
    var rendered = [];
    for (var i in items) {
      rendered.push(this.super.render(items[i],parent));
    }
    return rendered;
  }
});

/* Tag renderers */
Monominoes.Render.buildTagRender = function(tag,simple) {
  var taguc = tag.toUpperCase();
  var tagobj = (Monominoes.tags[taguc] || Monominoes.tags.create(tag,simple));
  var render = Monominoes.Render.extend({
    "render": function(item,parent) {
      var tag = this.type.build().addClass(this.css);
      if (this.extracss) tag.addClass(this.extracss);
      if (this.attrs) for (var a in this.attrs) tag.attr(a, typeof this.attrs[a] == "function" ? this.attrs[a](item) : this.attrs[a]);
      if (this.events) for (var e in this.events) tag.on(e,this.events[e]);
      // Invoking default render which appends layout to a parent container.
      this.super.render(item,tag);
      Monominoes.Render.append(tag,parent);
      return tag;
    },
    "css": tagobj.defaultcss
  });
  render.prototype.type = tagobj;
  return render;
};

(function() {
  var tag;
  for (var t in Monominoes.tags.all) {
    tag = Monominoes.tags.all[t];
    Monominoes.renders[tag.toUpperCase()] = Monominoes.Render.buildTagRender(tag);
  }
})();
