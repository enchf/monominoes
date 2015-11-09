/** Monominoes QUnit testing. */

/* Helpers */
function createMock(tag) {
  return Monominoes.Render.extend({
    "postInit": function() { this.id = (this.id || "mock-" + (createMock.count++)); },
    "buildItem": function() { return $(Monominoes.util.format("<{0}></{0}>",tag)).attr("id",this.id); },
    "customize": function(item,itemdata) { item.text(itemdata); }
  });
};
createMock.count = 0;

/* Test cases */
QUnit.test("Monominoes definition", function(assert) {
  assert.ok(Monominoes,"Monominoes object defined");
  assert.ok(Monominoes.util,"Monominoes util container defined");
  assert.ok(Monominoes.tags,"Monominoes tags container defined");
  assert.ok(Monominoes.renders,"Monominoes renders container defined");
  assert.ok(Komunalne.util.isFunction(Monominoes.Render),"Render class created");
  assert.ok(Komunalne.util.isFunction(Monominoes.Item),"Item class created");
  assert.ok(Komunalne.util.isFunction(Monominoes.Tag),"Tag class created");
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
  
  assert.notOk(("a" in renders[0].super),"Check for custom properties in Custom render not present in Custom super");
  assert.notOk(("a" in renders[1].super),"Check for custom properties in Custom render not present in Custom super");
  assert.strictEqual(renders[2].super.a,"test","Check for custom properties in Custom render present in Sub super");
  assert.strictEqual(renders[3].super.a,"test","Check for custom properties in Custom render present in Sub super");
  
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
    assert.ok(("super" in r),"Parent object created for object " + k);
    assert.ok(Komunalne.util.isInstanceOf(r.super,Object),"Parent object in render is of type Object");
    for (var m in classes[k].prototype) {
      if (m == "defaults") continue;
      assert.deepEqual(r.defaults[m],classes[k].prototype[m],"Property " + m + " against prototype in object " + k);
    }
    
    // Superclass defaults into super object.
    sc = superclasses[k];
    rp = r.super;
    l = 1;
    while (sc != null) {
      for (var m in sc.prototype) {
        if (m === "super") {
          if (sc === Monominoes.Render) assert.ok(rp[m] === null,"Parent property in super should be null");
          else assert.ok(Komunalne.util.isInstanceOf(rp[m],Object),"Parent property for lower levels is an object");
        } else {
          assert.deepEqual(rp[m],sc.prototype[m],
                           Monominoes.util.format("Superclass property {0} in super object {1}, level {2}", m,k,l));
        }
      }
      l++;
      rp = rp.super;
      sc = sc.superclass;
    } 
  }
});

