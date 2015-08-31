function Monominoes() {}
function MonoUtils() {}

/** Monominoes Utils definition */
MonoUtils.assert = function(obj, msg) { if (!obj) throw msg || "assertion failed"; };
MonoUtils.format = function() { $.validator.format.apply(null,arguments); };
MonoUtils.append = function(str,app,sep) { return ((str||"") + (sep||" ") + (app||"")).trim(); };
MonoUtils.getTag = function(tag) { return $(MonoUtils.format("<{0}></{0}>",tag)); };
MonoUtils.clone  = function(obj) { var clon = {}; for (var x in obj) { clon[x] = obj[x] } return clon; }
MonoUtils.currency = function(num,nd,ds,ms){
  MonoUtils.assert(typeof num == "number", "Formatting a non-number");
  nd = nd !== "" && nd !== null && !isNan((nd = Math.abs(nd))) ? nd : 2;
  ds = ds != undefined ? ds : ".";
  ms = ms != undefined ? ms : ",";
  var neg = num < 0 ? "-" : "";
  var ist = Math.abs(parseInt(num.toFixed(0))).toString();
  var dec = Math.abs(num).toString().substr(ist.length+1,nd);
  dec = (dec.length < nd) ? dec + ((new Array(nd-dec.length+1)).join("0")) : dec;
  var res = neg;
  var i = ist.length-1;
  for (; (i-3)>0; i-=3) res += (ms+ist.substr(i-3,3));
  res+=ist.substring(0,i);
  return res + (dec.length > 0 ? (ds+dec) : "");
};
MonoUtils.overwrite = function(obj,src,safe) {
  if (obj && src) {
    for (var x in src) 
      if (!safe || (safe && obj[x] == undefined)) obj[x] = src[x];
  }
};
MonoUtils.path = function(obj,path) {
  var paths = path.split(".");
  var el = obj;
  for (var p in paths) {
    if (typeof el === "object" && el[paths[p]] !== undefined) el = el[paths[p]]; 
    else { el = null; break }
  }
  return el;
};
MonoUtils.self = function(x) { return x; };

/* Constants */
Monominoes.cache = {};
Monominoes.renders = {};
Monominoes.tags = {};
                                                                    
