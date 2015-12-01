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
  "cols": null, // Number of columns. Can be a number or an object of the form { "number": 1, "size": "sm" },
                // to specify minimum grid size. Default values are sm for size and 1 for cols.
  "cell": null, // Configuration object for each of the items of the grid.
  "gridcss": null, // Special configuration for grid rows and cols in the form { "cols": "...", "rows": "..." }.
  "buildLayout": function() {
    var cols,size;
    this.gridcss = (this.gridcss || {});
    
    size = Komunalne.util.path(this.cols,"size") || "sm";
    size = Komunalne.util.isAnyOf(size,"lg","md","sm","xs") ? size : "sm";
    cols = Komunalne.util.isInstanceOf(this.cols,"number") ? this.cols : Komunalne.util.path(this.cols,"num") || 1;
    cols = (cols > 0 && cols < 13) ? parseInt(cols) : 1;
    
    this.cols = cols;
    this.size = size;
    this.cell = this.cell || {};
    this.cell.def = this.cell.def || {};
    // TODO Fix to allow non multiple of 12 columns.
    this.cell.def.class = Monominoes.util.format("col-{0}-{1}",this.size,(12/this.cols));
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