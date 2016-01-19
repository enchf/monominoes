/**
 * Bootstrap renders.
 * Contained in a new package.
 */
Monominoes.bs = {};

/**
 * Grid system first draft.
 * Pending adding offsets and more advanced configurations.
 */
Monominoes.bs.GRID = Monominoes.renders.DIV.extend({
  "name": "BOOTSTRAP_GRID",
  "defaultcss": "container",
  "grid": null, // Object with rules according to number of columns per screen size.
  "cell": null, // Configuration object for each of the items of the grid.
  "gridcss": null, // Special configuration for grid rows and cols in the form { "cols": "...", "rows": "..." }.
  "buildGridSystem": function() {
    var sizes = ["lg","md","sm","xs"];
    var clazz = "";
    var config = this.grid;
    var max = 1;
    sizes.forEach(function(size) {
      var val = Math.abs(parseInt(config[size]));
      if (!isNaN(val)) {
        // TODO Fix to allow non multiple of 12 columns.
        val = val % 12;
        if (val == 0) val = 12;
        clazz = Komunalne.util.append(clazz,Monominoes.util.format("col-{0}-{1}",size,(12/val)));
        if (val > max) max = val;
      }
    });
    this.cols = max;
    return (clazz != "") ? clazz : "col-lg-1";
  },
  "buildLayout": function() {
    this.gridcss = (this.gridcss || {});
    this.grid = this.grid || { "lg": 1 };
    this.cell = this.cell || {};
    this.cell.def = this.cell.def || {};
    this.cell.def.class = this.buildGridSystem();
    this.cell.extracss = this.gridcss.cols || "";
    this.cell.iterable = true;
    this.cell.key = "col";
    
    this.config.children = [{
      "render": Monominoes.renders.DIV,
      "config": {
        "key": "row",
        "def": { "class": "row" },
        "extracss": (this.gridcss.rows || ""),
        "iterable": true,
        "children": [{
          "render": Monominoes.renders.DIV,
          "config": this.cell 
        }]
      }
    }]
    this.super.buildLayout();
  },
  "extractData": function(data) {
    var aux,i;
    data = this.super.extractData(data);
    data = Komunalne.util.isArray ? data : [data];
    aux = [];
    i = 0;
    while (i < data.length) {
      aux.push(data.slice(i,i+this.cols));
      i += this.cols;
    }
    return aux;
  }
});