(Monominoes.init = function() {
  /* Static values */
  var simpletags = ["div","h1","h2","h3","h4","h5","h6","span","li","header","strong"];
  var complextags = ["img","ul","ol","br"];
  var tags = simpletags.concat(complextags);
  for (var x in tags) Monominoes.tags[tags[x].toUpperCase()] = tags[x];
  
  Monominoes.cols = ["col-lg-12","col-lg-6","col-md-6 col-lg-4","col-sm-6 col-md-4 col-lg-3", // 1,2,3,4.
                     "col-sm-6 col-md-4 col-lg-2","col-xs-6 col-sm-4 col-md-3 col-lg-2","", // 5,6,7.
                     "col-lg-1", "", "col-lg-1", "", "col-lg-1" ]; // 8,9,10,11,12.
  Monominoes.offsets = ["","","","","col-lg-offset-1","","","col-lg-offset-2","","col-lg-offset-1","",""];
  
  /* Renders */
  Monominoes.simpleTagFn = function(tag,clazz) {
    return function(data,parent) {
      MonoUtils.getTag(tag)
        .addClass(this[(clazz || "class")])
        .text(this.formatter ? this.formatter(data) : data)
        .appendTo(parent);
    };
  };
  
  for (var i in simpletags) {
    var tag = simpletags[i];
    Monominoes.renders[tag.toUpperCase()] = { 
      "class": MonoUtils.format("monominoes-{0}",tag),
      "formatter": MonoUtils.self, // Overwritable formatter. Returns data itself by default.
      "fn": Monominoes.simpleTagFn(tag)
    };
  } 
  
  Monominoes.renders.LIST = {
    "class": "monominoes-list",
    "item-class": "monominoes-item",
    "ordered": false,
    "marked": true,
    "formatter": MonoUtils.self,
    "item-render": function(data, list) {
      Monominoes.simpleTagFn(Monominoes.tags.LI,"item-class").call(this,data,list);
    },
    "fn": function(data, parent) {
      var list = MonoUtils.getTag(ordered ? Monominoes.tags.OL : Monominoes.tags.UL)
        .addClass(this.class)
        .appendTo(parent);

      if (this.marked === false) list.css("list-style-type","none");
      else if (typeof this.marked == "string") list.css("list-style-type",this.marked);

      for (var x in data) this["item-render"].call(this, data[x], list);
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
    "fn": function(data,parent) {
      MonoUtils.getTag(Monominoes.tags.SPAN)
        .addClass(this.class)
        .text(this.formatter(data))
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
    "fn": function(data,parent) {
      if (this.bold) {
        Monominoes.simpleTagFn(Monominoes.tags.STRONG)(MonoUtils.format("{0}:",this.label),parent);
        Monominoes.simpleTagFn(Monominoes.tags.SPAN)(data,parent);
      } else {
        Monominoes.simpleTagFn(Monominoes.tags.SPAN)(MonoUtils.format("{0}: {1}",this.label,data),parent);
      }
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
    "fn": function(data, parent) {
      var div;
      var scope = this;
      
      div = MonoUtils.getTag(Monominoes.tags.DIV)
        .css("height", (this.height || "auto"))
        .appendTo(parent);
      
      if (this.centered) {
        MonoUtils.getTag(Monominoes.tags.SPAN)
          .addClass("monominoes-img-helper")
          .appendTo(div);
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
    }
  };
  
  /* Transform LIST,LABELED,etc. configs into renderer config functions. */
  var render;
  var renderer = function(def,cfg) {
    var c = (cfg || {});
    var cloned = MonoUtils.clone(def);
    for (var x in cloned) {
      if (x.indexOf("class") >= 0) {
        cloned[x] = MonoUtils.append(cloned[x],cfg[x]);
        delete cfg[x];
      }
    }
    return MonoUtils.overwrite(cloned, cfg, false);
  };
  
  for (var x in Monominoes.renders) {
    render = Monominoes.renders[x];
    Monominoes.renders[x] = function(cfg) {
      return renderer(render,cfg);
    };
  }
})();

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

Monominoes.prototype.source = function(cfg,src) { return (!src || cfg.absolute) ? this.data : src; };

Monominoes.prototype.buildGrid = function(cfg,parent,src) {
  var source = this.source(cfg,src);
  var data = cfg.path ? MonoUtils.path(source, cfg.path) : [source];
  var cols = (cfg.cols || 1);
  var div,row,col,thm;
  var items,item,el;
  
  div = MonoUtils.getTag(Monominoes.tags.DIV)
    .addClass(MonoUtils.append("container",MonoUtils.path(cfg, "class.container")))
    .appendTo(parent);
  
  for (var i = 0; i < data.length; i++) {
    if (i % cols) row = MonoUtils.getTag(Monominoes.tags.DIV).addClass("row").appendTo(div);
    col = MonoUtils.getTag(Monominoes.tags.DIV)
      .addClass(this.getColStyle(cfg,cols,i))
      .appendTo(row);
    thm = MonoUtils.getTag(Monominoes.tags.DIV)
      .addClass(MonoUtils.append("thumbnail",MonoUtils.path(cfg, "class.thumbnail")))
      .appendTo(col);
    item = data[i];
    items = cfg.elements || [];
    
    for (var e = 0; e < items.length; e++) {
      el = items[e];
      if (el.elements) this.buildGrid(el,thm,item);
      else this.render(el,thm,item);
    }
  }
};

Monominoes.prototype.render = function(cfg,parent,src) {
  var source = this.source(cfg,src);
  var data = MonoUtils.path(source,cfg.path);
  var rcfg = typeof cfg.render == "function" ? cfg.render() : cfg.render;
  rcfg.fn(data,parent);
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
  m.buildGrid(m.layout, m.div);
  
  return m;
};