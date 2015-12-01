/**
 * Bootstrap renders testing.
 */
QUnit.test("General Bootstrap test", function(assert) {
  var i,R,key;
  
  assert.ok(Monominoes.bs,"Monominoes Bootstrap container defined");
  i = new Komunalne.helper.Iterator(Monominoes.bs);
  while (i.hasNext()) {
    R = i.next();
    key = i.currentKey();
    render = new R();
    assert.ok(Monominoes.util.isRender(R),key + " render constructor against isRender test");
    assert.ok(Monominoes.util.isRender(render),key + " render instance against isRender test");
    assert.notOk(Monominoes.util.isRenderInstance(R),key + " constructor against isRenderInstance test");
    assert.ok(Monominoes.util.isRenderInstance(render),key + " render instance against isRenderInstance test");
  }
});

QUnit.test("Bootstrap Grid System", function(assert) {
  var render;
  var about = {
    "path": "data",
    "children": [{ 
      "render": M.bs.GRID, 
      "config": {
        "cols": { "num": 4, "size": "sm" },
        "cell": {
          "def": {
            "attrs": { "data-content": M.util.property("content") }
          },
          "children": [{
            "render": M.renders.DIV,
            "config": { 
              "def": { "class": "text-center" }, 
              "path": "icon", 
              "children": [{ "render": M.fa.ICON, "size": "5x" }] 
            }
          },{
            "render": M.renders.P,
            "config": {
              "def": { "class": "text-center" },
              "path": "name",
              "text": M.util.data
            }
          }]
        }
      }
    },{
      "render": M.renders.P,
      "config": {
        "key": "message",
        "def": { "class": "text-center" }
      }
    }]
  };
  
  aboutData = { 
    "data": [
      { "icon": "industry", "name": "A", "content": "First" },
      { "icon": "cogs", "name": "B", "content": "Second" },
      { "icon": "star-o", "name": "C", "content": "Third" },
      { "icon": "line-chart", "name": "D", "content": "Fourth" }
    ]
  };
  
  render = new Monominoes.renders.DIV(about).render(aboutData,"#test-div");
  assert.ok(Monominoes.util.isRenderInstance(render),"Bootstrap Grid instance is a render");
  render.clear();
});
