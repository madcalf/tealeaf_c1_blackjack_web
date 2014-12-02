$(document).ready(function() {
  
  // --------- 
  // New Player Page 
  // --------- 
  // Might want to name and call this function just for consistency
  // instead of using the anonymous func which still gets a little confusing...
  // Really not sure what the purpose of that outer anonymous function wrapper is...
  // $(function() {

  // --------- 
  // Slider and input for startup cash
  // --------- 

  var lastBet = $("#bet_label").data("bet");
  var totalCash = $("#total_cash_label").data("totalCash");
  $("#bet_label span.value").text(lastBet);
  $("#total_cash_label span.value").text(totalCash);
    
  var default_val = 1500;
  var min_val = 1000;
  var max_val = 5000;
  // 
  
  $("#slider_start_cash" ).slider({
    min:    min_val, 
    max:    max_val, 
    step:   100,
    value:  default_val,
    slide:  function(event, ui) {
      $("#input_total_cash").val(ui.value);
      $("#total_cash_label").text("Cash on hand: $" + ui.value);
    }
  });
  
  $("#input_total_cash").val(default_val); // default start value

  // make sure entering manual values in the input field updates the slider
  $("#input_total_cash").change(function() {
    // limit entered value to our range defined above
    var inputVal = parseInt($("#input_total_cash").val());
    inputVal = clamp(inputVal, min_val, max_val);
    $("#slider_start_cash").slider("value", inputVal);
    // override the input field to match the clamped value
    $("#input_total_cash").val(inputVal);
  });
  // });
  
  

  
  // update the input field to match the calcualted auto-fill bet
  // 
  
  // --------- 
  // card animation 
  // --------- 

  hidePlayerCards();
  // hideDealerCards();
  showPlayerCards();
  var id = setTimeout(showDealerCards, 1000);
  
  
  function hidePlayerCards() {
    var $playerCards = $('#player li img');
    $playerCards.hide();  // hide all first    
  }
  
  // Note will want to simply show all player cards when dealer's turn
  // Don't don't want to keep animating the last one at that point
  function showPlayerCards() {
    var $playerCards = $('#player li img');
    var $newCards = $('player li img.new');
    $playerCards.hide();  // hide all first
          
    $playerCards.each(function(index, card) {
      console.log($(this.type) + "  is new: " + $(this).hasClass("new"));
      if ($(this).hasClass("new")) {
        $(this).delay(300 * index).fadeIn('fast');
      } else {
        $(this).show();
      }
    });
  }
  
  function hideDealerCards() {
    var $dealerCards = $('#dealer li img');
    $dealerCards.hide();  // hide all first    
  }
  
  function showDealerCards() {
    var $dealerCards = $('#dealer li img');
    var $newCards = $('#dealer li img.new');
    $dealerCards.hide();  // hide all first
    
    $dealerCards.each(function(index, card) {
      console.log($(this.type) + "  is new: " + $(this).hasClass("new"));
      if ($(this).hasClass("new")) {
        // $(this).hide();
        $(this).delay(300 * index).fadeIn('fast');
      } else {
        $(this).show();
      }
    });
  }
  
  function clamp(val, min_val, max_val) {
    return Math.min(Math.max(val, min_val),max_val);
  }
}); // end document.ready