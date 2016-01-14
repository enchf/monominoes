var genericData = {
  "title": "...",
  "subtitle": "...",
  "categories": [{
    "id": "#",
    "name": "...",
    "items": [
      { "id": "#", "name": "...", "desc": "..." },
      { "id": "#", "name": "...", "desc": "..." } //, ...
    ]
  }] //, { ...
};  

QUnit.test("Monominoes Arguments", function(assert) {
  var cfg = {
    "target": "test-div",
    "data": genericData,
    "layout": {}
  };
  var m = Monominoes.build(cfg);
  
  assert.ok(m.div, "Div object created");
  assert.ok(m.target == cfg.target, "Target correctly applied");
  assert.ok(m.data, "Data copied");
  assert.ok(m.layout, "Layout copied");
});

QUnit.test("Init Function", function(assert) {
  assert.ok(Monominoes.tags.H2 === "h2", "Tags settings");
  assert.equal(typeof new Monominoes().source,"function", "Prototype created");
});

QUnit.test("Path static method", function(assert) {
  var obj = { "a": 1, "b": [1,2,3], "c": "str", "d": { "e": "e", "f": { "g": false }, "h": true }, "i": -1 };
  assert.strictEqual(MonoUtils.path(obj,"a"), 1, "Test simple path ['a']");
  assert.strictEqual(MonoUtils.path(obj,"d.e"), "e", "Test one depth ['d.e']");
  assert.strictEqual(MonoUtils.path(obj,"d.f.g"), false, "Test two depth ['d.f.g']");
  assert.strictEqual(MonoUtils.path(obj,"d.i.f"), null, "Test unreachable path === null");
  assert.strictEqual(MonoUtils.path(obj,"a.b"), null, "Test try to go deep into a non object");
});

QUnit.test("Overwrite function", function(assert) {
  var fn = function() { return { a:1,b:"2",c:false,d:[] }; };
  var ob = function() { return { b:"3",e:{},c:true }; };
  var a,b;
  
  MonoUtils.overwrite((a=fn()),(b=ob()));
  assert.equal(a.a,1,"Test no overwrite of attrs not set in src");
  assert.equal(a.b,"2","Test no overwrite existing attrs in safe mode");
  assert.equal(b.b,"3","Test no overwrite on src");
  assert.propEqual(a.e,{},"Test overwrite non-existing attrs in safe mode");
  
  MonoUtils.overwrite((a=fn()),(b=ob()),false);
  assert.equal(a.a,1,"Test no overwrite of attrs not set in src");
  assert.equal(a.b,"3","Test overwrite existing attrs in unsafe mode");
  assert.equal(b.b,"3","Test no overwrite on src in unsafe mode");
  assert.propEqual(a.e,{},"Test overwrite non-existing attrs in unsafe mode");
});

QUnit.test("Test for isIterable", function(assert) {
  assert.ok(MonoUtils.isIterable({}),"Object is iterable");
  assert.ok(MonoUtils.isIterable([]),"Array is iterable");
  assert.notOk(MonoUtils.isIterable(null),"Null is not iterable");
  assert.notOk(MonoUtils.isIterable(undefined),"Undefined is not iterable");
  assert.notOk(MonoUtils.isIterable(),"Non defined arguments are not iterable");
  assert.notOk(MonoUtils.isIterable("String"),"String is required to be not iterable");
  assert.notOk(MonoUtils.isIterable(1),"Number is not iterable");
  assert.notOk(MonoUtils.isIterable(true),"True is not iterable");
  assert.notOk(MonoUtils.isIterable(false),"False is not iterable");
  assert.notOk(MonoUtils.isIterable(new Date()),"Date is not iterable");
});

QUnit.test("Test for isArray", function(assert) {
  assert.ok(MonoUtils.isArray([]),"Array is an array");
  assert.notOk(MonoUtils.isArray({}),"Object is not an array");
  assert.notOk(MonoUtils.isArray(null),"Null is not an array");
  assert.notOk(MonoUtils.isArray(undefined),"Undefined is not an array");
  assert.notOk(MonoUtils.isArray(),"Non defined arguments are not an array");
  assert.notOk(MonoUtils.isArray("String"),"String is required to be not an array");
  assert.notOk(MonoUtils.isArray(1),"Number is not an array");
  assert.notOk(MonoUtils.isArray(true),"True is not an array");
  assert.notOk(MonoUtils.isArray(false),"False is not an array");
  assert.notOk(MonoUtils.isArray(new Date()),"Date is not an array");
});

QUnit.test("Clone function", function(assert) {
  var aux,tmp,obj;
  assert.strictEqual(MonoUtils.clone(),undefined,"Non defined args are cloned as undefined");
  assert.strictEqual(MonoUtils.clone(undefined),undefined,"Undefined is cloned as undefined");
  assert.strictEqual(MonoUtils.clone(null),null,"Null is cloned as null");
  assert.strictEqual(MonoUtils.clone(1),1,"Number are returned itselfs");
  assert.strictEqual(MonoUtils.clone(true),true,"True is returned as true");
  assert.strictEqual(MonoUtils.clone(false),false,"False is returned as false");
  assert.strictEqual(MonoUtils.clone("String"),"String","String is returned as string");
  assert.strictEqual(MonoUtils.clone((aux = new Date())),aux,"Date is returned itself");
  assert.deepEqual(MonoUtils.clone([]),[],"Empty array returned as empty");
  assert.deepEqual(MonoUtils.clone({}),{},"Empty object returned as empty");
  
  aux = [1,2,3,4];
  assert.deepEqual(MonoUtils.clone(aux),(tmp=[1,2,3,4]),"Cloning array");
  aux.push(5);
  assert.ok(tmp.length==4,"Modifying original object does not affect cloned one");
  assert.deepEqual(tmp,[1,2,3,4],"Modifying original object does not affect cloned one");
  tmp.push(6);
  tmp.push(7);
  assert.ok(aux.length==5,"Modifying cloned object does not affect original one");
  assert.deepEqual(aux,[1,2,3,4,5],"Modifying cloned object does not affect original one");
  
  aux = {a:1,b:false,c:[1,2,3],d:{x:1,y:"string"},e:null,f:{}};
  obj = {a:1,b:false,c:[1,2,3],d:{x:1,y:"string"},e:null,f:{}};
  assert.deepEqual(MonoUtils.clone(aux),(tmp={a:1,b:false,c:[1,2,3],d:{x:1,y:"string"},e:null,f:{}}),"Cloning object");
  aux.g = {};
  aux.h = 0;
  assert.ok(tmp.g === undefined,"Modifying original object does not affect cloned one");
  assert.deepEqual(tmp,obj,"Modifying original object does not affect cloned one");
  tmp.a = 2;
  tmp.b = true;
  obj.g = {};
  obj.h = 0;
  assert.equal(aux.a,1,"Modifying cloned object does not affect original one");
  assert.equal(aux.b,false,"Modifying cloned object does not affect original one");
  assert.deepEqual(aux,obj,"Modifying cloned object does not affect original one");
  tmp.c.push(4);
  assert.ok(aux.c.length,3,"Modifying cloned object does not affect original one");
  assert.deepEqual(aux.c,[1,2,3],"Modifying cloned object does not affect original one");
});
