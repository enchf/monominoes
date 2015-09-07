var showSample = function(event) {
  var a = $(event.target);
  var item = a.data("item");
  var div = $("#place-sample");
  var layout = MonoUtils.clone(item.layout);
  
  layout["source-path"] = "data";
  layout.elements.push({
    "absolute": true,
    "cols": 2,
    "path": "",
    "properties": ["layout","data"],
    "elements": [{
      "path": "",
      "render": Monominoes.renders.CODE({
        "formatter": function(item) {
          return JSON.stringify(item,null,2);
        },
      })
    }]
  });
  
  div.empty();
  Monominoes.build({
    "target": "place-sample",
    "data": item,
    "layout": layout
  });
    
  SyntaxHighlighter.all();
};

$(function() {
  var dropdown;
  dropdown = $("#dropdown-ul");

  for (var x in DATA.samples) {
    var li = Monominoes.renders.LI().render("",dropdown);
    var item = DATA.samples[x];
    var text = MonoUtils.capitalize(item.id) + " Sample";
    Monominoes.renders.A({
      "click": showSample,
    }).render(text,li).data("item",item);
  }
});