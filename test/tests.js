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