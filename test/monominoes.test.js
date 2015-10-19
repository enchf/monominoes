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
  suite.add({ "args": [function(){ return -1; }], "expected": -1, "msg": "Function returning -1 passed as argument" });
  suite.add({ "args": [function(){ return this.a; },{a:1}], "expected": 1, "msg": "Scope passed as argument" });
  suite.add({ "args": [function(a,b) { return a+b; },null,1,2], "expected": 3, "msg": "Function with arguments" });
  suite.add({ "args": [function(a,b,c) { return this.d+c+a+b; },{d:4},1,2,3], "expected": 10,
               "msg": "Function with arguments and scope" });
  suite.add({ "args": ["string"], "expected": "string", "msg": "Non object passed as argument" });
  suite.add({ "args": ["string",{a:1},4,5], "expected": "string",
               "msg": "Other arguments ignored if argument is a concrete object" });
  suite.add({ "args": ["string",null,4,5], "expected": "string",
               "msg": "Other arguments ignored if argument is a concrete object with scope as null" });
  
  suite.execute(assert.buildFor("strictEqual"),Monominoes.util.concrete);
  assert.strictEqual(Monominoes.util.concrete(),undefined,"Undefined returned if concrete is called with no arguments");
});

QUnit.test("Tag class definition", function(assert) {
  var Tag = Monominoes.Tag;
  assert.ok(Monominoes.Tag,"Monominoes Tag class defined");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.content),"Content tags list");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.inline),"Inline tags list");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.text),"Text tags list");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.embed),"Embed tags list");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.form),"Form tags list");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.noend),"No-end tags lists");
  assert.ok(Komunalne.util.isArray(Monominoes.Tag.all),"All tags array");
  assert.equal(Monominoes.Tag.all.length,
               Tag.content.length + Tag.inline.length + Tag.text.length + Tag.embed.length + Tag.form.length,
               "All tags contained in Monominoes.Tag.all");
});

QUnit.test("Tag class methods", function(assert) {
  var Tag = Monominoes.Tag;
  var tag,simple,custom,customSimple;
  var iterator,i,end;
  var indicator = 0;
  var fn = function() { indicator++; };
  var clasz = "fake";
  var attrs = { "id": "fake", "title": "name" };
  var events = { "click": fn, "resize": fn };
  var style = { "width": "100px", "display": "block" };
  var emptyCfg = {};
  var config = { "class": clasz, "attrs": attrs, "events": events, "style": style };
  var item;
  
  tag = new Monominoes.Tag("h1");
  simple = new Monominoes.Tag("br");
  custom = new Monominoes.Tag("foo");
  customSimple = new Monominoes.Tag("roo",true);
  
  assert.strictEqual(tag.requireEnd,true,"H1 tag is recognized as a not self-close tag");
  assert.strictEqual(simple.requireEnd,false,"BR tag is recognized as a self-close tag");
  assert.ok(custom.requireEnd,"Declared not self-close tag");
  assert.notOk(customSimple.requireEnd,"Declared self-close tag");
  
  iterator = new Komunalne.helper.Iterator(Tag.all);
  while (iterator.hasNext()) {
    i = iterator.next();
    end = !Komunalne.util.arrayContains(i,Monominoes.Tag.noend);
    assert.strictEqual(Monominoes.Tag.requireEnd(i), end,
                       Monominoes.util.format("End needed for tag {0} validation: {1}",i,end));
  }
  
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

QUnit.test("Extend function", function(assert) {
  var i = 0;
  var ext = {
    "render": function(parent,data) { i++; },
    "property": { "foo": "bar" }
  };
  var Custom = Monominoes.Render.extend(ext);
  var Sub = Custom.extend({ "attribute": false, "property": "path" });
  var renders = [Custom(),new Custom({ "property": 1 })];
  var properties = [ext.property,1];
  var subrenders = [Sub({ "attribute": true }),new Sub()];
  var subattrs = [true,false];
  
  assert.ok(Custom.extend === Monominoes.Render.extend,"Extend function copied into new class");
  assert.ok(Monominoes.util.isRender(Custom),"Custom class tested against isRender function");
  assert.strictEqual(Custom.class,Custom,"Class property set on class definition");
  assert.strictEqual(Custom.superclass,Monominoes.Render,"Superclass property set on class definition");
  
  assert.ok(Sub.extend === Monominoes.Render.extend,"Extend function copied into extended new class");
  assert.ok(Monominoes.util.isRender(Sub),"Extended subclass is Render too");
  assert.strictEqual(Sub.class,Sub,"Class property set on extended subclass definition");
  assert.strictEqual(Sub.superclass,Custom,"Superclass property set on extended subclass definition");
  assert.strictEqual(Sub.superclass.superclass,Monominoes.Render,"Superclass superclass equal to Monominoes.Render");
});

QUnit.test("Is render function",function(assert) {
  assert.ok(Monominoes.util.isRender(Monominoes.Render),"Monominoes.Render abstract class is a Render");
});
