
function DataFunctions (data, dataByYear, dataByState, dataByIndustry, popEstimates){
	//function object
    var self = this;
    self.data = data;
    self.dataByYear = dataByYear;
    self.dataByState = dataByState;
    self.dataByIndustry = dataByIndustry;
    self.popEstimates = popEstimates;
}






//THESE FUNCTIONS CAN ONLY BE USED WITH CERTAIN DATASETS. ATTEMPTS TO USE WITHOUT FOLLOWING GUIDANCE MAY FAIL


//get an array of all TOTALS for a given year
// data: the dataByYear Map
//output:
// [
//     {
//         State: _____,
//         TotalEmployees: _____
//     }, ... 
// ]
DataFunctions.prototype.getStateByYear = function(year){
    var self = this;

    let yearData = self.dataByYear.get(year);
    let ret = [];

    for (let [state, areas] of yearData){
        let totalForIndIndustries = areas.find((el)=>el.Area==='Total');
        if(!totalForIndIndustries){
            continue;
        }
        let totalAcrossIndustries = totalForIndIndustries.Employment.find((el)=> el.Industry === 'Total');

        let obj = {
            State: state,
            TotalEmployees: totalAcrossIndustries.Employees
        }
        ret.push(obj);
    }

    return ret;
}


//get an array of all TOTALS in a GIVEN STATE's cities in a given year
// data: dataByState
//output:
// [
//     {
//         State: _____,
//         Area: _____,
//         TotalEmployees: _____
//     }, ... 
// ]

DataFunctions.prototype.getCityTotalsForStateByYear = function(state,  yearFilter){
    var self = this;

    let workingData = self.dataByState.get(state);
    let ret = [];
    for (let props in workingData){
        let year = workingData[props][yearFilter]; 
        for(let i = 0; i< year.length; i++){
            if(year[i].Industry === 'Total'){
                let obj = {
                    State: state,
                    Area: props,
                    TotalEmployees: year[i].Employees
                };
                ret.push(obj);
                break;
            }
        }
    }

    return ret;
}

//get an array of employment for all industries in a given area in a given state for a given year.
// data: dataByState
//output: 
// [
//     {
//         State: ____, 
//         Area: _____, 
//         Industry: ____,
//         Employees: ____,
//     }, ...
// ]
DataFunctions.prototype.getCitySpecificsByYear = function(state, yearFilter, area){
    var self = this;

    let workingData = self.dataByState.get(state);
    workingData = workingData[area][yearFilter];
    let ret = [];

    workingData.forEach((el)=>{
        //skip the "total" measure
        if(el.Industry === 'Total'){
            return false;
        }

        let obj = {
            State: state,
            Area: area,
            Industry: el.Industry,
            Employees: el.Employees
        }
        ret.push(obj);
    })

    return ret;
}


//get an array of employment for a given industry in a given year.
// data: the dataByIndustry Map
//output: 
// [
//     {
//         State: ____, 
//         Area: _____, 
//         Employees: ____,
//     }, ...
// ]
DataFunctions.prototype.getIndustryForYear = function(industry, year){
    var self = this;
    
    let workingData= self.dataByIndustry.get(industry).get(year);
    let ret = [];
    for (let [state, areas] of workingData){
        for(let [area, employees] of areas){
            let obj = {
                State: state,
                Area: area, 
                Employees: employees
            }

            ret.push(obj);
        }
    }

    return ret;
}


//get an array of employment for a given industry in a given year FOR A GIVEN STATE. Separated by AREA
// data: the dataByIndustry Map
// output
// [
//     {
//         State: ____, 
//         Area: _____, 
//         Employees: ____,
//     }, ...
// ]
DataFunctions.prototype.getIndustryForYearInState = function(industry, year, state){
    var self = this;

    let workingData = getIndustryForYear(ndustry, year);
    let ret = workingData.filter((el)=> el.State === state);
    return ret;

}

// get an array of employment for all areas in a given year. NOT separated by State
//data: dataByYear
DataFunctions.prototype.getEmploymentForYear = function(year){
    var self = this;

    let workingData = self.dataByYear.get(year);
    let ret = [];
    for (let [state, areas] of workingData){
        areas.forEach((areaEmp)=>{
            areaEmp.Employment.forEach((indEmp)=>{
                let obj = {
                    State: state,
                    Area: areaEmp.Area,
                    Employment: indEmp.Employees,
                    Industry: indEmp.Industry
                }

                ret.push(obj);
            })
        })
    }
    return ret;
}


// get an array of employment for all areas in a given year. NOT separated by State
//data: popEstimate
//returns a number
DataFunctions.prototype.getUSPopulationForYear = function(year){
    var self = this;

    return self.popEstimates.get(year).get("United States");
}


// get an array of employment for all areas in a given year. NOT separated by State
//data: popEstimate
//returns a number
DataFunctions.prototype.getStatePopulationForYear = function(state, year){
    var self = this;
    return self.popEstimates.get(year).get(state);
}


// get an array of all states
//returns an array of all states
DataFunctions.prototype.getAllStates = function(){
    var self = this;

    return Array.from(self.dataByState.keys());
}

// get an array of all areas
//data: data
//returns an array of objects with state and area props
DataFunctions.prototype.getAllAreas = function(){
    var self = this;

    let workingData = self.data
    let ret = [];
    workingData.forEach((el)=>{
        let obj = {
            State: el.State,
            Area: el.Area
        }
        ret.push(obj)
    })
    return ret;
}

// get an array of all industries
//data: data
//returns an array of objects with state and area props
DataFunctions.prototype.getAllAreasInState = function(state){
    var self = this;

    let workingData = self.dataByState.get(state);
    
    return Array.from(Object.getOwnPropertyNames(workingData));
}


// get an array of all industries
//data: data
//returns an array of objects with state and area props
DataFunctions.prototype.getAllIndustries = function(){
    var self = this;

    return Array.from(self.dataByIndustry.keys());
}
