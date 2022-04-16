
function ScatterChartNoScope (id, functions){
    var self = this;
    self.sectionId = id;
    self.functions = functions;
    self.num = 'x';
    self.denom = 'US';


    self.initVis();
}






//initialize vis
ScatterChartNoScope.prototype.initVis = function(){
    var self = this;

    self.margin = { top: 60, right: 20, bottom: 40, left: 50 };
    self.svgWidth = 500; //get current width of container on page
    self.svgHeight = 400;
    
    self.svg = d3.select(`#${self.sectionId}`)
            .append("svg")
            .attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

    // FURTHER DATA PROCESSING

    self.stateLevel = function(year){
        self.workingData = self.functions.getStateByYear(year);
        
        self.maxEmpLevel = 0; //to domain for y scale maximum
        self.xAxisTopDom = 0; //top domain for x scale
        self.workingData.forEach((el) => {
            let currentEmpLevel = self.functions.getStatePopulationForYear(el.State, year);
            if(currentEmpLevel === undefined){
                return false;
            }
            el.TotalEmployees = el.TotalEmployees * 1000;
            self.maxEmpLevel = self.maxEmpLevel > el.TotalEmployees ? self.maxEmpLevel : el.TotalEmployees;
            self.xAxisTopDom = self.xAxisTopDom > el.TotalEmployees/currentEmpLevel ? self.xAxisTopDom : el.TotalEmployees/currentEmpLevel ;
        })

        console.log(self.xAxisTopDom);



    }   
    self.areaLevel = function(year){
        let sumAreas = [];
        self.workingData = self.functions.getStateByYear(year);
        self.workingData.forEach((el)=>{                
            sumAreas = sumAreas.concat(self.functions.getCityTotalsForStateByYear(el.State, year));
        })
        self.workingData = [...sumAreas];
        
        self.maxEmpLevel = 0;
        self.xAxisTopDom = 0; //top domain for x scale
        self.workingData.forEach((el) => {
            let currentEmpLevel = self.functions.getStatePopulationForYear(el.State, year);
            el.TotalEmployees = el.TotalEmployees * 1000;
            self.maxEmpLevel = self.maxEmpLevel > el.TotalEmployees ? self.maxEmpLevel : el.TotalEmployees;
            self.xAxisTopDom = self.xAxisTopDom > el.TotalEmployees/currentEmpLevel ? self.xAxisTopDom : el.TotalEmployees/currentEmpLevel ;

        })
    }

    self.industryLevel = function(year){
        self.areaLevel(year);
        let sumIndustries = [];
        self.workingData.forEach((el)=>{
            sumIndustries = sumIndustries.concat(self.functions.getCitySpecificsByYear(el.State, year, el.Area));
        })
        self.workingData = [...sumIndustries];

        self.maxEmpLevel = 0;
        self.xAxisTopDom = 0; //top domain for x scale
        let tempMax = 0;
        self.workingData.forEach((el) => {
            let currentEmpLevel = self.functions.getStatePopulationForYear(el.State, year);
            el.Employees = el.Employees * 1000;
            if(tempMax < el.Employees){
                tempMax = el.Employees;
            }
            self.xAxisTopDom = self.xAxisTopDom > el.Employees/currentEmpLevel ? self.xAxisTopDom : el.Employees/currentEmpLevel ;
        })
        self.maxEmpLevel = tempMax;
    }


    // ======== LEGEND ========



    // ======== AXES ========

    // self.denomNum =  self.functions.getUSPopulationForYear(2018)/1000;
    self.num = "each state"

    self.yScale = d3
        .scaleLinear()
        .domain([0, 1]) //temporary yScale; this will be changed in the update.
        .range([self.svgHeight - self.margin.bottom, self.margin.top]);

    self.yAxis = d3
        .axisLeft()
        .scale(self.yScale)
        .tickFormat(d3.format(".2s"));
        // .ticks(65);

    // ======= SOME FUNCTIONS TAKEN FROM REFERENCE OF PAST PROJECTS FOR A TIME-BASED X AXIS =======
    //time
    self.xScale = d3
        .scaleLinear()
        .domain([0, 1]) //temporary xScale; this will be changed in the update
        .range([self.margin.left, self.svgWidth-self.margin.right]);

        // AXES
    self.xAxis = d3
        .axisBottom()
        .scale(self.xScale);

    self.xAxisGroup = self.svg.append("g").attr("class", "x-axis axis");
    self.yAxisGroup = self.svg.append("g").attr("class", "y-axis axis");  

    self.svg
        .select(".x-axis")
        .append("text")
        .text("% of each state's ESTIMATED population that was employed in this year")
        .attr("x", self.svgWidth - self.margin.right)
        .attr("y", 30)
        .attr("class", "axis-label")
        .attr("text-anchor", "end");



    self.svg
        .select(".y-axis")
        .append("text")
        .text("#employment in " + self.num)
        .attr("x", -20)
        .attr("y", -40)
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");


    // self.div = d3.select("body").append("div")
    //     .attr("class", "tooltip-donut scatter")
    //     .style("opacity", 0);

    self.color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])




    // FILTERING CAPABILITY

    let allGroup = ["States","Areas","Industries"]
    let allYear = [2018, 2019, 2020]

    //Add the options to the dropdown button
    d3.select(`#scatterLevel`)
        .selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function(d){return d;})
        .attr("value",function(d){return d;});
    
    d3.select(`#scatterYear`)
        .selectAll('option')
        .data(allYear)
        .enter()
        .append('option')
        .text(function(d){return d;})
        .attr("value",function(d){return d;});


    d3.select(`#scatterFilter`).on("click", function(event,d) {
        // recover the option that has been chosen
        let selectedOption = d3.select("#scatterLevel").property("value");
        console.log(selectedOption);
        let selectedYear = +d3.select("#scatterYear").property("value");
        // run the updateChart function with this selected option
        self.update(selectedOption, selectedYear);
    });
    


    // get all states
    let allStates = self.functions.getAllStates();
    
    // legend
    d3.select(`#${self.sectionId} .scatterLegend`)
        .selectAll('.legendBubble')
        .data(allStates)
        .enter()
        .append("div")
        .attr("class", 'legendBubble')
        .text((d) => {
            return d;
        });
        
    $(`#${self.sectionId} .scatterLegend .legendBubble`).click(function(event){
        let selected = this.innerText.split(" ").join("-");
        

        // turn all circles full opacity
        let allCircles = Array.from($(`#${self.sectionId} svg circle`));
        allCircles.forEach((el)=>{
            let currentClass = ($(el).attr("class"));
            if(currentClass.indexOf(' background') !== -1){
                currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
            }
            $(el).attr("class", currentClass);
        })



        //if there is a industry selected
        let industry = '';
        if($(`.entry.selected`).length > 0){
            industry = $(`.entry.selected`)[0].innerText.toString().replaceAll(',','').split(" ").join("-");
            //turn other not-california states low-opacity
            let otherIndustryCircles = Array.from($(`#${self.sectionId} svg circle:not(.${industry})`));
            otherIndustryCircles.forEach((el)=>{
                let currentClass = ($(el).attr("class")) + ' background'; 
                $(el).attr("class", currentClass);
            })

        }

        //if we're unselecting
        if($(this).hasClass('selected')){
            $(this).removeClass('selected');
            return;
        }
        $(`#${self.sectionId} .scatterLegend .legendBubble`).removeClass("selected");
        $(this).addClass("selected");


        // turn all other circles low opacity
        let otherCircles = Array.from($(`#${self.sectionId} svg circle:not(.${selected})`));
        otherCircles.forEach((el)=>{
            let currentClass = ($(el).attr("class")) + ' background'; 
            $(el).attr("class", currentClass);
        })

        //redraw other circles, potentially


    })
    //industry Legend
    d3.select(`#${self.sectionId} .industryLegend`)
        .selectAll('.industryLegend .entry')
        .data(self.functions.getAllIndustries())
        .enter()
        .append('div')
        .attr('class', 'entry')
        .text((d)=>d)
        .attr("style", (d) => `color:${self.color(d)}`);

    $(`#${self.sectionId} .industryLegend .entry`).click(function(event){
        let selected = this.innerText.toString().replaceAll(',','').split(" ").join("-");
        

        // turn all circles full opacity
        let allCircles = Array.from($(`#${self.sectionId} svg circle`));
        
        allCircles.forEach((el)=>{
            let currentClass = ($(el).attr("class"));
            if(currentClass.indexOf(' background') !== -1){
                currentClass = currentClass.substring(0, currentClass.indexOf(" background"));
            }
            $(el).attr("class", currentClass);
        })

       

        //if there is a state selected
        let state = '';
        if($(`.legendBubble.selected`).length > 0){
            state = $(`.legendBubble.selected`)[0].innerText.split(" ").join('-');
            console.log(state);
            //turn other not-california states low-opacity
            let otherStateCircles = Array.from($(`#${self.sectionId} svg circle:not(.${state})`));
            otherStateCircles.forEach((el)=>{
                let currentClass = ($(el).attr("class")) + ' background'; 
                $(el).attr("class", currentClass);
            })

        }
        
         //if we're unselecting
        if($(this).hasClass('selected')){
            $(this).removeClass('selected');
            // self.svg.select('.cover').remove();
            return;
        }
        $(`#${self.sectionId} .industryLegend .entry`).removeClass("selected");
        $(this).addClass("selected");
        
        // turn all other circles low opacity
        let otherCircles = Array.from($(`#${self.sectionId} svg circle:not(.${selected})`));
        otherCircles.forEach((el)=>{
            let currentClass = ($(el).attr("class")) + ' background'; 
            $(el).attr("class", currentClass);
        })


        //redraw other circles, potentially
        

        console.log(selected);

    })
    
    self.update("States", 2018)
    // self.update("Areas", 2018)
    // self.update("Industries", 2018)
    
};

