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

QUnit.test("Currency formatter", function(assert) {
  // Testing Integers.
  assert.equal(MonoUtils.currency(1),"1.00","Testing integer");
  assert.equal(MonoUtils.currency(0),"0.00","Testing integer with 0");
  assert.equal(MonoUtils.currency(666),"666.00","Testing integer with 3 digits");
  assert.equal(MonoUtils.currency(1010),"1,010.00","Testing integer greater than 1000");
  assert.equal(MonoUtils.currency(123456789012),"123,456,789,012.00","Testing big integer");
  assert.equal(MonoUtils.currency(12345),"12,345.00","Testing integer with 5 digits");
  assert.equal(MonoUtils.currency(-0),"0.00","Testing -0");
  assert.equal(MonoUtils.currency(-1),"-1.00","Testing negative digit");
  assert.equal(MonoUtils.currency(-123),"-123.00","Testing negative with 3 digits");
  assert.equal(MonoUtils.currency(-12345),"-12,345.00","Testing negative with 5 digits");
  assert.equal(MonoUtils.currency(-123456789012),"-123,456,789,012.00", "Testing big negative");
  // Testing floats.
  assert.equal(MonoUtils.currency(1.23),"1.23","Testing float");
  assert.equal(MonoUtils.currency(0.01),"0.01","Testing float between 0 and 1");
  assert.equal(MonoUtils.currency(-12.34),"-12.34","Testing negative float");
  assert.equal(MonoUtils.currency(-12345678.901234),"-12,345,678.90","Testing big negative float");
  assert.equal(MonoUtils.currency(1.235),"1.24","Testing rounding up");
  assert.equal(MonoUtils.currency(1.234),"1.23","Testing rounding down");
  assert.equal(MonoUtils.currency(1.2),"1.20","Testing padding zeros");
  assert.equal(MonoUtils.currency(1.999),"2.00","Testing complex rounding up");
  assert.equal(MonoUtils.currency(-1.999),"-2.00","Testing negative complex round");
  // Testing formatter changing default parameters.
  assert.equal(MonoUtils.currency(1.234444,3),"1.234","Testing 3 decimals round down");
  assert.equal(MonoUtils.currency(1.234567,4),"1.2346","Testing 4 decimals round up");
  assert.equal(MonoUtils.currency(0.000001,3),"0.000","Testing round down to 0");
  assert.equal(MonoUtils.currency(1.2,6),"1.200000","Testing padding zeros");
  assert.equal(MonoUtils.currency(1.20019001,4),"1.2002","Testing 4 decimals round up");
  assert.equal(MonoUtils.currency(1.23,3,"@"),"1@230","Testing changing decimal separator");
  assert.equal(MonoUtils.currency(12345.567,2,"-","="),"12=345-57","Testing changing both decimal and thousands separators");
  assert.equal(MonoUtils.currency(12345.6543,2,"$%&","--"),"12--345$%&65","Lenght > 1 separators");
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
