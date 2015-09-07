function Monominoes() {}
function MonoUtils() {}

/** Monominoes Utils definition */
MonoUtils.assert = function(obj, msg) { if (!obj) throw msg || "assertion failed"; };
MonoUtils.format = function() { return $.validator.format.apply(null,arguments); };
MonoUtils.append = function(str,app,sep) { return ((str||"") + (sep||" ") + (app||"")).trim(); };
MonoUtils.getTag = function(tag) { return $(MonoUtils.format("<{0}></{0}>",tag)); };
MonoUtils.currency = function(num,nd,ds,ms){
  MonoUtils.assert(typeof num == "number", "Formatting a non-number");
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
MonoUtils.overwrite = function(obj,src,safe) {
  if (obj && src) {
    for (var x in src) 
      if (safe === false || ((safe == null || safe === true) && obj[x] == undefined)) obj[x] = src[x];
  }
  return obj;
};
MonoUtils.path = function(obj,path) {
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
MonoUtils.self = function(x) { return x; };
MonoUtils.nothing = function() {};
MonoUtils.capitalize = function(str) { return str[0].toUpperCase() + str.substr(1); };
MonoUtils.clone  = function(obj) { 
  var clon = {};
  var item;
  for (var x in obj) { 
    item = obj[x];
    clon[x] = typeof item == "object" && item != undefined ? 
      (item.constructor && item.constructor == Array ? item.slice(0) : MonoUtils.clone(item)) 
      : obj[x];
  } 
  return clon; 
};

/* Constants */
Monominoes.cache = {};
Monominoes.renders = {};
Monominoes.tags = {};

/* Render helpers */
Monominoes.validate = function(cfg) {
  var val = ["target","div","data","layout"];
  var typ = ["string","object","object","object"];
  var man = [false,false,true,true];
  var t;
             
  MonoUtils.assert(cfg.target || cfg.div,"Neither target ID or div is provided");
  
  for (var i=0; i<val.length; i++) {
    if (man[i]) MonoUtils.assert(cfg[val[i]], MonoUtils.format("Property {0} is not provided",val[i]));
    if (cfg[val[i]]) MonoUtils.assert((t = typeof cfg[val[i]]) === typ[i], 
                                       MonoUtils.format("Property {0} type expected was {1} but is {2}",val[i],typ[i],t));
  }
};

Monominoes.renderer = function(def,cfg) {
  var c = (cfg || {});
  var cloned = MonoUtils.clone(def);
  
  for (var x in cloned) {
    if (x.indexOf("class") >= 0 && c[x] != undefined) {
      cloned[x] = MonoUtils.append(cloned[x],c[x]);
      delete c[x];
    }
  }

  MonoUtils.overwrite(cloned, cfg, false);
  return cloned;
};

Monominoes.createRender = function(rendercfg) {
  return function(cfg) {
    return Monominoes.renderer(rendercfg,cfg);
  };
};

/* Initialization */                                                                    
(Monominoes.init = function() {
  /* Static values */
  var simpletags = ["div","h1","h2","h3","h4","h5","h6","span","li","header","strong","p","pre"];
  var complextags = ["img","ul","ol","br","a"];
  var tags = simpletags.concat(complextags);
  for (var x in tags) Monominoes.tags[tags[x].toUpperCase()] = tags[x];
  
  Monominoes.cols = ["col-lg-12","col-lg-6","col-md-6 col-lg-4","col-sm-6 col-md-4 col-lg-3", // 1,2,3,4.
                     "col-sm-6 col-md-4 col-lg-2","col-xs-6 col-sm-4 col-md-3 col-lg-2","", // 5,6,7.
                     "col-lg-1", "", "col-lg-1", "", "col-lg-1" ]; // 8,9,10,11,12.
  Monominoes.offsets = ["","","","","col-lg-offset-1","","","col-lg-offset-2","","col-lg-offset-1","",""];
  
  /* Renders */
  Monominoes.simpleTagFn = function(tag,clazz) {
    return function(data,parent) {
      return MonoUtils.getTag(tag)
        .addClass(this[(clazz || "class")])
        .html(this.formatter ? this.formatter(data) : data)
        .appendTo(parent);
    };
  };
  
  for (var i in simpletags) {
    var tag = simpletags[i];
    Monominoes.renders[tag.toUpperCase()] = { 
      "class": MonoUtils.format("monominoes-{0} monominoes-simple",tag),
      "formatter": MonoUtils.self, // Overwritable formatter. Returns data itself by default.
      "render": Monominoes.simpleTagFn(tag)
    };
  } 
  
  Monominoes.renders.A = {
    "class": "monominoes-a",
    "href": "#",
    "target": "",
    "formatter": MonoUtils.self,
    "click": null,
    "render": function(data, parent) {
      var a = MonoUtils.getTag(Monominoes.tags.A)
        .addClass(this.class)
        .html(this.formatter(data))
        .attr("href", this.href)
        .attr("target", this.target)
        .appendTo(parent);
      
      if (this.click != undefined) {
        a.click(this.click);
      }
      
      return a;
    }
  };
  
  Monominoes.renders.LIST = {
    "class": "monominoes-list",
    "item-class": "monominoes-item",
    "ordered": false,
    "marked": true,
    "formatter": MonoUtils.self,
    "item-render": function(data, list) {
      return Monominoes.simpleTagFn(Monominoes.tags.LI,"item-class").call(this,data,list);
    },
    "render": function(data, parent) {
      var list = MonoUtils.getTag(ordered ? Monominoes.tags.OL : Monominoes.tags.UL)
        .addClass(this.class)
        .appendTo(parent);

      if (this.marked === false) list.css("list-style-type","none");
      else if (typeof this.marked == "string") list.css("list-style-type",this.marked);

      for (var x in data) this["item-render"].call(this, data[x], list);
      
      return list;
    }
  };
  
  Monominoes.renders.LIST_GROUP = MonoUtils.overwrite(
    MonoUtils.clone(Monominoes.renders.LIST),
    { 
      "class": "list-group",
      "item-class": "list-group-item",
      "marked": false
    },
    false
  );
  
  Monominoes.renders.TEXT_BLOCK = {
    "class": "monominoes-text-block",
    "color": "white",
    "background": "black",
    "formatter": MonoUtils.self,
    "render": function(data,parent) {
      return MonoUtils.getTag(Monominoes.tags.SPAN)
        .addClass(this.class)
        .html(this.formatter(data))
        .css("color", this.color)
        .css("background-color", this.background)
        .appendTo(parent);
    }
  };
  
  Monominoes.renders.PRICE = MonoUtils.overwrite(
    MonoUtils.clone(Monominoes.renders.TEXT_BLOCK),
    {
      "decimals": 2,
      "decimal-separator": ".",
      "thousands-separator": ",",
      "formatter": function(data) { 
        return MonoUtils.currency(
          data,
          this.decimals,
          this["decimal-separator"],
          this["thousands-separator"]
        );
      }
    },
    false
  );
  
  Monominoes.renders.LABELED = {
    "class": "monominoes-labeled",
    "label": "", // Mandatory.
    "bold": true,
    "formatter": MonoUtils.self,
    "render": function(data,parent) {
      var div = MonoUtils.getTag(Monominoes.tags.DIV).appendTo(parent);
      if (this.bold) {
        Monominoes.simpleTagFn(Monominoes.tags.STRONG)(MonoUtils.format("{0}:",this.label),div);
        Monominoes.simpleTagFn(Monominoes.tags.SPAN)(data,div);
      } else {
        Monominoes.simpleTagFn(Monominoes.tags.SPAN)(MonoUtils.format("{0}: {1}",this.label,data),div);
      }
      return div;
    }
  };
  
  Monominoes.renders.CODE = {
    "class": "",
    "language": "",
    "formatter": MonoUtils.self,
    "render": function(data,parent) {
      return MonoUtils.getTag(Monominoes.tags.PRE)
        .text(this.formatter(data))
        .addClass(MonoUtils.append(this.class,this["language"]))
        .appendTo(parent);
    }
  };
  
  Monominoes.renders.IMG = {
    "class": "img-responsive monominoes-img",
    "default-format": "jpg",
    "default-img": null, // Optional URL to default image.
    "centered": true,
    "height": null, // Optional image height (% or px).
    "source": "",   // Image repository path, default to root. Add last / if necessary.
    "formatter": function(data) { // Overwritable function to format image name from data argument.
      var lastch = this.source[this.source.length-1];
      return MonoUtils.format("{0}{1}{2}.{3}",
          this.source,
          this.source && (lastch !== "/" && lastch !=="\\") ? "/" : "",
          data,
          this["default-format"]); // Scope of the function will be config object itself.
    },
    "alt": function(data) { return ""; }, // Overwritable function to add alt img attribute.
    "render": function(data, parent) {
      var div;
      var scope = this;
      
      div = MonoUtils.getTag(Monominoes.tags.DIV)
        .css("height", (this.height || "auto"))
        .appendTo(parent);
      
      if (this.centered) {
        MonoUtils.getTag(Monominoes.tags.SPAN)
          .addClass("monominoes-img-helper")
          .appendTo(div);
        div.css("text-align", "center");
      }
      
      MonoUtils.getTag(Monominoes.tags.IMG)
        .attr("src", this.formatter(data))
        .attr("alt", this.alt(data))
        .addClass(this.class)
        .error(function(img) {
          img.onerror = "";
          if (scope["default-img"]) img.src = scope.source + scope["default-img"];
          return true;
        })
        .appendTo(div);
      
      return div;
    }
  };
  
  Monominoes.renders.GRID = {}; // TODO.
  
  // Render creation.
  for (var x in Monominoes.renders) {
    Monominoes.renders[x] = Monominoes.createRender(Monominoes.renders[x]);
  }
})();

Monominoes.prototype.source = function(cfg,src) { 
  return cfg.absolute ? this.data : (cfg["source-path"] ? MonoUtils.path(src,cfg["source-path"]) : src);
};

Monominoes.prototype.buildGrid = function(parent,src,cfg) {
  var source = this.source(cfg,src);
  var data = cfg.path != undefined ? MonoUtils.path(source, cfg.path) : [source];
  var cols = (cfg.cols || 1);
  var div,row,col,thm;
  var items,item,el;
  var i = 0;
  
  div = MonoUtils.getTag(Monominoes.tags.DIV)
    .addClass(MonoUtils.append("monominoes container",MonoUtils.path(cfg, "class.container")))
    .appendTo(parent);
  
  for (var x in data) {
    if (cfg.properties && cfg.properties.indexOf(x) < 0) continue;
    if (i % cols == 0) row = MonoUtils.getTag(Monominoes.tags.DIV).addClass("row").appendTo(div);
    
    col = MonoUtils.getTag(Monominoes.tags.DIV)
      .addClass(this.getColStyle(cfg,cols,i))
      .appendTo(row);
    
    thm = MonoUtils.getTag(Monominoes.tags.DIV)
      .addClass(MonoUtils.append("thumbnail",MonoUtils.path(cfg, "class.thumbnail")))
      .appendTo(col);
    
    item = data[x];
    items = cfg.elements || [];
    
    for (var e = 0; e < items.length; e++) {
      el = items[e];
      if (el.elements) this.buildGrid(thm,item,el);
      else this.render(el,thm,item);
    }
    
    i++;
  }
};

Monominoes.prototype.render = function(cfg,parent,src) {
  var source = this.source(cfg,src);
  var data = MonoUtils.path(source,cfg.path);
  var rcfg = typeof cfg.render == "function" ? cfg.render() : cfg.render;
  rcfg.render(data,parent);
};

Monominoes.prototype.getColStyle = function(cfg,cols,i) {
  return MonoUtils.append(
    MonoUtils.append(Monominoes.cols[cols-1],(i == 0 ? Monominoes.offsets[cols-1] : "")),
    MonoUtils.path(cfg,"class.col")
  ).trim();
};

Monominoes.build = function(cfg) {
  var m;
  
  Monominoes.validate(cfg);
  m = new Monominoes();
  MonoUtils.overwrite(m,cfg,true);
  
  m.div = (m.div) ? $(m.div) : $("#"+m.target);
  m.target = (m.target || (m.div.id || null));
  m.buildGrid(m.div, m.data, m.layout);
  
  return m;
};