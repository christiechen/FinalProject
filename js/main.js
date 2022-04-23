// window.onbeforeunload = function(event)
// {
//     return confirm("Confirm refresh");
// };
// beginning page — disabled hidden for now

  let startTime;
  let selectedVis;
$("#intro .options button").click(function(){
  $('.entire-body').css('display', 'flex'); //show vis
  $("#intro .options").css('display', 'none'); //hide choices
  $("#intro .new").css('display', 'block'); //visible new button
  $(`#${this.value}`).css('display', 'block');
  selectedVis = this.value;

  console.log("=======================");
  console.log("START SESSION");
  console.log(`TYPE: ${this.value}`);

  //start time
  let date = new Date();
  startTime = date.getTime();
})
$("#intro .new button").click(()=>{
  $('.entire-body').css('display', 'none'); //hide vis
  $("#intro .options").css('display', 'block'); //show choices
  $("#intro .new").css('display', 'none'); //hide new button
  $(`.body-section > section`).css('display', 'none');

  //clear all checked radios
  $('input:checked').attr('checked',false)
})


$('#start').click( ()=>{
  let len = Array.from($(`#intro button`)).length;
  let rand = Math.floor(Math.random() * len);
  Array.from($(`#intro button`))[rand].click();
  $('#start-screen').css("display", "none");
})


let correctAnswers = Array.from($('input.correct'));

$('#finalSubmit').click(()=>{
  let selectedAnswers = Array.from($('input:not(.selfreflect):checked'));

  if(selectedAnswers.length !== correctAnswers.length){
    alert("Please fill out all 10 questions!")
    return;
  }
  let incorrect = [];
  for(let i = 0; i< correctAnswers.length; ++i){
    if(selectedAnswers[i].value != correctAnswers[i].value){
      incorrect.push(selectedAnswers[i].name);
    }
  }
  if(incorrect.length !== 0){
    console.log("INCORRECT:");
    console.log(incorrect.toString());
  }
  else{
    console.log("NO INCORRECT ANSWERS")
  }

  let date = new Date();
  let endTime = date.getTime();

  let time = (endTime - startTime) / 1000
  $('#chart_type').attr("value", selectedVis);
  $('#incorrect_qs').attr("value", incorrect.toString());
  $('#time').attr("value", time);
  


  // Array.from($('input.selfreflect:checked')).forEach((el, i) => {
  //   $(`#sf${i+1}`).attr("value", el.value);    
  // });


  if(!confirm("Are you sure you want to submit?")){
    return;
  }


  console.log("TIME TAKEN IN SECONDS:")
  console.log(time); //time in seconds
  console.log("=======================");


  $('#questions-hide').css("display", "block");
  $('#svgs').css("display", "none");
  $('#questions-timed').css("display", "none");
})

window.addEventListener("load", function() {
  const form = document.getElementById('final-form');
  form.addEventListener("submit", function(e) {
    $('#sheets-submit').attr('disabled', 'disabled');
    e.preventDefault();
    const data = new FormData(form);
    const action = e.target.action;
    fetch(action, {
      method: 'POST',
      body: data,
    })
    .then(() => {
      $('.entire-body').css('display', 'none');
      $('#end-screen').css('display', 'block');
      // alert("Thank you for participating!");
    })
    return true;
  });
});
