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
