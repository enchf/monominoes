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
    var self,item;
    var append = function(target,cls) {
      return Komunalne.util.append(target,Monominoes.util.format("fa-{0}",cls));
    };
    
    this.config.def = this.config.def || {};
    this.config.def.style = this.config.def.style || {};
    this.config.def.style.color = (this.color || this.config.def.style.color);
    this.config.def.style["background-color"] = (this.background || this.config.def.style["background-color"]);
    
    item = this.super.buildItem(data);
    self = this;
    Komunalne.util.forEach(["size","pull","animated","rotate","flip","icon"],function(val) {
      self[val] = Monominoes.util.extractValue(self[val],self,data);
    });
    
    cls = Komunalne.util.append("fa",item.attr("class"));
    cls = append(cls,this.icon);
    cls = Komunalne.util.isAnyOf(this.size,"lg","2x","3x","4x","5x") ? append(cls,this.size) : cls;
    cls = Komunalne.util.isAnyOf(this.pull,"left","right") ? append(cls,"pull-"+this.pull) : cls;
    cls = Komunalne.util.isAnyOf(this.animated,"pulse","spin") ? append(cls,this.animated) : cls;
    cls = Komunalne.util.isAnyOf(this.rotate,"90","180","270") ? append(cls,"rotate-"+this.rotate) : cls;
    cls = Komunalne.util.isAnyOf(this.flip,"horizontal","vertical") ? append(cls,"flip-"+this.flip) : cls;
    
    cls = this["fixed-width"] === true ? append(cls,"fw") : cls;
    cls = this.border === true ? append(cls,"border") : cls;
    item.attr("class",cls);
    
    return item;
  }
});
