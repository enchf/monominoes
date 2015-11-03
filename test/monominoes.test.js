/** Monominoes QUnit testing. */

/* Helpers */
function createMock(tag) {
  return Monominoes.Render.extend({
    "buildItem": function() { return $(Monominoes.util.format("<{0}></{0}>",tag)); }
  });
};

/* Test cases */
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

QUnit.test("Monominoes.util.format accepts null and undefined", function(assert) {
  assert.strictEqual(Monominoes.util.format("Test {0} {1}",null,undefined), "Test null undefined", 
                     "Null and undefined as formatter arguments");
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
  var style = { "width": "100px" };
  var emptyCfg = {};
  var config = { "class": clasz, "attrs": attrs, "events": events, "style": style };
  var item;
  
  tag = new Monominoes.Tag("h1");
  simple = new Monominoes.Tag("br");
  custom = new Monominoes.Tag("foo");
  customSimple = new Monominoes.Tag({"name": "roo", "noEnd": true});
  
  assert.strictEqual(tag.requireEnd,true,"H1 tag is recognized as a not self-close tag");
  assert.strictEqual(simple.requireEnd,false,"BR tag is recognized as a self-close tag");
  assert.ok(custom.requireEnd,"Custom tag not explicitly set as self-close will require to be closed");
  assert.notOk(customSimple.requireEnd,"Declared self-close tag");
  
  iterator = new Komunalne.helper.Iterator(Tag.all);
  while (iterator.hasNext()) {
    i = iterator.next();
    end = !Komunalne.util.arrayContains(i,Monominoes.Tag.noend);
    assert.strictEqual(Monominoes.Tag.requireEnd(i), end,
                       Monominoes.util.format("End needed for tag {0} validation: {1}",i,end));
  }
  
  item = tag.build(emptyCfg);
  assert.notOk(item.hasClass(clasz),"Tag creation without class specification: class not specifed");
  assert.notOk(item.attr("id"),"Tag creation without attributes: no id set as attribute");
  assert.notOk(item.prop("id"),"Tag creation without attributes: no property id is set");
  assert.notOk(item.attr("title"),"Tag creation without attributes: no title set as attribute");
  assert.notOk(item.prop("title"),"Tag creation without attributes: no property title is set");
  assert.equal(item.css("width"),"0px","Tag creation without css properties: no width set");
  item.trigger("click");
  assert.equal(indicator,0,"Tag creation without click event");
  item.trigger("resize");
  assert.equal(indicator,0,"Tag creation without resize event");
  
  item = tag.build(config);
  assert.ok(item.hasClass(clasz),"Tag creation with class specification: have class " + clasz);
  assert.ok(item.attr("id"),"Tag creation with attributes: id exists");
  assert.equal(item.prop("id"),"fake","Tag creation with attributes: checking id");
  assert.ok(item.attr("title"),"Tag creation with attributes: title exists");
  assert.equal(item.prop("title"),"name","Tag creation with attributes: checking title");
  assert.equal(item.css("width"),"100px","Tag creation with css properties: checking width");
  item.trigger("click");
  assert.equal(indicator,1,"Tag creation with click event");
  item.trigger("resize");
  assert.equal(indicator,2,"Tag creation with resize event");
});

