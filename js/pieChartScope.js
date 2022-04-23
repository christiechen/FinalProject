
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
// Level 3: each industry in a single area’s employment


//initialize vis
PieChartScope.prototype.initVis = function () {
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 700; //get current width of container on page
    self.svgHeight = 700;
    // the radius, to ensure that our pieChart is big enough
    self.radius = (Math.min(self.svgWidth, self.svgHeight) / 2) - 20;

    // color scale
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
    // the svg
    self.svg = d3.select(`#${self.sectionId}`)
        .append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    // year dropdown button
    d3.select("#pieChartScopeYearButton")
        .selectAll('option')
        .data([2018, 2019, 2020])
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });
    // chart label that indicates what information is being shown
    self.svg.append("text")
        .attr("x", self.svgWidth / 2)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("class", "pieChartScopeLabel scopeLabel")
        .text("All States")
        .style("text-anchor", "middle")

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
    // initial plot that is just allStates
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
    // tooltip that is shown on hover
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
    // if the year is changed, making sure that the scope doesn't change
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
}


// create state/industry/area search feature, depending on what option is selected
// dropdown

PieChartScope.prototype.update = function (scopeLevel, scopedInto, currYear) {

    //     // adapt this for the pie chart
    var self = this;

    self.svg.selectAll(".arcs").remove();

    var g = d3.select(".arcGroup")
    // creating the arcData that will be plotted
    var currArcData = []

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(self.radius);

    var pie = d3.pie()
        .value(function (d) { return d["TotalEmployees"] });

    var selectedState = null
    var selectedArea = null

    if (self.currObj != null) {
        // giving us the correct value, if it is accessible
        selectedState = scopedInto["State"]
        selectedArea = scopedInto["Area"]
    }

    if (scopeLevel == "areas") {
        // scoping into an area, thus reassigning scopeLevel to another level up
        self.scopeLevel = "industries"
        // reassign d3.pie() because the value is now "Employees" and not "TotalEmployees"
        pie = d3.pie().value(function (d) { return d["Employees"] })
        // array of all the industry data from the selected year, state, and area
        var indData = self.functions.getCitySpecificsByYear(selectedState, currYear, selectedArea)
        // assign the plotted arcData to this
        currArcData = indData;
        currArcData = currArcData.filter(d => { return !isNaN(d["Employees"]) })

        // array of all industry names
        let allIndustries = self.functions.getAllIndustries();
        // update Legend
        d3.select(`#${self.sectionId} .pieLegend`)
            .selectAll('.legendBubble')
            .data(allIndustries)
            .join("div")
            .attr("class", 'legendBubble')
            .attr("style", (d) => `color: ${self.color(d)}`)
            .text((d) => {
                return d;
            });
        // update label
        d3.select(".pieChartScopeLabel")
            .text("All States > " + selectedState + " > " + selectedArea)

    }
    else if (scopeLevel == "industries") {
        // scoping into an industry, thus reassigning scopeLevel to another level up
        self.scopeLevel = "states"
        //array of all the state data from the selected year
        var stateData = self.functions.getStateByYear(currYear);

        // assign the plotted arcData to this

        currArcData = stateData;
        // filter out values we don't want, this helps sorting
        currArcData = currArcData.filter(d => { return !isNaN(d["TotalEmployees"]) })


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
        // update label
        d3.select(".pieChartScopeLabel")
            .text("All States")

    } else if (scopeLevel == "states") {
        //scoping into a state, thus reassigning scopeLevel to another level up
        self.scopeLevel = "areas"
        // data from each area in the current state and year
        var areaData = self.functions.getCityTotalsForStateByYear(selectedState, currYear)
        currArcData = areaData;
        currArcData = currArcData.filter(d => { return !isNaN(d["TotalEmployees"]) })

        // array of each area name
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
        // update label
        d3.select(".pieChartScopeLabel")
            .text("All States > " + selectedState)
    }

    g.selectAll(".arcs")
        .data(pie(currArcData))
        .join("path")
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
        .attr("class", "arcs")
        .attr("d", arc)
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide)
        .on("click", function (d, i) {
            //when the arcs are clicked, the update function runs again
            self.currObj = i["data"]
            self.update(self.scopeLevel, self.currObj, self.currYear)
        })

    // instantiate hover tooltip
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
    self.svg.call(self.tip);

    // exiting and removing arcs
    g.selectAll(".arcs").exit().remove();

}