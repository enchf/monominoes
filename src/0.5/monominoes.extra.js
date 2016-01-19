/**
 * Extra renders definition.
 */
Monominoes.renders.YOUTUBE = Monominoes.renders.IFRAME.extend({
  "width": 480,
  "height": 360,
  "buildLayout": function() {
    this.config.def = this.config.def || {};
    this.config.def.attrs = this.config.def.attrs || {};
    this.config.def.attrs.frameborder = "0";
    this.config.def.attrs.allowfullscreen = "";
    this.config.def.attrs.src = this.getUrl;
    this.config.def.attrs.width = this.width;
    this.config.def.attrs.height = this.height;
    this.super.buildLayout();
  },
  "getUrl": function(render,target,data) {
    var url = data;
    var base = "http://www.youtube.com/embed/";
    return url.indexOf("watch?") >= 0 ? base + url.substr(url.lastIndexOf("=")+1) : url;
  }
});
