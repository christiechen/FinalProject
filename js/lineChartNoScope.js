
function LineChartNoScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;

    self.initVis();
}






//initialize vis
LineChartNoScope.prototype.initVis = function(){
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

    //console.log(state2019);
    //console.log(self.sumState);

    //console.log(self.functions.dataByState);

    self.areaData = [];

    self.functions.dataByState.forEach(function(element,state){
        for (var key in element) {
            let el = element[key];
            for (var year in el){
                self.areaData.push({"State":state, "Area":key, "Employees":+el[year][0].Employees, "Year":+year, "Class":state+"-"+key})
            }
        }
    });

    //self.sumArea = d3.group(tempAreaArr, (d)=>d.State, (d)=>d.Area);
    self.sumArea = d3.group(self.areaData, (d)=>d.Class);

    //console.log(self.sumArea);

    self.industryData = [];

    self.functions.dataByIndustry.forEach(function(element,industry){
        //console.log(element);
        if (industry!=="Total"){
            element.forEach(function(el,year){
                //console.log(el);
                //let sumTotalforIndustry = 0;
                el.forEach(function(e,state){
                    //console.log(e);
                    e.forEach(function(numEmployees,area){
                        if (area!=="Total"){
                            if (isNaN(numEmployees)) {
                                numEmployees = 0;
                            }
                            self.industryData.push({"Industry": industry, "Employees":numEmployees, "Year": year, "State":state,"Area":area, "Class":state+"-"+area+"-"+industry});
                            //sumTotalforIndustry+=numEmployees;
                        }
                    });
                });
                //self.industryData.push({"Industry": industry, "Employees":sumTotalforIndustry, "Year": year})
            });
        }
    });

    //console.log(self.industryData);

    self.sumIndustry = d3.group(self.industryData,(d)=>d.Class);
    console.log(self.sumIndustry);

    let allGroup = ["states","areas","industries"]

    //Add the options to the dropdown button
    d3.select("#selectButton")
        .selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d){return d;})
        .attr("value",function(d){return d;});

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
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']);

    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function(event, d) {

            //console.log(d);

            let state = d[1][0].State ? `<p> State: ${d[1][0].State} </p>` : '';
            let area = d[1][0].Area ? `<p> Area: ${d[1][0].Area} </p>` : '';
            let industry = d[1][0].Industry ? `<p> Industry: ${d[1][0].Industry} </p>` : '';
            let emp2018 = d[1][0].TotalEmployees ? `<p> Employment 2018: ${d[1][0].TotalEmployees} </p>` : `<p> Employment 2018: ${d[1][0].Employees} </p>`;
            let emp2019 = d[1][1].TotalEmployees ? `<p> Employment 2019: ${d[1][1].TotalEmployees} </p>` : `<p> Employment 2019: ${d[1][1].Employees} </p>`;
            let emp2020 = d[1][2].TotalEmployees ? `<p> Employment 2020: ${d[1][2].TotalEmployees} </p>` : `<p> Employment 2020: ${d[1][2].Employees} </p>`;

            let text = `<div> ${state} ${area} ${industry} ${emp2018} ${emp2019} ${emp2020} </div>`;

            return text;

        });

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
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        self.update(selectedOption)
    });

    self.svg.call(self.tip);

    // get all states
    let allStates = self.functions.getAllStates();

    // legends
    //fill state legend
    d3.select(`#${self.sectionId} .lineLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .text((d) => {
            return d;
        });

    $(`#${self.sectionId} .lineAreaLegend`).attr("style", "display:none");
    self.stateStatus = "All";

    //click on state legend
    $(`#${self.sectionId} .lineLegend .legendBubble`).click(function(event){
        self.stateStatus = this.innerText;
        self.updateAreaLegend(this);
        if($(`.legendAreaBubble.selected`).length <= 0) {
            let selected = this.innerText.split(" ").join("-");

            // turn all circles full opacity, remove background class
            let allLines = Array.from($(`#${self.sectionId} svg .line`));
            allLines.forEach((el) => {
                let currentClass = ($(el).attr("class"));
                //console.log(currentClass);
                if (currentClass.indexOf(' background') !== -1) {
                    currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
                    //console.log(currentClass);
                }
                $(el).attr("class", currentClass);
            });

            //if we're unselecting
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                self.stateStatus = "All";
                d3.select(`#${self.sectionId} .lineAreaLegend`)
                    .selectAll('.legendAreaBubble')
                    .remove();
                return;
            }

            //switch current legend click to bold text
            $(`#${self.sectionId} .lineLegend .legendBubble`).removeClass("selected");
            $(this).addClass("selected");


            // turn all other circles low opacity
            let otherLines = Array.from($(`#${self.sectionId} svg .line:not(.${selected})`));
            //console.log(otherLines);
            otherLines.forEach((el) => {
                //console.log(el);
                let currentClass = ($(el).attr("class")) + ' background';
                $(el).attr("class", currentClass);
            });
        }
    });

}

