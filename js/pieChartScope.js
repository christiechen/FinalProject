
function PieChartScope(id, functions) {
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.scopeLevel = "states"
    self.currObj = null
    self.currYear = 2018

    self.initVis();
}



// Pie chart  (toggle by year)
// Level 1: split total employment up by state first
// Level 2: each area in a single state’s total employment
// Level 3: each industry in each area’s employment



//initialize vis
PieChartScope.prototype.initVis = function () {
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 700; //get current width of container on page
    self.svgHeight = 600;

    self.radius = (Math.min(self.svgWidth, self.svgHeight) / 2) - 20;


    self.color = d3.scaleOrdinal()
        .range(['#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999', '#aafaeb', '#d41c34'])

    self.svg = d3.select(`#${self.sectionId}`)
        .append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    d3.select("#pieChartScopeYearButton")
        .selectAll('option')
        .data([2018, 2019, 2020])
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    self.svg.append("text")
        .attr("x", self.svgHeight / 2)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("class", "pieChartScopeLabel")
        .text("All States")


    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(self.radius);
    var pie = d3.pie()
        .value(function (d) { return d["TotalEmployees"] });

    var g = self.svg.append("g")
        .attr("transform", `translate(${self.svgWidth / 2},${self.svgHeight / 2})`)
        .attr("class", "arcGroup")
        .attr("width", 500)
        .attr("height", 400);

    var stateData = self.functions.getStateByYear(self.currYear);

    g.selectAll(".arcs")
        .data(pie(stateData))
        .enter()
        .append("path")
        .attr("class", "arcs")
        .attr("fill", (data, i) => {
            let value = data.data;
            return self.color(value.State);

        })
        .attr("d", arc);


    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')

        .html(function (event, d) {
            d = d["data"]
            let state = d.State ? `<p> State: ${d.State} </p>` : '';
            let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
            let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
            let emp = d.Employees ? `<p> Employment: ${d.Employees} </p>` : `<p> Employment: ${d["TotalEmployees"]} </p>`;
            let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
            return text;

        });
    self.currYear = parseInt(d3.select("#pieChartScopeYearButton").property("value"));

    self.svg.selectAll('path')
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide)
        .on("click", function (d, i) {
            self.currObj = i["data"]
            self.update(self.scopeLevel, self.currObj, self.currYear)
        });

    self.svg.call(self.tip);



    d3.select("#pieChartScopeYearButton").on("change", function () {
        // recover the option that has been chosen
        self.currYear = d3.select(this).property("value")
        self.currYear = parseInt(self.currYear)
        if (self.scopeLevel == "areas") {
            self.scopeLevel = "states"
        } else if (self.scopeLevel == "industries") {
            self.scopeLevel = "areas"
        } else if (self.scopeLevel == "states") {
            self.scopeLevel = "industries"
        }
        self.update(self.scopeLevel, self.currObj, self.currYear)
    })
    self.svg.selectAll(".arcs").exit().remove();

    //fill state legend
    let allStates = self.functions.getAllStates();

    d3.select(`#${self.sectionId} .pieLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .attr("style", (d) => `color: ${self.color(d)}`)
        .text((d) => {
            return d;
        });

    // self.update(self.scopeLevel, self.currObj, self.currYear)
}


// create state/industry/area search feature, depending on what option is selected
// dropdown

PieChartScope.prototype.update = function (scopeLevel, scopedInto, currYear) {

    //     // adapt this for the pie chart
    var self = this;

    self.svg.selectAll(".arcs").remove();

    // self.svg.selectAll(".arcs").remove();

    var g = d3.select(".arcGroup")



    var currArcData = []

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(self.radius);
    var pie = d3.pie()
        .value(function (d) { return d["TotalEmployees"] });

    var selectedState = null
    var selectedArea = null

    if (self.currObj != null) {
        selectedState = scopedInto["State"]
        selectedArea = scopedInto["Area"]
    }

    if (scopeLevel == "areas") {
        self.scopeLevel = "industries"
        pie = d3.pie().value(function (d) { return d["Employees"] })
        var indData = self.functions.getCitySpecificsByYear(selectedState, currYear, selectedArea)
        currArcData = indData;

        let allIndustries = self.functions.getAllIndustries();

        d3.select(`#${self.sectionId} .pieLegend`)
            .selectAll('.legendBubble')
            .data(allIndustries)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d) => `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });

        d3.select(".pieChartScopeLabel")
            .text("All States > " + selectedState + " > " + selectedArea)

    }
    else if (scopeLevel == "industries") {
        self.scopeLevel = "states"
        var stateData = self.functions.getStateByYear(currYear);
        currArcData = stateData;

        //fill state legend
        let allStates = self.functions.getAllStates();

        d3.select(`#${self.sectionId} .pieLegend`)
            .selectAll('.legendBubble')
            .data(allStates)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d) => `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });

        d3.select(".pieChartScopeLabel")
            .text("All States")


    } else if (scopeLevel == "states") {
        self.scopeLevel = "areas"

        var areaData = self.functions.getCityTotalsForStateByYear(selectedState, currYear)
        currArcData = areaData;

        let allAreas = [];
        areaData.forEach((el) => {
            allAreas.push(el.Area);
        })

        //remove all

        d3.select(`#${self.sectionId} .pieLegend`)
            .selectAll('.legendBubble')
            .data(allAreas)
            .join('div')
            .attr("class", 'legendBubble')
            .attr("style", (d) => `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });

        d3.select(".pieChartScopeLabel")
            .text("All States > " + selectedState)
    }

    g.selectAll(".arcs")
        .data(pie(currArcData))
        .enter()
        .append("path")
        .attr("fill", (data, i) => {
            let value = data.data;

            if (self.scopeLevel === "states") {
                return self.color(value.State);
            }
            if (self.scopeLevel === "areas") {
                return self.color(value.Area);
            }
            if (self.scopeLevel === "industries") {
                return self.color(value.Industry);
            }

        })
        .attr("d", arc)
        .attr("class", "arcs")
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide)
        .on("click", function (d, i) {

            self.currObj = i["data"]
            self.update(self.scopeLevel, self.currObj, self.currYear)
        })


    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')

        .html(function (event, d) {
            d = d["data"]
            let state = d.State ? `<p> State: ${d.State} </p>` : '';
            let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
            let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
            let emp = d.Employees ? `<p> Employment: ${d.Employees} </p>` : `<p> Employment: ${d["TotalEmployees"]} </p>`;
            let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
            return text;

        });

    // g.selectAll(".arcs").transition().duration(2000);


    self.svg.selectAll(".arcs").exit().remove();



    self.svg.call(self.tip);


}