QUnit.test("Render instantiation: Process layout, key-mapped items retrieval and custom init", function(assert) {
  var count = createMock.count;
  var Div = createMock("div");
  var Span = createMock("span");
  var P = createMock("p");
  var subsub = Span({ "key": "subsub" });
  var sub = new P({ "key": "sub", "children": [ subsub ], "id": "sub" });
  var render = new Div({
    "id": "master",
    "children": [
      { "render": Span, "config": {} },
      sub
    ]
  });
  
  assert.equal(render.id,"master","Custom property is set, verified in postInit function");
  assert.ok(Komunalne.util.isArray(render.layout.children),"The children array is created");
  assert.equal(render.layout.children.length,2,"Two children are appended in subitems array");
  assert.equal(render.layout.children[0].id,"mock-" + (count+1),"First child custom property is set in postInit");
  assert.equal(render.layout.children[1].id,"sub","Second child custom property is set, verified in postInit");
  assert.ok(Monominoes.util.isRender(render.layout.children[0],Span),"First child is a render of type Span");
  assert.ok(Monominoes.util.isRender(render.layout.children[1],P),"Second child is a render of type P");
  assert.notOk(Komunalne.util.isFunction(render.layout.children[0]),"First child is a render instance not constructor");
  assert.notOk(Komunalne.util.isFunction(render.layout.children[1]),"Second child is a render instance not constructor");
  assert.ok(Komunalne.util.isInstanceOf(render.layout.childMap,Object),"Child map is an object");
  assert.deepEqual(Komunalne.util.keys(render.layout.childMap),["sub"],"Only key mapped renders present in child map");
  assert.ok(Monominoes.util.isRender(render.layout.childMap.sub,P),"Mapped child render is of type P");
  assert.notOk(Komunalne.util.isFunction(render.layout.childMap.sub),"Mapped child render is an instance not function");
  assert.ok(sub === render.renderByKey("sub"),"Immediate child retrieval");
  assert.ok(subsub === render.renderByKey("sub.subsub"),"Child of child retrieval");
  assert.ok(render.renderByKey("inexistent") == null,"Inexisting key retrieval results in null");
  assert.ok(render.renderByKey("abc.def") == null,"Inexisting composite key retrieval results in null");
  assert.ok(render.renderByKey("sub.def") == null,"Inexisting sub key retrieval results in null");
  assert.ok(render.renderByKey("sub.sub.sub") == null,"Inexisting composite sub key retrieval results in null");
  assert.equal(render.renderByKey("sub.subsub").id,"mock-" + (count),
               "Child of child custom property is set in postInit function");
  
  assert.ok(Komunalne.util.isArray(render.renderByKey("sub").layout.children),"Children array is created in child");
  assert.equal(render.renderByKey("sub").layout.children.length,1,"Only one child is appended in child children array");
  assert.ok(Monominoes.util.isRender(render.renderByKey("sub").layout.children[0],Span),
            "Child of child is a render of type Span");
  assert.notOk(Komunalne.util.isFunction(render.renderByKey("sub").layout.children[0]),
            "Child of child is a render instance");
  assert.ok(Komunalne.util.isInstanceOf(render.renderByKey("sub").layout.childMap,Object),
            "Mapped child child map is an object");
  assert.deepEqual(Komunalne.util.keys(render.renderByKey("sub").layout.childMap),["subsub"],
            "Mapped children key is set");
  assert.ok(Monominoes.util.isRender(render.renderByKey("sub").layout.childMap.subsub,Span),
            "Mapped child of mapped child render is of type SPAN");
  assert.notOk(Komunalne.util.isFunction(render.renderByKey("sub").layout.childMap.sub),
            "Mapped child of mapped child render is a render instance not constructor");
  
  assert.ok(Komunalne.util.isArray(render.layout.children[0].layout.children),"Children array is created in first child");
  assert.equal(render.layout.children[0].layout.children.length,0,"First child render has no children");
  assert.ok(Komunalne.util.isInstanceOf(render.layout.children[0].layout.childMap,Object),
            "First child render child map is an object");
  assert.deepEqual(Komunalne.util.keys(render.layout.children[0].layout.childMap),[],
            "First child render has no mapped renders");
  assert.ok(render.layout.children[1] === render.layout.childMap.sub,"Second child render is the same as the mapped one");
});

QUnit.test("Is render function", function(assert) {
  var aux,key,instance;
  var i = new Komunalne.helper.Iterator(Monominoes.renders);
  assert.ok(Monominoes.util.isRender(Monominoes.Render),"Monominoes.Render abstract class is a Render");
  while (i.hasNext()) {
    aux = i.next();
    key = i.currentKey();
    instance = aux();
    assert.ok(Monominoes.util.isRender(aux),key + " render constructor against isRender test");
    assert.ok(Monominoes.util.isRender(instance),key + " render instance against isRender test");
    assert.notOk(Monominoes.util.isRenderInstance(aux),key + " render constructor against isRenderInstance test");
    assert.ok(Monominoes.util.isRenderInstance(instance),key + " render instance against isRenderInstance test");
  }
});

