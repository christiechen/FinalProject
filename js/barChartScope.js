
function BarChartScope(id, functions) {
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.scopeLevel = "states"
    self.currObj = { State: 'California', Area: 'Los Angeles-Long Beach-Anaheim', Industry: 'Trade, transportation, and utilities', Employees: 1113.3 }
    self.currYear = 2018

    self.initVis();
}



//initialize vis
BarChartScope.prototype.initVis = function () {
    var self = this;

    self.margin = { top: 30, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 700; //get current width of container on page
    self.svgHeight = 600;

    self.radius = (Math.min(self.svgWidth, self.svgHeight) / 2) - 20;


    self.svg = d3.select(`#${self.sectionId}`)
        .append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    d3.select("#barChartScopeYearButton")
        .selectAll('option')
        .data([2018, 2019, 2020])
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });




    d3.select("#barChartScopeYearButton").on("change", function () {
        // recover the option that has been chosen
        self.currYear = parseInt(d3.select(this).property("value"))
        if (self.scopeLevel == "areas") {
            self.scopeLevel = "states"
        } else if (self.scopeLevel == "industries") {
            self.scopeLevel = "areas"
        } else if (self.scopeLevel == "states") {
            self.scopeLevel = "industries"
        }
        self.update(self.scopeLevel, self.currObj, self.currYear)
    })

    self.svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${self.margin.left},0)`)

    self.svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(50, ${self.svgHeight - self.margin.bottom})`)

    //fill state legend
    let allStates = self.functions.getAllStates();

    d3.select(`#${self.sectionId} .pieLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .text((d) => {
            return d;
        });


    self.update(self.scopeLevel, self.currObj, self.currYear)


}


// create state/industry/area search feature, depending on what option is selected
// dropdown

BarChartScope.prototype.update = function (scopeLevel, scopedInto, currYear) {

    //     // adapt this for the bar chart
    var self = this;

    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')

        .html(function (event, d) {
            let state = d.State ? `<p> State: ${d.State} </p>` : '';
            let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
            let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
            let emp = d.Employees ? `<p> Employment: ${d.Employees} </p>` : `<p> Employment: ${d["TotalEmployees"]} </p>`;
            let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
            return text;

        });


    var barData = []

    var selectedState = null
    var selectedArea = null

    if (self.currObj != null) {
        selectedState = scopedInto["State"]
        selectedArea = scopedInto["Area"]
    }

    var x = d3.scaleBand()
        .range([0, self.svgWidth - self.margin.right - self.margin.left])
        .padding(0.2);

    var y = d3.scaleLinear()
        .range([self.svgHeight - self.margin.bottom, self.margin.top]);

    var bars = self.svg.selectAll("rect");

    if (scopeLevel == "industries") {
        var indData = self.functions.getCitySpecificsByYear(selectedState, currYear, selectedArea)
        barData = indData;
        barData.sort(function (a, b) {
            return a["Employees"] - b["Employees"]
        })
        barData = barData.filter(d => { return !isNaN(d["Employees"]) })

        var max = barData[barData.length - 1]["Employees"]
        x.domain(barData.map(function (d) { return d["Industry"]; }))
        y.domain([0, max])

        let allIndustries = self.functions.getAllIndustries();


        d3.select(`#${self.sectionId} .barLegend`)
            .selectAll('.legendBubble')
            .data(allIndustries)
            .join("div")
            .attr("class", 'legendBubble')
            .text((d) => {
                return d;
            });
        bars
            .data(barData)
            .join("rect")
            .attr("class", "rects")
            .attr("x", function (d) { return self.margin.left + x(d["Industry"]); })
            .attr("y", function (d) { return y(d["Employees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["Employees"]); })
            .attr("fill", "#69b3a2")
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide)
            .on("click", function (d, i) {
                self.currObj = i
                self.update(self.scopeLevel, self.currObj, self.currYear)
            });
        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "8px")
    }
    else if (scopeLevel == "states") {
        var stateData = self.functions.getStateByYear(currYear);
        barData = stateData;
        barData.sort(function (a, b) {
            return a["TotalEmployees"] - b["TotalEmployees"]
        })
        barData = barData.filter(d => { return !isNaN(d["TotalEmployees"]) })

        var max = barData[barData.length - 1]["TotalEmployees"]
        x.domain(barData.map(function (d) { return d["State"]; }))
        y.domain([0, max])

        let allStates = self.functions.getAllStates();

        d3.select(`#${self.sectionId} .barLegend`)
            .selectAll('.legendBubble')
            .data(allStates)
            .join("div")
            .attr("class", 'legendBubble')
            .text((d) => {
                return d;
            });
        bars
            .data(barData)
            .join("rect")
            .attr("class", "rects")
            .attr("x", function (d) { return self.margin.left + x(d["State"]); })
            .attr("y", function (d) { return y(d["TotalEmployees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["TotalEmployees"]); })
            .attr("fill", "#69b3a2")
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide)
            .on("click", function (d, i) {
                self.currObj = i
                self.update(self.scopeLevel, self.currObj, self.currYear)
            });
        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "8px")
    } else if (scopeLevel == "areas") {


        var areaData = self.functions.getCityTotalsForStateByYear(selectedState, currYear)
        barData = areaData;
        barData.sort(function (a, b) {
            return a["TotalEmployees"] - b["TotalEmployees"]
        })
        barData = barData.filter(d => { return !isNaN(d["TotalEmployees"]) })
        var max = barData[barData.length - 1]["TotalEmployees"]
        x.domain(barData.map(function (d) { return d["Area"]; }))
        y.domain([0, max])

        let allAreas = [];
        areaData.forEach((el) => {
            allAreas.push(el.Area);
        })

        //remove all

        d3.select(`#${self.sectionId} .barLegend`)
            .selectAll('.legendBubble')
            .data(allAreas)
            .join('div')
            .attr("class", 'legendBubble')
            .text((d) => {
                return d;
            });
        bars
            .data(barData)
            .join("rect")
            .attr("class", "rects")
            .attr("x", function (d) { return self.margin.left + x(d["Area"]); })
            .attr("y", function (d) { return y(d["TotalEmployees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["TotalEmployees"]); })
            .attr("fill", "#69b3a2")
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide)
            .on("click", function (d, i) {
                self.currObj = i
                self.update(self.scopeLevel, self.currObj, self.currYear)
            });
        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "8px")
    }



    self.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (2))
        .attr("x", (0 - (self.svgHeight / 2)))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Total Employees (thousands)")
        .style("font-size", "12px");







    self.svg.call(self.tip);

    if (scopeLevel == "areas") {
        self.scopeLevel = "industries"
    }
    else if (scopeLevel == "industries") {
        self.scopeLevel = "states"
    } else if (scopeLevel == "states") {
        self.scopeLevel = "areas"
    }




}