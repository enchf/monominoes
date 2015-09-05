var showSample = function(event) {
  var a = $(event.target);
  var item = a.data("item");
  var div = $("#place-sample");
  
  div.empty();
  $.getJSON(item.id + ".json", function(cfg) {
    Monominoes.build({
      "target": "place-sample",
      "data": cfg.data,
      "layout": cfg.layout
    });
  });
};

$(function() {
  //<li><a href="#">Action</a></li>
  $.getJSON("samples.json", function(data) {
    var dropdown;
    
    dropdown = $("#dropdown-ul");
    $.samples = data;
    
    for (var x in data.samples) {
      var li = Monominoes.renders.LI().render("",dropdown);
      var item = data.samples[x];
      Monominoes.renders.A({
        "click": showSample
      }).render(item,li).data("item",item);
    }
  });
});