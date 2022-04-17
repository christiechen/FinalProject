  // beginning page — disabled hidden for now

  let startTime;
// $("#intro .options button").click(function(){
//   $('.entire-body').css('display', 'flex'); //show vis
//   $("#intro .options").css('display', 'none'); //hide choices
//   $("#intro .new").css('display', 'block'); //visible new button
//   $(`#${this.value}`).css('display', 'block');

//   console.log("=======================");
//   console.log("START SESSION");
//   console.log(`TYPE: ${this.value}`);

//   //start time
//   let date = new Date();
//   startTime = date.getTime();
// })
// $("#intro .new button").click(()=>{
//   $('.entire-body').css('display', 'none'); //hide vis
//   $("#intro .options").css('display', 'block'); //show choices
//   $("#intro .new").css('display', 'none'); //hide new button
//   $(`.body-section > section`).css('display', 'none');

//   //clear all checked radios
//   $('input:checked').attr('checked',false)
// })




let correctAnswers = Array.from($('input.correct'));

$('#finalSubmit').click(()=>{
  let selectedAnswers = Array.from($('input:not(.selfreflect):checked'));

  let incorrect = [];
  for(let i = 0; i< selectedAnswers.length; ++i){
    if(selectedAnswers[i].value != correctAnswers[i].value){
      incorrect.push(selectedAnswers[i].name);
    }
  }
  if(incorrect.length !== 0){
    console.log("INCORRECT:");
    console.log(incorrect);
  }
  else{
    console.log("NO INCORRECT ANSWERS")
  }

  let date = new Date();
  let endTime = date.getTime();

  console.log("TIME TAKEN IN SECONDS:")
  console.log((endTime-startTime) / 1000); //time in seconds
  console.log("=======================");
})