QUnit.test("Helper function getContainerFrom", function(assert) {
  var suite,aux,render;
  
  aux = Monominoes.Item.getContainerFrom("div");
  assert.ok(aux,"Returns not null from jQuery selector");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Returns a jQuery object from jQuery selector");
  aux = Monominoes.Item.getContainerFrom("<div></div>");
  assert.ok(aux,"Returns not null from HTML string");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Returns a jQuery object from HTML string");
  aux = Monominoes.Item.getContainerFrom($("#qunit"));
  assert.ok(aux,"Returns not null from jQuery objects");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Returns a jQuery object from jQuery objects");
  aux = Monominoes.Item.getContainerFrom(document.getElementsByTagName("script")[0]);
  assert.ok(aux,"Returns not null from HTML DOM Element objects");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Returns a jQuery object from HTML DOM Element objects");
  render = createMock("div")().render("text");
  aux = Monominoes.Item.getContainerFrom(render);
  assert.ok(aux,"Returns not null from built Render");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Returns a jQuery object from built Render");
  aux = Monominoes.Item.getContainerFrom(render.items[0]);
  assert.ok(aux,"Returns not null from Item");
  assert.ok(Komunalne.util.isInstanceOf(aux,jQuery),"Returns a jQuery object from Item");
  
  suite = new Komunalne.test.Suite();
  suite.add({ "args": [1], "msg": "Null from numbers" });
  suite.add({ "args": [true], "msg": "Null from booleans" });
  suite.add({ "args": [function(){}], "msg": "Null from functions" });
  suite.add({ "args": [new Date()], "msg": "Null from Dates/objects" });
  suite.add({ "args": [{}], "msg": "Null from plain objects" });
  suite.add({ "args": [[]], "msg": "Null from arrays" });
  suite.add({ "args": [null], "msg": "Null from null" });
  suite.add({ "args": ["inexistent-id"], "msg": "Null from inexistent elements using selector" });
  suite.add({ "args": [(render = createMock("div")())], "msg": "Null from non built Render" });
  suite.add({ "args": [createMock("span")], "msg": "Null from Render constructor" });
  suite.add({ "args": [new Monominoes.Item($("#test-div"),render,"data",0)], "msg": "Null from non built Item" });
  suite.execute(assert.buildFor("notOk"),Monominoes.Item.getContainerFrom);
});

QUnit.test("Render function: Test updateData", function(assert) {
  var Div = createMock("div"), Span = createMock("span");
  var data = { "a": 1, "b": 2 };
  var a = Div({ "data": data, "children": [ Span(),Span() ] });
  var aux;
  assert.ok("data" in a,"Data attribute is on render instance");
  assert.deepEqual(a.data,data,"Data is correctly set");
  assert.ok("data" in a.layout.children[0],"Data attribute is on first child");
  assert.deepEqual(a.layout.children[0].data,data,"Data is correctly set on first child");
  assert.ok("data" in a.layout.children[1],"Data attribute is on second child");
  assert.deepEqual(a.layout.children[1].data,data,"Data is correctly set on second child");  
  aux = a;
  a = a.render();
  assert.ok(a === aux,"Render is returning the instance itself");
  assert.ok("data" in a,"Data attribute exists after call to render without arguments");
  assert.deepEqual(a.data,data,"Data remains the same after call to render without arguments");
  assert.ok("data" in a.layout.children[0],"Data attribute on first child exists after render without arguments");
  assert.deepEqual(a.layout.children[0].data,data,
                   "Data on first child remains the same after call to render without arguments");
  assert.ok("data" in a.layout.children[1],"Data attribute on second child exists after render without arguments");
  assert.deepEqual(a.layout.children[1].data,data,
                   "Data on first child remains the same after call to render without arguments");
  a.render([1,2,3]);
  assert.ok("data" in a,"Data attribute exists after call to render with new data");
  assert.deepEqual(a.data,[1,2,3],"Data is updated after call to render with new data");
  assert.ok("data" in a.layout.children[0],"Data attribute on first child exists after render with new data");
  assert.deepEqual(a.layout.children[0].data,[1,2,3],
                   "Data on first child is updated after render with new data");
  assert.ok("data" in a.layout.children[1],"Data attribute on second child exists after render with new data");
  assert.deepEqual(a.layout.children[1].data,[1,2,3],
                   "Data on second child is updated after render with new data");
  a = new Div({ "children": [ Span(),Span() ] });
  assert.ok(a.data == null,"Data is null if not set at instantiation");
  assert.ok(a.layout.children[0].data == null,"Data is null if not set at instantiation in first child");
  assert.ok(a.layout.children[1].data == null,"Data is null if not set at instantiation in second child");
  a.render("data");
  assert.equal(a.data,"data","Data is updated from null after call to render with arguments");
  assert.equal(a.layout.children[0].data,"data","First child data is updated from null after render with arguments");
  assert.equal(a.layout.children[1].data,"data","Second child data is updated from null after render with arguments");
});

