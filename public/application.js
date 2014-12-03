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
  showCards("player");  
  showCards("dealer");

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
  // Note
  // Test for the source route in the response header as a way
  // to determine when to update the nav bar. (Originally i thought i'd need
  // to do this for anims, but turns out not so in this case. (But i still 
  // wanted to figure out how to do it. :-) )
  // Since the source url is not included in the Response headers, I added 
  // a custom header called "Blackjack-Route" to all responses via the rb file.
  // It contains the current route string (e.g. "/game/end"...);
  // ----------------------------------
  $(document).on('click', "#hit input", function() {
    // submit the http request from here instead of letting the browser do it
    $.ajax({
      type: "POST",
      url: "/game/player/hit"
    }).done(function (data, textStatus, xhr) {
      // update just the game container
      $("#game_container").replaceWith($(data).find("#game_container"));
      var path = xhr.getResponseHeader("Blackjack-Route");
      if (path != "/game/player/hit") {
        // update the navbar so we can update the score update
        // new cash data is not available from the DOM unless we update 
        // the navbar
        $(".navbar").replaceWith($(data).find(".navbar"));
        // call this explicitly cuz it doesn'g get called on ajaxified actions
        updateStats();       
      }
      showCards("player");
      showCards("dealer");
      
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
        showCards("player");
        showCards("dealer");
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
      })
      .done(function(data, statusText, xhr) {
        // update just the game container
        $("#game_container").replaceWith($(data).find("#game_container"));
        var path = xhr.getResponseHeader("Blackjack-Route");
        if (path != "/player/dealer/hit") {
            // update the navbar so we can update the score update
            // new cash data is not available from the DOM unless we update 
            // the navbar
            $(".navbar").replaceWith($(data).find(".navbar"));
            // call this explicitly cuz it doesn'g get called on ajaxified actions
            updateStats();
          }
          showCards("player");
          showCards("dealer");
      }); 
      return false;
  });
    
  // --------- 
  // card animation 
  // --------- 


  // this version uses the "new" class that gets added via the template
  // to cards that were just dealt. So cards are only animated when dealt
  function showCards(whichPlayer) {
    var $cards = $("#" + whichPlayer + " .card");
    var startDelay = 0;
    $cards.each(function(index) {
      if ($(this).hasClass("new")) {
        // add extra delay for initial dealer cards, so player is dealt first
        startDelay = (index < 2 && whichPlayer == 'dealer') ? 1000 : 0
        // add delay between first and second cards
        if (index == 1) var delayTime = 400;
        $(this).delay(startDelay).delay(delayTime).animate( { width: "show" }, 200);
      } else {
        $(this).show();  // show immediately, don't animate
      }
    });
  }

  // function showPlayerCards() {
  //   var $cards = $("#player .card");
  //   // this version uses the "new" class that gets added via the template
  //   // for cards that were just dealt
  //   $cards.each(function(index) {
  //     if ($(this).hasClass("new")) {
  //       // add delay between first and second cards
  //       if (index == 1) var delayTime = 400;
  //       $(this).delay(delayTime).animate( { width: "show" }, 200);
  //     } else {
  //       $(this).show();  // show immediately, don't fade
  //     }
  //   });
  // }
  
  // function showDealerCards() {
  //   var $cards = $("#dealer .card");
  //   // this version uses the "new" class that gets added via the template
  //   $cards.each(function(index) {
  //     // console.log($(this.type) + "  is new: " + $(this).hasClass("new"));
  //     if ($(this).hasClass("new")) {
  //       // $(this).fadeIn('normal');
  //       $(this).animate( { width: "show" }, 200);
  //     } else {
  //       $(this).show();  // show immediately, don't fade
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