QUnit.test("Extend function", function(assert) {
  var i,j=0,r,k;
  var ext = {
    "a": "test",
    "render": function(parent,data) { j++; },
    "property": { "foo": "bar" }
  };
  var Custom = Monominoes.Render.extend(ext);
  var Sub = Custom.extend({ "attribute": false, "property": "path" });
  var renders = [Custom(),new Custom({ "property": 1 }),Sub({ "attribute": true }),new Sub()];
  var properties = [{"property": ext.property},{"property": 1},{"attribute":true},{"attribute":false}];
  var classes = [Custom,Custom,Sub,Sub];
  var superclasses = [Monominoes.Render,Monominoes.Render,Custom,Custom];
  var l,sc,rp,prev;
  
  assert.ok(Custom.extend === Monominoes.Render.extend,"Extend function copied into new class");
  assert.ok(Monominoes.util.isRender(Custom),"Custom class tested against isRender function");
  assert.strictEqual(Custom.class,Custom,"Class property set on class definition");
  assert.strictEqual(Custom.superclass,Monominoes.Render,"Superclass property set on class prototype");
  assert.strictEqual(Custom.prototype.class,Custom,"Class property set on class prototype");
  assert.strictEqual(Custom.prototype.superclass,Monominoes.Render,"Superclass property set on class prototype");
  
  assert.ok(Sub.extend === Monominoes.Render.extend,"Extend function copied into extended new class");
  assert.ok(Monominoes.util.isRender(Sub),"Extended subclass is Render too");
  assert.strictEqual(Sub.class,Sub,"Class property set on extended subclass definition");
  assert.strictEqual(Sub.superclass,Custom,"Superclass property set on extended subclass definition");
  assert.strictEqual(Sub.superclass.superclass,Monominoes.Render,"Superclass superclass equal to Monominoes.Render");
  assert.strictEqual(Sub.prototype.class,Sub,"Class property set on extended subclass prototype");
  assert.strictEqual(Sub.prototype.superclass,Custom,"Superclass property set on extended subclass prototype");
  assert.strictEqual(Sub.prototype.superclass.superclass,Monominoes.Render,
                     "Superclass superclass in prototype equal to Monominoes.Render");
  
  assert.notOk(("a" in renders[0].parent),"Check for custom properties in Custom render not present in Custom parent");
  assert.notOk(("a" in renders[1].parent),"Check for custom properties in Custom render not present in Custom parent");
  assert.strictEqual(renders[2].parent.a,"test","Check for custom properties in Custom render present in Sub parent");
  assert.strictEqual(renders[3].parent.a,"test","Check for custom properties in Custom render present in Sub parent");
  
  i = new Komunalne.helper.Iterator(renders);
  while (i.hasNext()) {
    r = i.next();
    k = i.currentKey();
    assert.ok(Monominoes.util.isRender(r),"Check if render instance passes render test for item " + k);
    assert.strictEqual(r.class,classes[k],"Check correct class of instance: " + classes[k].name);
    assert.strictEqual(r.superclass,superclasses[k],"Check correct superclass of instance: " + superclasses[k].name);
    for (var m in properties[k]) {
      assert.deepEqual(r[m],properties[k][m],"Property " + m + " test in object " + k);
    }
    assert.ok(("defaults" in r),"Defaults object created for object " + k);
    assert.ok(("parent" in r),"Parent object created for object " + k);
    assert.ok(Komunalne.util.isInstanceOf(r.parent,Object),"Parent object in render is of type Object");
    for (var m in classes[k].prototype) {
      if (m == "defaults") continue;
      assert.deepEqual(r.defaults[m],classes[k].prototype[m],"Property " + m + " against prototype in object " + k);
    }
    
    // Superclass defaults into parent object.
    sc = superclasses[k];
    rp = r.parent;
    l = 1;
    while (sc != null) {
      for (var m in sc.prototype) {
        if (m === "parent") {
          if (sc === Monominoes.Render) assert.ok(rp[m] === null,"Parent property in parent should be null");
          else assert.ok(Komunalne.util.isInstanceOf(rp[m],Object),"Parent property for lower levels is an object");
        } else {
          assert.deepEqual(rp[m],sc.prototype[m],
                           Monominoes.util.format("Superclass property {0} in parent object {1}, level {2}", m,k,l));
        }
      }
      l++;
      rp = rp.parent;
      sc = sc.superclass;
    } 
  }
});

QUnit.test("Render instantiation: Process layout and key-mapped items retrieval", function(assert) {
  var Div = createMock("div");
  var Span = createMock("span");
  var P = createMock("p");
  var subsub = Span({ "key": "subsub" });
  var sub = new P({ "key": "sub", "children": [ subsub ] });
  var render = new Div({ 
    "children": [
      { "render": Span, "config": {} },
      sub
    ]
  });
  
  assert.ok(Komunalne.util.isArray(render.children),"The children array is created");
  assert.equal(render.children.length,2,"Only one children is appended in subitems array");
  assert.ok(Monominoes.util.isRender(render.children[0],Span),"First child is a render of type Span");
  assert.ok(Monominoes.util.isRender(render.children[1],P),"Second child is a render of type P");
  assert.notOk(Komunalne.util.isFunction(render.children[0]),"First child is a render instance not constructor");
  assert.notOk(Komunalne.util.isFunction(render.children[1]),"Second child is a render instance not constructor");
  assert.ok(Komunalne.util.isInstanceOf(render.childMap,Object),"Child map is an object");
  assert.deepEqual(Komunalne.util.keys(render.childMap),["sub"],"Only key mapped renders present in child map");
  assert.ok(Monominoes.util.isRender(render.childMap.sub,P),"Mapped child render is of type P");
  assert.notOk(Komunalne.util.isFunction(render.childMap.sub),"Mapped child render is a render instance not constructor");
  assert.ok(sub === render.childByKey("sub"),"Immediate child retrieval");
  assert.ok(subsub === render.childByKey("sub.subsub"),"Child of child retrieval");
  assert.ok(render.childByKey("inexistent") == null,"Inexisting key retrieval results in null");
  assert.ok(render.childByKey("abc.def") == null,"Inexisting composite key retrieval results in null");
  assert.ok(render.childByKey("sub.def") == null,"Inexisting sub key retrieval results in null");
  assert.ok(render.childByKey("sub.sub.sub") == null,"Inexisting composite sub key retrieval results in null");
  
  assert.ok(Komunalne.util.isArray(render.childByKey("sub").children),"The children array is created in child render");
  assert.equal(render.childByKey("sub").children.length,1,"Only one children is appended in child render children array");
  assert.ok(Monominoes.util.isRender(render.childByKey("sub").children[0],Span),"Child child is a render of type Span");
  assert.notOk(Komunalne.util.isFunction(render.childByKey("sub").children[0]),"Child child is a render instance");
  assert.ok(Komunalne.util.isInstanceOf(render.childByKey("sub").childMap,Object),"Mapped child child map is an object");
  assert.deepEqual(Komunalne.util.keys(render.childByKey("sub").childMap),["subsub"],"Mapped children key is set");
  assert.ok(Monominoes.util.isRender(render.childByKey("sub").childMap.subsub,Span),
            "Mapped child of mapped child render is of type SPAN");
  assert.notOk(Komunalne.util.isFunction(render.childByKey("sub").childMap.sub),
            "Mapped child of mapped child render is a render instance not constructor");
  
  assert.ok(Komunalne.util.isArray(render.children[0].children),"The children array is created in first child render");
  assert.equal(render.children[0].children.length,0,"First child render has no children");
  assert.ok(Komunalne.util.isInstanceOf(render.children[0].childMap,Object),"First child render child map is an object");
  assert.deepEqual(Komunalne.util.keys(render.children[0].childMap),[],"First child render has no mapped renders");
  assert.ok(render.children[1] === render.childMap.sub,"Second child render is the same as the mapped one");
});

