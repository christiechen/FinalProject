
function PieChartNoScope(id, functions) {
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.selectedOption = "states"
    self.selectedYear = 2018
    self.selectedState = "California"
    self.selectedArea = ""

    self.initVis();
}



// Pie chart  (toggle by year)
// Level 1: split total employment up by state first
// Level 2: each area in a single state’s total employment
// Level 3: each industry in each area’s employment



//initialize vis
PieChartNoScope.prototype.initVis = function () {
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 700; //get current width of container on page
    self.svgHeight = 600;

    self.radius = (Math.min(self.svgWidth, self.svgHeight) / 2) - 20;


    self.svg = d3.select(`#${self.sectionId}`)
        .append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    self.color = d3.scaleOrdinal()
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])


    var allGroup = ["states", "areas", "industries"]

    var allStates = self.functions.getAllStates();
    d3.select("#pieChartNoScopeStatesButton")
        .selectAll('option')
        .data(allStates)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });


    //Add the options to the dropdown button
    d3.select("#pieChartNoScopeButton")
        .selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    d3.select("#pieChartNoScopeYearButton")
        .selectAll('option')
        .data([2018, 2019, 2020])
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });


    d3.select("#pieChartNoScopeStatesButton").on("change", function () {
        // recover the option that has been chosen

        var currAreas = self.functions.getAllAreasInState(d3.select(this).property("value"));

        d3.select("#pieChartNoScopeAreasButton")
            .selectAll('option')
            .data(currAreas)
            .join("option")
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

    })



    d3.select(`#pieChartNoScopeUpdateButton`).on("click", function (event, d) {
        // recover the option that has been chosen
        self.selectedYear = d3.select("#pieChartNoScopeYearButton").property("value");
        self.selectedOption = d3.select("#pieChartNoScopeButton").property("value");
        self.selectedState = d3.select("#pieChartNoScopeStatesButton").property("value");
        self.selectedArea = d3.select("#pieChartNoScopeAreasButton").property("value");
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    });

    self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)


}


// create state/industry/area search feature, depending on what option is selected
// dropdown

PieChartNoScope.prototype.update = function (selectedOption, selectedYear, selectedState, selectedArea) {
    var self = this;

    var currArcData = [];

    var currYear = parseInt(selectedYear)
    var pie = d3.pie()
        .value(function (d) { return d["TotalEmployees"] });


    var currAreas = self.functions.getAllAreasInState(selectedState);

    d3.select("#pieChartNoScopeAreasButton")
        .selectAll('option')
        .data(currAreas)
        .join("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });



    if (selectedOption == "areas") {
        d3.select("#pieChartNoScopeStatesButton").style("display", "block");
        d3.select("#pieChartNoScopeAreasButton").style("display", "none");
        var areaData = self.functions.getCityTotalsForStateByYear(selectedState, currYear)
        currArcData = areaData;
    }
    else if (selectedOption == "industries") {
        d3.select("#pieChartNoScopeStatesButton").style("display", "block");
        d3.select("#pieChartNoScopeAreasButton").style("display", "block");
        pie = d3.pie().value(function (d) { return d["Employees"] })
        selectedArea = d3.select("#pieChartNoScopeAreasButton").property("value");
        var indData = self.functions.getCitySpecificsByYear(selectedState, currYear, selectedArea)
        currArcData = indData;
    } else if (selectedOption == "states") {
        d3.select("#pieChartNoScopeStatesButton").style("display", "none");
        d3.select("#pieChartNoScopeAreasButton").style("display", "none");
        var stateData = self.functions.getStateByYear(currYear);
        currArcData = stateData;
    }

    // sort the arc data by state so that the hover is more useful

    // Creating arc
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(self.radius);


    // run the updateChart function with this selected option

    var g = self.svg.append("g")
        .attr("transform", `translate(${self.svgWidth / 2},${self.svgHeight / 2})`)

    var arcs = g.selectAll("arc")
        .data(pie(currArcData))
        .enter()
        .append("g");

    // Appending path 

    arcs.append("path")
        .attr("fill", (data, i) => {
            let value = data.data;
            // console.log(data);
            if(selectedOption === 'states')
                return self.color(value.State);
            if(selectedOption === 'areas')
                return self.color(value.Area);
            if(selectedOption === 'industries')
                return self.color(value.Industry);
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

    self.svg.selectAll('path')
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);

    self.svg.call(self.tip);

    arcs.exit().remove();
    d3.select("#pieChartNoScopeAreasButton")
        .selectAll('option').exit().remove();

}
