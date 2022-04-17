$(function() {
    d3.csv("population-estimate.csv").then(function(pops) {

        d3.csv("employeesByIndustry.csv").then(function(data){
            //get population data
            let popEstimates = new Map();
            popEstimates.set(2018, new Map());
            popEstimates.set(2019, new Map());
            popEstimates.set(2020, new Map());

            pops.forEach((el)=>{
                popEstimates.get(2018).set(el.NAME, el.POPESTIMATE2018);
                popEstimates.get(2019).set(el.NAME, el.POPESTIMATE2019);
                popEstimates.get(2020).set(el.NAME, el.POPESTIMATE2020);
            })
            
            console.log("POPESTIMATES");
            console.log(popEstimates);

            //get numbers to be numbers
            //remove the "(1)" from area titles
            data.forEach((el)=>{
                for(let propt in el){
                    if(propt !== "State" && propt !== "Area"){
                        el[propt] = +el[propt];
                    }
                
                }
                if(el.Area.indexOf("(") !== -1){
                    el.Area = el.Area.substring(0, el.Area.indexOf("("));
                }
                if(el.State.indexOf("(") !== -1){
                    el.State = el.State.substring(0, el.State.indexOf("("));
                }
            })

            let origData = JSON.parse(JSON.stringify(data));
            console.log(origData);

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

            //keep only certain states
            let keepVal = [
                'California',
                'Texas',
                'New York',
                'Florida',
                'Illinois',
                'Pennsylvania',
                'Ohio',
                'Georgia',
                'North Carolina',
                'Michigan',
                'New Jersey',
                'Virginia',
                'Massachusetts',
                'Washington',
                'Indiana'
                // 'Tennessee',
                // 'Wisconsin',
                // 'Minnesota',
                // 'Missouri'
            ]
            let keepValSet = new Set(keepVal);

            //remove data
            data = data.filter((el)=> {
                return keepValSet.has(el.State);
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


            

            let functions = new DataFunctions(data, dataByYear, dataByState, dataByIndustry, popEstimates);

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



            console.log("FULL DATA")
            console.log(data);
            console.log("DATA BY YEAR")
            console.log(dataByYear);
            console.log("DATA BY STATE")
            console.log(dataByState);
            console.log("DATA BY INDUSTRY")
            console.log(dataByIndustry);


            // console.log(getStateByYear(dataByYear, 2018));
            // console.log(getIndustryForYear(dataByIndustry, "Mining and Logging", 2018));
            // console.log(getIndustryForYearInState(dataByIndustry, "Mining and Logging", 2018, "Alaska"));
            // console.log(getEmploymentForYear(dataByYear, 2018));


            //EXAMPLE
            console.log("EXAMPLE ZOOM DATA");

            // example of a zoom:
            
            //level 1: all states and their total employment in a given year
            console.log(functions.getStateByYear(2018))
            
            //zooming into Alabama 
            //level 2: Alabama information – total employment in each major area (city
            // console.log(functions.getCityTotalsForStateByYear("Alabama", 2018));

            //zooming into a specific area for specific industries
            // level 3: Alabama major areas — employment for each industry
            // console.log(functions.getCitySpecificsByYear("Alabama", 2018, "Anniston-Oxford-Jacksonville"));


            // FOR SCATTERPLOT:
            console.log(functions.getUSPopulationForYear(2018));
            console.log(functions.getStatePopulationForYear("California", 2018));



            // HERE IS WHERE YOU WOULD CREATE VISUALIZATIONS.
            // Ideally, you'll pass in a few of the datasets created above and then just use functions inside each object
            // to generate the data that you need for each level.



            let barChartScope = new BarChartScope("barChartScopeSection", functions);
            let barChartNoScope = new BarChartNoScope("barChartNoScopeSection", functions);
            let scatterChartScope = new ScatterChartScope("scatterChartScopeSection", functions);
            let scatterChartNoScope = new ScatterChartNoScope("scatterChartNoScopeSection", functions);
            let pieChartScope = new PieChartScope("pieChartScopeSection", functions);
            let pieChartNoScope = new PieChartNoScope("pieChartNoScopeSection", functions);
            let lineChartScope = new LineChartScope("lineChartScopeSection", functions);
            let lineChartNoScope = new LineChartNoScope("lineChartNoScopeSection", functions);


            // GET ALL STATES AND AREAS FOR LEGENDS
            // console.log(functions.getAllStates());
            // console.log(functions.getAllAreas());
            // console.log(functions.getAllIndustries());
            console.log(functions.getStatePopulationForYear("District of Columbia", 2018));
            console.log(functions.getAllAreasInState("California"));

        });
    });
});