QUnit.test("Is render function", function(assert) {
  var i = new Komunalne.helper.Iterator(Monominoes.renders);
  assert.ok(Monominoes.util.isRender(Monominoes.Render),"Monominoes.Render abstract class is a Render");
  while (i.hasNext()) assert.ok(Monominoes.util.isRender(i.next()),i.currentKey() + " render against isRender test");
});

QUnit.test("Helper function getItemFrom", function(assert) {
  var suite = new Komunalne.test.Suite();
  suite.add({ "args": ["div"], "msg": "Using jQuery selectors" });
  suite.add({ "args": ["<div></div>"], "msg": "Using HTML string" });
  suite.add({ "args": [$("#qunit")], "msg": "Using jQuery objects" });
  suite.add({ "args": [document.getElementsByTagName("script")[0]], "msg": "Using HTML DOM Element objects" });
  //suite.add({ "args": [Monominoes.renders.DIV()], "msg": "Using Render itself" });
  suite.execute(assert.buildFor("ok"),Monominoes.Render.getItemFrom);
  
  suite.clear();
  suite.add({ "args": [1], "msg": "Null for numbers" });
  suite.add({ "args": [true], "msg": "Null for booleans" });
  suite.add({ "args": [function(){}], "msg": "Null for functions" });
  suite.add({ "args": [new Date()], "msg": "Null for Dates/objects" });
  suite.add({ "args": [{}], "msg": "Null for plain objects" });
  suite.add({ "args": [[]], "msg": "Null for arrays" });
  suite.add({ "args": [null], "msg": "Null for null" });
  suite.add({ "args": ["inexistent-id"], "msg": "Null for inexistent elements using selector" });
  suite.execute(assert.buildFor("notOk"),Monominoes.Render.getItemFrom);
});

QUnit.test("Render function: Test updateData", function(assert) {
  var Div = createMock("div"), Span = createMock("span");
  var data = { "a": 1, "b": 2 };
  var a = Div({ "data": data });
  var aux;
  assert.ok("data" in a,"Data is set on render instance");
  assert.deepEqual(a.data,data,"Data is correctly set");
  aux = a;
  a = a.render();
  assert.ok(a === aux,"Render is returning the instance itself");
  assert.ok("data" in a,"Data is set on render instance after render function call without arguments");
  assert.deepEqual(a.data,data,"Data remains the same after render function call without arguments");
  a.render([1,2,3]);
  assert.ok("data" in a,"Data is set on render instance after render call with data argument");
  assert.deepEqual(a.data,[1,2,3],"Data is correctly updated after render call with data argument");
  a = new Div();
  assert.ok(a.data == null,"Data is null if not set at instantiation");
  a.render("data");
  assert.equal(a.data,"data","Data is updated from null after call to render with arguments");
});

