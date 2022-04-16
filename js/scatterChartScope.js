
function ScatterChartScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.hierarchy = [];
    self.initVis();
}






//initialize vis
ScatterChartScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 40, left: 50 };
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
        .domain([0,d3.max(state2018, function(d){return d.TotalEmployees*1000/d.population * 100})])
        .range([self.margin.left, self.svgWidth - self.margin.right]);

    console.log(d3.max(state2018, function(d){return d.TotalEmployees*1000/d.population * 100}));

    self.xAxisGroup = self.svg
        .append("g")
        .attr("id", "xAxis")
        .attr("class", "x-axis axis");
    
    self.xAxis = d3.axisBottom().scale(self.x);  

    self.y = d3
        .scaleLinear()
        .domain([0, d3.max(state2018, function(d) { return d.TotalEmployees * 1000; })])
        .range([self.svgHeight-self.margin.bottom, self.margin.top]);
        

    self.yAxisGroup = self.svg.append("g")
        .attr("id","yAxis")
        .attr("class", "y-axis axis");
    
    self.yAxis = d3.axisLeft().scale(self.y)
            .tickFormat(d3.format(".2s"));



    self.svg
        .select(".x-axis")
        .append("text")
        .text("% of each state's ESTIMATED population that was employed in this year")
        .attr("x", self.svgWidth - self.margin.right)
        .attr("y", 30)
        .attr("class", "axis-label")
        .attr("text-anchor", "end");



    self.svg
        .select(".y-axis")
        .append("text")
        .text("#employment in " + self.num)
        .attr("x", -20)
        .attr("y", -40)
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    // color palette
    self.color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    self.zoomStatus = "states";

    self.svg.selectAll(".dot")
        .data(state2018)
        .join("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return self.x(d.TotalEmployees*1000/d.population * 100); } )
        .attr("cy", function (d) { return self.y(d.TotalEmployees*1000); } )
        .attr("r", 3)
        .attr("fill",function(d){ return self.color(d.State)})
        .on("click",function(event,d){
            self.update(d, +$("#yearGroupButton option:selected").text());
        });




    self.xAxisGroup = self.svg 
        .select(".x-axis")
        .call(self.xAxis)
        .attr("transform", `translate(0, ${self.svgHeight-self.margin.bottom})`);
        
    self.yAxisGroup = self.svg 
        .select(".y-axis")
        .call(self.yAxis)
        .attr("transform", `translate( ${self.margin.left},0)`);

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
ScatterChartScope.prototype.update = function(zoom, year){
    var self = this;
    console.log(zoom);
    console.log(year);

    let workingData;
    //get new data 
    if(self.zoomStatus = "states"){
        self.zoomStatus = "areas";
        //all areas in selected state in selected yeaer
        workingData = self.functions.getCityTotalsForStateByYear(zoom.State, year);
        console.log(workingData);
        //update x and y axis scale
        self.y.domain([0, d3.max(workingData, function(d) { return d.TotalEmployees * 1000; })]);    
        self.yAxis.scale(self.y);

        console.log(zoom.State)
        console.log(year)
        let max = d3.max(workingData, function(d) { return d.TotalEmployees * 1000 / 
        self.functions.getStatePopulationForYear(zoom.State, year) * 100; });
        self.x.domain([0, max]);
        console.log(max); 
        self.xAxis.scale(self.x);

    }

    


    self.svg.selectAll(".dot")
        .data(workingData)
        .join("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return self.x(d.TotalEmployees*1000/self.functions.getStatePopulationForYear(zoom.State, year) * 100); } )
        .attr("cy", function (d) { return self.y(d.TotalEmployees*1000); } )
        .attr("r", 3)
        .attr("fill",function(d){ return self.color(d.State)})
        .on("click",function(event,d){
            self.update(d, $("#yearGroupButton option:selected").text());
        });
   
    self.xAxisGroup = self.svg 
        .select(".x-axis")
        .call(self.xAxis)
        .attr("transform", `translate(0, ${self.svgHeight-self.margin.bottom})`);
        
    self.yAxisGroup = self.svg 
        .select(".y-axis")
        .call(self.yAxis)
        .attr("transform", `translate( ${self.margin.left},0)`);



    //update chart
}