var App = App || {};

$(document).ready(function(){
  // initialize spaghetti plot components
  App.spaghettiPlots = {a: {}, b: {}, c: {}};
  App.spaghettiPlots.height = d3.select(".spaghettiDiv").node().clientWidth * 0.1;

  App.spaghettiPlots.a.svg = 
    d3.select(".spaghettiA")
  .append("svg")
    .attr("height", App.spaghettiPlots.height);

  App.spaghettiPlots.b.svg = 
    d3.select(".spaghettiB")
  .append("svg")
    .attr("height", App.spaghettiPlots.height);

  App.spaghettiPlots.c.svg = 
    d3.select(".spaghettiC")
  .append("svg")
    .attr("height", App.spaghettiPlots.height);



  // initialize time curve components

  // initialize probability projection components
  App.probabilityProjection = {};

  App.probabilityProjection.width = d3.select(".probprojmapdiv").node().clientWidth;
  App.probabilityProjection.height = App.probabilityProjection.width * 0.3;

  App.probabilityProjection.svg =
    d3.select(".probprojmapdiv")
  .append("svg")
    // .attr("width", App.probabilityProjection.width)
    .attr("height", App.probabilityProjection.height);
});
