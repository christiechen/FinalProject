
function BarChartNoScope(id, functions) {
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.selectedOption = "states"
    self.selectedYear = 2018
    self.selectedState = "Alabama"
    self.selectedArea = ""
    self.initVis();
}

// Bar chart (toggle by year)
// Level 1: x axis: state, y axis: total employment
// Level 2: x axis: area, y axis: total employment
// Level 3: x axis: industry, y axis: total employment





//initialize vis
BarChartNoScope.prototype.initVis = function () {
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 500; //get current width of container on page
    self.svgHeight = 400;


    self.svg = d3.select(`#${self.sectionId}`)
        .append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);



    var allGroup = ["states", "areas", "industries"]

    var allStates = self.functions.getAllStates();
    d3.select("#barChartNoScopeStatesButton")
        .selectAll('option')
        .data(allStates)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });


    //Add the options to the dropdown button
    d3.select("#barChartNoScopeButton")
        .selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    d3.select("#barChartNoScopeYearButton")
        .selectAll('option')
        .data([2018, 2019, 2020])
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    self.svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${self.margin.left},0)`)

    self.svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(${self.margin.left}, ${self.svgHeight - self.margin.bottom})`)






    d3.select("#barChartNoScopeButton").on("change", function () {
        // recover the option that has been chosen
        self.selectedOption = d3.select(this).property("value")
        self.selectedYear = d3.select("#barChartNoScopeYearButton").property("value");
        self.selectedState = d3.select("#barChartNoScopeStatesButton").property("value");
        self.selectedArea = d3.select("#barChartNoScopeAreasButton").property("value");

        // run the updateChart function with this selected option
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    });

    d3.select("#barChartNoScopeYearButton").on("change", function () {
        // recover the option that has been chosen
        self.selectedYear = d3.select(this).property("value")
        self.selectedOption = d3.select("#barChartNoScopeButton").property("value");
        self.selectedState = d3.select("#barChartNoScopeStatesButton").property("value");
        self.selectedArea = d3.select("#barChartNoScopeAreasButton").property("value");
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    })

    d3.select("#barChartNoScopeStatesButton").on("change", function () {
        // recover the option that has been chosen
        self.selectedState = d3.select(this).property("value")
        self.selectedOption = d3.select("#barChartNoScopeButton").property("value");
        self.selectedYear = d3.select("#barChartNoScopeYearButton").property("value");
        self.selectedArea = d3.select("#barChartNoScopeAreasButton").property("value");


        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    })
    d3.select("#barChartNoScopeAreasButton").on("change", function () {
        // recover the option that has been chosen
        self.selectedArea = d3.select(this).property("value")
        self.selectedYear = d3.select("#barChartNoScopeYearButton").property("value");
        self.selectedOption = d3.select("#barChartNoScopeButton").property("value");
        self.selectedState = d3.select("#barChartNoScopeStatesButton").property("value");
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    })


    self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)


}


BarChartNoScope.prototype.update = function (selectedOption, selectedYear, selectedState, selectedArea) {
    var self = this;

    var barData = [];

    var currYear = parseInt(selectedYear)


    var currAreas = self.functions.getAllAreasInState(selectedState);


    var x = d3.scaleBand()
        .range([0, self.svgWidth - self.margin.left - self.margin.right])
        .padding(0.2);

    var y = d3.scaleLinear()
        .range([self.svgHeight - self.margin.bottom, 0]);

    var bars = self.svg.selectAll("rect");


    d3.select("#barChartNoScopeAreasButton")
        .selectAll('option')
        .data(currAreas)
        .join("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });

    if (selectedOption == "areas") {
        d3.select("#barChartNoScopeStatesButton").style("display", "block");
        d3.select("#barChartNoScopeAreasButton").style("display", "none");
        var areaData = self.functions.getCityTotalsForStateByYear(selectedState, currYear)
        barData = areaData;
        barData.sort(function (a, b) {
            return a["TotalEmployees"] - b["TotalEmployees"]
        })
        barData = barData.filter(d => { return !isNaN(d["TotalEmployees"]) })
        var max = barData[barData.length - 1]["TotalEmployees"]
        x.domain(barData.map(function (d) { return d["Area"]; }))
        y.domain([0, max])

        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))

        bars
            .data(barData)
            .join("rect")
            .attr("x", function (d) { return self.margin.left + x(d["Area"]); })
            .attr("y", function (d) { return y(d["TotalEmployees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["TotalEmployees"]); })
            .attr("fill", "#69b3a2")
            .attr("class", "yAxis")
    }
    else if (selectedOption == "industries") {
        d3.select("#barChartNoScopeStatesButton").style("display", "block");
        d3.select("#barChartNoScopeAreasButton").style("display", "block");
        selectedArea = d3.select("#barChartNoScopeAreasButton").property("value");
        var indData = self.functions.getCitySpecificsByYear(selectedState, currYear, selectedArea)
        barData = indData;
        barData.sort(function (a, b) {
            return a["Employees"] - b["Employees"]
        })
        barData = barData.filter(d => { return !isNaN(d["Employees"]) })

        var max = barData[barData.length - 1]["Employees"]
        x.domain(barData.map(function (d) { return d["Industry"]; }))
        y.domain([0, max])

        self.svg.select(".xAxis").call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))

        bars
            .data(barData)
            .join("rect")
            .attr("x", function (d) { return self.margin.left +  x(d["Industry"]); })
            .attr("y", function (d) { return y(d["Employees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["Employees"]); })
            .attr("fill", "#69b3a2")
    } else if (selectedOption == "states") {
        d3.select("#barChartNoScopeStatesButton").style("display", "none");
        d3.select("#barChartNoScopeAreasButton").style("display", "none");
        var stateData = self.functions.getStateByYear(currYear);
        barData = stateData;
        barData.sort(function (a, b) {
            return a["TotalEmployees"] - b["TotalEmployees"]
        })
        barData = barData.filter(d => { return !isNaN(d["TotalEmployees"]) })

        var max = barData[barData.length - 1]["TotalEmployees"]
        x.domain(barData.map(function (d) { return d["State"]; }))
        y.domain([0, max])

        self.svg.select(".xAxis").call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))

        bars
            .data(barData)
            .join("rect")
            .attr("x", function (d) { return self.margin.left + x(d["State"]); })
            .attr("y", function (d) { return y(d["TotalEmployees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["TotalEmployees"]); })
            .attr("fill", "#69b3a2")
    }





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

    self.svg.selectAll('rect')
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);

    self.svg.call(self.tip);

    d3.select("#barChartNoScopeAreasButton")
        .selectAll('option').exit().remove();
    // d3.select(".xAxis").selectAll("g").exit().remove();
    // d3.select(".yAxis").selectAll("g").exit().remove();



    // bars.exit().remove();

}

