
function LineChartScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.showing = '';

    self.initVis();
}






// Initialize line chart (scoping) visualization
// Level 1: x axis: year, y axis: total employment in each state
// Level 2: x axis: year, y axis: total employment in each area in the selected state
// Level 3: x axis: year, y axis: total employment in each industry in the selected area
// Zooming/Scoping again at level 3 returns to level 1
LineChartScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 500;
    self.svgHeight = 700;
    
    self.svg = d3.select(`#${self.sectionId}`)
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

    // DATA PROCESSING FOR LEVEL 1

    // Getting # employments in each state for each year (2018, 2019, 2020)
    let state2018 = self.functions.getStateByYear(2018);
    let state2019 = self.functions.getStateByYear(2019);
    let state2020 = self.functions.getStateByYear(2020);

    // Data processing to add year property
    state2018.forEach(function (element, index) {
        element.year = 2018;
    });
    state2019.forEach(function (element, index) {
        element.year = 2019;
    });
    state2020.forEach(function (element, index) {
        element.year = 2020;
    });

    // Gathering all data together
    self.stateData = state2018;
    self.stateData.push(...state2019);
    self.stateData.push(...state2020);

    // Grouping by state
    self.sumState = d3.group(self.stateData, (d) => d.State);


    // Initial Axis Setup

    self.x = d3
        .scaleLinear()
        .domain([2018,2020])
        .range([0, self.svgWidth - 70]);

    self.svg
        .append("g")
        .attr("id", "xAxis")
        .attr("class","x-axis axis")
        .attr("transform", `translate(50, ${self.svgHeight-30})`)
        .call(d3.axisBottom(self.x).ticks(2).tickFormat(d3.format("d")));

    self.svg
        .select(".x-axis")
        .append("text")
        .text("year")
        .attr("x", self.svgWidth - self.margin.right-50)
        .attr("y", 25)
        .attr("class", "axis-label")
        .attr("text-anchor", "end");

    self.y = d3
        .scaleLinear()
        .domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])
        .range([self.svgHeight-50,0]);

    self.svg.append("g")
        .attr("id","yAxis")
        .attr("class", "y-axis axis")
        .attr("transform",'translate(50,20)')
        .call(d3.axisLeft(self.y));

    self.svg
        .select(".y-axis")
        .append("text")
        .text("# employment (thousands)")
        .attr("x", 0)
        .attr("y", -43)
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    // color palette
    self.color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    self.zoomStatus = "states"; // Initialize current zoom level 1 (states)

    // Tooltip setup
    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function (event, d) {

            let state = d[1][0].State ? `<p> State: ${d[1][0].State} </p>` : '';
            let area = d[1][0].Area ? `<p> Area: ${d[1][0].Area} </p>` : '';
            let industry = d[1][0].Industry ? `<p> Industry: ${d[1][0].Industry} </p>` : '';
            let emp2018 = d[1][0].TotalEmployees ? `<p> Employment 2018: ${d[1][0].TotalEmployees} </p>` : `<p> Employment 2018: ${d[1][0].Employees} </p>`;
            let emp2019 = d[1][1].TotalEmployees ? `<p> Employment 2019: ${d[1][1].TotalEmployees} </p>` : `<p> Employment 2019: ${d[1][1].Employees} </p>`;
            let emp2020 = d[1][2].TotalEmployees ? `<p> Employment 2020: ${d[1][2].TotalEmployees} </p>` : `<p> Employment 2020: ${d[1][2].Employees} </p>`;

            let text = `<div> ${state} ${area} ${industry} ${emp2018} ${emp2019} ${emp2020} </div>`;

            return text;
        });

    // Initial Line Chart (Level 1) Implementation
    self.svg.selectAll(".line")
        .data(self.sumState)
        .join("path")
        .attr("class","line")
        .attr("fill", "none")
        .attr("stroke", function(d){ return self.color(d[0]) })
        .attr("stroke-width", 1.8)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return self.x(d.year)+50; })
                .y(function(d) { return self.y(d.TotalEmployees)+20; })
                (d[1])
        })
        .on("click",function(event,d){
            //console.log(d[0]);
            self.update(d[0]);
        })
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);

    self.svg.call(self.tip);

    // LEGEND

    let allStates = self.functions.getAllStates();

    // Fill state (initial level) legend
    d3.select(`#${self.sectionId} .lineScopeColorLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .attr("style", (d)=> `color: ${self.color(d)}`)
        .text((d) => {
            return d;
        });

    // Adding showing label
    $(`#${self.sectionId} .scopeLabel`)
        .text(self.showing + " All States")
}

