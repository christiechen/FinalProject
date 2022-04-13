
function LineChartNoScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.initVis();
}






//initialize vis
LineChartNoScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 500; //get current width of container on page
    self.svgHeight = 400;
    
    self.svg = d3.select(`#${self.sectionId}`)
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

    let state2018 = self.functions.getStateByYear(2018);
    let state2019 = self.functions.getStateByYear(2019);
    let state2020 = self.functions.getStateByYear(2020);

    state2018.forEach(function (element, index) {
        element.year = 2018;
    });

    state2019.forEach(function (element, index) {
        element.year = 2019;
    });

    state2020.forEach(function (element, index) {
        element.year = 2020;
    });

    self.stateData = state2018;
    self.stateData.push(...state2019);
    self.stateData.push(...state2020);

    self.sumState = d3.group(self.stateData, (d) => d.State);

    console.log(state2019);
    console.log(self.sumState);

    //console.log(self.functions.dataByState);

    self.areaData = [];

    self.functions.dataByState.forEach(function(element,state){
        for (var key in element) {
            let el = element[key];
            for (var year in el){
                self.areaData.push({"State":state, "Area":key, "Employees":+el[year][0].Employees, "Year":+year})
            }
        }
    });

    //self.sumArea = d3.group(tempAreaArr, (d)=>d.State, (d)=>d.Area);
    self.sumArea = d3.group(self.areaData, (d)=>d.Area);

    console.log(self.sumArea);

    self.industryData = [];

    self.functions.dataByIndustry.forEach(function(element,industry){
        if (industry!=="Total"){
            element.forEach(function(el,year){
                let sumTotalforIndustry = 0;
                el.forEach(function(e,state){
                    e.forEach(function(numEmployees,area){
                        if (area==="Total"){
                            if (isNaN(numEmployees)) {
                                numEmployees = 0;
                            }
                            sumTotalforIndustry+=numEmployees;
                        }
                    });
                });
                self.industryData.push({"Industry": industry, "Employees":sumTotalforIndustry, "Year": year})
            });
        }
    });

    //console.log(self.industryData);

    self.sumIndustry = d3.group(self.industryData,(d)=>d.Industry);
    console.log(self.sumIndustry);

    let allGroup = ["states","areas","industries"]

    //Add the options to the dropdown button
    d3.select("#selectButton")
        .selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d){return d;})
        .attr("value",function(d){return d;});

    self.x = d3
        .scaleLinear()
        .domain([2018,2020])
        .range([0, self.svgWidth - 70]);

    self.svg
        .append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(50, ${self.svgHeight-30})`)
        .call(d3.axisBottom(self.x).ticks(2).tickFormat(d3.format("d")));

    self.y = d3
        .scaleLinear()
        .domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])
        .range([self.svgHeight-50,0]);

    self.svg.append("g")
        .attr("id","yAxis")
        .attr("transform",'translate(50,20)')
        .call(d3.axisLeft(self.y));

    // color palette
    self.color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    self.svg.selectAll(".line")
        .data(self.sumState)
        .join("path")
        .attr("class","line")
        .attr("fill", "none")
        .attr("stroke", function(d){ return self.color(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return self.x(d.year)+50; })
                .y(function(d) { return self.y(d.TotalEmployees)+20; })
                (d[1])
        });

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        self.update(selectedOption)
    });

}

//Update the chart
LineChartNoScope.prototype.update = function(selectedOption){
    var self = this;
    //console.log(selectedOption);
    //self.svg.selectAll(".line").remove();

    if (selectedOption==="states"){
        self.y.domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])

        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        self.svg.selectAll(".line")
            .data(self.sumState)
            .join("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.year)+50; })
                    .y(function(d) { return self.y(d.TotalEmployees)+20; })
                    (d[1])
            });
    }
    else if (selectedOption==="areas"){
        self.y.domain([0, d3.max(self.areaData, function(d) { return d.Employees; })])

        //console.log(self.sumArea);

        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        self.svg.selectAll(".line")
            .data(self.sumArea)
            .join("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.Year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            });
    }
    else {
        self.y.domain([0, d3.max(self.industryData, function(d) { return d.Employees; })])

        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        self.svg.selectAll(".line")
            .data(self.sumIndustry)
            .join("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.Year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            });
    }

}



















