/**
 * Font Awesome renders testing.
 */
QUnit.test("Font Awesome renders", function(assert) {
  var render;
  var i = new Komunalne.helper.Iterator(["ICON"]);
  var key;
  
  assert.ok(Monominoes.fa,"Monominoes fa container defined");
  while (i.hasNext()) {
    key = i.next();
    render = new Monominoes.fa[key]()
    assert.ok(Monominoes.util.isRender(Monominoes.fa[key]),key + " render constructor against isRender test");
    assert.ok(Monominoes.util.isRender(render),key + " render instance against isRender test");
    assert.notOk(Monominoes.util.isRenderInstance(Monominoes.fa[key]),key + " constructor against isRenderInstance test");
    assert.ok(Monominoes.util.isRenderInstance(render),key + " render instance against isRenderInstance test");
  }
  
  render = new Monominoes.fa.ICON().render("camera-retro","#test-div");
  assert.equal(render.items.length,1,"Unique parent item for FA icon");
  assert.equal((item = render.items[0]).item.prop("tagName"),"I","FA icon item is an I");
  assert.ok(Monominoes.util.isRender(item.render,Monominoes.fa.ICON),"FA icon render is M.fa.ICON");
  assert.equal(Komunalne.$.elementText(item.item),"","Text tag is empty");
  assert.equal(render.layout.children.length,0,"No children renders are set");
  assert.ok(item.item.hasClass("fa"),"FA icon classes contains fa");
  assert.ok(item.item.hasClass("fa-camera-retro"),"FA icon classes contains the rendered icon");
  render.clear();
  
  config = {
    "iterable": true,
    "icon": { "path": "icon" },
    "size": "5x",
    "fixed-width": true,
    "border": true,
    "pull": "left",
    "animated": function(render,data) { return data.animation; },
    "flip": "vertical",
    "rotate": "180",
    "color": Monominoes.util.property("color"),
    "background": "black"
  };
  data = [
    { "color": "red", "icon": "cog", "rgb": "rgb(255, 0, 0)", "animation": "spin" },
    { "color": "white", "icon": "refresh", "rgb": "rgb(255, 255, 255)", "animation": "pulse" }
  ];
  render = new Monominoes.fa.ICON(config).render(data,"#test-div");
  assert.equal(render.items.length,2,"Two elements for FA icon iterable");
  for (var i = 0; i < 2; i++) {
    assert.equal(Komunalne.$.elementText((item = render.items[i]).item),"","Text tag is empty");
    assert.equal(render.layout.children.length,0,"No children renders are set");
    assert.ok(item.item.hasClass("fa"),"FA icon classes contains fa");
    assert.ok(item.item.hasClass("fa-"+data[i].icon),"FA icon for item " + i);
    assert.ok(item.item.hasClass("fa-5x"),"FA icon size set for item " + i);
    assert.ok(item.item.hasClass("fa-fw"),"FA icon fixed width for item " + i);
    assert.ok(item.item.hasClass("fa-border"),"FA icon border set for item " + i);
    assert.ok(item.item.hasClass("fa-pull-left"),"FA icon left alignment for item " + i);
    assert.ok(item.item.hasClass("fa-"+data[i].animation),"FA icon animation is set for item " + i);
    assert.ok(item.item.hasClass("fa-flip-vertical"),"FA icon flip set for item " + i);
    assert.ok(item.item.hasClass("fa-rotate-180"),"FA icon rotation set for item " + i);
    assert.equal(item.item.css("color"),data[i].rgb,"FA icon color for item " + i);
    assert.equal(item.item.css("background-color"),"rgb(0, 0, 0)","FA icon background color for item " + i);
  }
  render.clear();
});