QUnit.test("Render function: Build items, subitems and clear", function(assert) {
  var data = { "data": { "x": 1, "y": "foo" }, "title": "title" };
  var aux;
  var Div = createMock("div");
  var Span = createMock("span");
  var P = createMock("p");
  var subsub,sub;
  var render = new Div({ 
    "children": [
      { "render": Span, "config": {} },
      (sub = new P({ "key": "sub", "children": [ (subsub = Span({ "key": "subsub" })) ] }))
    ]
  }).render(data);
    
  assert.ok("item" in render,"Item is built after call to render function");
  assert.ok(Komunalne.util.isInstanceOf(render.item,jQuery),"Item is set as a jQuery object");
  assert.equal(render.item.prop("tagName"),"DIV","Tag is correctly built on item");
  assert.ok(Komunalne.util.isArray(render.subitems),"The subitems array is created");
  assert.equal(render.subitems.length,2,"Two children are appended in subitems array");
  assert.ok(Komunalne.util.isInstanceOf(render.subitems[0],jQuery),"First subitem is a jQuery instance");
  assert.equal(render.subitems[0].prop("tagName"),"SPAN","Tag is correctly built in first subitem: SPAN");
  assert.ok(Komunalne.util.isInstanceOf(render.subitems[1],jQuery),"Second subitem is a jQuery instance");
  assert.equal(render.subitems[1].prop("tagName"),"P","Tag is correctly built in second subitem: P");
  assert.deepEqual(Komunalne.util.keys(render.itemsMap),["sub"],"Subitem key is present on items map");
  assert.ok(Komunalne.util.isInstanceOf(render.itemsMap.sub,jQuery),"Child in items map is a jQuery object");
  assert.equal(render.itemsMap.sub.prop("tagName"),"P","Object in items map refer to the correct tag");
  
  aux = render.itemByKey("sub.subsub");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Mapped item is a jQuery object");
  assert.equal(aux.prop("tagName"),"SPAN","Mapped item refer to the correct tag: SPAN");
  
  render.clear();
  assert.ok(render.item == null,"Item is removed after call to clear");
  assert.ok(Komunalne.util.isArray(render.subitems),"Subitems property remains an array");
  assert.equal(render.subitems.length,0,"Subitems array is empty after call to clear");
  assert.deepEqual(Komunalne.util.keys(render.itemsMap),[],"Items map is empty after call to clear");
});

QUnit.test("Tag renders default settings",function(assert) {
  var c,r,t;
  var clazz;
  var i = new Komunalne.helper.Iterator(Monominoes.renders);
  while(i.hasNext()) {
    c = i.next();
    if (Monominoes.util.isRender(c,Monominoes.renders.TAG)) {
      r = c();
      assert.ok(r.tag === c.prototype.tag,"Correct Tag builder is set on render " + i.currentKey());
      assert.ok(Monominoes.util.isRender(r),"Tag render instance is a Render");
      assert.ok(Monominoes.util.isRender(r,Monominoes.renders.TAG),"Tag render is a TAG Render instance");
      if (r.tag != null) {
        t = r.buildItem();
        clazz = "monominoes-" + c.prototype.tag.name;
        assert.ok(r.defaultcss === clazz,"Default css is set properly " + r.defaultcss);
        assert.ok(t.hasClass(clazz),"Class " + clazz + " is set when building the item " + r.tag.name);
      }
    }
  }
});

QUnit.test("Tag render creation and property validation", function(assert) {
  var c,r,s;
  var i = new Komunalne.helper.Iterator(Monominoes.renders);
  var count = 0,msg;
  var fn = function() { count++; };
  while(i.hasNext()) {
    c = i.next();
    if (c === Monominoes.renders.TAG || !Monominoes.util.isRender(c,Monominoes.renders.TAG)) continue;
    r = c({ 
      "extracss": "fake-css", 
      "def": {
        "attrs": { "id": "id-" + count },
        "events": { "click": fn }
      }
    });
    s = c({
      "def": {
        "class": "custom-class",
        "style": { "color": "black" }
      }
    });
    msg = "Render Tag " + i.currentKey();
    assert.strictEqual(r.class,c,"Class correctly set on " + msg);
    assert.strictEqual(r.superclass,Monominoes.renders.TAG,"Superclass is TAG for " + msg);
    assert.strictEqual(s.class,c,"Class correctly set on " + msg);
    assert.strictEqual(s.superclass,Monominoes.renders.TAG,"Superclass is TAG for " + msg);
    assert.strictEqual(r.tag,Monominoes.tags[i.currentKey()],"Tag builder object is assigned to instance for " + msg);
    assert.strictEqual(s.tag,Monominoes.tags[i.currentKey()],"Tag builder object is assigned to instance for " + msg);
    assert.strictEqual(r.defaults.defaultcss,"monominoes-" + r.tag.name,"Default class set in defaults for " + msg);
    assert.strictEqual(s.defaults.defaultcss,"monominoes-" + s.tag.name,"Default class set in defaults for " + msg);
    //assert.ok(r.item,"Validate inner item object creation for " + msg);
    //assert.ok(s.item,"Validate inner item object creation for " + msg);
  }
});
