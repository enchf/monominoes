function Monominoes() {}

/** Utils **/
Monominoes.util = {};
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
Monominoes.util.forceType = function(obj,clazz) { return obj instanceof clazz ? obj : new clazz(); };

/** Init Helpers **/
Monominoes.init = {};
Monominoes.init.tags = function() {
  var all = Monominoes.tags.all;
  for(var x in all) {
    Monominoes[all[x].toUpperCase()] = new Monominoes.Tag({
      tag: all[x],
      simple: Monominoes.tags.noclose.indexOf(all[x]) >= 0
    });
  }
};

/** Tags **/
Monominoes.tags = {};
Monominoes.tags.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","p","pre","code"];
Monominoes.tags.list = ["ul","ol","li"];
Monominoes.tags.form = ["form","input","button","label"];
Monominoes.tags.item = ["div","img","br","hr","a"];
Monominoes.tags.noclose = ["img","br","hr","input"];
Monominoes.tags.all = Monominoes.tags.text.concat(Monominoes.tags.list).concat(Monominoes.tags.form).concat(Monominoes.tags.item);

Monominoes.Tag = function(cfg) {
  var t = Monominoes.util.forceType(this,Monominoes.Tag);
  Monominoes.util.apply(cfg,t);
  return t;
};
Monominoes.Tag.prototype.template = "<{0}></{0}>";
Monominoes.Tag.prototype.simpleTemplate = "<{0}>";
Monominoes.Tag.prototype.getTemplate = function() { return this.simple ? this.simpleTemplate : this.template; };
Monominoes.Tag.prototype.build = function(cfg) {
  var obj = $(Monominoes.util.format(this.getTemplate(),this.tag));
  if (cfg && cfg.class) obj.addClass(cfg.class);
  if (cfg && cfg.content) obj.html(cfg.content);
  if (cfg && cfg.parent) obj.appendTo(cfg.parent);
  return obj;
};

Monominoes.init.tags();

/** Renders **/
Monominoes.renders = {};
Monominoes.Render = function(cfg) {
  var r = Monominoes.util.forceType(this,Monominoes.Render);
  Monominoes.util.apply(r.super,r);
  Monominoes.util.apply(cfg,r);
  return r;
};
Monominoes.Render.prototype.super = {};
