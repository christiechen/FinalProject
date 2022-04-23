
function ScatterChartScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    // for y-axis label
    self.num = 'each state'

    // labels
    self.showing = '';
    // self.currentState = [];
    self.initVis();
}






//initialize vis
ScatterChartScope.prototype.initVis = function(){
    var self = this;

    // SVG dimensions
    self.margin = { top: 60, right: 20, bottom: 40, left: 50 };
    self.svgWidth = 700; //get current width of container on page
    self.svgHeight = 750;
    
    // append SVG
    self.svg = d3.select(`#${self.sectionId}`)
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

    let allYearGroup = ["2018","2019","2020"]

    //Add the year options to the dropdown button
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

    //accounting for bad data
    let state2018 = tempState2018.filter(function (value) {
        return !Number.isNaN(value.population);
    });

    //potential: Further data processing can be done here and stored as self.XX so that it could be simply called when update function is called (like in linecharts)

    // console.log(state2018);


    // === AXES === 
    // x axis
    self.x = d3
        .scaleLinear()
        .domain([0,d3.max(state2018, function(d){return d.TotalEmployees*1000/d.population * 100})])
        .range([self.margin.left, self.svgWidth - self.margin.right]);

    // console.log(d3.max(state2018, function(d){return d.TotalEmployees*1000/d.population * 100}));

    self.xAxisGroup = self.svg
        .append("g")
        .attr("id", "xAxis")
        .attr("class", "x-axis axis");
    
    self.xAxis = d3.axisBottom().scale(self.x);  

    //y axis
    self.y = d3
        .scaleLinear()
        .domain([0, d3.max(state2018, function(d) { return d.TotalEmployees * 1000; })])
        .range([self.svgHeight-self.margin.bottom, self.margin.top]);
        

    self.yAxisGroup = self.svg.append("g")
        .attr("id","yAxis")
        .attr("class", "y-axis axis");
    
    self.yAxis = d3.axisLeft().scale(self.y)
            .tickFormat(d3.format(".2s"));


    // appending axis to svg
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
    .range([
        "#d3d3d3",
        "#7fafaf",
        "#2e8b57",
        "#8b0000",
        "#808000",
        "#5151ff",
        "#ff4500",
        "#ffa500",
        "#ffff00",
        "#c71585",
        "#8bc700",
        "#00fa9a",
        "#4169e1",
        "#00ffff",
        "#00bfff",
        "#dbfcff",
        "#ff00ff",
        "#f0e68c",
        "#fa8072",
        "#dda0dd",
    ]);

    // which zoom level we are in
    self.zoomStatus = "states";

    // d3 tool tip
    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function(event, d) {
           let state = d.State? `<p> State: ${d.State} </p>` : '';
           let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
           let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
           let emp = d.Employees ? `<p> Employment: ${d.Employees * 1000} </p>` : `<p> Employment: ${d.TotalEmployees * 1000} </p>`;
           let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
           return text;
           
        });


    // initial load of scatterplot data
    self.svg.selectAll(".dot")
        .data(state2018)
        .join("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return self.x(d.TotalEmployees*1000/d.population * 100); } )
        .attr("cy", function (d) { return self.y(d.TotalEmployees*1000); } )
        .attr("r", 4)
        .attr("fill",function(d){ return self.color(d.State)})
        .on("click",function(event,d){
            self.update(d, +$("#yearGroupButton option:selected").text());
            self.zoom = d;
        })
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);
   
    self.svg.call(self.tip);

    //fill state legend
    let allStates = self.functions.getAllStates();

    d3.select(`#${self.sectionId} .scatterLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .attr("style", (d)=> `color: ${self.color(d)}`)
        .text((d) => {
            return d;
        });
    

    // Calling axes
    self.xAxisGroup = self.svg 
        .select(".x-axis")
        .call(self.xAxis)
        .attr("transform", `translate(0, ${self.svgHeight-self.margin.bottom})`);
        
    self.yAxisGroup = self.svg 
        .select(".y-axis")
        .call(self.yAxis)
        .attr("transform", `translate( ${self.margin.left},0)`);


    // Adding showing label
    self.svg
        .append('text')
        .attr('class', "scopeLabel")
        .attr('x', self.svgWidth/2)
        .attr('y', self.margin.top)
        .text(self.showing + " All States")


    // When the button is changed, run the updateChart function
    d3.select("#yearGroupButton").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedYear = d3.select(this).property("value")
        // run the updateChart function with this selected option
        self.updateYear(+selectedYear);
    });
}

//Update the chart (update the year)
ScatterChartScope.prototype.updateYear = function(year){
    var self = this;
    let workingData;

    self.num = "each state" //y-axis label

    //get all areas in selected state in selected yeaer
    workingData = self.functions.getStateByYear(year);
    console.log(workingData);

    //update x and y axis scale
    self.y.domain([0, d3.max(workingData, function(d) { return d.TotalEmployees * 1000; })]);    
    self.yAxis.scale(self.y);

    console.log(year)
    let max = d3.max(workingData, function(d) { return d.TotalEmployees * 1000 / 
    self.functions.getStatePopulationForYear(d.State, year) * 100; });
    self.x.domain([0, max]);
    console.log(max); 
    self.xAxis.scale(self.x);


    // d3 tool tip 
    // self.tip = d3.tip().attr('class', "d3-tip")
    //     .direction('se')
    //     .html(function(event, d) {
    //     let state = d.State? `<p> State: ${d.State} </p>` : '';
    //     let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
    //     let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
    //     let emp = d.Employees ? `<p> Employment: ${d.Employees * 1000} </p>` : `<p> Employment: ${d.TotalEmployees * 1000} </p>`;
    //     let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
    //     return text;
        
    //     });


    // draw updated circles for years
    self.svg.selectAll(".dot")
        .data(workingData)
        .join("circle")
        .attr("class","dot")
        .attr("cx", function (d) { 
            if(d.TotalEmployees){
                return self.x(d.TotalEmployees*1000/self.functions.getStatePopulationForYear(d.State, year) * 100); 
            } 
            return self.x(d.Employees*1000/self.functions.getStatePopulationForYear(d.State, year) * 100); 
        })
        .attr("cy", function (d) { 
            if(d.TotalEmployees){
                return self.y(d.TotalEmployees*1000);
            }
            return self.y(d.Employees*1000); 
        })
        .attr("r", 4)
        .attr("fill",function(d){ return self.color(d.State)})
        .on("click",function(event,d){
            self.update(d, +$("#yearGroupButton option:selected").text());
        })
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);
   
    self.svg.call(self.tip);
    
    self.xAxisGroup = self.svg 
        .select(".x-axis")
        .call(self.xAxis)
        .attr("transform", `translate(0, ${self.svgHeight-self.margin.bottom})`);
        
    self.yAxisGroup = self.svg 
        .select(".y-axis")
        .call(self.yAxis)
        .attr("transform", `translate( ${self.margin.left},0)`);
}

//Update the chart (zooming)
ScatterChartScope.prototype.update = function(zoom, year){
    var self = this;
    console.log(zoom);
    console.log(year);

    let workingData;

    //get new data depending on the current zoom level
    if(self.zoomStatus === "states"){
        self.zoomStatus = "areas";

        //all areas in selected state in selected yeaer
        workingData = self.functions.getCityTotalsForStateByYear(zoom.State, year);
        console.log(workingData);
        
        //update x and y axis scale
        self.y.domain([0, d3.max(workingData, function(d) { return d.TotalEmployees * 1000; })]);    
        self.yAxis.scale(self.y);

        let max = d3.max(workingData, function(d) { return d.TotalEmployees * 1000 / 
        self.functions.getStatePopulationForYear(zoom.State, year) * 100; });
        self.x.domain([0, max]);
        self.xAxis.scale(self.x);
        
        //fill area legend
        let allAreas = [];
        workingData.forEach((el)=>{
            allAreas.push(el.Area);
        })

        d3.select(`#${self.sectionId} .scatterLegend`)
            .selectAll('.legendBubble')
            .data(allAreas)
            .join('div')
            .attr("class", 'legendBubble')
            .attr("style", (d)=> `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });

        self.num = "each area in " + zoom.State;
        
        // changing showing label
        self.svg.select('.scopeLabel')
            .text(self.showing + "All States > " + zoom.State);
        
    }
    else if(self.zoomStatus === "areas"){
        self.zoomStatus = "industries";
        
        //all areas in selected state in selected yeaer
        workingData = self.functions.getCitySpecificsByYear(zoom.State, year, zoom.Area);
        console.log(workingData);
        
        //update x and y axis scale
        self.y.domain([0, d3.max(workingData, function(d) { return d.Employees * 1000; })]);    
        self.yAxis.scale(self.y);

        console.log(zoom.Area)
        let max = d3.max(workingData, function(d) { return d.Employees * 1000 / 
        self.functions.getStatePopulationForYear(zoom.State, year) * 100; });
        self.x.domain([0, max]);
        
        self.xAxis.scale(self.x);
        
        //fill state legend
        let allIndustries = self.functions.getAllIndustries();

        d3.select(`#${self.sectionId} .scatterLegend`)
            .selectAll('.legendBubble')
            .data(allIndustries)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d)=> `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });
        
        self.num = "each industry in " + zoom.Area;
        // changing showing label
        self.svg.select('.scopeLabel')
          .text(self.showing + "All States > " + zoom.State + " > " + zoom.Area);
    
    }
    else if(self.zoomStatus === "industries"){
        self.zoomStatus = "states";
        //all areas in selected state in selected yeaer
        workingData = self.functions.getStateByYear(year);
        //update x and y axis scale
        self.y.domain([0, d3.max(workingData, function(d) { return d.TotalEmployees * 1000; })]);    
        self.yAxis.scale(self.y);

        let max = d3.max(workingData, function(d) { return d.TotalEmployees * 1000 / 
        self.functions.getStatePopulationForYear(d.State, year) * 100; });
        self.x.domain([0, max]);
        self.xAxis.scale(self.x);

        //fill state legend
        let allStates = self.functions.getAllStates();

        d3.select(`#${self.sectionId} .scatterLegend`)
            .selectAll('.legendBubble')
            .data(allStates)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d)=> `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });
        self.num = "each state";

        self.svg.select('.scopeLabel')
            .text(self.showing + "All States");
    }

    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function(event, d) {
        let state = d.State? `<p> State: ${d.State} </p>` : '';
        let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
        let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
        let emp = d.Employees ? `<p> Employment: ${d.Employees * 1000} </p>` : `<p> Employment: ${d.TotalEmployees * 1000} </p>`;
        let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
        return text;
        
        });



    // DRAWING CIRCLES W TRANSITION
    let circs = self.svg.selectAll(".dot")
        .data(workingData)
        .join("circle")
        .attr("class","dot")
        

    circs.transition()
        .duration(1000)
        .attr("cx", function (d) { 
            if(d.TotalEmployees){
                return self.x(d.TotalEmployees*1000/self.functions.getStatePopulationForYear(d.State, year) * 100); 
            } 
            return self.x(d.Employees*1000/self.functions.getStatePopulationForYear(d.State, year) * 100); 
        })
        .attr("cy", function (d) { 
            if(d.TotalEmployees){
                return self.y(d.TotalEmployees*1000);
            }
            return self.y(d.Employees*1000); 
        })
        .attr("r", 4)
        .attr("fill",function(d){ 
            if(self.zoomStatus === 'states'){
                return self.color(d.State);
            }
            if(self.zoomStatus === 'areas'){
                return self.color(d.Area)
            }
            if(self.zoomStatus === 'industries'){
                return self.color(d.Industry)
            }
        });
    

    circs
        .on("click",function(event,d){
            self.update(d, +$("#yearGroupButton option:selected").text());
        })
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);
   
   
    self.svg.call(self.tip);
    
    self.xAxisGroup = self.svg 
        .select(".x-axis")
        .call(self.xAxis)
        .attr("transform", `translate(0, ${self.svgHeight-self.margin.bottom})`);
        
    self.yAxisGroup = self.svg 
        .select(".y-axis")
        .call(self.yAxis)
        .attr("transform", `translate( ${self.margin.left},0)`);


    self.svg
        .select(".y-axis .axis-label")
        .text("#employment in " + self.num)

    //update chart
}