QUnit.test("Render function: Build items, customization and clear", function(assert) {
  var data = { "data": { "x": 1, "y": "foo" }, "title": "title" };
  var aux,child,subrender;
  var Div = createMock("div");
  var Span = createMock("span");
  var P = createMock("p");
  var subsub,sub;
  var container = $("#test-div");
  var render = new Div({
    "id": "div-id",
    "children": [
      { "render": Span, "config": { "id": "first-span" } },
      (sub = new P({ 
        "key": "sub", 
        "children": [ 
          (subsub = Span({ "key": "subsub", "path": "title" })),
          { "render": Span, "config": { "absolute": true, "path": "data.y" } }
        ] 
      }))
    ]
  }).render(data,container);
  
  // Customization and DOM test.
  assert.ok("id" in render,"Render id custom property is set");
  assert.equal(render.id,"div-id","Render id custom property value is correct");
  assert.ok("id" in render.layout.children[0],"Render id custom property is set on child");
  assert.equal(render.layout.children[0].id,"first-span","Render id custom property value is correct on child");
  assert.ok("id" in render.layout.children[1],"Render id custom property is set on second child");
  assert.ok("id" in render.layout.children[1].layout.children[0],"Render id custom property is set on child of child");
  assert.equal($("#div-id").length,1,"Render item exists in DOM");
  
  // Items creation.
  assert.ok("items" in render,"Item is built after call to render function");
  assert.ok(Komunalne.util.isArrayOf(render.items,Monominoes.Item),"Render.items is an array of M.Item");
  assert.equal(render.items.length,1,"Parent item is created");
  assert.ok(container === (aux = render.items[0]).container,"Container from render is assigned to parent item");
  assert.ok(aux.render === render,"Render is correctly assigned into parent item");
  assert.ok(aux.data === data,"Data is assigned into parent item");
  assert.equal(aux.index,0,"Parent item has index = 0");
  assert.ok(aux.layout === render.layout.children,"Layout is assigned as parent render children");
  assert.ok(Komunalne.util.isInstanceOf(aux.item,jQuery),"Underlying parent item is a jQuery object");
  assert.equal(aux.item.prop("tagName"),"DIV","Tag of parent item item is DIV");
  assert.ok(Komunalne.util.isArrayOf(aux.children,Monominoes.Item),"Children is an array of M.Item");
  assert.equal(aux.children.length,2,"Parent item has two children");
  assert.ok(Komunalne.util.isInstanceOf(aux.childMap,"object"),"Parent item children map is an object");
  assert.deepEqual(Komunalne.util.keys(aux.childMap),["sub"],"Only one child is mapped into parent item");
  assert.ok(aux.isDrawn(),"Parent item is marked as drawn");
  
  child = aux.children[0];
  subrender = render.layout.children[0];
  assert.ok(child.container === aux.item,"First child container is parent item inner item");
  assert.ok(child.render === subrender,"Render in first child is first layout children");
  assert.ok(child.data === data,"Data is assigned into first child item");
  assert.equal(child.index,0,"First child has index = 0");
  assert.deepEqual(child.layout,subrender.layout.children,"First child layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying first child item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"SPAN","Tag of first child item item is SPAN");
  assert.ok(Komunalne.util.isArrayOf(child.children,Monominoes.Item),"First item children is an array of M.Item");
  assert.equal(child.children.length,0,"First child item has no children");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"First child children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),[],"No children are mapped into first child item");
  assert.ok(child.isDrawn(),"First child item is marked as drawn");
  
  child = aux.children[1];
  subrender = render.layout.children[1];
  assert.ok(child.container === aux.item,"Second child container is parent item inner item");
  assert.ok(child.render === subrender,"Render in second child is second layout children");
  assert.ok(child.data === data,"Data is assigned into second child item");
  assert.equal(child.index,1,"Second child has index = 1");
  assert.deepEqual(child.layout,subrender.layout.children,"Second child layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying second child item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"P","Tag of second child item item is SPAN");
  assert.ok(Komunalne.util.isArrayOf(child.children,Monominoes.Item),"Second item children is an array of M.Item");
  assert.equal(child.children.length,2,"Second child item has two children");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"Second child children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),["subsub"],"One child is mapped into second child item");
  assert.ok(child.isDrawn(),"Second child item is marked as drawn");
  
  aux = child;
  child = aux.children[0];
  subrender = aux.render.layout.children[0];
  assert.ok(child.container === aux.item,"First grandson container is parent item inner item");
  assert.ok(child.render === subrender,"Render in first grandson is first layout children");
  assert.equal(child.data,"title","Data is assigned into first grandson item");
  assert.equal(child.index,0,"First grandson has index = 0");
  assert.deepEqual(child.layout,subrender.layout.children,"First grandson layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying first grandson item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"SPAN","Tag of first grandson item item is SPAN");
  assert.ok(Komunalne.util.isArrayOf(child.children,Monominoes.Item),"First grandson children is an array of M.Item");
  assert.equal(child.children.length,0,"First grandson has no children");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"First grandson children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),[],"No children are mapped into first grandson item");
  assert.ok(child.isDrawn(),"First grandson item is marked as drawn");
  
  child = aux.children[1];
  subrender = aux.render.layout.children[1];
  assert.ok(child.container === aux.item,"Second grandson container is parent item inner item");
  assert.ok(child.render === subrender,"Render in second grandson is second layout children");
  assert.equal(child.data,"foo","Data is assigned into second grandson item");
  assert.equal(child.index,1,"Second grandson has index = 1");
  assert.deepEqual(child.layout,subrender.layout.children,"second grandson layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying second grandson item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"SPAN","Tag of second grandson item item is SPAN");
  assert.ok(Komunalne.util.isArrayOf(child.children,Monominoes.Item),"Second grandson children is an array of M.Item");
  assert.equal(child.children.length,0,"Second grandson has no children");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"Second grandson children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),[],"No children are mapped into second grandson item");
  assert.ok(child.isDrawn(),"Second grandson item is marked as drawn");
  
  // Result of clear function.
  render.clear();
  assert.ok(render.items == null,"Item is removed after call to clear");
  assert.ok(Komunalne.util.isArray(render.layout.children),"Render layout remains set");
  assert.equal(render.layout.children.length,2,"Render layout remains the same");
  assert.deepEqual(Komunalne.util.keys(render.layout.childMap),["sub"],"Child map remains the same in render");
  assert.equal($("#div-id").length,0,"Render item doesn't exist in DOM after calling clear method");
});

QUnit.test("Item and iterable children items content and structure", function(assert) {
  var Div = createMock("div");
  var P = createMock("p");
  var Span = createMock("span");
  var render = new Div({
    "path": "data",
    "children": [{ "render": P, "config": { "key": "items", "iterable": true, "path": "data.items" } }],
    "customize": function(item,itemdata) { item.text(itemdata.title); }
  });
  var data = { "data": { "title": "Title", "items": ["one","two","three"] } };
  var itemsRender;
  var aux;
  
  render.render(data);
  itemsRender = render.childByKey("items");
  assert.equal(Komunalne.$.elementText(render.items),"Title","Customized title is set from base render path config");
  assert.deepEqual(render.itemData,data.data,"Base render item data correctly set");
  assert.deepEqual(itemsRender.itemData,data.data.items,"Iterable child render item data set");
  assert.ok(render === itemsRender.parent,"Parent is correctly set for child render");
  assert.ok(render.items === itemsRender.container,"Container is set for children during rendering");
  assert.ok(render.container === null,"If container is not specified it remains null for base render");
  
  render = new Div({
    "id": "base-div",
    "customize": function(item,itemdata) { item.text(itemdata.header); },
    "children": [{
      "render": P,
      "config": { "key": "paragraph", "path": "text" }
    },{
      "render": Div,
      "config": {
        "iterable": true,
        "key": "options",
        "path": "options",
        "customize": function(item,itemdata) { item.text(itemdata.id); },
        "children": [{ 
          "render": Span, 
          "config": { 
            "key": "id", 
            "path": "id" // Path will be relative to the iteration item.
          }
        },{ 
          "render": Span, 
          "config": { 
            "key": "value", 
            "path": "value" // Path will be relative to the iteration item.
          }
        }]
      }
    }] 
  });
  data = { 
    "header": "Header",
    "text": "This is text",
    "options": [
      { "id": 1, "value": "one", "key": "uno" },
      { "id": 2, "value": "two", "key": "dos" },
      { "id": 3, "value": "three", "key": "tres" }
    ]
  };
  
  render.render(data,"#test-div");
  assert.ok(render.container != null,"Base render container is not null");
  assert.equal(render.container.attr("id"),"test-div","Base render is placed on test-div DOM element");
  assert.ok(render.path == null,"There is no path specified for base render");
  assert.ok(render.parent == null,"There is no parent render for base render");
  assert.deepEqual(render.data,data,"Data is assigned to base render");
  assert.deepEqual(render.itemData,data,"No path specified in base render so item data is equal to data");
  assert.notOk(Komunalne.util.isArray(render.items),"Base render items is not an array");
  assert.ok(Komunalne.util.isInstanceOf(render.items,jQuery),"Base render items is a jQuery object");
  assert.equal(render.items.attr("id"),"base-div","Id is correctly set on customize function");
  assert.equal($("#base-div").length,1,"Base render items is present in DOM");
  assert.equal(Komunalne.$.elementText(render.items),data.header,"Text for base render items is set");
  
  aux = render.childByKey("paragraph");
  assert.ok(aux.container != null,"Paragraph render container is not null");
  assert.ok(aux.container === render.items,"Paragraph container is base render items");
  assert.equal(aux.container.attr("id"),"base-div","Paragraph container id is items id of base render");
  assert.equal(aux.path,"text","Paragraph path set to text");
  assert.ok(aux.parent === render,"Paragraph parent is base render");
  assert.deepEqual(aux.data,data,"Data is always absolute and equal to data in paragraph render");
  assert.deepEqual(aux.itemData,data.text,"Item data set according to path in paragraph render");
  assert.notOk(Komunalne.util.isArray(aux.items),"Paragraph render items is not an array");
  assert.ok(Komunalne.util.isInstanceOf(aux.items,jQuery),"Paragraph render items is a jQuery object");
  assert.ok(aux.items.attr("id").indexOf("mock") >= 0,"Id is set on paragraph render items");
  assert.equal($("#" + aux.items.attr("id")).length,1,"Paragraph render items is present in DOM");
  assert.equal(Komunalne.$.elementText(aux.items),data.text,"Text for paragraph render items is set");
  
  aux = render.childByKey("options");
  assert.ok(aux.container != null,"Options render container is not null");
  assert.ok(aux.container === render.items,"Options container is base render items");
  assert.equal(aux.container.attr("id"),"base-div","Options container id is items id of base render");
  assert.equal(aux.path,"options","Options path set to options");
  assert.ok(aux.parent === render,"Options parent is base render");
  assert.deepEqual(aux.data,data,"Data is always absolute and equal to data in options render");
  assert.deepEqual(aux.itemData,data.options,"Item data set according to path in options render");
  assert.ok(Komunalne.util.isArray(aux.items),"Options render items is an array");
  assert.notOk(Komunalne.util.isInstanceOf(aux.items,jQuery),"Options render items is not a jQuery object");
  assert.equal(aux.items.length,3,"Options render length is 3");
  assert.equal(aux.container.children().length,4,"Paragraph plus 3 options items are appended to base render items");
  assert.equal(Komunalne.$.elementText(aux.items[0]),"1","Text for options render items is 1 in first item");
  assert.equal(Komunalne.$.elementText(aux.items[1]),"2","Text for options render items is 2 in second item");
  assert.equal(Komunalne.$.elementText(aux.items[2]),"3","Text for options render items is 3 in third item");
  
});

QUnit.test("Iterable items", function(assert) {
  var H1 = createMock("h1");
  var UL = createMock("ul");
  var LI = createMock("li");
  var render = new UL({
    "children": [
      { "render": H1, "config": { "key": "header", "path": "header" } },
      { "render": LI, "config": { "key": "items", "path": "items", "iterable": true } }
    ]
  });
  var data1 = { "title": "ignored", "header": "Title", "items": [1,2,3,4,5] };
  var data2 = { "header": "Updated", "items": ["a","b","c"] };
  var header,items;
  var i;
  
  render.render(data1);
  header = render.childByKey("header");
  items = render.childByKey("items");
  
  assert.equal(render.children.length,2,"Two child renders appended to base render");
  assert.ok(Komunalne.util.isInstanceOf(header.items,jQuery),"Header child render has a single item");
  assert.ok(Komunalne.util.isArray(items.items),"Items child render has items property as an array");
  assert.deepEqual(render.itemData,data1,"Item data is correctly set if no path specified");
  assert.equal(header.itemData,"Title","Header item data is correctly set according to path");
  assert.deepEqual(items.itemData,[1,2,3,4,5],"Iterable item data is correctly set according to path");
  
  // Iterability test.
  i = 1;
  assert.equal(items.items.length,5,"Items child render has 5 items from the data received");
  while (i <= 5) assert.equal(items.items[i-1].text(),i,"Checking items for the first data assignment: " + (i++));
  
  i = 0;
  render.render(data2);
  assert.equal(render.children.length,2,"Two child renders appended to base render in the second rendering");
  assert.ok(Komunalne.util.isInstanceOf(header.items,jQuery),"Header child render preserves a single item");
  assert.ok(Komunalne.util.isArray(items.items),"Items child render preserves items property as an array");
  assert.deepEqual(render.itemData,data2,"Item data is correctly updated for base render");
  assert.equal(header.itemData,"Updated","Header item data is updated in second rendering");
  assert.deepEqual(items.itemData,["a","b","c"],"Iterable item data is updated in second rendering");
  assert.equal(items.items.length,3,"Items child render has 5 items from the data received");
  while (i < 3) assert.equal(items.items[i].text(),data2.items[i],
                             "Checking items for the updated data: " + data2.items[i++]);
});

QUnit.test("Item retrieval by index or key", function(assert) {
  assert.ok(Monominoes.Render.prototype.getItem);
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
