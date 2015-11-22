/**
 * Font Awesome renders.
 * Contained in a new package.
 */
Monominoes.fa = {};

Monominoes.fa.ICON = Monominoes.renders.I.extend({
  "icon": Monominoes.util.data, // Name from library (example: "camera-retro", without "fa"). Default is data itself.
  "size": "", // Add size: lg, 2x, 3x, 4x, 5x.  
  "fixed-width": false,
  "border": false,
  "pull": "",
  "animated": "", // Choose between pulse and spin.
  "rotate": "", // Choose between 90, 180 and 270.
  "flip": "", // Choose between horizontal and vertical.
  "color": "", // Default existent.
  "background": "", // Default existent.
  "buildItem": function(data) {
    var cls = "";
    var self,item,pivot;
    var append = function(target,cls) {
      return Komunalne.util.append(target,Monominoes.util.format("fa-{0}",cls));
    };
    
    this.config.def = this.config.def || {};
    this.config.def.style = this.config.def.style || {};
    this.config.def.style.color = (this.color || this.config.def.style.color);
    this.config.def.style["background-color"] = (this.background || this.config.def.style["background-color"]);
    
    item = this.super.buildItem(data);
    self = this;
    pivot = {};
    Komunalne.util.forEach(["size","pull","animated","rotate","flip","icon"],function(val) {
      pivot[val] = Monominoes.util.extractValue(self[val],self,data);
    });
    
    cls = Komunalne.util.append("fa",item.attr("class"));
    cls = append(cls,pivot.icon);
    cls = Komunalne.util.isAnyOf(pivot.size,"lg","2x","3x","4x","5x") ? append(cls,pivot.size) : cls;
    cls = Komunalne.util.isAnyOf(pivot.pull,"left","right") ? append(cls,"pull-"+pivot.pull) : cls;
    cls = Komunalne.util.isAnyOf(pivot.animated,"pulse","spin") ? append(cls,pivot.animated) : cls;
    cls = Komunalne.util.isAnyOf(pivot.rotate,"90","180","270") ? append(cls,"rotate-"+pivot.rotate) : cls;
    cls = Komunalne.util.isAnyOf(pivot.flip,"horizontal","vertical") ? append(cls,"flip-"+pivot.flip) : cls;
    
    cls = this["fixed-width"] === true ? append(cls,"fw") : cls;
    cls = this.border === true ? append(cls,"border") : cls;
    item.attr("class",cls);
    
    return item;
  }
});
