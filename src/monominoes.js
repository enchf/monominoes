function Monominoes() {}

/* Static methods */
Monominoes.cache = {};
Monominoes.renders = {};
Monominoes.tags = {};
Monominoes.assert = function(obj, msg) { if (!obj) throw msg || "assertion failed"; };
Monominoes.overwrite = function(obj, safe) { if (obj) for (var x in obj) if (!safe || (safe && !this[x])) this[x] = obj[x]; };
Monominoes.append = function(obj) { if (obj) for (var x in obj) this[x] = (this[x] || "") + obj[x]; };
Monominoes.format = $.validator.format;
                                                                    
(Monominoes.init = function() {
  /* Static values */
  var tags = ["div","h1","h2","h3","h4","h5","h6","span","img","ul","ol","li","header","br","strong"];
  for (var x in tags) Monominoes.tags[tags[x].toUpperCase()] = tags[x];
  Monominoes.appendables = [];
  
  /* Default config values */
  Monominoes.overwrite.call(Monominoes.prototype, {
    cols: 1
  });
})();

Monominoes.validate = function(cfg) {
  var val = ["target","div","data","layout"];
  var typ = ["string","object","object","object"];
  var man = [false,false,true,true];
  var t;
             
  Monominoes.assert(cfg.target || cfg.div,"Neither target ID or div is provided");
  
  for (var i=0; i<val.length; i++) {
    if (man[i]) Monominoes.assert(cfg[val[i]], Monominoes.format("Property {0} is not provided", val[i]));
    if (cfg[val[i]]) Monominoes.assert((t = typeof cfg[val[i]]) === typ[i], 
                                       Monominoes.format("Property {0} type expected was {1} but is {2}", val[i],typ[i],t));
  }
};

Monominoes.build = function(cfg) {
  var m;
  
  Monominoes.validate(cfg);
  m = new Monominoes();
  Monominoes.overwrite.call(m,cfg,true);
  
  m.div = (m.div) ? $(m.div) : $("#"+m.target);
  m.target = (m.target || (m.div.id || null));
  
  return m;
}