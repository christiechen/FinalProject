
function PieChartNoScope(id, functions) {
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.selectedOption = "states"
    self.selectedYear = 2018
    self.selectedState = "California"
    self.selectedArea = "Bakersfield"

    self.initVis();
}



// Pie chart  (toggle by year)
// Level 1: split total employment up by state first
// Level 2: all areas in all state’s total employment
// Level 3: all industries in all area's employment



//initialize vis
PieChartNoScope.prototype.initVis = function () {
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 750; //get current width of container on page
    self.svgHeight = 750;

    self.radius = (Math.min(self.svgWidth, self.svgHeight) / 2) - 20;


    self.svg = d3.select(`#${self.sectionId}`)
        .append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight);

    self.color = d3.scaleOrdinal()
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])


    var allGroup = ["states", "areas", "industries"]

    var allStates = self.functions.getAllStates();

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

    d3.select(`#pieChartNoScopeUpdateButton`).on("click", function (event, d) {
        // recover the option that has been chosen
        self.selectedYear = d3.select("#pieChartNoScopeYearButton").property("value");
        self.selectedOption = d3.select("#pieChartNoScopeButton").property("value");
        self.update(self.selectedOption, self.selectedYear, self.selectedState, self.selectedArea)
    });

    // legends
    //fill state legend
    d3.select(`#${self.sectionId} .pieLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .text((d) => {
            return d;
        });

    //click on state legend
    $(`#${self.sectionId} .pieLegend .legendBubble`).click(function (event) {
        let selected = this.innerText.split(" ").join("-");

        // turn all path full opacity, remove background class
        let allPaths = Array.from($(`#${self.sectionId} svg g g`));
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
        $(`#${self.sectionId} .pieLegend .legendBubble`).removeClass("selected");
        $(this).addClass("selected");


        // turn all other circles low opacity
        let otherPaths = Array.from($(`#${self.sectionId} svg g g:not(.${selected})`));
        otherPaths.forEach((el) => {
            let currentClass = ($(el).attr("class")) + ' background';
            $(el).attr("class", currentClass);
        })

        console.log(this.innerText);
        if (self.selectedOption === "areas") {
            self.areaFill(this.innerText, null, false);
        }
        if (self.selectedOption === "industries") {
            self.areaFill(this.innerText, 'white', true);
            self.industryFill();
        }

    })

    // //industry Legend
    self.industryFill = function () {
        d3.select(`#${self.sectionId} .industryLegend`)
            .selectAll('.industryLegend .entry')
            .data(self.functions.getAllIndustries())
            .enter()
            .append('div')
            .attr('class', 'entry')
            .text((d) => d)
            .attr("style", (d) => `color:${self.color(d)}`);
    }


    //area Legend
    self.areaClear = function () {
        d3.select(`#${self.sectionId} .areaLegend`)
            .selectAll('.entry')
            .remove();
    }
    self.areaFill = function (state, color, clickable) {
        self.areaClear();
        d3.select(`#${self.sectionId} .areaLegend`)
            .selectAll('.entry')
            .data(self.functions.getAllAreasInState(state))
            .enter()
            .append('div')
            .attr('class', 'entry')
            .text((d) => d)
            .attr("style", (d) => color ? `color: ${color}` : `color:${self.color(d)}`);

        if (!clickable) {
            $(`#${self.sectionId} .areaLegend`).removeClass("clickable");
            return;
        }
        //click on arealegend
        if (!$(`#${self.sectionId} .areaLegend`).hasClass("clickable")) {
            $(`#${self.sectionId} .areaLegend`).addClass("clickable");
        }
        $(`#${self.sectionId} .areaLegend .entry`).click(function (event) {
            let selected = this.innerText.toString().replaceAll(',', '').split(" ").join("-");

            if (self.selectedOption === "areas") {

            }

            // turn all circles full opacity
            let allPaths = Array.from($(`#${self.sectionId} svg g g`));

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
                let otherStatePaths = Array.from($(`#${self.sectionId} svg g g:not(.${state})`));
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
            $(`#${self.sectionId} .areaLegend .entry`).removeClass("selected");
            $(this).addClass("selected");
            console.log(selected);

            // turn all other arcs low opacity
            let otherCircles = Array.from($(`#${self.sectionId} svg g g:not(.${selected})`));
            otherCircles.forEach((el) => {
                let currentClass = ($(el).attr("class")) + ' background';
                $(el).attr("class", currentClass);
            })


        })
    }

    // industry dropdown toggle
    var allInds = self.functions.getAllIndustries();
    allInds[0] = "All Industries"

    d3.select("#pieChartNoScopeIndustriesButton")
        .selectAll('option')
        .data(allInds)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; });
    // centered vis label
    self.svg.append("text")
        .attr("x", self.svgWidth / 2)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("class", "pieChartNoScopeLabel scopeLabel")
        .text("All States")
        .style("text-anchor", "middle")
    // auto update, because we don't initialize the pieChart with data
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

    var areaArcData = []
    var stateArcData = []
    var indArcData = []
    // sort through the data, so that we can create large groups of all of the necessary data
    var stateData = self.functions.getStateByYear(currYear);
    stateData.forEach(function (f) {
        stateArcData.push(f)
        var tempAreas = self.functions.getCityTotalsForStateByYear(f["State"], currYear)
        tempAreas.forEach(function (g) {
            areaArcData.push(g)
            var tempInds = self.functions.getCitySpecificsByYear(f["State"], currYear, g["Area"])
            tempInds.sort(function (a, b) {
                if (a["State"] == b["State"]) {
                    return a["Employees"] - b["Employees"]
                }
            })
            tempInds.forEach(function (h) {
                indArcData.push(h)
            })
        })

    })

    // filter all arcData to get rid of nonValues

    areaArcData = areaArcData.filter(d => { return !isNaN(d["TotalEmployees"]) })
    stateArcData = stateArcData.filter(d => { return !isNaN(d["TotalEmployees"]) })
    indArcData = indArcData.filter(d => { return !isNaN(d["Employees"]) })

    //remove previous legend filtering
    $(`#${self.sectionId} .pieLegend .selected`).removeClass('selected');
    //clear area 
    self.areaClear();


    if (selectedOption == "areas") {
        d3.select(".pieChartNoScopeLabel")
            .text("All Areas")
        d3.select("#pieChartNoScopeIndustriesButton").style("display", "none");
        $(`#${self.sectionId} .industryLegend`).parent().css("display", "none");
        $(`#${self.sectionId} .areaLegend`).parent().css("display", "block");
        currArcData = areaArcData
    }
    else if (selectedOption == "industries") {

        d3.select("#pieChartNoScopeIndustriesButton").style("display", "block");
        d3.select(".pieChartNoScopeLabel")
            .text("All Industries")
        var currInd = d3.select("#pieChartNoScopeIndustriesButton").property("value");
        if (currInd == "All Industries") {
            currArcData = indArcData;
        } else {
            currArcData = indArcData.filter(d => d["Industry"] == currInd)
            currArcData.sort(function (a, b) {
                return a["Employees"] - b["Employees"]
            })
            console.log(currArcData)
        }
        // reassigning the pieData
        pie = d3.pie().value(function (d) { return d["Employees"] }).sort(null)
        $(`#${self.sectionId} .industryLegend`).parent().css("display", "block");
        $(`#${self.sectionId} .areaLegend`).parent().css("display", "block");

    } else if (selectedOption == "states") {
        d3.select("#pieChartNoScopeIndustriesButton").style("display", "none");
        d3.select(".pieChartNoScopeLabel")
            .text("All States")
        $(`#${self.sectionId} .industryLegend`).parent().css("display", "none");
        $(`#${self.sectionId} .areaLegend`).parent().css("display", "none");
        currArcData = stateArcData;
    }
    // sort the arc data by state so that the hover is more useful

    // Creating arc
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(self.radius);

    self.svg.selectAll("g")
        .remove();

    var g = self.svg.append("g")
        .attr("transform", `translate(${self.svgWidth / 2},${self.svgHeight / 2})`)
    // initial arcs, using the data that has been altered within the if statements
    var arcs = g.selectAll("arc")
        .data(pie(currArcData))
        .enter()
        .append("g")
        .attr("class", (d) => {
            let state = d.data.State.split(" ").join("-");
            let area = '';
            let industry = '';
            if (selectedOption === 'areas') {
                area = d.data.Area
                return state + ' ' + area;
            }
            if (selectedOption === 'industries') {
                area = d.data.Area.replaceAll(',', '').split(" ").join('-');
                industry = d.data.Industry.replaceAll(',', '').split(" ").join('-');
                return state + " " + area + " " + industry;
            }
            return state;

        });

    arcs.append("path")
        .attr("fill", (data, i) => {
            let value = data.data;
            // console.log(data);
            if (selectedOption === 'states')
                return self.color(value.State);
            if (selectedOption === 'areas')
                return self.color(value.Area);
            if (selectedOption === 'industries')
                return self.color(value.Industry);
        })
        .attr("d", arc);

    // initialize hover tooltip
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

    // call the tooltip

    self.svg.selectAll('path')
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);

    self.svg.call(self.tip);
    // exit and remove arcs
    arcs.exit().remove();

}
