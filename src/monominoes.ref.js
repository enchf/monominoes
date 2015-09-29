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
Monominoes.util.isFunction = function(obj) { return typeof obj == "function"; };
Monominoes.util.concrete = function(fn,scope) { 
  return Monominoes.util.isFunction(fn) ? fn.apply(scope,arguments.slice(2)) : fn; 
};
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
    if (Monominoes.util.isIterable(source[x])) {
      if (target[x] == undefined) target[x] = Monominoes.util.isArray(source[x]) ? [] : {};
      Monominoes.util.recursiveApply(source[x],target[x]);
    } else {
      target[x] = source[x];
    }
  }
};
Monominoes.util.isAnyOf = function(item) { return arguments.slice(1).indexOf(item) >= 0; };

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
Monominoes.Tag.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","i","p","pre","code"];
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

/* Class prototype */
Monominoes.Render.prototype.iterable = false;
Monominoes.Render.prototype.superclass = null;
Monominoes.Render.prototype.class = Monominoes.Render;
Monominoes.Render.prototype.properties = {};
Monominoes.Render.prototype.style = {};
Monominoes.Render.prototype.super = {};
Monominoes.Render.prototype.defaults = {};
Monominoes.Render.prototype.count = 0;
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
    this.count = 0;
    for (var i = 0; i < data.length; i++) {
      this.count++;
      itemRender.count = this.count;
      ret.push(itemRender.render(data[i],parent));
    }
  } else {
    ret = Monominoes.Render.append(item,parent);
  }
  if (this.layout) {
    ret = (Monominoes.Render.isRender(this.layout) ? Monominoes.util.concrete(this.layout).render(item,parent) :
           Monominoes.util.isFunction(this.layout) ? this.layout(item,parent) : 
           Monominoes.renders.LAYOUT_RENDER(this.layout).render(item,parent));
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
      items.push(Monominoes.util.concrete(cfg.render,null,cfg.config).render(data,parent));
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
        tag.attr(a, Monominoes.util.isFunction(this.properties[a]) ? 
                 this.properties[a].call(this,item) : 
                 this.properties[a]);
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
    	if (typeof this.marker == "string") this.style["list-style-type"] = this.marker;
    } 
    this.super.render(item,parent); 
  }
});
Monominoes.renders.UL = Monominoes.renders.LIST.extend({ "ordered": false });
Monominoes.renders.OL = Monominoes.renders.LIST.extend({ "ordered": true });

Monominoes.renders.PRE = Monominoes.renders.TAG.extend({
  "language": "",
  "render": function(item,render) {
    this.extracss = Monominoes.util.append(this.extracss,this.language);
    this.super.render(item,parent);
  }
});

/* Custom tags renderers */
Monominoes.renders.TEXT_BLOCK = Monominoes.renders.SPAN.extend({
  "css": "monominoes-text-block",
  "font-color": "white",
  "background": "black",
  "render": function(item,parent) {
    this.style.color = this["font-color"];
    this.style["background-color"] = this.background;
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
    this.layout.elements[0].config.style["font-weight"] = weight;
    this.type = this.inline ? Monominoes.tags.SPAN : Monominoes.tags.DIV;
    this.super.render(item,parent);
  }
});

