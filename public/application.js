// ---------------------------------- 
// ---------------------------------- 
$(document).ready(function() {
  
  // Might want to name and call this function just for consistency
  // instead of using the anonymous func which still gets a little confusing...
  // Really not sure what the purpose of the outer anonymous function wrapper is...

  // $(function() {

  // ----------------------------------
  // Reset status displays in the nav bar
  // ----------------------------------
  updateStats();
    

  // ----------------------------------
  // Set up the slider and input for startup cash
  // ----------------------------------
  var default_val = 1500;
  var min_val = 1000;
  var max_val = 5000;
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
  
  // ----------------------------------
  // AJAX for player hit action
  // ----------------------------------
  $(document).on('click', "#hit input", function() {
    // submit the http request from here instead of letting the browser do it
    $.ajax({
      type: "POST",
      url: "/game/player/hit"
    }).done(function (data, textStatus, xhr) {

      // Want to just replace the player div on hit. But need to know when the
      // hit is a bust and redirects to /game/end so we can update the whole 
      // game-container div. 
      // To to that, test for the source route in the response header.
      // Since the source url is not included in the Response headers, I added 
      // a custom header called "Blackjack-Route" to all responses in the rb file.
      // It contains the current route string (e.g. "/game/end"...);
      
      var path = xhr.getResponseHeader("Blackjack-Route");
      if (path == "/game/player/hit") {
        // update just the player div
        $("#game_container").find("#player").replaceWith($(data).find("#player"));
        return false;
      }else {
        // update the entire game_container div
        // note: shouldn't need to turn off the layout in rb if we're plucking out the div
        // instead of sending the entire data back.
        $("#game_container").replaceWith($(data).find("#game_container"));
        // call this explicitly cuz it doesn'g get called on ajaxified actions

        // update the navbar so we see the score update
        // note new cash data is not available from the dom unless we update 
        // the navbar (since the existing nav bar has the old data)
        $(".navbar").replaceWith($(data).find(".navbar"));
        updateStats();        
      }
      
    }); // end done handler
    
    // Remember, this gets called immediately upon clicking 
    // where as the done handler above is not called until the request is done.
    // So we can't return anything conditional on the ajax response from here. 
    // That all needs to happen from the done handler. 
    // Here we either return true or false
    return false;
  }); // end click handler

  // ----------------------------------
  // AJAX for player stay action
  // ----------------------------------
  $(document).on('click', '#stay input', function() {
      $.ajax({
        type:"POST",
        url: "/game/player/stay"
      }).done(function(data, statusText, xhr) {
        // update the entire game container here, since we're transitioning
        // to dealer's turn 
        $("#game_container").replaceWith($(data).find("#game_container"));
      });
      return false;
  });
  
  // ----------------------------------
  // AJAX for dealer hit action
  // ----------------------------------
  $(document).on('click', "#next input", function() {
      $.ajax({
        type: "POST",
        url:  "/game/dealer/next",
        context: this.parent
      }).done(function(data, statusText, xhr) {
          // draw just the player bit here, so we don't redraw the player cards?
          var path = xhr.getResponseHeader("Blackjack-Route");
          if (path == "/player/dealer/hit") {
            $("#game_container").find("#dealer").replaceWith($(data).find("#dealer"));
          } else {
            $("#game_container").replaceWith($(data).find("#game_container"));
            
            // update the navbar so we see the score update
            // note new cash data is not available from the dom unless we update 
            // the navbar (since the existing nav bar has the old data)
            $(".navbar").replaceWith($(data).find(".navbar"));
            
            // call this explicitly cuz it doesn'g get called on ajaxified actions
            updateStats();
          }
      }); 
      return false;
  });
    
  // --------- 
  // card animation 
  // --------- 

  // hidePlayerCards();
  // showPlayerCards();
  // var id = setTimeout(showDealerCards, 1000);
  
  
  // function hidePlayerCards() {
  //   var $playerCards = $('#player li img');
  //   $playerCards.hide();  // hide all first    
  // }
  
  // // Note will want to simply show all player cards when dealer's turn
  // // Don't don't want to keep animating the last one at that point
  // function showPlayerCards() {
  //   var $playerCards = $('#player li img');
  //   var $newCards = $('player li img.new');
  //   $playerCards.hide();  // hide all first
          
  //   $playerCards.each(function(index, card) {
  //     // console.log($(this.type) + "  is new: " + $(this).hasClass("new"));
  //     if ($(this).hasClass("new")) {
  //       $(this).delay(300 * index).fadeIn('fast');
  //     } else {
  //       $(this).show();
  //     }
  //   });
  // }
  
  // function hideDealerCards() {
  //   var $dealerCards = $('#dealer li img');
  //   $dealerCards.hide();  // hide all first    
  // }
  
  // function showDealerCards() {
  //   var $dealerCards = $('#dealer li img');
  //   var $newCards = $('#dealer li img.new');
  //   $dealerCards.hide();  // hide all first
    
  //   $dealerCards.each(function(index, card) {
  //     console.log($(this.type) + "  is new: " + $(this).hasClass("new"));
  //     if ($(this).hasClass("new")) {
  //       // $(this).hide();
  //       $(this).delay(300 * index).fadeIn('fast');
  //     } else {
  //       $(this).show();
  //     }
  //   });
  // }

  function updateStats() {
    var lastBet = $("#bet_label").data("bet");
    var totalCash = $("#total_cash_label").data("totalCash");
    $("#bet_label span.value").text(lastBet);
    $("#total_cash_label span.value").text(totalCash);  
  }

  function clamp(val, min_val, max_val) {
    return Math.min(Math.max(val, min_val),max_val);
  }
}); // end document.ready