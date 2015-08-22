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

QUnit.test( "Monominoes Arguments", function( assert ) {
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