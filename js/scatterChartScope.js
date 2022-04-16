
function ScatterChartScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.initVis();
}






//initialize vis
ScatterChartScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 500; //get current width of container on page
    self.svgHeight = 400;
    
    self.svg = d3.select(`#${self.sectionId}`)
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

    let allYearGroup = ["2018","2019","2020"]

    //Add the options to the dropdown button
    d3.select("#yearGroupButton")
        .selectAll('option')
        .data(allYearGroup)
        .enter()
        .append('option')
        .text(function(d){return d;})
        .attr("value",function(d){return d;});

    //Initial chart Creation (2018)

    //Initial State Data (2018)
    let tempState2018 = self.functions.getStateByYear(2018);
    tempState2018.forEach(function (element, index){
        var stateName = element.State;
        var statePop = self.functions.getStatePopulationForYear(stateName, 2018);
        element.population = +statePop;
    });

    //some of the populations are unknown:(?
    //Also, maybe self.state2018 if want to store it
    let state2018 = tempState2018.filter(function (value) {
        return !Number.isNaN(value.population);
    });

    //Further data processing can be done here and stored as self.XX so that it could be simply called when update function is called (like in linecharts)

    console.log(state2018);

    self.x = d3
        .scaleLinear()
        .domain([0,d3.max(state2018, function(d){return d.TotalEmployees/d.population*100000})])
        .range([0, self.svgWidth - 70]);

    console.log(d3.max(state2018, function(d){return d.TotalEmployees/d.population*100000}));

    self.svg
        .append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(50, ${self.svgHeight-30})`)
        .call(d3.axisBottom(self.x));

    self.y = d3
        .scaleLinear()
        .domain([0, d3.max(state2018, function(d) { return d.TotalEmployees; })])
        .range([self.svgHeight-50,0]);

    self.svg.append("g")
        .attr("id","yAxis")
        .attr("transform",'translate(50,20)')
        .call(d3.axisLeft(self.y));

    // color palette
    self.color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    self.zoomStatus = "states";

    self.svg.selectAll(".dot")
        .data(state2018)
        .join("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return 50+self.x(d.TotalEmployees/d.population*100000); } )
        .attr("cy", function (d) { return 20+self.y(d.TotalEmployees); } )
        .attr("r", 3)
        .style("fill",function(d){ return self.color(d.State)})
        .on("click",function(event,d){
            self.update(d);
        });

    // When the button is changed, run the updateChart function
    d3.select("#yearGroupButton").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedYear = d3.select(this).property("value")
        // run the updateChart function with this selected option
        self.updateYear(selectedYear)
    });
}

//Update the chart (update the year)
ScatterChartScope.prototype.updateYear = function(selectedYear){
    var self = this;
    console.log(selectedYear);
}

//Update the chart (zooming)
ScatterChartScope.prototype.update = function(zoom){
    var self = this;
    console.log(zoom);
}