//Update the chart
LineChartScope.prototype.update = function(group) {
    var self = this;

    // When the chart was at level 1 (states)
    if (self.zoomStatus==="states"){
        self.zoomStatus = "areas"; // Now the chart is at level 2
        self.stateStatus = group; // group is the selected state

        // DATA PROCESSING FOR LEVEL 2

        // Getting # employments in each area in the selected state for each year (2018, 2019, 2020)
        let areas2018 = self.functions.getCityTotalsForStateByYear(group, 2018);
        let areas2019 = self.functions.getCityTotalsForStateByYear(group, 2019);
        let areas2020 = self.functions.getCityTotalsForStateByYear(group, 2020);

        // Data processing to add year property
        areas2018.forEach(function (element, index) {
            element.year = 2018;
        });
        areas2019.forEach(function (element, index) {
            element.year = 2019;
        });
        areas2020.forEach(function (element, index) {
            element.year = 2020;
        });

        // Gathering all data together
        self.areaData = areas2018;
        self.areaData.push(...areas2019);
        self.areaData.push(...areas2020);

        // Grouping by area
        self.sumArea = d3.group(self.areaData, (d) => d.Area);

        // Update y axis
        self.y.domain([0, d3.max(self.areaData, function(d) { return d.TotalEmployees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        // Line chart implementation
        self.svg.selectAll(".line")
            .data(self.sumArea)
            .join("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.8)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.year)+50; })
                    .y(function(d) { return self.y(d.TotalEmployees)+20; })
                    (d[1])
            })
            .on("click",function(event,d){
                self.update(d[0]);
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);

        // LEGEND

        let allAreas = self.functions.getAllAreasInState(self.stateStatus);

        // Fill area legend
        d3.select(`#${self.sectionId} .lineScopeColorLegend`)
            .selectAll('.legendBubble')
            .data(allAreas)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d)=> `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });

        $('.scopeLabel')
            .text(self.showing + "All States > " + self.stateStatus);
    }
    // When the chart was at level 2 (areas)
    else if (self.zoomStatus==="areas"){
        self.zoomStatus = "industries"; // Now the chart is at level 3

        // Getting # employments in each industry in the selected area for each year (2018, 2019, 2020)
        let industries2018 = self.functions.getCitySpecificsByYear(self.stateStatus, 2018, group);
        let industries2019 = self.functions.getCitySpecificsByYear(self.stateStatus, 2019, group);
        let industries2020 = self.functions.getCitySpecificsByYear(self.stateStatus, 2020, group);

        // Data processing to add year property
        industries2018.forEach(function (element, index) {
            element.year = 2018;
        });
        industries2019.forEach(function (element, index) {
            element.year = 2019;
        });
        industries2020.forEach(function (element, index) {
            element.year = 2020;
        });

        // Gathering all data together
        self.industryData = industries2018;
        self.industryData.push(...industries2019);
        self.industryData.push(...industries2020);

        // Grouping by industry
        self.sumIndustry = d3.group(self.industryData, (d) => d.Industry);

        // Update y axis
        self.y.domain([0, d3.max(self.industryData, function(d) { return d.Employees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        // Line chart implementation
        self.svg.selectAll(".line")
            .data(self.sumIndustry)
            .join("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.8)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            })
            .on("click",function(event,d){
                self.update(d[0]);
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);

        // LEGEND

        let allIndustries = self.functions.getAllIndustries();

        // Fill industry legend
        d3.select(`#${self.sectionId} .lineScopeColorLegend`)
            .selectAll('.legendBubble')
            .data(allIndustries)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d)=> `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });
        $('.scopeLabel')
            .text(self.showing + "All States > " + self.stateStatus + " > " + group);
    }
    // When the chart was at level 3 (industries)
    else {
        self.zoomStatus = "states"; // Now the chart is at level 1 again

        // Update y axis
        self.y.domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        // Line chart implementation
        self.svg.selectAll(".line")
            .data(self.sumState)
            .join("path")
            .attr("class","line")
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.8)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.year)+50; })
                    .y(function(d) { return self.y(d.TotalEmployees)+20; })
                    (d[1])
            })
            .on("click",function(event,d){
                self.update(d[0]);
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);

        // LEGEND

        let allStates = self.functions.getAllStates();

        // Fill state legend
        d3.select(`#${self.sectionId} .lineScopeColorLegend`)
            .selectAll('.legendBubble')
            .data(allStates)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d)=> `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });
        $('.scopeLabel')
            .text(self.showing + "All States");
    }

}

