
function ScatterChartNoScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.initVis();
}






//initialize vis
ScatterChartNoScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 500; //get current width of container on page
    self.svgHeight = 400;
    
    let svg = d3.select(`#${self.sectionId}`)
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height", self.svgHeight);


}

