$(document).ready(function() {
  
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
  
    
}); // end document.ready