/**
 *level: state, area, or industry
 */
ScatterChartNoScope.prototype.update = function(level, year){
    var self = this;
    console.log("update");

    $(`#${self.sectionId} .loc`).text("Total Employment Per " + level + " in " + year);

    //make industry level legend show up
    if(level === "Industries"){
        $(`#${self.sectionId} .industryLegend`).attr("style", "display:block");
    }
    else{
        $(`#${self.sectionId} .industryLegend`).attr("style", "display:none");
    }

    //GET WORKING DATA
    switch (level){
        case "States":
            self.stateLevel(year);
            break;
        case "Areas":
            self.areaLevel(year);
            break;
        case "Industries":
            self.industryLevel(year);
            break;
    }
    

    //UPDATE AXES SCALES

    self.yScale.domain([0, self.maxEmpLevel]);
    self.yAxis.scale(self.yScale);

    self.xScale.domain([0, self.xAxisTopDom * 100]); 
    self.xAxis.scale(self.xScale);


    //initial load
    self.svg.selectAll('circle')
        .remove(); //clear old ones
    

    self.tip = d3.tip().attr('class', "d3-tip")
        .direction('se')
        .html(function(event, d) {
           let state = d.State? `<p> State: ${d.State} </p>` : '';
           let area = d.Area ? `<p> Area: ${d.Area} </p>` : ``;
           let industry = d.Industry ? `<p> Industry: ${d.Industry} </p>` : ``;
           let emp = d.Employees ? `<p> Employment: ${d.Employees} </p>` : `<p> Employment: ${d.TotalEmployees} </p>`;
           let text = `<div> ${state} ${area} ${industry} ${emp} </div>`;
           return text;
           
        });


    
    //draw everything
    self.svg.selectAll('circle')
        .data(self.workingData)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", (d) => {
            if(d.Employees){
                return self.xScale(d.Employees/ self.functions.getStatePopulationForYear(d.State, year) * 100 );
            }
            return self.xScale(d.TotalEmployees/self.functions.getStatePopulationForYear(d.State, year) * 100);
        })
        .attr("cy", (d) => {
            if(d.Employees){
                return self.yScale(d.Employees);
            }
            return self.yScale(d.TotalEmployees);
        })
        .attr("fill", (d) => {
            if (self.functions.getStatePopulationForYear(d.State, year) === undefined){
                return "none";
            }
            if(level === "Industries" && isNaN(d.Employees)){
                return "none";
            }
            if(level !== "Industries" && d.TotalEmployees === undefined){
                return "none";
            }
            if(level === "Industries"){
                return self.color(d.Industry);
            }
            return self.color(d.State);
        })
        .attr("class", (d) => {
            let ret = d.State.split(" ").join("-")
            if(level === "Industries"){
                let ind = d.Industry.replaceAll(',', '');
                ret += " " + ind.split(" ").join("-");
            }
            return ret;
        });
    
    self.svg.selectAll('circle:not(.background)')
        .on("mouseover", self.tip.show)
        .on("mouseout", self.tip.hide);

        // .append('title')
        // .text((d)=>d.State + " " + d.Area + " " + d.TotalEmployees + " " + d.Employees);
    self.svg.call(self.tip);
    
    
    // AXES
    self.xAxisGroup = self.svg
        .select(".x-axis")
        .call(self.xAxis)
        .attr("transform", `translate(0, ${self.svgHeight-self.margin.bottom})`);

    self.yAxisGroup = self.svg
        .select(".y-axis")
        .call(self.yAxis)
        .attr("transform", `translate( ${self.margin.left},0)`);
    


    
    
}
