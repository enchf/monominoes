var showSample = function(event) {
  var a = $(event.target);
  var item = a.data("item");
  var div = $("#place-sample");
  
  div.empty();
  Monominoes.build({
    "target": "place-sample",
    "data": item.data,
    "layout": item.layout
  });
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