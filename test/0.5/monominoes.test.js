/** Monominoes QUnit testing. */

/* Helpers */
function createMock(tag) {
  return Monominoes.Render.extend({
    "postInit": function() { this.id = (this.id || "mock-" + (createMock.count++)); },
    "buildItem": function(data,target) { return $(Monominoes.util.format("<{0}></{0}>",tag)).attr("id",this.id); },
    "customize": function(item) { item.item.text(item.data); }
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
  assert.ok(M,"Shortcut is defined, even by Monominoes or by another code");
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
  var i,j=0,r,k,msg;
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
      msg = "Property " + m + " against prototype in object " + k;
      if (Komunalne.util.isFunction(classes[k].prototype[m]) || m == "defaults") assert.ok(r.defaults[m],msg);
      else assert.deepEqual(r.defaults[m],classes[k].prototype[m],msg);
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
          msg = Monominoes.util.format("Superclass property {0} in super object {1}, level {2}", m,k,l);
          if (!Komunalne.util.isFunction(sc.prototype[m])) assert.deepEqual(rp[m],sc.prototype[m],msg);
          else assert.ok(rp[m],msg);
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
  assert.equal(render.layout.children[0].id,"mock-" + (parseInt(createMock.count)-1),"Id property set on first child");
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

QUnit.test("Items rendering, content, structure, customization and clear for non-iterable renders", function(assert) {
  var data = { "data": { "x": 1, "y": "foo" }, "title": "title" };
  var aux,child,subrender;
  var Div = createMock("div");
  var Span = createMock("span");
  var P = createMock("p");
  var subsub,sub;
  var objectToStr = "[object Object]";
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
  assert.ok("items" in render,"Items is built after call to render function");
  assert.ok(Komunalne.util.isArrayOf(render.items,Monominoes.Item),"Render.items is an array of M.Item");
  assert.equal(render.items.length,1,"Parent items length is 1");
  assert.ok(container === (aux = render.items[0]).container,"Container from render is assigned to parent item");
  assert.ok(aux.parent === null,"Base render has no M.Item parent");
  assert.ok(aux.render === render,"Render is correctly assigned into parent item");
  assert.ok(aux.data === data,"Data is assigned into parent item");
  assert.equal(aux.index,0,"Index of parent is 0");
  assert.equal(aux.layout,render.layout.children,"Layout is assigned as parent render children");
  assert.ok(Komunalne.util.isInstanceOf(aux.item,jQuery),"Underlying parent item is a jQuery object");
  assert.equal(aux.item.prop("tagName"),"DIV","Tag of parent item item is DIV");
  assert.equal(Komunalne.$.elementText(aux.item),objectToStr,"Text content of parent item");
  assert.equal(aux.item.attr("id"),"div-id","Id is set on parent item");
  assert.ok(Komunalne.util.isArrayOf(aux.children,Array),"Children is an array of arrays");
  assert.equal(aux.children.length,2,"Parent item has two indexed renders");
  assert.ok(Komunalne.util.isArrayOf(aux.children[0],Monominoes.Item),"First indexed renders array is of M.Item's");
  assert.equal(aux.children[0].length,1,"First indexed renders array has one M.Item");
  assert.ok(Komunalne.util.isArrayOf(aux.children[1],Monominoes.Item),"Second indexed renders array is of M.Item's");
  assert.equal(aux.children[1].length,1,"Second indexed renders array has one M.Item");
  assert.ok(Komunalne.util.isInstanceOf(aux.childMap,"object"),"Parent item children map is an object");
  assert.deepEqual(Komunalne.util.keys(aux.childMap),["sub"],"Only one child is mapped into parent item");
  assert.ok(Komunalne.util.isArrayOf(aux.childMap.sub,Monominoes.Item),"Indexed child entry is an array of M.Item's");
  assert.equal(aux.childMap.sub.length,1,"Indexed child entry in parent item has one item");
  assert.equal(aux.childMap.sub[0],aux.children[1][0],"Indexed child entry in parent item is the second children item");
  assert.equal(aux.childMap.sub[0].render,sub,"Indexed child render in parent item is the stored render as sub");
  assert.ok(aux.isDrawn(),"Parent item is marked as drawn");
  
  child = aux.children[0][0];
  subrender = render.layout.children[0];
  assert.ok(child.container === aux.item,"First child container is parent item inner item");
  assert.ok(child.parent === aux,"First child parent is base parent item");
  assert.ok(child.render === subrender,"Render in first child is first layout children");
  assert.ok(child.data === data,"Data is assigned into first child item");
  assert.equal(child.index,0,"Index of first child is 0");
  assert.equal(child.layout,subrender.layout.children,"First child layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying first child item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"SPAN","Tag of first child item item is SPAN");
  assert.equal(Komunalne.$.elementText(child.item),objectToStr,"Text content of first child item");
  assert.equal(child.item.attr("id"),"first-span","Id is set on first child item");
  assert.ok(Komunalne.util.isArrayOf(child.children,Array),"First item children is an array of M.Item");
  assert.equal(child.children.length,0,"First child item has no children");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"First child children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),[],"No children are mapped into first child item");
  assert.ok(child.isDrawn(),"First child item is marked as drawn");
  
  child = aux.children[1][0];
  subrender = render.layout.children[1];
  assert.ok(child.container === aux.item,"Second child container is parent item inner item");
  assert.ok(child.parent === aux,"Second child parent is base parent item");
  assert.ok(child.render === subrender,"Render in second child is second layout children");
  assert.ok(child.data === data,"Data is assigned into second child item");
  assert.equal(child.index,0,"Index of second child is 0");
  assert.equal(child.layout,subrender.layout.children,"Second child layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying second child item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"P","Tag of second child item item is SPAN");
  assert.equal(Komunalne.$.elementText(child.item),objectToStr,"Text content of second child item");
  assert.equal(child.item.attr("id").indexOf("mock"),0,"Generated id is set on second child item");
  assert.ok(Komunalne.util.isArrayOf(child.children,Array),"Second item children is an array of arrays");
  assert.equal(child.children.length,2,"Second child item has two children");
  assert.ok(Komunalne.util.isArrayOf(child.children[0],Monominoes.Item),"First child of 2nd child is an array of items");
  assert.equal(child.children[0].length,1,"First child of 2nd child has one item");
  assert.ok(Komunalne.util.isArrayOf(child.children[1],Monominoes.Item),"Second child of 2nd child is an array of items");
  assert.equal(child.children[1].length,1,"Second child of 2nd child has one item");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"Second child children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),["subsub"],"One child is mapped into second child item");
  assert.ok(Komunalne.util.isArrayOf(child.childMap.subsub,Monominoes.Item),
            "Mapped item in 2nd child is an M.Item array");
  assert.equal(child.childMap.subsub.length,1,"Mapped item in 2nd child has one item");
  assert.equal(child.childMap.subsub[0].render,subsub,"Indexed child render in 2nd child is the stored render as subsub");
  assert.equal(child.childMap.subsub[0],child.children[0][0],"Mapped item in 2nd child correspond to the correct item");
  assert.ok(child.isDrawn(),"Second child item is marked as drawn");
  
  aux = child;
  child = aux.children[0][0];
  subrender = aux.render.layout.children[0];
  assert.ok(child.container === aux.item,"First grandson container is parent item inner item");
  assert.ok(child.parent === aux,"First grandson parent is second child");
  assert.ok(child.render === subrender,"Render in first grandson is first layout children");
  assert.equal(child.data,"title","Data is assigned into first grandson item");
  assert.equal(child.index,0,"Index of first grandson is 0");
  assert.deepEqual(child.layout,subrender.layout.children,"First grandson layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying first grandson item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"SPAN","Tag of first grandson item item is SPAN");
  assert.equal(Komunalne.$.elementText(child.item),"title","Text content of first grandson item");
  assert.equal(child.item.attr("id").indexOf("mock"),0,"Generated id is set on first grandson item");
  assert.ok(Komunalne.util.isArrayOf(child.children,Array),"First grandson children is an array of M.Item");
  assert.equal(child.children.length,0,"First grandson has no children");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"First grandson children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),[],"No children are mapped into first grandson item");
  assert.ok(child.isDrawn(),"First grandson item is marked as drawn");
  
  child = aux.children[1][0];
  subrender = aux.render.layout.children[1];
  assert.ok(child.container === aux.item,"Second grandson container is parent item inner item");
  assert.ok(child.parent === aux,"Second grandson parent is second child");
  assert.ok(child.render === subrender,"Render in second grandson is second layout children");
  assert.equal(child.data,"foo","Data is assigned into second grandson item");
  assert.equal(child.index,0,"Index of second grandson is 0");
  assert.deepEqual(child.layout,subrender.layout.children,"second grandson layout is assigned as first sub render");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Underlying second grandson item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"SPAN","Tag of second grandson item item is SPAN");
  assert.equal(Komunalne.$.elementText(child.item),"foo","Text content of second grandson item");
  assert.equal(child.item.attr("id").indexOf("mock"),0,"Generated id is set on second grandson item");
  assert.ok(Komunalne.util.isArrayOf(child.children,Array),"Second grandson children is an array of M.Item");
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

QUnit.test("Items rendering, content, structure, customization and clear for iterable renders", function(assert) {
  var Div = createMock("div");
  var P = createMock("p");
  var Span = createMock("span");
  var render,data,aux,child,subrender,options,grandson,gsrender;
  var id1,id2;
  var F = Monominoes.util.format;
  
  render = new Div({
    "id": "base-div",
    "path": "data",
    "customize": function(item) { item.item.text(item.data.header); },
    "children": [{
      "render": P,
      "config": { "key": "headtext", "path": "text" }
    },{
      "render": Div,
      "config": {
        "iterable": true,
        "key": "options",
        "path": "options",
        "customize": function(item) { item.item.text(item.data.id); },
        "children": [{ 
          "render": Span, 
          "config": { 
            "key": "key", 
            "path": "key" // Path will be relative to the iteration item.
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
    "result": "ok",
    "data": {
      "header": "Header",
      "text": "This is text",
      "options": [
        { "id": 1, "value": "one", "key": "uno" },
        { "id": 2, "value": "two", "key": "dos" },
        { "id": 3, "value": "three", "key": "tres" }
      ]
    }
  };  
  render.render(data,"#test-div");
  
  // Items creation.
  aux = render.items[0];
  assert.ok("items" in render,"Items is built after call to render function");
  assert.ok(Komunalne.util.isArrayOf(render.items,Monominoes.Item),"Render.items is an array of M.Item");
  assert.equal(render.items.length,1,"Base item is a single item");
  assert.equal(aux.container.attr("id"),"test-div","Container from render is assigned to base item");
  assert.ok(aux.parent === null,"Base item has no M.Item parent");
  assert.ok(aux.render === render,"Render is correctly assigned into base item");
  assert.ok(aux.data === data.data,"Data is assigned into base item according to path");
  assert.ok(aux.layout === render.layout.children,"Layout of base item is base render layout.children");
  assert.ok(Komunalne.util.isInstanceOf(aux.item,jQuery),"Underlying base item item is a jQuery object");
  assert.equal(aux.item.prop("tagName"),"DIV","Tag of base item item is DIV");
  assert.equal(Komunalne.$.elementText(aux.item),"Header","Text content of base item");
  assert.ok(Komunalne.util.isArrayOf(aux.children,Array),"Children is an array of arrays of Items in base item");
  assert.equal(aux.children.length,2,"Base item has one two children arrays");
  assert.ok(Komunalne.util.isArrayOf(aux.children[0],Monominoes.Item),"Children first array is of M.Items in base item");
  assert.equal(aux.children[0].length,1,"Base item first children array has one item");
  assert.ok(Komunalne.util.isArrayOf(aux.children[1],Monominoes.Item),"Children second array is of M.Items in base item");
  assert.equal(aux.children[1].length,3,"Base item second children array has three item as it is iterable");
  assert.ok(Komunalne.util.isInstanceOf(aux.childMap,"object"),"Base item children map is an object");
  assert.deepEqual(Komunalne.util.keys(aux.childMap),["headtext","options"],"Two children are mapped into base item");
  assert.ok(Komunalne.util.isArrayOf(aux.childMap.headtext,Monominoes.Item),"First map array is of M.Items in base item");
  assert.ok(Komunalne.util.isArrayOf(aux.childMap.options,Monominoes.Item),"Second map array is of M.Items in base item");
  assert.equal(aux.childMap.headtext.length,1,"First map array has 1 item in base item");
  assert.equal(aux.childMap.options.length,3,"Second map array has 3 items in base item");
  assert.equal(aux.childMap.headtext[0],aux.children[0][0],"First mapped item is the first children unique element");
  assert.equal(aux.childMap.options[1],aux.children[1][1],"Second mapped item is the second children iterable element");
  assert.ok(aux.isDrawn(),"Base item is marked as drawn");
  assert.equal($("#base-div").length,1,"Base item item is present in DOM");
  assert.equal(render.getBaseRender(),render,"Base render for base render its itself");
  
  child = render.getItemByKey("headtext");
  subrender = aux.render.layout.children[0];
  assert.equal(child.container,aux.item,"Headtext render container is base item");
  assert.equal(child.parent,aux,"Headtext parent is base item");
  assert.equal(child.render,subrender,"Headtext render is base item first child");
  assert.equal(child.data,"This is text","Data is assigned in headtext");
  assert.equal(child.layout,subrender.layout.children,"Layout of headtext is base item first child children array");
  assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),"Headtext item is a jQuery object");
  assert.equal(child.item.prop("tagName"),"P","Tag of headtext item is P");
  assert.equal(Komunalne.$.elementText(child.item),"This is text","Text content of headtext");
  assert.ok(Komunalne.util.isArrayOf(child.children,Array),"Children is an array of arrays of Items in headtext");
  assert.equal(child.children.length,0,"Headtext has no children arrays");
  assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),"Headtext children map is an object");
  assert.deepEqual(Komunalne.util.keys(child.childMap),[],"No children are mapped into headtext");
  assert.ok(child.isDrawn(),"Headtext is marked as drawn");
  assert.equal($("#"+child.item.attr("id")).length,1,"Headtext item is present in DOM");
  assert.equal(subrender.getBaseRender(),render,"Base render for child 1 is the upmost render");
  id1 = "#" + child.item.attr("id");
  
  options = render.getItemByKey("options");
  subrender = aux.render.layout.children[1];
  assert.ok(Komunalne.util.isArrayOf(options,Monominoes.Item),"Options item is an array of Items");
  assert.equal(options.length,3,"Options item is of length 3");
  id2 = "#" + options[0].item.attr("id");
  assert.equal(subrender.getBaseRender(),render,"Base render for child 2 is the upmost render");
  
  for (var i = 0; i < options.length; i++) {
    child = options[i];
    assert.equal(child.container,aux.item,F("Child #{0} is contained into base item",i));
    assert.equal(child.container.attr("id"),"base-div",F("Child #{0} container is base item",i));
    assert.equal(child.parent,aux,F("Child #{0} parent is base item",i));
    assert.equal(child.render,subrender,F("Child #{0} render is correctly assigned from base item layout",i));
    assert.equal(child.data,data.data.options[i],F("Data is assigned into child #{0} according to path",i));
    assert.equal(child.layout,subrender.layout.children,F("Child #{0} layout is options render children",i));
    assert.ok(Komunalne.util.isInstanceOf(child.item,jQuery),F("Underlying child #{0} item is a jQuery object",i));
    assert.equal(child.item.prop("tagName"),"DIV",F("Tag of child #{0} item is DIV",i));
    assert.equal(Komunalne.$.elementText(child.item),i + 1,F("Text content of child #{0}",i));
    assert.ok(Komunalne.util.isArrayOf(child.children,Array),F("Children is an array of Items arrays in child #{0}",i));
    assert.equal(child.children.length,2,F("Child #{0} has one two children arrays",i));
    assert.ok(Komunalne.util.isArrayOf(child.children[0],Monominoes.Item),F("Items array in child #{0} first child",i));
    assert.equal(child.children[0].length,1,F("Child #{0} first children array has one item",i));
    assert.ok(Komunalne.util.isArrayOf(child.children[1],Monominoes.Item),F("Items array in child #{0} second child",i));
    assert.equal(child.children[1].length,1,F("Child #{0} second children array has one item",i));
    assert.ok(Komunalne.util.isInstanceOf(child.childMap,"object"),F("Child #{0} children map is an object",i));
    assert.deepEqual(Komunalne.util.keys(child.childMap),["key","value"],F("Two children are mapped into child #{0}",i));
    assert.ok(Komunalne.util.isArrayOf(child.childMap.key,Monominoes.Item),F("Child {0} 1st map is an Item array",i));
    assert.ok(Komunalne.util.isArrayOf(child.childMap.value,Monominoes.Item),F("Child {0} 2nd map is an Item array",i));
    assert.equal(child.childMap.key.length,1,F("Child {0} 1st map array has 1 item",i));
    assert.equal(child.childMap.value.length,1,F("Child {0} 2nd map array has 1 item",i));
    assert.equal(child.childMap.key[0],aux.children[1][i].children[0][0],F("Correct first mapping in child {0}",i));
    assert.equal(child.childMap.value[0],aux.children[1][i].children[1][0],F("Correct second mapping in child {0}",i));
    assert.ok(child.isDrawn(),F("Child #{0} is marked as drawn",i));
    assert.equal($("#" + child.item.attr("id")).length,1,F("Child #{0} item is present in DOM",i));
    
    grandson = child.children[0][0];
    gsrender = subrender.getMappedRender("key");
    assert.equal(grandson.container,child.item,F("First grandson is contained into child #{0} item",i));
    assert.equal(grandson.container.attr("id"),child.item.attr("id"),F("First grandson container is child #{0} item",i));
    assert.equal(grandson.parent,child,F("First grandson parent is child #{0} item",i));
    assert.equal(grandson.render,gsrender,F("Child #{0} first grandson render is correctly assigned",i));
    assert.equal(grandson.data,data.data.options[i].key,F("Data is assigned into first grandson of child #{0}",i));
    assert.equal(grandson.layout,gsrender.layout.children,F("Child #{0} 1st grandson layout is 1st options child",i));
    assert.ok(Komunalne.util.isInstanceOf(grandson.item,jQuery),F("Child #{0} 1st grandson item is a jQuery object",i));
    assert.equal(grandson.item.prop("tagName"),"SPAN",F("Tag of child #{0} first grandson is SPAN",i));
    assert.equal(Komunalne.$.elementText(grandson.item),data.data.options[i].key,F("Child #{0} first grandson text",i));
    assert.ok(Komunalne.util.isArrayOf(grandson.children,Array),F("Children is an array in first grandson child #{0}",i));
    assert.equal(grandson.children.length,0,F("First grandson of child #{0} is an empty array",i));
    assert.ok(Komunalne.util.isInstanceOf(grandson.childMap,"object"),F("Child #{0} 1st grandson map is an object",i));
    assert.deepEqual(Komunalne.util.keys(grandson.childMap),[],F("No children are mapped in 1st grandson child #{0}",i));
    assert.ok(grandson.isDrawn(),F("Child #{0} first grandson is marked as drawn",i));
    assert.equal($("#" + grandson.item.attr("id")).length,1,F("Child #{0} first grandson item is present in DOM",i));
    assert.equal(gsrender.getBaseRender(),render,"Base render for grandson 1 is the upmost render");
    
    grandson = child.children[1][0];
    gsrender = subrender.getMappedRender("value");
    assert.equal(grandson.container,child.item,F("Second grandson is contained into child #{0} item",i));
    assert.equal(grandson.container.attr("id"),child.item.attr("id"),F("Second grandson container is child #{0} item",i));
    assert.equal(grandson.parent,child,F("Second grandson parent is child #{0} item",i));
    assert.equal(grandson.render,gsrender,F("Child #{0} second grandson render is correctly assigned",i));
    assert.equal(grandson.data,data.data.options[i].value,F("Data is assigned into second grandson of child #{0}",i));
    assert.equal(grandson.layout,gsrender.layout.children,F("Child #{0} 2st grandson layout is 2st options child",i));
    assert.ok(Komunalne.util.isInstanceOf(grandson.item,jQuery),F("Child #{0} 2st grandson item is a jQuery object",i));
    assert.equal(grandson.item.prop("tagName"),"SPAN",F("Tag of child #{0} second grandson is SPAN",i));
    assert.equal(Komunalne.$.elementText(grandson.item),data.data.options[i].value,F("Child #{0} 2nd grandson text",i));
    assert.ok(Komunalne.util.isArrayOf(grandson.children,Array),F("Children is an array in 2nd grandson child #{0}",i));
    assert.equal(grandson.children.length,0,F("Second grandson of child #{0} is an empty array",i));
    assert.ok(Komunalne.util.isInstanceOf(grandson.childMap,"object"),F("Child #{0} 2st grandson map is an object",i));
    assert.deepEqual(Komunalne.util.keys(grandson.childMap),[],F("No children are mapped in 2st grandson child #{0}",i));
    assert.ok(grandson.isDrawn(),F("Child #{0} second grandson is marked as drawn",i));
    assert.equal($("#" + grandson.item.attr("id")).length,1,F("Child #{0} second grandson item is present in DOM",i));
    assert.equal(gsrender.getBaseRender(),render,"Base render for grandson 2 is the upmost render");
  }
  
  render.clear();
  assert.ok(render.items == null,"Item is removed after call to clear");
  assert.ok(Komunalne.util.isArray(render.layout.children),"Render layout remains set");
  assert.equal(render.layout.children.length,2,"Render layout remains the same");
  assert.deepEqual(Komunalne.util.keys(render.layout.childMap),["headtext","options"],
                   "Child map remains the same in render");
  assert.equal($("#base-div").length,0,"Render item doesn't exist in DOM after calling clear method");
  assert.equal($(id1).length,0,"Random child item id does not exist in DOM after calling clear method");
  assert.equal($(id2).length,0,"Random options item id does not exist in DOM after calling clear method");
});

QUnit.test("Item retrieval by key", function(assert) {
  var aux;
  var Div = createMock("div");
  var P = createMock("p");
  var Span = createMock("span");
  var data = {
    "result": "ok",
    "data": {
      "header": "Header",
      "text": "This is text",
      "options": [
        { "id": 1, "value": "one", "key": "uno" },
        { "id": 2, "value": "two", "key": "dos" },
        { "id": 3, "value": "three", "key": "tres" }
      ]
    }
  };
  var render = new Div({
    "id": "base-div",
    "path": "data",
    "customize": function(item) { item.item.text(item.data.header); },
    "children": [{
      "render": P,
      "config": { "key": "headtext", "path": "text" }
    },{
      "render": Div,
      "config": {
        "iterable": true,
        "key": "options",
        "path": "options",
        "customize": function(item) { item.item.text(item.data.id); },
        "children": [{ 
          "render": Span, 
          "config": { 
            "key": "key", 
            "path": "key" // Path will be relative to the iteration item.
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
  }).render(data);
  
  assert.ok(Monominoes.Render.prototype.getItemByKey,"Function getItemByKey exists in Render prototype");
  assert.ok(render.getItemByKey("fakekey") === null,"Retrieving non existing key returns null");
  assert.ok(render.getItemByKey("0") === null,"Retrieving index on non iterable parent render returns null");
  assert.ok(render.getItemByKey("options.1.key.2") === null,"Retrieving index on non iterable child render returns null");
  assert.ok(render.getItemByKey("options.1.0") === null,"Existing index should be returned only on iterable children");
  assert.ok((aux = render.getItemByKey("headtext")),"Retrieved headtext child item");
  assert.ok(aux === render.items[0].children[0][0],"Ensure the returned headtext child is the correct element");
  assert.ok(Komunalne.util.isArray((aux = render.getItemByKey("options"))),"Iterable key returns an array of items");
  assert.equal(aux.length,3,"Iterable key options returns 3 items");
  assert.ok(render.getItemByKey("options.4") === null,"Iterable key with out of bounds index returns null");
  assert.ok((aux = render.getItemByKey("options.2")),"Iterable key with index returns item");
  assert.ok(aux === render.items[0].children[1][2],"Ensure the returned indexed options child is correct");
  assert.ok((aux = render.getItemByKey("options.0.value")),"Child of iterable key with index returns item");
  assert.ok(aux === render.items[0].children[1][0].children[1][0],"Ensure the returned indexed options child is correct");
  
  render = new P({ "iterable": true, "children": [ Span(),Span() ] }).render([1,2,3]);
  assert.ok(render.getItemByKey("headtext") === null,"Unexisting key on parent iterable render returns null");
  assert.ok((aux = render.getItemByKey("1")),"Indexed iterable item in parent iterable returns an item");
  assert.equal(aux,render.items[1],"Ensure the indexed iterable parent returned is correct");
  assert.ok(render.getItemByKey("1.0") === null,"Indexed elements are not returned when using keys");
  
  render = new Div({ "children": [ 
    Span({ "key": "a", "path": "text" }), 
    P({ "iterable": true, "path": "items", "key": "items" }) 
  ] });
  render.render({ "text": "text", "items": [] });
  assert.deepEqual(render.getItemByKey("items"),[],"Iterable render built with empty array has empty set of items");
  assert.ok(render.getItemByKey("items.1") === null,"Unexisting index in parent iterable returns null");
});

QUnit.test("Item retrieval by index", function(assert) {
  var aux,exp;
  var Div = createMock("div");
  var render = new Div({ "id": "parent", "children": [
    { "render": Div, "config": { "id": "child", "path": "child", "children": [ new Div() ] } },
    { "render": Div, "config": { "iterable": true, "id": "children", "path": "children" } }
  ]});
  var data = { "child": 1, "children": [1,2,3] };
  render.render(data);
  
  assert.ok(Monominoes.Render.prototype.getItemByIndex,"Function getItemByIndex exists in Render prototype");
  aux = render.getItemByIndex("0");
  exp = render.items[0].children[0][0];
  assert.equal(aux,exp,"Retrieving first child of parent");
  assert.equal(aux.item.attr("id"),exp.item.attr("id"),"First child inner item is the same as the indexed retrieved");
  aux = render.getItemByIndex("1");
  exp = render.items[0].children[1];
  assert.ok(Komunalne.util.isArray(aux),"Second iterable child is an array");
  assert.equal(aux,exp,"Retrieving second iterable child is the second child array");
  assert.equal(aux.length,exp.length,"Both arrays are the same length");
  aux = render.getItemByIndex("0.0");
  exp = render.items[0].children[0][0].children[0][0];
  assert.equal(aux,exp,"Retrieving first child of first child of parent");
  assert.equal(aux.item.attr("id"),exp.item.attr("id"),"First child of first child item id is the expected one");
  aux = render.getItemByIndex("1.0");
  exp = render.items[0].children[1][0];
  assert.equal(aux,exp,"Retrieving first iterable of second child of parent");
  assert.equal(aux.item.attr("id"),exp.item.attr("id"),"First child of first child item id is the expected one");
  aux = render.getItemByIndex("1.1");
  exp = render.items[0].children[1][1];
  assert.equal(aux,exp,"Retrieving second iterable of second child of parent");
  assert.equal(aux.item.attr("id"),exp.item.attr("id"),"First child of first child item id is the expected one");
  aux = render.getItemByIndex("1.2");
  exp = render.items[0].children[1][2];
  assert.equal(aux,exp,"Retrieving thirds iterable of first second of parent");
  assert.equal(aux.item.attr("id"),exp.item.attr("id"),"First child of first child item id is the expected one");
  
  assert.strictEqual(render.getItemByIndex("2"),null,"Retrieving unexisting second child of parent results in null");
  assert.strictEqual(render.getItemByIndex("0.1"),null,"Retrieving unexisting child of first child");
  assert.strictEqual(render.getItemByIndex("1.3"),null,"Retrieving unexisting indexed child of iterable second child");
  assert.strictEqual(render.getItemByIndex("1.0.0"),null,"Retrieving unexisting child of iterable second child");
});

QUnit.test("Render retrieval by combined index/key", function(assert) {
  var config = {
    "children": [{
      "render": Monominoes.renders.DIV,
      "config": {
        "key": "modal",
        "id": "modal-div",
        "children": [{
          "render": Monominoes.renders.DIV,
          "config": {
            "id": "modal-subdiv",
            "children": [{
              "render": Monominoes.renders.DIV,
              "config": {
                "id": "modal-subsubdiv",
                "children": [{
                  "render": Monominoes.renders.DIV,
                  "config": {
                    "key": "submodal",
                    "id": "modal-subsubsubdiv"
                  }
                }]
              }
            }]
          }
        }]
      }
    }]
  };
  
  var render = new Monominoes.renders.DIV(config).render({});
  var aux;
  
  assert.ok(Komunalne.util.isFunction(Monominoes.Render.prototype.inspectRender),"Function inspectRender exists");
  assert.strictEqual(render.inspectRender("fakekey"),null,"Non existing key");
  assert.ok((aux = render.inspectRender("modal")) != null,"Existing key");
  assert.equal(aux.id, "modal-div", "Correct render for existing key");
  assert.strictEqual(render.inspectRender("modal.1.key.2"),null,"Non existing sub index");
  assert.strictEqual(render.inspectRender("1"),null,"Non existing index");
  assert.ok((aux = render.inspectRender("modal.0.0")) != null,"Existing sub index");
  assert.equal(aux.id, "modal-subsubdiv", "Correct render for existing key");
  assert.strictEqual(render.inspectRender("modal.0.1"),null,"Non existing sub-index");
  assert.ok((aux = render.inspectRender("modal.0.0.submodal")) != null,"Existing sub key");
  assert.equal(aux.id, "modal-subsubsubdiv", "Correct render for existing key");
  assert.strictEqual(render.inspectRender("modal.0.0.submodal.fake"),null,"Non existing sub key");
  assert.strictEqual(render.inspectRender("modal.0.0.submodal.0"),null,"Non existing sub index for existing sub key");
});

QUnit.test("Tag renders default settings",function(assert) {
  var c,r,t;
  var clazz;
  var i = new Komunalne.helper.Iterator(Monominoes.tags);
  while(i.hasNext()) {
	i.next();
    c = Monominoes.renders[i.currentKey()];
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
});

QUnit.test("Tag render creation and property validation", function(assert) {
  var Render,instance,custom,item;
  var msg,defaultcss,data,aux;
  var i = new Komunalne.helper.Iterator(Monominoes.tags);
  var count = 0, show = 0;
  var fn;
  
  while(i.hasNext()) {
	i.next();
    Render = Monominoes.renders[i.currentKey()];
    msg = "Render Tag " + i.currentKey();
    defaultcss = "monominoes-" + i.currentKey().toLowerCase();
    
    custom = new Render({ "text": "Custom text", "def": { "class": "custom-class", "text": "Overriden" } }).render({});
    assert.strictEqual(custom.class,Render,"Class correctly set on " + msg);
    assert.strictEqual(custom.superclass,Monominoes.renders.TAG,msg + " superclass is TAG");
    assert.strictEqual(custom.tag,Monominoes.tags[i.currentKey()],"Tag object is assigned into tag for " + msg);
    assert.equal(custom.defaults.defaultcss,defaultcss,"Default class set in defaults for " + msg);
    assert.equal("monominoes-" + custom.tag.name,defaultcss,"Name set in tag object");
    assert.equal(custom.def.class,"custom-class","Custom class is assigned in " + msg);
    assert.ok(Komunalne.util.isArrayOf(custom.items,Monominoes.Item),"Items array is created for " + msg);
    item = custom.items[0];
    assert.ok(item.item.hasClass("custom-class"),"Custom class is assigned in custom object of " + msg);
    assert.equal(Komunalne.$.elementText(item.item),"Custom text","Text in config overrides the one in def for " + msg);
    
    fn = function(item) { 
      count++; 
      assert.ok(Monominoes.util.isRender(this),"Event handler scope is a render object for " + msg);
      assert.equal(this.name,i.currentKey(),"Event handler scope is a render object for " + msg);
      assert.ok(item,"Item object is passed as argument for " + msg);
      assert.ok(Komunalne.util.isInstanceOf(item,Monominoes.Item),"Item object is an instance of Item for " + msg);
      assert.equal(item.item.prop("tagName"),i.currentKey(),"Event tag is " + i.currentKey());
    };
    
    instance = Render({
      "extracss": "fake-css",
      "def": {
        "text": msg,
        "attrs": { "id": { "path": "id" } },
        "style": {
          "display": { "path": "show", "handler": function(render,target,data) { return (data || "none"); } },
          "color": function() { return "blue"; },
          "text-transform": "uppercase"
        },
        "events": { "click": fn }
      }
    });
    
    show = ((++show) % 2) === 0;
    show = show === false ? show : "block";
    data = { "id": "mono-" + count, "show": show };
    instance.render(data,"#test-div");
    
    assert.strictEqual(instance.class,Render,"Class correctly set on " + msg);
    assert.strictEqual(instance.superclass,Monominoes.renders.TAG,msg + " superclass is TAG");
    assert.strictEqual(instance.tag,Monominoes.tags[i.currentKey()],"Tag object is assigned into tag for " + msg);
    assert.equal(instance.defaults.defaultcss,defaultcss,"Default class is in defaults on " + msg);
    assert.ok(Komunalne.util.isArrayOf(instance.items,Monominoes.Item),"Items array is created for " + msg);
    item = instance.items[0];
    assert.ok(item.item.hasClass("fake-css"),"Custom class is assigned in instance of " + msg);
    assert.ok(item.item.hasClass(defaultcss),"Default class is assigned in instance of " + msg);
    assert.equal(Komunalne.$.elementText(item.item),msg,"Text is set and formatted in " + msg);
    assert.equal($("#"+data.id).length,1,msg + " exists in DOM");
    assert.equal(item.item.attr("id"),data.id,msg + " id is set correctly");
    assert.equal(item.item.css("display"),show === false ? "none" : "block",msg + " display is set according to rule");
    assert.equal(item.item.css("color"),"rgb(0, 0, 255)",msg + " color is set according to rule");
    assert.equal(item.item.css("text-transform"),"uppercase",msg + " text transform is set according to rule");
    
    if (i.currentKey().toUpperCase() != "OBJECT" && i.currentKey().toUpperCase() != "EMBED") { 
      aux = count;
      $("#"+data.id).click();
      assert.equal(count,aux+1,msg + " click event is dispatched correctly");
    }
    
    instance.clear();
    assert.ok(instance.items == null,"Item is removed after call to clear for " + msg);
    assert.ok(Komunalne.util.isArray(instance.layout.children),"Render layout remains set after clear for " + msg);
    assert.equal($("#" + data.id).length,0,"Rendered item doesn't exist in DOM after calling clear method for " + msg);
  }
});

QUnit.test("List render instantiation and customization", function(assert) {
  var list,item,li,child;
  var data = [1,2,3,4,5],config;
  var i,j;
  
  list = new Monominoes.renders.LIST().render(data);
  assert.ok(list,"List render is created");
  assert.ok(Monominoes.util.isRender(list),"Object created is a Render");
  assert.equal(list.items.length,1,"List has an unique parent item");
  assert.ok(Komunalne.util.isInstanceOf((item = list.items[0]),Monominoes.Item),"Item is created at the top of List");
  assert.ok(Monominoes.util.isRender(item.render,Monominoes.renders.LIST),"List render is not UL or OL");
  assert.equal(item.item.prop("tagName"),"UL","Default tag is unordered list (UL)");
  assert.equal(Komunalne.$.elementText(item.item),"","No text is assigned to parent tag");
  assert.strictEqual(list.marker,null,"Marker is not explicitly set");
  assert.equal(list.layout.children.length,1,"Immediate children layout is only 1 render");
  assert.ok(Monominoes.util.isRender(list.layout.children[0],Monominoes.renders.LI),"LI render is set for list children");
  assert.equal(list.layout.children[0].layout.children.length,0,"No children are set as defaults");
  i = new Komunalne.helper.Iterator(item.children[0]);
  assert.equal(i.length(),5,"Five LI items are set as per data");
  while (i.hasNext()) {
    li = i.next();
    j = i.currentKey();
    assert.ok(Monominoes.util.isRender(li.render,Monominoes.renders.LI),"LI render is set for item " + j);
    assert.equal(li.data,parseInt(j) + 1,"LI data is set for item " + j);
    assert.equal(li.container,item.item,"LI #" + j + " item is attached to List parent item");
    assert.equal(li.parent,item,"LI parent is set for item " + j);
    assert.equal(li.children.length,0,"No children are set for item " + j);
  }
  
  config = {
    "ordered": true,
    "itemsLayout": {
      "children": [
        { "render": Monominoes.renders.H1, "config": { "path": "header", "text": Monominoes.util.data } },
        { "render": Monominoes.renders.P, "config": { "path": "text", "text": Monominoes.util.data } }
      ],
      "def": {
        "class": "fake-css"
      }
    },
    "marker": "armenian",
    "text": "Title"
  };
  data = [
    { "id": 1, "header": "First",  "text": "Dictionary of the Khazars" },
    { "id": 2, "header": "Second", "text": "Imperium" },
    { "id": 3, "header": "Third",  "text": "The Hand of Good Fortune" }
  ];
  
  list = Monominoes.renders.LIST(config).render(data);
  assert.equal(list.items.length,1,"Custom list has an unique parent item");
  assert.ok(Komunalne.util.isInstanceOf((item = list.items[0]),Monominoes.Item),"Only 1 item at the top of custom list");
  assert.ok(Monominoes.util.isRender(item.render,Monominoes.renders.LIST),"Custom list render is not UL or OL");
  assert.equal(item.item.prop("tagName"),"OL","Custom list set as ordered");
  assert.equal(Komunalne.$.elementText(item.item),"Title","Explicit text is set for custom list parent item");
  assert.strictEqual(list.marker,"armenian","Armenian numbering is set for custom list");
  assert.equal(list.layout.children.length,1,"Immediate children layout is only 1 render for custom list");
  assert.ok(Monominoes.util.isRender(list.layout.children[0],Monominoes.renders.LI),"LI children are set in custom list");
  assert.equal(list.layout.children[0].layout.children.length,2,"Each LI will have two children");
  i = new Komunalne.helper.Iterator(item.children[0]);
  assert.equal(i.length(),3,"Three LI items are set as per data in custom list");
  while (i.hasNext()) {
    li = i.next();
    j = i.currentKey();
    assert.ok(Monominoes.util.isRender(li.render,Monominoes.renders.LI),"LI render is set for item " + j);
    assert.equal(li.data,data[j],"LI data is set for item " + j);
    assert.equal(li.container,item.item,"LI #" + j + " item is attached to List parent item");
    assert.equal(li.parent,item,"LI parent is set for item " + j);
    assert.equal(li.children.length,2,"Two children are set for item " + j);
    assert.ok(li.item.hasClass("fake-css"),"Custom class is assigned for item " + j);
    assert.equal(li.item.css("list-style-type"),"armenian","Armenian list style is set for item " + j);
    assert.equal(Komunalne.$.elementText(li.item),"","No text in LI item #" + j);
    child = li.children[0][0];
    assert.ok(Monominoes.util.isRender(child.render,Monominoes.renders.H1),"H1 first item render for item " + j);
    assert.equal(child.data,data[j].header,"Data is set for first item in LI #" + j);
    assert.equal(child.container,li.item,"First item is contained in LI item #" + j);
    assert.equal(child.parent,li,"First item parent is LI #" + j);
    assert.equal(child.children.length,0,"No children are set for first child in LI #" + j);
    assert.ok(child.item.hasClass("monominoes-h1"),"Default class is assigned for first child in LI #" + j);
    assert.equal(Komunalne.$.elementText(child.item),data[j].header,"Text is set on first item in LI #" + j);
    child = li.children[1][0];
    assert.ok(Monominoes.util.isRender(child.render,Monominoes.renders.P),"P second item render for item " + j);
    assert.equal(child.data,data[j].text,"Data is set for second item in LI #" + j);
    assert.equal(child.container,li.item,"Second item is contained in LI item #" + j);
    assert.equal(child.parent,li,"Second item parent is LI #" + j);
    assert.equal(child.children.length,0,"No children are set for second child in LI #" + j);
    assert.ok(child.item.hasClass("monominoes-p"),"Default class is assigned for first child in LI #" + j);
    assert.equal(Komunalne.$.elementText(child.item),data[j].text,"Text is set on first item in LI #" + j);
  }
});

QUnit.test("Image block render", function(assert) {
  var render,item,data,child,wait;
  var image = "res/1.jpg";
  
  render = new Monominoes.renders.IMAGE_BLOCK().render(image,"#test-div");
  assert.equal(render.items.length,1,"Unique parent item for Image Block");
  assert.equal((item = render.items[0]).item.prop("tagName"),"DIV","Parent item is a DIV");
  assert.equal(item.item.css("text-align"),"center","DIV text and items are centered");
  assert.ok(Monominoes.util.isRender(item.render,Monominoes.renders.IMAGE_BLOCK),"Parent render is IMAGE_BLOCK");
  assert.equal(Komunalne.$.elementText(item.item),"","No text is assigned to tag");
  assert.equal(render.layout.children.length,2,"Two children renders are set");
  assert.ok(Monominoes.util.isRender(render.layout.children[0],Monominoes.renders.SPAN),"First child render is SPAN");
  assert.equal(render.layout.children[0].layout.children.length,0,"No children are set on first child");
  assert.ok(Monominoes.util.isRender(render.layout.children[1],Monominoes.renders.IMG),"Second child render is IMG");
  assert.equal(render.layout.children[1].layout.children.length,0,"No children are set on second child");
  assert.ok((child = item.children[0][0]).item.hasClass("monominoes-spanimgblock"),"SPAN class is set");
  assert.equal(child.item.prop("tagName"),"SPAN","First child item is a SPAN tag");
  assert.equal(child.item.css("vertical-align"),"middle","SPAN is vertically centered");
  assert.ok((child = item.children[1][0]).item.hasClass("monominoes-imgblock"),"IMG class is set");
  assert.equal(child.item.prop("tagName"),"IMG","Second child item is an IMG tag");
  assert.equal(child.item.attr("src"),image,"Image source is correctly set");
  assert.equal(child.item.css("vertical-align"),"middle","IMG is vertically centered");
  
  render.clear();
  config = { "sourceDir": "res", "extension": "jpg", 
             "def": { "style": { "border": "4px solid red", "height": "200px" } } };
  render = new Monominoes.renders.IMAGE_BLOCK(config).render(2,"#test-div");
  assert.equal(Komunalne.$.elementText((item = render.items[0]).item),"","No text is assigned to tag");
  assert.equal(item.item.css("border-top-width"),"4px","DIV border is set");
  assert.equal(item.item.css("border-top-style"),"solid","DIV border is set");
  assert.equal(item.item.css("border-top-color"),"rgb(255, 0, 0)","DIV border is set");
  assert.equal(render.layout.children.length,2,"Two children renders are set");
  assert.ok(Monominoes.util.isRender(render.layout.children[0],Monominoes.renders.SPAN),"First child render is SPAN");
  assert.equal(render.layout.children[0].layout.children.length,0,"No children are set on first child");
  assert.ok(Monominoes.util.isRender(render.layout.children[1],Monominoes.renders.IMG),"Second child render is IMG");
  assert.equal(render.layout.children[1].layout.children.length,0,"No children are set on second child");
  assert.ok((child = item.children[0][0]).item.hasClass("monominoes-spanimgblock"),"SPAN class is set");
  assert.equal(child.item.prop("tagName"),"SPAN","First child item is a SPAN tag");
  assert.equal(child.item.css("vertical-align"),"middle","SPAN is vertically centered");
  assert.ok((child = item.children[1][0]).item.hasClass("monominoes-imgblock"),"IMG class is set");
  assert.equal(child.item.prop("tagName"),"IMG","Second child item is an IMG tag");
  assert.equal(child.item.attr("src"),"res/2.jpg","Image source is correctly set");
  assert.equal(child.item.css("vertical-align"),"middle","IMG is vertically centered");
  
  render.clear();
  config = { "sourceDir": "res", "extension": "jpg", 
             "def": { "style": { "border": "4px solid red", "height": "200px" } } };
  render = new Monominoes.renders.IMAGE_BLOCK(config).render(2,"#test-div");
  assert.equal(Komunalne.$.elementText((item = render.items[0]).item),"","No text is assigned to tag");
  assert.equal(item.item.css("border-top-width"),"4px","DIV border is set");
  assert.equal(item.item.css("border-top-style"),"solid","DIV border is set");
  assert.equal(item.item.css("border-top-color"),"rgb(255, 0, 0)","DIV border is set");
  assert.equal(render.layout.children.length,2,"Two children renders are set");
  assert.ok(Monominoes.util.isRender(render.layout.children[0],Monominoes.renders.SPAN),"First child render is SPAN");
  assert.equal(render.layout.children[0].layout.children.length,0,"No children are set on first child");
  assert.ok(Monominoes.util.isRender(render.layout.children[1],Monominoes.renders.IMG),"Second child render is IMG");
  assert.equal(render.layout.children[1].layout.children.length,0,"No children are set on second child");
  assert.ok((child = item.children[0][0]).item.hasClass("monominoes-spanimgblock"),"SPAN class is set");
  assert.equal(child.item.prop("tagName"),"SPAN","First child item is a SPAN tag");
  assert.equal(child.item.css("vertical-align"),"middle","SPAN is vertically centered");
  assert.ok((child = item.children[1][0]).item.hasClass("monominoes-imgblock"),"IMG class is set");
  assert.equal(child.item.prop("tagName"),"IMG","Second child item is an IMG tag");
  assert.equal(child.item.attr("src"),"res/2.jpg","Image source is correctly set");
  assert.equal(child.item.css("vertical-align"),"middle","IMG is vertically centered");
  
  render.clear();
  wait = assert.async();
  config = { 
    "align": "left",
    "valign": "bottom",
    "defaultImg": "res/1.jpg",
    "sourceDir": "res",
    "extension": "jpg",
    "def": { 
      "style": { "border": "4px solid", "height": "200px" }
    },
    "errorHandler": function(img) {
      var val = this.defaults.errorHandler(img);
      assert.strictEqual(child.item.attr("src"),"res/1.jpg","Image src updated after fail");
      render.clear();
      wait();
    }
  };
  render = new Monominoes.renders.IMAGE_BLOCK(config).render(3,"#test-div");
  assert.equal(Komunalne.$.elementText((item = render.items[0]).item),"","No text is assigned to tag");
  assert.equal(render.defaultImg,"res/1.jpg","Default img is set on render");
  assert.equal(item.item.css("text-align"),"left","DIV text and items are left aligned");
  assert.ok((child = item.children[0][0]).item.hasClass("monominoes-spanimgblock"),"SPAN class is set");
  assert.equal(child.item.prop("tagName"),"SPAN","First child item is a SPAN tag");
  assert.equal(child.item.css("vertical-align"),"bottom","SPAN is vertically on bottom");
  assert.ok((child = item.children[1][0]).item.hasClass("monominoes-imgblock"),"IMG class is set");
  assert.equal(child.item.prop("tagName"),"IMG","Second child item is an IMG tag");
  assert.equal(child.item.attr("src"),"res/3.jpg","Image source is correctly set");
  assert.equal(child.item.css("vertical-align"),"bottom","IMG is vertically on bottom");
});

QUnit.test("Text block test", function(assert) {
  var render,config,item;
  
  render = new Monominoes.renders.TEXT_BLOCK().render("test","#test-div");
  assert.equal(render.items.length,1,"Unique parent item for Text Block");
  assert.equal((item = render.items[0]).item.prop("tagName"),"SPAN","Parent item is a SPAN");
  assert.ok(Monominoes.util.isRender(item.render,Monominoes.renders.TEXT_BLOCK),"Parent render is TEXT_BLOCK");
  assert.equal(Komunalne.$.elementText(item.item),"test","Text is assigned to tag");
  assert.equal(render.layout.children.length,0,"No children renders are set");
  assert.ok(item.item.hasClass("monominoes-text-block"),"Default class for text block is set");
  assert.ok(item.item.css("font-weight") == "bold" || item.item.css("font-weight") == "700","Font is set as bold");
  assert.equal(item.item.css("text-align"),"center","SPAN text and items are centered");
  assert.equal(item.item.css("padding-top"),"8px","Vertical pad is set as default");
  assert.equal(item.item.css("padding-left"),"10px","Horizontal pad is set as default");
  render.clear();
  
  config = { 
    "fontcolor": "#ffff66", "background": "#006600", "bold": false,
    "text": Monominoes.util.property("data")
  };
  render = new Monominoes.renders.TEXT_BLOCK(config).render({ "data": "Other test" },"#test-div");
  assert.equal(Komunalne.$.elementText((item = render.items[0]).item),"Other test","Text is assigned to tag");
  assert.equal(render.layout.children.length,0,"No children renders are set");
  assert.ok(item.item.hasClass("monominoes-text-block"),"Default class for text block is set");
  assert.equal(item.item.css("color"),"rgb(255, 255, 102)","Color is set as yellow");
  assert.equal(item.item.css("background-color"),"rgb(0, 102, 0)","Background color is set as dark green");
  assert.equal(item.item.css("font-weight"),"400","Font is set as bold");
  assert.equal(item.item.css("text-align"),"center","SPAN text and items are centered");
  render.clear();
});

QUnit.test("YouTube video render", function(assert) {
  var render,url,item,config;
  url = "https://www.youtube.com/watch?v=ihh4QPkbX9w";
  render = new Monominoes.renders.YOUTUBE().render(url,"#test-div");
  assert.equal(render.items.length,1,"Unique parent item for Text Block");
  assert.equal((item = render.items[0]).item.prop("tagName"),"IFRAME","Parent item is an IFRAME");
  assert.ok(Monominoes.util.isRender(item.render,Monominoes.renders.YOUTUBE),"Parent render is YOUTUBE");
  assert.equal(Komunalne.$.elementText(item.item),"","Text is empty");
  assert.equal(render.layout.children.length,0,"No children renders are set");
  assert.ok(item.item.hasClass("monominoes-iframe"),"Default class for text block is set");
  assert.equal(item.item.attr("width"),"480","Width is set as defaults");
  assert.equal(item.item.attr("height"),"360","Height is set as defaults");
  assert.equal(item.item.attr("src"),"http://www.youtube.com/embed/ihh4QPkbX9w","Iframe URL is set");
  render.clear();
  
  url = "http://www.youtube.com/embed/ihh4QPkbX9w";
  config = { "width": 240, "height": 180 };
  render = new Monominoes.renders.YOUTUBE(config).render(url,"#test-div");
  assert.equal((item = render.items[0]).item.attr("width"),"240","Width is set as in config");
  assert.equal(item.item.attr("height"),"180","Height is set as in config");
  assert.equal(item.item.attr("src"),url,"Iframe URL is set");
  render.clear();
});
