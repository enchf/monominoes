/**
 * Tag class definition.
 * @param name Tag name.
 * @param simple True to build as a self-closing, no-content tag. 
 *        If no flag specified, it will be determined using Monominoes.Tag.isSimple method.
 */
Monominoes.Tag = function(name,simple){
  this.name = name;
  this.simple = simple === true || Monominoes.Tag.isSimple(name);
  this.tag = Monominoes.util.format(this.template(),name);
};

/**
 * Determines the string template to use depending tag self-closability.
 */
Monominoes.Tag.prototype.template = function() { 
  return this.simple ? Monominoes.Tag.simple : Monominoes.Tag.full;
};

/**
 * Build a new HTML DOM jQuery object for the tag, applying the specified configuration.
 * @param config A configuration object that can contain the following optional properties:
 * - class: String with the CSS class names to apply to the tag.
 * - events: Object with key-value pairs of valid events, being key = name as string and value = function handler.
 * - attrs: Object with key-value string pairs of tag attributes, being key = attribute name and value = attribute value.
 * - style: Object with key-value pairs of CSS properties, being key = property name and value = CSS valid value.
 */
Monominoes.Tag.prototype.build = function(config) { 
  var tag;
  config = config || {};
  tag = $(this.tag).addClass(config.class || "")
    .attr(config.attrs || {})
    .css(config.style || {});
  Komunalne.util.forEach((config.events || {}), function(val,key) { tag.on(key,val); });
  return tag;
};

/* Statics */
Monominoes.Tag.text = ["h1","h2","h3","h4","h5","h6","span","header","strong","i","p","pre","code"];
Monominoes.Tag.list = ["ul","ol","li"];
Monominoes.Tag.item = ["div","form","button","a","label"];
Monominoes.Tag.selfclose = ["img","input","br","hr"];
Monominoes.Tag.isSimple = function(tag) { return Komunalne.util.arrayContains(tag,this.selfclose); };
Monominoes.Tag.simple = "<{0}>";
Monominoes.Tag.full = Monominoes.Tag.simple + "</{0}>";

(function() {
  var Tag = Monominoes.Tag;
  Tag.all = Komunalne.util.arrayConcat(Tag.text,Tag.list,Tag.item,Tag.selfclose);
  var tag;
  for(var i in Tag.all) {
    tag = Tag.all[i];
    Monominoes.tags[tag.toUpperCase()] = new Monominoes.Tag(tag);
  }
})();
