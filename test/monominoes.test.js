/**
 * Monominoes QUnit testing.
 */

QUnit.test("Monominoes definition", function(assert) {
  assert.ok(Monominoes,"Monominoes object defined");
  assert.ok(Monominoes.util,"Monominoes util container defined");
  assert.ok(Monominoes.tags,"Monominoes tags container defined");
  assert.ok(Monominoes.renders,"Monominoes renders container defined");
});

QUnit.test("Concrete method from util", function(assert) {
  var suite;
  
  suite = new Komunalne.test.Suite();
  suite.add([function(){ return -1; }],-1,"Function returning -1 passed as argument");
  suite.add([function(){ return this.a; },{a:1}],1,"Scope passed as argument");
  suite.add([function(a,b) { return a+b; },null,1,2],3,"Function with arguments");
  suite.add([function(a,b,c) { return this.d+c+a+b; },{d:4},1,2,3],10,"Function with arguments and scope");
  suite.add(["string"],"string","Non object passed as argument");
  suite.add(["string",{a:1},4,5],"string","Other arguments ignored if argument is a concrete object");
  suite.add(["string",null,4,5],"string","Other arguments ignored if argument is a concrete object with scope as null");
  
  suite.execute(Monominoes.util.concrete,assert.buildFor("strictEqual"));
  assert.strictEqual(Monominoes.util.concrete(),undefined,"Undefined returned if concrete is called with no arguments");
});

QUnit.test("Tag class definition", function(assert) {
  var tag,simple;
  var custom,customSimple;
  var Tag = Monominoes.Tag;
  var f = function(simple) { 
    return function(tag) { assert.strictEqual(Monominoes.Tag.isSimple(tag),simple,"Self-close definition for " + tag); };
  };
  var indicator = 0;
  var fn = function() { indicator++; };
  var clasz = "fake";
  var attrs = { "id": "fake", "title": "name" };
  var events = { "click": fn, "resize": fn };
  var style = { "width": "100px", "display": "block" };
  var emptyCfg = {};
  var config = { "class": clasz, "attrs": attrs, "events": events, "style": style };
  var item;
  
  assert.ok(Monominoes.Tag,"Monominoes Tag class defined");
  assert.ok(Monominoes.Tag.all,"All tags array");
  assert.equal(Monominoes.Tag.all.length,
               Tag.text.length + Tag.list.length + Tag.item.length + Tag.selfclose.length,
               "All tags contained in Monominoes.Tag.all");
  tag = new Monominoes.Tag("h1");
  simple = new Monominoes.Tag("br");
  custom = new Monominoes.Tag("foo");
  customSimple = new Monominoes.Tag("roo",true);
  
  assert.strictEqual(tag.simple,false,"H1 tag is recognized as a not self-close tag");
  assert.strictEqual(simple.simple,true,"BR tag is recognized as a self-close tag");
  assert.notOk(custom.simple,"Declared not self-close tag");
  assert.ok(customSimple.simple,"Declared self-close tag");
  
  Monominoes.Tag.text.forEach(f(false));
  Monominoes.Tag.list.forEach(f(false));
  Monominoes.Tag.item.forEach(f(false));
  Monominoes.Tag.selfclose.forEach(f(true));
  
  item = tag.build(emptyCfg);
  assert.notOk(item.hasClass(clasz),"Tag creation without class specification");
  assert.notOk(item.attr("id"),"Tag creation without attributes");
  assert.notOk(item.prop("id"),"Tag creation without attributes");
  assert.notOk(item.attr("title"),"Tag creation without attributes");
  assert.notOk(item.prop("title"),"Tag creation without attributes");
  assert.equal(item.css("width"),"0px","Tag creation without css properties");
  assert.notOk(item.css("display"),"Tag creation without css properties");
  item.trigger("click");
  assert.equal(indicator,0,"Tag creation without click event");
  item.trigger("resize");
  assert.equal(indicator,0,"Tag creation without resize event");
  
  item = tag.build(config);
  assert.ok(item.hasClass(clasz),"Tag creation with class specification");
  assert.ok(item.attr("id"),"Tag creation with attributes");
  assert.equal(item.prop("id"),"fake","Tag creation with attributes");
  assert.ok(item.attr("title"),"Tag creation with attributes");
  assert.equal(item.prop("title"),"name","Tag creation with attributes");
  assert.equal(item.css("width"),"100px","Tag creation with css properties");
  assert.equal(item.css("display"),"block","Tag creation with css properties");
  item.trigger("click");
  assert.equal(indicator,1,"Tag creation with click event");
  item.trigger("resize");
  assert.equal(indicator,2,"Tag creation with resize event");
});
