$(function() {
    d3.csv("employeesByIndustry.csv").then(function(data){
        
        

        //get numbers to be numbers
        data.forEach((el)=>{
            for(let propt in el){
                if(propt !== "State" && propt !== "Area"){
                    el[propt] = +el[propt];
                }
               
            }
        })
        let origData = [...data];
        let industries = new Set();

        //split industry and year
        data.forEach((el)=>{
            for(let propt in el){
                if(propt.indexOf('-') !== -1){
                    let p = propt.split('-'); //first is year, second is industry
                    
                    //if the year property doesn't already exist
                    if(!el[p[0]]){
                        el[p[0]] = []; //create empty array for the year
                    }
                    el[p[0]].push({
                        Industry: p[1],
                        Employees: el[propt] 
                    });

                    industries.add(p[1]);
                    delete el[propt];
                }
               
            }
        })
        

        //organize by state
        data.sort((a,b)=>(a.State - b.State));

        let dataByState = new Map();
        data.forEach((el)=>{
            if(dataByState.has(el.State)){
                dataByState.get(el.State)[el.Area] = {2018: el[2018], 2019: el[2019], 2020:el[2020]};
            }
            else{
                dataByState.set(el.State, {});
            }
        })



        //split into years
        let dataByYear = new Map();
        dataByYear.set(2018, new Map());
        dataByYear.set(2019, new Map());
        dataByYear.set(2020, new Map());
        
        data.forEach((el)=>{
            let area = el.Area;
            if(!dataByYear.get(2018).has(el.State)){
                dataByYear.get(2018).set(el.State, []);
            }
            dataByYear.get(2018).get(el.State).push({Area: el.Area, Employment: el[2018]});
            if(!dataByYear.get(2019).has(el.State)){
                dataByYear.get(2019).set(el.State, []);
            }
            dataByYear.get(2019).get(el.State).push({Area: el.Area, Employment: el[2019]});
            if(!dataByYear.get(2020).has(el.State)){
                dataByYear.get(2020).set(el.State, []);
            }
            dataByYear.get(2020).get(el.State).push({Area: el.Area, Employment: el[2020]});
            
        })
        
        let dataByIndustry = new Map();
        for (let ind of industries){
            dataByIndustry.set(ind, new Map());
            dataByIndustry.get(ind).set(2018, new Map());
            dataByIndustry.get(ind).set(2019, new Map());
            dataByIndustry.get(ind).set(2020, new Map());
        }
        data.forEach((el)=>{
            let state = el.State;
            let area = el.Area;
            el[2018].forEach((el)=> {
                let currentInd = dataByIndustry.get(el.Industry);
                //no areas from this state yet
                if(!currentInd.get(2018).has(state)){
                    currentInd.get(2018).set(state, new Map());    
                }
                //add to state
                currentInd.get(2018).get(state).set(area, el.Employees);
            })
            el[2019].forEach((el)=> {
                let currentInd = dataByIndustry.get(el.Industry);
                //no areas from this state yet
                if(!currentInd.get(2019).has(state)){
                    currentInd.get(2019).set(state, new Map());    
                }
                //add to state
                currentInd.get(2019).get(state).set(area, el.Employees);
            })
            el[2020].forEach((el)=> {
                let currentInd = dataByIndustry.get(el.Industry);
                //no areas from this state yet
                if(!currentInd.get(2020).has(state)){
                    currentInd.get(2020).set(state, new Map());    
                }
                //add to state
                currentInd.get(2020).get(state).set(area, el.Employees);
            })
        })


        


        //NOTES ABOUT DATA:
        //a NaN value means that there is no data. 0 means 0. not the same thing!

        //origData      array of original Data from CSV file.
        //industries    a Set of all industries.
        //data          an array of all major areas. sorted by state
        //dataByState   a Map of all States. Key is State, value a JS object. 
                            //JS object structure: {
                            // Area: {
                                    // 2018: [Industry: ___, Employees: __] 
                            // }
                            // }

        // dataByYear   a Map of [year --> map of [state --> [objects for each area]]]
                        //example: 
                        // 2018 => Map
                                // Alabama => [ {
                                //                 Area: ___, 
                                //                 Employment: [ {Industry: ___, Employees:___ }, ...]
                                //              }, ...
                                //            ]



        
        console.log(data);
        console.log(dataByYear);
        console.log(dataByState);
        console.log(dataByIndustry);


        console.log(getStateByYear(dataByYear, 2018));
        console.log(getIndustryForYear(dataByIndustry, "Mining and Logging", 2018));
        console.log(getIndustryForYearInState(dataByIndustry, "Mining and Logging", 2018, "Alaska"));
    })
});



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
function getStateByYear(data, year){
    let yearData = data.get(year);
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
function getIndustryForYear(data, industry, year){
    let workingData= data.get(industry).get(year);
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


//get an array of employment for a given industry in a given year FOR A GIVEN STATE
function getIndustryForYearInState(data, industry, year, state){
    let workingData = getIndustryForYear(data, industry, year);
    let ret = workingData.filter((el)=> el.State === state);
    return ret;

}