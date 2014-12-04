$(document).ready(function() {
  
   // --------- 
  // Bet Page 
  // ---------   
  
  // clear out the top bet label, since it's confusing
  // $("#current_bet_label").val("");
  
  // ==== THIS and clamp() SHOULD ONLY EXIST ONCE IN APPLICATION.js, NEED TO FIGURE THAT OUT
  var lastBet = $("#bet_label").data("bet");
  var totalCash = $("#total_cash_label").data("totalCash");
  $("#bet_label span.value").text(lastBet);
  $("#total_cash_label span.value").text(totalCash);
  // ==================
  
  // make the bet inputfield and curent slider position reflect the last 
  // bet as default
  var minBet = $("#slider_bet").data("minBet");
  var defaultBet = clamp(lastBet, minBet, totalCash);
  // default the auto-fill bet to the last bet, but limit to cash the user has on hand
  $("#bet_input").val(defaultBet); 
  
  // limit the max slider amount to the players total cash
  $("#slider_bet").slider({
    value: defaultBet,
    min: minBet,
    max: totalCash,
    step: 10,
    slide: function(event, ui) {
      $("#bet_input").val(ui.value);
      $("#bet_label").text("Current bet: $" + ui.value);
    }
  });
  
  // make sure manually entering a bet will update the slider
  $("#bet_input").change(function () {
    var inputVal = parseInt($("#bet_input").val());
    inputVal = clamp(inputVal, minBet, totalCash);
    $("#slider_bet").slider("value", inputVal);
    // override the input field to match the clamped value
    $("#bet_input").val(inputVal);    
  });
  
 
  function clamp(val, min_val, max_val) {
    return Math.min(Math.max(val, min_val),max_val);
  }
}); // end document.ready