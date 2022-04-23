
function BarChartNoScope(id, functions) {
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.selectedOption = "states"
    self.selectedYear = 2018
    self.selectedState = "California";
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

    self.margin = { top: 5, right: 20, bottom: 150, left: 50 };
    self.svgWidth = 1000; //get current width of container on page
    self.svgHeight = 600;


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

    // year select button

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



    d3.select(`#barChartNoScopeUpdateButton`).on("click", function (event, d) {
        // recover the option that has been chosen
        self.selectedYear = d3.select("#barChartNoScopeYearButton").property("value");
        self.selectedOption = d3.select("#barChartNoScopeButton").property("value");
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    });

    // legends

    // var allInds = self.functions.getAllIndustries().filter((el)=> el!=="Total");
    var allInds = self.functions.getAllIndustries();
    allInds[0] = "All Industries"

    d3.select("#barChartNoScopeIndustriesButton")
        .selectAll('option')
        .data(allInds)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });


    var allStates = self.functions.getAllStates();

    //fill state legend
    d3.select(`#barChartNoScopeSection .barLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .text((d) => {
            return d;
        });

    //click on state legend
    $(`#barChartNoScopeSection .barLegend .legendBubble`).click(function (event) {
        let selected = this.innerText.split(" ").join("-");

        // turn all path full opacity, remove background class
        let allPaths = Array.from($(`#${self.sectionId} svg rect`));
        allPaths.forEach((el) => {
            let currentClass = ($(el).attr("class"));
            if (currentClass.indexOf(' background') !== -1) {
                currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
            }
            $(el).attr("class", currentClass);
        })


        //if we're unselecting
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            //clear area 
            self.areaClear();
            return;
        }

        //switch current legend click to bold text
        $(`#barChartNoScopeSection .barLegend .legendBubble`).removeClass("selected");
        $(this).addClass("selected");


        // turn all other circles low opacity
        let otherPaths = Array.from($(`#${self.sectionId} svg rect:not(.${selected})`));
        otherPaths.forEach((el) => {
            let currentClass = ($(el).attr("class")) + ' background';
            $(el).attr("class", currentClass);
        })

        if (self.selectedOption === "areas") {
            self.areaFill(this.innerText, null, false);
        }
        if (self.selectedOption === "industries") {
            self.areaFill(this.innerText, 'white', true);
            // self.industryFill();
        }

    })

    //area Legend
    self.areaClear = function () {
        d3.select(`#barChartNoScopeSection .areaLegend`)
            .selectAll('.entry')
            .remove();
    }
    self.areaFill = function (state, color, clickable) {
        self.areaClear();
        d3.select(`#barChartNoScopeSection .areaLegend`)
            .selectAll('.entry')
            .data(self.functions.getAllAreasInState(state))
            .enter()
            .append('div')
            .attr('class', 'entry')
            .text((d) => d)

        if (!clickable) {
            $(`#barChartNoScopeSection .areaLegend`).removeClass("clickable");
            return;
        }
        //click on arealegend
        if (!$(`#barChartNoScopeSection .areaLegend`).hasClass("clickable")) {
            $(`#barChartNoScopeSection .areaLegend`).addClass("clickable");
        }
        $(`#barChartNoScopeSection .areaLegend .entry`).click(function (event) {
            let selected = this.innerText.toString().replaceAll(',', '').split(" ").join("-");

            if (self.selectedOption === "areas") {

            }

            // turn all circles full opacity
            let allPaths = Array.from($(`#${self.sectionId} svg rect`));

            allPaths.forEach((el) => {
                let currentClass = ($(el).attr("class"));
                if (currentClass.indexOf(' background') !== -1) {
                    currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
                }
                $(el).attr("class", currentClass);
            })

            //if there is a state selected
            let state = '';


            if ($(`.legendBubble.selected`).length > 0) {
                state = $(`.legendBubble.selected`)[0].innerText.split(" ").join('-'); //current selected state

                //turn other not-selected states low-opacity
                let otherStatePaths = Array.from($(`#${self.sectionId} svg rect:not(.${state})`));
                otherStatePaths.forEach((el) => {
                    let currentClass = ($(el).attr("class")) + ' background';
                    $(el).attr("class", currentClass);
                })

            }


            //if we're unselecting
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');

                return;
            }

            //remove previously selected area
            $(`#barChartNoScopeSection .areaLegend .entry`).removeClass("selected");
            $(this).addClass("selected");

            // turn all other arcs low opacity
            let otherRects = Array.from($(`#${self.sectionId} svg rect:not(.${selected})`));
            otherRects.forEach((el) => {
                let currentClass = ($(el).attr("class")) + ' background';
                $(el).attr("class", currentClass);
            })


        })
    }

    // update when selected industry is changedTouches
    d3.select("#barChartNoScopeIndustriesButton").on("click", function () {
        // recover the option that has been chosen
        self.selectedYear = d3.select("#barChartNoScopeYearButton").property("value");
        self.selectedOption = d3.select("#barChartNoScopeButton").property("value");
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    })
    // label

    self.svg.append("text")
        .attr("x", self.svgWidth / 2)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("class", "barChartNoScopeLabel scopeLabel")
        .text("All States")


    self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
}


