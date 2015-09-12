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
        "language": "json",
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
  
  $('pre').each(function(i, block) {
    hljs.highlightBlock(block);
  });
};

$(function() {
  Monominoes.renders.DROPDOWN({
    "btn-class": "btn-primary",
    "placeholder": "Monominoes Samples",
    "id": "samples",
    "formatter": function(item) { return MonoUtils.capitalize(item.id) + " Sample"; },
    "item-click": showSample,
    "datakey": "item",
  }).render(DATA.samples,$("#samples-title"));
});