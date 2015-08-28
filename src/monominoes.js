function Monominoes() {}

/* Static methods */
Monominoes.cache = {};
Monominoes.renders = {};
Monominoes.tags = {};
Monominoes.assert = function(obj, msg) { if (!obj) throw msg || "assertion failed"; };
Monominoes.overwrite = function(obj, safe) { if (obj) for (var x in obj) if (!safe || (safe && !this[x])) this[x] = obj[x]; };
Monominoes.getTag = function(tag) { return $("<{0}></{0}>".format(tag)); };
Monominoes.clone = function(obj) { var clon = {}; for (var x in obj) { clon[x] = obj[x] } return clon; }

Monominoes.path = function(obj, path) {
  var paths = path.split(".");
  var el = obj;
  for (var p in paths) {
    if (typeof el === "object" && el[paths[p]] !== undefined) el = el[paths[p]]; 
    else { el = null; break }
  }
  return el;
};

/* Extensions */
String.prototype.append = function(app,sep) { return (this+(sep||" ")+(app||"")).trim(); };
String.prototype.format = function() { $.validator.format.apply(this,arguments); };
                                                                    
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
      Monominoes.getTag(tag).addClass(this[(clazz || "class")]).text(data).appendTo(parent);
    };
  };
  
  var renderCfg = function(def,cfg) {
    var c = (cfg || {});
    var cloned = Monominoes.clone(def);
    for (var x in cloned) {
      if (x.indexOf("class") >= 0) {
        cloned[x] = cloned[x].append(cfg[x]);
        delete cfg[x];
      }
    }
    return Monominoes.overwrite.call(cloned, cfg, false);
  };
  
  for (var i in simpletags) {
    var tag = simpletags[i];
    Monominoes.renders[tag.toUpperCase()] = function(cfg) {
      return renderCfg({ 
        "class": "monominoes {0}".format(tag).append(cfg["class"]),
        "fn": Monominoes.simpleTagFn(tag)
      }, cfg);
    };
  } 
  
  var configs = {
    "LIST": {
      "class": "monominoes list",
      "el-class": "monominoes item",
      "ordered": false,
      "fn": function(data, parent) {
        var list = Monominoes.getTag(ordered ? "ol" : "ul").addClass(this["class"]).appendTo(parent);
        for (var x in data) Monominoes.simpleTagFn("li","el-class").call(this,data[x],list);
      }
    }
  };
  
})();

Monominoes.validate = function(cfg) {
  var val = ["target","div","data","layout"];
  var typ = ["string","object","object","object"];
  var man = [false,false,true,true];
  var t;
             
  Monominoes.assert(cfg.target || cfg.div,"Neither target ID or div is provided");
  
  for (var i=0; i<val.length; i++) {
    if (man[i]) Monominoes.assert(cfg[val[i]], "Property {0} is not provided".format(val[i]));
    if (cfg[val[i]]) Monominoes.assert((t = typeof cfg[val[i]]) === typ[i], 
                                       "Property {0} type expected was {1} but is {2}".format(val[i],typ[i],t));
  }
};

Monominoes.prototype.source = function(cfg,src) { return (!src || cfg.absolute) ? this.data : src; };

Monominoes.prototype.buildGrid = function(cfg,parent,src) {
  var source = this.source(cfg,src);
  var data = cfg.path ? Monominoes.path(source, cfg.path) : [source];
  var cols = (cfg.cols || 1);
  var div,row,col,thm;
  var items,item,el;
  
  div = Monominoes.getTag(Monominoes.tags.DIV)
    .addClass("container".append(Monominoes.path(cfg, "class.container")))
    .appendTo(parent);
  
  for (var i = 0; i < data.length; i++) {
    if (i % cols) row = Monominoes.getTag(Monominoes.tags.DIV).addClass("row").appendTo(div);
    col = Monominoes.getTag(Monominoes.tags.DIV)
      .addClass(this.getColStyle(cfg,cols,i))
      .appendTo(row);
    thm = Monominoes.getTag(Monominoes.tags.DIV)
      .addClass("thumbnail".append(Monominoes.path(cfg, "class.thumbnail")))
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
  var data = Monominoes.path(source,cfg.path);
  var rcfg = typeof cfg.render == "function" ? cfg.render() : cfg.render;
  rcfg.fn(data,parent);
};

Monominoes.prototype.getColStyle = function(cfg,cols,i) {
  return Monominoes.cols[cols-1]
    .append(i == 0 ? Monominoes.offsets[cols-1] : "")
    .append(Monominoes.path(cfg,"class.col"))
    .trim();
};

Monominoes.build = function(cfg) {
  var m;
  
  Monominoes.validate(cfg);
  m = new Monominoes();
  Monominoes.overwrite.call(m,cfg,true);
  
  m.div = (m.div) ? $(m.div) : $("#"+m.target);
  m.target = (m.target || (m.div.id || null));
  m.buildGrid(m.layout, m.div);
  
  return m;
};