Monominoes.renders.IMG_BLOCK = Monominoes.renders.DIV.extend({
  "centered": true,
  "height": "auto",
  "width": "auto",
  "defaultimg": "",
  "sourcedir": "",
  "format": "",
  "imageindex": 1,
  "sourcefn": function(name,dir,ext) {
    dir = (dir || this.sourcedir);
    ext = (ext || this.format);
    var lch = dir[dir.length-1];
    var fch = ext[0];
    dir += (lch !== "/" && lch !=="\\" ? "/" : "");
    ext = ext ? (fch === "." ? ext : "." + ext) : "";
    return Monominoes.util.format("{0}{1}{2}",dir,name,ext);
  },
  "error": function(img) {
    img.onerror = "";
    if (this.defaultimg) img.src = this.sourcefn(this.defaultimg);
    return true;
  },
  "layout": {
    "elements": [{
      "config": {
        "css": "monominoes-img-helper"
      },
      "render": Monominoes.renders.SPAN
    },{
      "css": "monominoes-img img-responsive",
      "layout": function(item,parent) {
        var scope = this;
        parent.error(function(img) { scope.error.call(scope,img); });
      },
      "config": {
        "properties": {
          "src": function(item) { this.sourcefn(item); }
        }
      },
      "render": Monominoes.renders.IMG
    }]
  },
  "render": function(item,parent) {
    var img;
    var tocopy = ["default","sourcedir","format","error","sourcefn"];
    this.style.width = this.width;
    this.style.height = this.height;
    if (this.centered) this.style["text-align"] = "center";
    
    img = this.layout.elements[this.imageindex];
    for (var i = 0; i < tocopy.length; i++) { img.config[tocopy[i]] = this[tocopy[i]]; }
    this.super.render(item,parent);
  }
});

/* Bootstrap renderers */
Monominoes.renders.LIST_GROUP = Monominoes.renders.LIST.extend({
  "css": "list-group",
  "marker": "none",
  "item": {
    "config": {
      "css": "list-group-item"
    }
  }
});

Monominoes.renders.DROPDOWN = Monominoes.renders.DIV.extend({
  "css": "dropdown",
  "style": {
    "margin-left": "0.5em"
  },
  "id": "",
  "selected": null,
  "iterable": true,
  "datakey": "dd-data",
  "click": function(event) {
    var clicked = $(event.target);
    this.component.selected = clicked.data(this.datakey);
  },
  "inline": false,
  "placeholder": "",
  "display": Monominoes.util.self,
  "layout": {
    "elements": [{
      "config": {
        "css": "btn dropdown-toggle",
        "properties": {
          "type": "button",
          "data-toggle": "dropdown",
          "aria-haspopup": "true",
          "aria-expanded": "true"
        },
        "render": function(item,render) { 
          return this.super.render(item,render).text(this.placeholder);
        },
        "layout": Monominoes.renders.SPAN({ "css": "caret" })
      },
      "render": Monominoes.renders.BUTTON
    },{
      "config": {
        "css": "dropdown-menu",
        "item": {
          "config": {
            "render": function(item,parent) {
              return this.super.render(item,parent)
                .text(Monominoes.util.concrete(this.display,this,item))
                .data(this.datakey,item);
            }
          }
        }
      },
      "render": Monominoes.renders.UL
    }]
  },
  "render": function(item,parent) {
    this.properties.id = Monominoes.util.concrete((this.id || Monominoes.renders.DROPDOWN.id),this);
    if (this.inline) this.style.display = "inline-block";
    this.layout.elements[0].config.placeholder = this.placeholder;
    this.layout.elements[0].config.properties.id = this.id + "-btn";
    this.layout.elements[1].config.properties.id = this.id + "-ul";
    this.layout.elements[1].config.properties["aria-labeledby"] = this.id + "-btn";
    this.layout.elements[1].config.item.config.events.click = this.click;
    this.layout.elements[1].config.item.config.datakey = this.datakey;
    this.layout.elements[1].config.item.config.display = this.display;
    this.layout.elements[1].config.item.config.component = this;
  }
});
Monominoes.renders.DROPDOWN.counter = 1;
Monominoes.renders.DROPDOWN.id = function() { 
  return Monominoes.util.format("monominoes-dd-{0}",Monominoes.renders.DROPDOWN.counter++);
};

