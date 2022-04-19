
function LineChartScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.initVis();
}






//initialize vis
LineChartScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 500; //get current width of container on page
    // self.svgHeight = 400;
    self.svgHeight = 700;
    
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

    self.zoomStatus = "states";

    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function (event, d) {
            console.log(d);

            let state = d[0] ? `<p> State: ${d[0]} </p>` : '';
            let emp2018 = d[1][0].TotalEmployees ? `<p> Employment 2018: ${d[1][0].TotalEmployees} </p>` : '';
            let emp2019 = d[1][1].TotalEmployees ? `<p> Employment 2019: ${d[1][1].TotalEmployees} </p>` : '';
            let emp2020 = d[1][2].TotalEmployees ? `<p> Employment 2020: ${d[1][2].TotalEmployees} </p>` : '';

            let text = `<div> ${state} ${emp2018} ${emp2019} ${emp2020} </div>`;

            return text;
        });

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
}

//Update the chart
LineChartScope.prototype.update = function(group) {
    var self = this;
    console.log(group);

    if (self.zoomStatus==="states"){
        self.zoomStatus = "areas";
        self.stateStatus = group;

        let areas2018 = self.functions.getCityTotalsForStateByYear(group, 2018);
        let areas2019 = self.functions.getCityTotalsForStateByYear(group, 2019);
        let areas2020 = self.functions.getCityTotalsForStateByYear(group, 2020);

        areas2018.forEach(function (element, index) {
            element.year = 2018;
        });

        areas2019.forEach(function (element, index) {
            element.year = 2019;
        });

        areas2020.forEach(function (element, index) {
            element.year = 2020;
        });

        self.areaData = areas2018;
        self.areaData.push(...areas2019);
        self.areaData.push(...areas2020);

        self.sumArea = d3.group(self.areaData, (d) => d.Area);

        //console.log(self.sumArea);

        self.y.domain([0, d3.max(self.areaData, function(d) { return d.TotalEmployees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        self.tip.html(function (event, d) {
                console.log(d);

                let area = d[0] ? `<p> Area: ${d[0]} </p>` : '';
                let emp2018 = d[1][0].TotalEmployees ? `<p> Employment 2018: ${d[1][0].TotalEmployees} </p>` : '';
                let emp2019 = d[1][1].TotalEmployees ? `<p> Employment 2019: ${d[1][1].TotalEmployees} </p>` : '';
                let emp2020 = d[1][2].TotalEmployees ? `<p> Employment 2020: ${d[1][2].TotalEmployees} </p>` : '';

                let text = `<div> ${area} ${emp2018} ${emp2019} ${emp2020} </div>`;

                return text;
            });

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
                console.log(d[0]);
                self.update(d[0]);
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);


    }
    else if (self.zoomStatus==="areas"){
        self.zoomStatus = "industries";

        let industries2018 = self.functions.getCitySpecificsByYear(self.stateStatus, 2018, group);
        let industries2019 = self.functions.getCitySpecificsByYear(self.stateStatus, 2019, group);
        let industries2020 = self.functions.getCitySpecificsByYear(self.stateStatus, 2020, group);

        industries2018.forEach(function (element, index) {
            element.year = 2018;
        });

        industries2019.forEach(function (element, index) {
            element.year = 2019;
        });

        industries2020.forEach(function (element, index) {
            element.year = 2020;
        });

        self.industryData = industries2018;
        self.industryData.push(...industries2019);
        self.industryData.push(...industries2020);

        //console.log(self.industryData);

        self.sumIndustry = d3.group(self.industryData, (d) => d.Industry);

        //console.log(self.sumIndustry);

        self.y.domain([0, d3.max(self.industryData, function(d) { return d.Employees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        self.tip.html(function (event, d) {
            console.log(d);

            let industry = d[0] ? `<p> Industry: ${d[0]} </p>` : '';
            let emp2018 = d[1][0].Employees ? `<p> Employment 2018: ${d[1][0].Employees} </p>` : '';
            let emp2019 = d[1][1].Employees ? `<p> Employment 2019: ${d[1][1].Employees} </p>` : '';
            let emp2020 = d[1][2].Employees ? `<p> Employment 2020: ${d[1][2].Employees} </p>` : '';

            let text = `<div> ${industry} ${emp2018} ${emp2019} ${emp2020} </div>`;

            return text;
        });

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
                //console.log(d[0]);
                self.update(d[0]);
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);
    }
    else {
        self.zoomStatus = "states";
        self.y.domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        self.tip.html(function (event, d) {
            console.log(d);

            let state = d[0] ? `<p> State: ${d[0]} </p>` : '';
            let emp2018 = d[1][0].TotalEmployees ? `<p> Employment 2018: ${d[1][0].TotalEmployees} </p>` : '';
            let emp2019 = d[1][1].TotalEmployees ? `<p> Employment 2019: ${d[1][1].TotalEmployees} </p>` : '';
            let emp2020 = d[1][2].TotalEmployees ? `<p> Employment 2020: ${d[1][2].TotalEmployees} </p>` : '';

            let text = `<div> ${state} ${emp2018} ${emp2019} ${emp2020} </div>`;

            return text;
        });

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
    }

}

