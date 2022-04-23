
function LineChartNoScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.showing = '';

    self.initVis();
}






// Initialize line chart (no scoping) visualization
// Level 1: x axis: year, y axis: total employment in each state
// Level 2: x axis: year, y axis: total employment in each area
// Level 3: x axis: year, y axis: total employment in each industry in each area
LineChartNoScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 60, left: 50 };
    self.svgWidth = 600;
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


    // DATA PROCESSING FOR LEVEL 2

    self.areaData = [];

    // Data gathering- for each state, get data for each area and store them with appropriate properties
    self.functions.dataByState.forEach(function(element,state){
        for (var key in element) {
            let el = element[key];
            for (var year in el){
                self.areaData.push({"State":state, "Area":key, "Employees":+el[year][0].Employees, "Year":+year, "Class":state+"-"+key})
            }
        }
    });

    // Grouping by area
    self.sumArea = d3.group(self.areaData, (d)=>d.Class);


    // DATA PROCESSING FOR LEVEL 3

    self.industryData = [];

    // Data gathering- for each area, get data for each industry and store them with appropriate properties
    self.functions.dataByIndustry.forEach(function(element,industry){
        if (industry!=="Total"){
            element.forEach(function(el,year){
                el.forEach(function(e,state){
                    e.forEach(function(numEmployees,area){
                        if (area!=="Total"){
                            if (isNaN(numEmployees)) {
                                numEmployees = 0;
                            }
                            self.industryData.push({"Industry": industry, "Employees":numEmployees, "Year": year, "State":state,"Area":area, "Class":state+"-"+area+"-"+industry});
                        }
                    });
                });
            });
        }
    });

    // Grouping by area+industry
    self.sumIndustry = d3.group(self.industryData,(d)=>d.Class);


    // Options of the dropdown menu (level 1, 2, 3)
    let allGroup = ["states","areas","industries"]

    // Add the options to the dropdown button
    d3.select("#selectButton")
        .selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d){return d;})
        .attr("value",function(d){return d;});


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


    // Color palette
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


    // Tooltip setup
    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function(event, d) {

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
        .attr("class",function(d){return "line "+ d[0].split(" ").join("-")})
        .attr("fill", "none")
        .attr("stroke", function(d){ return self.color(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return self.x(d.year)+50; })
                .y(function(d) { return self.y(d.TotalEmployees)+20; })
                (d[1])
        })
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(event,d) {
        // recover the option that has been chosen
        self.selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        self.update();
    });

    self.svg.call(self.tip);


    // Get all states
    let allStates = self.functions.getAllStates();


    // LEGENDS
    // Fill state (initial level) legend
    d3.select(`#${self.sectionId} .lineLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .text((d) => {
            return d;
        });

    // Initially the other two legends for deeper levels are not displayed
    $(`#${self.sectionId} .lineAreaLegend`).css("display", "none");
    $(`#${self.sectionId} .colorLegend`).css("display", "none");
    self.stateStatus = "All"; // Initially all states are displayed; none is selected

    // Click on state legend
    $(`#${self.sectionId} .lineLegend .legendBubble`).click(function(event){
        self.stateStatus = this.innerText;
        self.updateAreaLegend(this); // Update area legend appropriately
        self.colorLegendFill(); // Update color legend appropriately
        if($(`.legendAreaBubble.selected`).length <= 0) {
            let selected = this.innerText.split(" ").join("-");

            // Turn all circles full opacity, remove background class
            let allLines = Array.from($(`#${self.sectionId} svg .line`));
            allLines.forEach((el) => {
                let currentClass = ($(el).attr("class"));
                if (currentClass.indexOf(' background') !== -1) {
                    currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
                }
                $(el).attr("class", currentClass);
            });

            //if we're unselecting
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                self.stateStatus = "All"; // none of the states is selected
                // remove entries in area legend
                d3.select(`#${self.sectionId} .lineAreaLegend`)
                    .selectAll('.legendAreaBubble')
                    .remove();
                self.colorLegendFill(); // update color legend accordingly
                return;
            }

            //switch current legend click to bold text
            $(`#${self.sectionId} .lineLegend .legendBubble`).removeClass("selected");
            $(this).addClass("selected");


            // turn all other circles low opacity
            let otherLines = Array.from($(`#${self.sectionId} svg .line:not(.${selected})`));
            otherLines.forEach((el) => {
                let currentClass = ($(el).attr("class")) + ' background';
                $(el).attr("class", currentClass);
            });
        }
    });

    // Color Legend (Non-clickable)
    self.colorLegendFill = function() {
        // when the chart is at level 2 (areas)
        if (self.selectedOption==="areas"){
            // when none of the states is selected, remove all entries in color legend
            if (self.stateStatus==="All"){
                d3.select(`#${self.sectionId} .colorLegend`)
                    .selectAll('.colorLegend .entry')
                    .remove();
            }
            // when a state is selected, fill in the color legend with areas
            else {
                d3.select(`#${self.sectionId} .colorLegend`)
                    .selectAll('.colorLegend .entry')
                    .data(self.functions.getAllAreasInState(self.stateStatus))
                    .join('div')
                    .attr('class', 'entry')
                    .text((d)=>d)
                    .attr("style", (d) => `color:${self.color(d)}`);
            }
        }
        // when the chart is at level 3 (industries), fill in the color legend with industries
        else if (self.selectedOption==="industries"){
            d3.select(`#${self.sectionId} .colorLegend`)
                .selectAll('.colorLegend .entry')
                .data(self.functions.getAllIndustries())
                .enter()
                .append('div')
                .attr('class', 'entry')
                .text((d)=>d)
                .attr("style", (d) => `color:${self.color(d)}`);
        }
        // when the chart is at level 1 (states), remove all the entries in color legend
        else {
            d3.select(`#${self.sectionId} .colorLegend`)
                .selectAll('.colorLegend .entry')
                .remove();
        }
    }

    // Adding showing label
    $(`#${self.sectionId} .scopeLabel`)
        .text(self.showing + " All States")
}

