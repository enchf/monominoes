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

Monominoes.bs.CAROUSEL = Monominoes.renders.DIV.extend({
  "name": "BOOTSTRAP_CAROUSEL",
  "id": "", // Carousel ID.
  "image": null, // If this config property not present, data itself will be used as the "src" attribute of the tag.
  "title": null,
  "interval": "5000",
  "slideText": null,  // Each of image, title and slideText is a configuration file in the form:
                      // { 
                      //    "property": String (path) or function for the data to be rendered.
                      //    "cell": (optional) Sub render to be used as children of the item. 
                      //            Applicable only for title and slideText.
                      //    "def": Monominoes item definition to apply to the container tag.
                      // }
  "buildLayout": function() {
    var inner, indicators, left, right;
    var imgConfig, titleConfig, textConfig;
    var hasTextProperties, textProperties;
    var extract = Monominoes.util.extractValue;
    
    this.config.def = this.config.def || {};
    this.config.def.attrs = this.config.def.attrs || {};
    this.config.def.attrs["data-ride"] = "carousel";
    this.config.def.attrs["data-interval"] = this.interval;
    this.config.def.attrs.id = this.id;
    this.config.def.class = (extract(this.config.def.class) || "") + "carousel slide";
    
    hasTextProperties = this.image && (this.title || this.slideText);
    imgConfig = {};
    
    if (this.image) {
      imgConfig.path = this.image.property;
      imgConfig.def = this.image.def || {};
      imgConfig.def.attrs = imgConfig.def.attrs || {};
      imgConfig.def.attrs.src = imgConfig.def.attrs.src || Monominoes.util.data;
    } else {
      imgConfig.def = { "attrs": { "src": Monominoes.util.data } }
    }
        
    <div class="carousel-inner" role="listbox">
      <div class="item active">
        <span></span><img src="img/welcome.jpg" alt="Rumorosa Blues Band">
        <div class="carousel-caption">
          <h3>Rumorosa Blues Band</h3>
          <p>"Paz y Blues"<br>
          Bienvenidos a nuestro sitio</p>
        </div>
      </div>
    </div>
                    
    inner = {
      "render": Monominoes.renders.DIV,
      "config": {
        "def": {
          "class": "carousel-inner",
          "attrs": { "role": "listbox" }
        },
        "children": [{
          "render": Monominoes.renders.DIV,
          "config": {
            "iterable": true,
            "def": { 
              "class": function(r,t,d) { return "item" + (t.parent.index == 0 ? " active" : ""); }
            },
            "children": [{
              "render": Monominoes.renders.IMG,
              "config": imgConfig
            }]
          }
        }]
      }
    };
    
    if (hasTextProperties) {
      textProperties = {
        "render": Monominoes.renders.DIV,
        "config": {
          "def": { "class": "carousel-caption" },
          "children": [{
            "render": Monominoes.renders.H3,
            "config": titleConfig
          },{
            "render": Monominoes.renders.P,
            "config": textConfig
          }]
        }
      };
      inner.config.children.config.children.push(textProperties);
    }
    
    indicators = {
      "render": Monominoes.renders.LIST,
      "config": {
        "ordered": true,
        "def": { "class": "carousel-indicators" },
        "itemsLayout": {
          "def": {
            "attrs": { 
              "data-target": "#" + this.id, 
              "data-slide-to": function(r,t,d) {
                return t.parent.index;
              }
            },
            "class": function(r,t,d) { 
              return t.parent.index == 0 ? "active" : ""; 
            }
          }
        }
      }
    };
    
    left = {
      "render": Monominoes.renders.A,
      "config": {
        "def": { 
          "class": "left carousel-control",
          "attrs": { "href": "#" + this.id, "role": "button", "data-slide": "prev" }
        },
        "children": [{
          "render": Monominoes.renders.SPAN,
          "config": {
            "def": { 
              "class": "glyphicon glyphicon-chevron-left",
              "attrs": { "aria-hidden": "true" }
            }
          }
        },{
          "render": Monominoes.renders.SPAN,
          "config": {
            "def": { "class": "sr-only" },
            "text": "Previous"
          }
        }]
      }
    };
    
    right = {
      "render": Monominoes.renders.A,
      "config": {
        "def": { 
          "class": "right carousel-control",
          "attrs": { "href": "#" + this.id, "role": "button", "data-slide": "next" }
        },
        "children": [{
          "render": Monominoes.renders.SPAN,
          "config": {
            "def": { 
              "class": "glyphicon glyphicon-chevron-right",
              "attrs": { "aria-hidden": "true" }
            }
          }
        },{
          "render": Monominoes.renders.SPAN,
          "config": {
            "def": { "class": "sr-only" },
            "text": "Next"
          }
        }]
      }
    };
    
    this.config.children = [ inner, indicators, left, right ];
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
