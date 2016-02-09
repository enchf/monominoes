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
  "placeholder": "", // Dropwdown placeholder.
  "options": null, // Explicit set of options.
  "labelProperty": Monominoes.util.data, // Label property to place in the dropdown list for each of the elements.
  "valueProperty": Monominoes.util.data, // Property to be used as value in the form, through the underlying hidden input.
  "fieldName": "", // Property or value to be used as name of the hidden input.
  "selected": null, // Item selected.
  "selectHandler": function(item,event) {}, // Function to be executed when an element is selected.
  "getSelected": function() {
    return this.selected;
  },                                                  
  "extractData": function(data) {
    return Komunalne.util.isArray(this.options) ? this.options : this.super.extractData(data);
  },
  "buildLayout": function() {
    this.config.def = this.config.def || {};
    this.config.def.style = this.config.def.style || {};
    this.config.def.style.position = "relative";
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
        "text": this.placeholder
      }
    },{
      "render": Monominoes.renders.INPUT,
      "config": {
        "def": { "attrs": { "type": "hidden", "name": this.fieldName } },
        "key": "hidden"
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
              "text": Komunalne.util.isInstanceOf(this.labelProperty,"string") ? 
                      Monominoes.util.property(this.labelProperty) : Monominoes.util.data,
              "def": { 
                "attrs": { "href": "#" },
                "events": {
                  "click": function(item,event) {
                    var value,visible,dropdown,dditem;
                    
                    dropdown = this.parent.parent.parent;
                    dropdown.selected = item.data;
                    dropdown.selectHandler(item,event);
                    
                    dditem = item.parent.parent.parent;
                    
                    value = Komunalne.util.isInstanceOf(dropdown.valueProperty,"string") ? 
                            Monominoes.util.property(dropdown.valueProperty)(item.data) : 
                            dropdown.valueProperty(this,item,item.data);
                    
                    visible = Komunalne.util.isInstanceOf(dropdown.labelProperty,"string") ? 
                            Monominoes.util.property(dropdown.labelProperty)(item.data) : 
                            dropdown.labelProperty(this,item,item.data);
                    
                    // Sets the value to the hidden element and put the visible value into the combo caret.
                    dditem.children[1][0].item.val(value);
                    dditem.children[0][0].item.text(visible);
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