BarChartNoScope.prototype.update = function (selectedOption, selectedYear, selectedState, selectedArea) {
    var self = this;

    //get selection
    let selEntry = $(`.entry.selected`);
    let selLegend = $(`.legendBubble.selected`)
    // clear selection
    selEntry.trigger("click");
    selLegend.trigger("click");


    var barData = [];

    var currYear = parseInt(selectedYear)

    var currAreas = self.functions.getAllAreasInState(selectedState);

    var areaBars = []
    var stateBars = []
    var indBars = []

    // arranging the bar data

    var stateData = self.functions.getStateByYear(currYear);
    stateData.forEach(function (f) {
        stateBars.push(f)
        var tempAreas = self.functions.getCityTotalsForStateByYear(f["State"], currYear)
        tempAreas.forEach(function (g) {
            areaBars.push(g)
            var tempInds = self.functions.getCitySpecificsByYear(f["State"], currYear, g["Area"])
            tempInds.forEach(function (h) {
                indBars.push(h)
            })
        })

    })

    //remove previous legend filtering
    $(`#barChartNoScopeSection .barLegend .selected`).removeClass('selected');
    //clear area 
    self.areaClear();
    // axes

    var x = d3.scaleBand()
        .range([0, self.svgWidth - self.margin.left - self.margin.right])
        .padding(0.2);

    var y = d3.scaleLinear()
        .range([self.svgHeight - self.margin.bottom, self.margin.top]);

    var bars = self.svg.selectAll("rect");

    // 
    if (selectedOption == "areas") {
        d3.select(".barChartNoScopeLabel")
            .text("All Areas")
        d3.select("#barChartNoScopeIndustriesButton").style("display", "none");

        $(`#barChartNoScopeSection .areaLegend`).parent().css("display", "block");
        barData = areaBars;
        barData = barData.filter(d => { return !isNaN(d["TotalEmployees"]) })

        barData.sort(function (a, b) {
            return a["TotalEmployees"] - b["TotalEmployees"]
        })
        // setting axes
        var max = barData[barData.length - 1]["TotalEmployees"]
        var currRange = d3.range(0, barData.length)
        x.domain(currRange)
        y.domain([0, max])
        // calling axes

        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .text(function (d, i) {
                return barData[i]["Area"]
            })
            .attr("transform", "translate(-10,10)rotate(-90)")
            .style("text-anchor", "end")
            .style("font-size", "8px")
        self.svg.select(".yAxis").call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "8px")
        // appending
        bars
            .data(barData)
            .join("rect")
            .attr("x", function (d, i) { return self.margin.left + x(i); })
            .attr("y", function (d) { return y(d["TotalEmployees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["TotalEmployees"]); })
            .attr("fill", "#69b3a2")
            .attr("class", (d) => "rects " + d.State.split(" ").join("-") + " " + d.Area.replaceAll(',', '').split(" ").join("-"));
    }
    else if (selectedOption == "industries") {

        d3.select("#barChartNoScopeIndustriesButton").style("display", "block");
        $(`#barChartNoScopeSection .areaLegend`).parent().css("display", "block");

        var currInd = d3.select("#barChartNoScopeIndustriesButton").property("value");
        if (currInd == "All Industries") {
            barData = indBars;
        } else {
            barData = indBars.filter(d => d["Industry"] == currInd)
        }

        d3.select(".barChartNoScopeLabel")
            .text(currInd)

        // filtering data

        barData = barData.filter(d => { return !isNaN(d["Employees"]) })

        // REMOVING TOTALS
        barData = barData.filter(d => { return d.Area !== "Total" })

        barData.sort(function (a, b) {
            return a["Employees"] - b["Employees"]
        })

        // setting domains
        var max = barData[barData.length - 1]["Employees"]
        var currRange = d3.range(0, barData.length)
        x.domain(currRange)
        y.domain([0, max])
        // calling axes
        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .text(function (d, i) {
                return barData[i]["Area"]
            })
            .attr("transform", "translate(-10,10)rotate(-90)")
            .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "8px")

        bars
            .data(barData)
            .join("rect")
            .attr("x", function (d, i) { return self.margin.left + x(i); })
            .attr("y", function (d) { return y(d["Employees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["Employees"]); })
            .attr("fill", "#69b3a2")
            .attr("class", (d) => {
                return "rects " + d.State.split(" ").join("-") + " " + d.Area.replaceAll(',', '').split(" ").join("-") + " " + d.Industry.replaceAll(',', '').split(" ").join("-");
            })
    } else if (selectedOption == "states") {
        d3.select(".barChartNoScopeLabel")
            .text("All States")
        d3.select("#barChartNoScopeIndustriesButton").style("display", "none");

        $(`#barChartNoScopeSection .areaLegend`).parent().css("display", "none");
        barData = stateBars;
        barData = barData.filter(d => { return !isNaN(d["TotalEmployees"]) })

        barData.sort(function (a, b) {
            return a["TotalEmployees"] - b["TotalEmployees"]
        })

        var max = barData[barData.length - 1]["TotalEmployees"]
        var currRange = d3.range(0, barData.length)
        x.domain(currRange)
        y.domain([0, max])

        self.svg.select(".xAxis").call(d3.axisBottom(x))
            .selectAll("text")
            .text(function (d, i) {
                return barData[i]["State"]
            })
            .attr("transform", "translate(-10,10)rotate(-90)")
            .style("text-anchor", "end")
        self.svg.select(".yAxis").call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "8px")

        console.log(barData)

        bars
            .data(barData)
            .join("rect")
            .attr("x", function (d, i) { return self.margin.left + x(i); })
            .attr("y", function (d) { return y(d["TotalEmployees"]); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return self.svgHeight - self.margin.bottom - y(d["TotalEmployees"]); })
            .attr("fill", "#69b3a2")
            .attr("class", (d) => "rects " + d.State.split(" ").join("-"))
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

    // reclick
    selEntry.trigger("click");
    selLegend.trigger("click");
}

