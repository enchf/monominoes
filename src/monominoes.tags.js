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
    Monominoes.tags[tags[i].toUpperCase()] = new Monominoes.Tag(tags[i],Monominoes.Tag.isSimple(tags[i]));
  }
})();