//Update the chart
LineChartNoScope.prototype.update = function(){
    var self = this;

    // When the chart is at level 1 (states)
    if (self.selectedOption==="states"){

        // Update y axis
        self.y.domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        // Do not display 2nd and 3rd legends
        $(`#${self.sectionId} .lineAreaLegend`).css("display", "none");
        $(`#${self.sectionId} .colorLegend`).css("display", "none");

        self.colorLegendFill(); // Update color legend

        // Line chart implementation
        self.svg.selectAll(".line")
            .data(self.sumState)
            .join("path")
            .attr("class",function(d){return "line "+ d[0].split(" ").join("-");})
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]);})
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.year)+50; })
                    .y(function(d) { return self.y(d.TotalEmployees)+20; })
                    (d[1])
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);
        $('.scopeLabel')
            .text(self.showing + "All States");
    }
    // When the chart is at level 2 (areas)
    else if (self.selectedOption==="areas"){

        // Update y axis
        self.y.domain([0, d3.max(self.areaData, function(d) { return d.Employees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        // Only display color legend. Do not display 2nd legend
        $(`#${self.sectionId} .lineAreaLegend`).css("display", "none");
        $(`#${self.sectionId} .colorLegend`).css("display", "block");
        self.colorLegendFill(); // Update color legend

        // Line chart implementation
        self.svg.selectAll(".line")
            .data(self.sumArea)
            .join("path")
            .attr("class",function(d){return "line "+ d[1][0].State.split(" ").join("-")+" "+d[0].split(" ").join("-")})
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[1][0].Area) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.Year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);
        
        $('.scopeLabel')
            .text(self.showing + "All Areas");
    }
    // When the chart is at level 3 (industries)
    else {

        // Update y axis
        self.y.domain([0, d3.max(self.industryData, function(d) { return d.Employees; })])
        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        // Display all three legends
        $(`#${self.sectionId} .lineAreaLegend`).css("display", "block");
        $(`#${self.sectionId} .colorLegend`).css("display", "block");
        self.colorLegendFill(); // Update color legend

        // Line chart implementation
        self.svg.selectAll(".line")
            .data(self.sumIndustry)
            .join("path")
            .attr("class",function(d){return "line "+ d[1][0].State.split(" ").join("-")+" "+d[1][0].State.split(" ").join("-")+"-"+d[1][0].Area.split(" ").join("-")+" "+d[1][0].Industry.split(" ").join("-")})
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[1][0].Industry) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.Year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);
        
        $('.scopeLabel')
            .text(self.showing + "All Industries");
    }

}

// Update the second legend
LineChartNoScope.prototype.updateAreaLegend = function(stateThis){
    var self = this;
    if (self.stateStatus !== "All") {
        //fill area legend
        d3.select(`#${self.sectionId} .lineAreaLegend`)
            .selectAll('.legendAreaBubble')
            .data(self.functions.getAllAreasInState(self.stateStatus))
            .join("div")
            .attr("class", 'legendAreaBubble')
            .text((d) => {
                return d;
            });

        //click on area legend
        $(`#${self.sectionId} .lineAreaLegend .legendAreaBubble`).click(function (event) {
            event.stopImmediatePropagation(); // Prevent clicking event happening twice
            let selected = this.innerText.split(" ").join("-");
            self.colorLegendFill(); // Update color legend

            // turn all lines full opacity, remove background class
            let allLines = Array.from($(`#${self.sectionId} svg .line`));
            allLines.forEach((el) => {
                let currentClass = ($(el).attr("class"));
                if (currentClass.indexOf(' background') !== -1) {
                    currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
                }
                $(el).attr("class", currentClass);
            });

            //if we're unselecting
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                // turn all other lines low opacity
                let otherStateLines = Array.from($(`#${self.sectionId} svg .line:not(.${self.stateStatus.split(" ").join("-")})`));
                otherStateLines.forEach((el) => {
                    let currentClass = ($(el).attr("class")) + ' background';
                    $(el).attr("class", currentClass);
                });
                return;
            }

            //switch current legend click to bold text
            $(`#${self.sectionId} .lineAreaLegend .legendAreaBubble`).removeClass("selected");
            $(this).addClass("selected");

            // turn all other lines low opacity
            let otherLines = Array.from($(`#${self.sectionId} svg .line:not(.${self.stateStatus.split(" ").join("-") + "-" + selected})`));
            otherLines.forEach((el) => {
                let currentClass = ($(el).attr("class")) + ' background';
                $(el).attr("class", currentClass);
            });
        });
    }
    
}


