//Update the chart
LineChartNoScope.prototype.update = function(selectedOption){
    var self = this;
    //console.log(selectedOption);
    //self.svg.selectAll(".line").remove();

    if (selectedOption==="states"){
        self.y.domain([0, d3.max(self.stateData, function(d) { return d.TotalEmployees; })])

        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        $(`#${self.sectionId} .lineAreaLegend`).attr("style", "display:none");

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
    }
    else if (selectedOption==="areas"){
        self.y.domain([0, d3.max(self.areaData, function(d) { return d.Employees; })])

        //console.log(self.sumArea);

        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        $(`#${self.sectionId} .lineAreaLegend`).attr("style", "display:none");

        console.log(self.sumArea);

        self.svg.selectAll(".line")
            .data(self.sumArea)
            .join("path")
            .attr("class",function(d){return "line "+ d[1][0].State.split(" ").join("-")+" "+d[0].split(" ").join("-")})
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.Year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);
    }
    else {
        self.y.domain([0, d3.max(self.industryData, function(d) { return d.Employees; })])

        self.svg.select("#yAxis").call(d3.axisLeft(self.y));

        $(`#${self.sectionId} .lineAreaLegend`).attr("style", "display:block");

        console.log(self.sumIndustry);

        self.svg.selectAll(".line")
            .data(self.sumIndustry)
            .join("path")
            .attr("class",function(d){return "line "+ d[1][0].State.split(" ").join("-")+" "+d[1][0].State.split(" ").join("-")+"-"+d[1][0].Area.split(" ").join("-")+" "+d[1][0].Industry.split(" ").join("-")})
            .attr("fill", "none")
            .attr("stroke", function(d){ return self.color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return self.x(d.Year)+50; })
                    .y(function(d) { return self.y(d.Employees)+20; })
                    (d[1])
            })
            .on("mouseover", self.tip.show)
            .on("mouseout", self.tip.hide);
    }

}

//Update the second legend
LineChartNoScope.prototype.updateAreaLegend = function(stateThis){
    var self = this;
    console.log("twice?");
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
    }

    //click on area legend
    $(`#${self.sectionId} .lineAreaLegend .legendAreaBubble`).click(function(event){
        let selected = this.innerText.split(" ").join("-");
        console.log(selected);

        // turn all lines full opacity, remove background class
        let allLines = Array.from($(`#${self.sectionId} svg .line`));
        //console.log(allLines);
        allLines.forEach((el) => {
            let currentClass = ($(el).attr("class"));
            if (currentClass.indexOf(' background') !== -1) {
                currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
                //console.log(currentClass);
            }
            $(el).attr("class", currentClass);
        });

        console.log(this);

        //if we're unselecting
        if ($(this).hasClass('selected')) {
            //console.log(stateThis);
            $(this).removeClass('selected');
            // turn all other lines low opacity
            let otherStateLines = Array.from($(`#${self.sectionId} svg .line:not(.${stateThis.innerText.split(" ").join("-")})`));
            //console.log(otherStateLines);
            otherStateLines.forEach((el) => {
                //console.log(el);
                let currentClass = ($(el).attr("class")) + ' background';
                $(el).attr("class", currentClass);
            });
            return;
        }

        //switch current legend click to bold text
        $(`#${self.sectionId} .lineAreaLegend .legendAreaBubble`).removeClass("selected");
        $(this).addClass("selected");

        // turn all other lines low opacity
        let otherLines = Array.from($(`#${self.sectionId} svg .line:not(.${stateThis.innerText.split(" ").join("-")+"-"+selected})`));
        otherLines.forEach((el) => {
            //console.log(el);
            let currentClass = ($(el).attr("class")) + ' background';
            $(el).attr("class", currentClass);
        });
    });
}


















