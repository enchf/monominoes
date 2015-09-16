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
Monominoes.util.apply = function(source,target) { for(var x in source) target[x] = Monominoes.util.clone(source[x]); };

/** Tags **/
Monominoes.tags.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","p","pre","code"];
Monominoes.tags.list = ["ul","ol","li"];
Monominoes.tags.item = ["div","form","button","a","label"];
Monominoes.tags.noclose = ["img","br","hr","input"];
Monominoes.tags.all = Monominoes.tags.text.concat(Monominoes.tags.list).concat(Monominoes.tags.item).concat(Monominoes.tags.noclose);
Monominoes.tags.open = "<{0}>";
Monominoes.tags.close = "</{0}>";
Monominoes.tags.template = Monominoes.tags.open + Monominoes.tags.close;
Monominoes.tags.create = function(tag,simple) {
  var t = function(){};
  var obj = new t();
  t.prototype.name = tag;
  t.prototype.simple = simple;
  t.prototype.template = (simple === true) ? Monominoes.tags.open : Monominoes.tags.template;
  t.prototype.tag = Monominoes.util.format(t.prototype.template,tag);
  t.prototype.object = $(t.prototype.tag);
  t.prototype.classtype = t;
  t.prototype.render = Monominoes.tags.render(obj);
  return obj;
};
Monominoes.tags.render = function() {
  //TODO fix.
  var obj = $(Monominoes.util.format(this.getTemplate(),this.tag));
  if (cfg && cfg.class) obj.addClass(cfg.class);
  if (cfg && cfg.content) obj.html(cfg.content);
  if (cfg && cfg.parent) obj.appendTo(cfg.parent);
  return obj;
};

(function() {
  var shortcut = Monominoes.tags;
  var tags = shortcut.all;
  for(var i in tags) shortcut[tags[i].toUpperCase()] = shortcut.create(tags[i],shortcut.noclose.indexOf(tags[i]) >= 0);
})();

/** Renders **/
Monominoes.renders.isRender = function(obj) {
  var classtype = obj.class;
  var render = false;
  
  while (!render && classtype) {
    render = classtype === Monominoes.Render;
    classtype = classtype.superclass;
  }
  
  return render;
};

Monominoes.renders.extend = function(renderClass,newClass) {};
              
/** Base abstract Render class **/
Monominoes.Render = function(cfg) {
  var t = Monominoes.renders.isRender(this) ? this : new Monominoes.Render();
  Monominoes.util.apply(t.super,t);
  Monominoes.util.apply(cfg,t);
  return t;
};
Monominoes.Render.prototype.super = {};
Monominoes.Render.prototype.class = Monominoes.Render;
Monominoes.Render.prototype.superclass = null;
Monominoes.Render.prototype.render = function(item,parent) {};
Monominoes.Render.prototype.formatChild = Monominoes.util.self;
Monominoes.Render.prototype.attrs = {};
Monominoes.Render.classtype = Monominoes.Render;