/* Renderers for FontAwesome icons */
Monominoes.renders.ICON = Monominoes.renders.I.extend({
  "css": "fa",
  "icon": "", // Mandatory, name from library (example: "camera-retro", without "fa").
  "size": "", // Add size: lg, 2x, 3x, 4x, 5x.
  "fixed-width": false,
  "border": false,
  "align": "",
  "color": "", // Default existent.
  "background": "", // Default existent.
  "animated": "",
  "rotate": "",
  "flip": "",
  "render": function(item,parent) {
    var appendFn = Monominoes.renders.ICON.appendClass;
    appendFn(this,Monominoes.util.concrete(this.icon,this,this,item));
    if (Monominoes.util.isAnyOf(this.size,"lg","2x","3x","4x","5x")) appendFn(this,this.size);
    if (this["fixed-width"]) appendFn(this,"fw");
    if (this.border) appendFn(this,"border");
    if (Monominoes.util.isAnyOf(this.align,"left")) appendFn(this,"pull-"+this.align);
    if (Monominoes.util.isAnyOf(this.animated,"pulse","spin")) appendFn(this,this.animated);
    if (Monominoes.util.isAnyOf(this.rotate,"90","180","270")) appendFn(this,"rotate-"+this.rotate);
    if (Monominoes.util.isAnyOf(this.flip,"horizontal","vertical")) appendFn(this,"flip-"+this.flip);
    if (this.color) this.style.color = this.color;
    if (this.background) this.style["background-color"] = this.background;
    this.super.render(item,parent);
  }
});
Monominoes.renders.ICON.appendClass = function(render,str) {
  if (str) {
    render.extracss = Monominoes.util.append(render.extracss,Monominoes.util.format("fa-{0}",str));
  }
};

Monominoes.renders.ICON_LIST = Monominoes.renders.UL.extend({
  "css": "fa-ul",
  "marker": "none",
  "item": {
    "config": {
      "layout": {
        "elements": [{
          "render": Monominoes.renders.ICON
        },{
          "render": Monominoes.renders.SELF
        }]
      }
    }
  }
});

Monominoes.renders.STACKED_ICON = Monominoes.renders.SPAN.extend({
  "css": "fa-stack",
  "size": "",
  "inverse": false,
  "parent": "",
  "child": "",
  "layout": {
    "elements": [{
      "config": {
        "css": "fa fa-stack-2x"
      },
      "render": Monominoes.util.ICON
    },{
      "config": {
        "css": "fa fa-stack-1x"
      },
      "render": Monominoes.util.ICON
    }]
  },
  "render": function(item,parent) {
    var appendFn = Monominoes.renders.ICON.appendClass;
    if (Monominoes.util.isAnyOf(this.size,"lg","2x","3x","4x","5x")) appendFn(this,this.size);
    if (this.inverse) appendFn(this.layout.elements[1].config,"inverse");
    this.layout.elements[0].config.icon = this.parent;
    this.layout.elements[1].config.icon = this.child;
    this.super.render(item,parent);
  }
});

/** Monominoes Grid Render **/
Monominoes.renders.MONOMINOES = Monominoes.renders.DIV.extend({
  "css": "monominoes container monominoes-root",
  "cols": 1,
  "iterable": true,
  "item": {
    "config": {
      "render": function(item,parent) {
        var row;
        if (this.count % this.cols == 0) {
          row = Monominoes.renders.DIV({ "css": "row" }).render(item,parent);
        } else {
          row = parent;
        }
        this.super.render(item,row);
      }
    }
  },
  "render": function(item,parent) {
    this.item.config.cols = this.cols;
  }
});

Monominoes.renders.MONOMINOES.cols = ["col-lg-12","col-lg-6","col-md-6 col-lg-4", // 1,2,3,
                                      "col-sm-6 col-md-4 col-lg-3","col-sm-6 col-md-4 col-lg-2", // 4,5,
                                      "col-xs-6 col-sm-4 col-md-3 col-lg-2","","col-lg-1", // 6,7,8,
                                      "","col-lg-1", "", "col-lg-1" ]; // 9,10,11,12.
Monominoes.renders.MONOMINOES.offsets = ["","","","",
                                         "col-lg-offset-1","","","col-lg-offset-2",
                                         "","col-lg-offset-1","",""];
