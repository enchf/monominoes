Monominoes.bs.MODAL = Monominoes.renders.DIV.extend({
  "name": "BOOTSTRAP_MODAL",
  "cell": null, // Layout to be applied to the modal content.
  "defaultcss": "modal fade",
  "size": "",
  "footer": null, // Layout to be applied to the modal footer.
  "title": "", // Modal window header title.
  "show": function(data,target) {
    var container = null;
    if (this.isBuilt()) {
      container = this.items[0].container;
      this.clear();
    }
    this.render(data,target || container);
    this.items[0].item.modal('show');
  },
  "buildLayout": function() {
    var size;
    var children;
    
    this.config.def = this.config.def || {};
    this.config.def.attrs = this.config.def.attrs || {};
    this.config.def.attrs.tabindex = -1;
    this.config.def.attrs.role = "dialog";
    
    size = Komunalne.util.arrayContains(this.size,["sm","lg"]) ? "modal-" + this.size : "";
    
    this.headers = [];
    this.headers.push({
      "render": Monominoes.renders.BUTTON,
      "config": {
        "def": {
          "class": "close",
          "attrs": {
            "type": "button",
            "data-dismiss": "modal",
            "aria-label": "×",
          },
        },
        "children": [{
          "render": Monominoes.renders.SPAN,
          "config": {
            "text": "×",
            "def": { "attrs": { "aria-hidden": "true" } }
          }
        }]
      }
    });
    if (this.title) {
      this.headers.push({
        "render": Monominoes.renders.H4,
        "config": {
          "def": { "class": "modal-title" },
          "text": this.title
        }
      });
    }
    
    children = [{
      "render": Monominoes.renders.DIV,
      "config": {
        "def": { "class": "modal-header" },
        "children": this.headers
      }
    },{
      "render": Monominoes.renders.DIV,
      "config": {
        "def": { "class": "modal-body" },
        "children": Komunalne.util.isArray(this.cell) ? this.cell : [ this.cell ]
      }
    }];
    
    if (this.footer) {
      this.children.push({
        "render": Monominoes.renders.DIV,
        "config": {
          "def": { "class": "modal-footer" },
          "children": Komunalne.util.isArray(this.footer) ? this.footer : [ this.footer ]
        }
      });
    }
    
    this.config.children = [{
      "render": Monominoes.renders.DIV,
      "config": {
        "def": { "class": Komunalne.util.append("modal-dialog",size) },
        "children": [{
          "render": Monominoes.renders.DIV,
          "config": {
            "def": { "class": "modal-content" },
            "children": children
          }
        }]
      }
    }];
    this.super.buildLayout();
  }
});

Monominoes.bs.DROPDOWN = Monominoes.renders.DIV.extend({
  "name": "BOOTSTRAP_DROPDOWN",
  "id": "",    // Dropdown id.
  "label": "", // Dropwdown label.
  "labelProperty": "", // Label property to place in the dropdown list for each of the elements.
  "selectHandler": null, // Function to be executed when an element is selected.
  "selected": null, // Item selected.
  "buildLayout": function() {
    this.config.children = [{
      "render": Monominoes.renders.BUTTON,
      "config": {
        "def": {
          "class": "btn btn-default dropdown-toggle",
          "attrs": { 
            "type": "button", "id": this.id, "data-toggle": "dropdown", 
            "aria-haspopup": true, "aria-expanded": true
          }
        },
        "children": [ new Monominoes.renders.SPAN({ "def": { "class": "caret" } }) ],
        "text": this.label
      }
    },{
      "render": Monominoes.renders.LIST,
      "config": {
        "def": { 
          "class": "dropdown-menu",
          "attrs": { "aria-labelledby": this.id }
        },
        "itemsLayout": {
          "children": [{
            "render": Monominoes.renders.A,
            "config": {
              "text": Monominoes.util.property(this.labelProperty),
              "def": { 
                "attrs": { "href": "#" },
                "events": {
                  "click": function(item,event) {
                    this.getBaseRender().selected = item;
                  }
                }
              }
            }
          }]
        }
      }
    }];
    this.super.buildLayout();
  }
});
