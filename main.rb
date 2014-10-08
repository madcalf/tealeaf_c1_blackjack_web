require 'rubygems'
require 'sinatra'

# set :sessions, true
use Rack::Session::Cookie, :key => 'rack.session',
                           :path => '/',
                           :secret => 'some_random_string'
                           
BLACKJACK_VALUE = 21

# ===============================================================
# HELPERS
# ===============================================================
helpers do
  def hand_value(cards)
    value = 0
    soft_value = 0
    # preliminary total
    cards.each do |card|
      face = card[0]
      if face.to_i.between?(2, 10)
        value += face.to_i
      else
        value += (face == "ace") ? 1 : 10
      end
    end
    
    # soft value, if aces
    aces = cards.select { |card| card[0] == "ace"}
    if aces.count > 0
      soft_value = value
      aces.each do
        soft_value += 10 if soft_value + 10 <= BLACKJACK_VALUE
      end
    end
    
    result = {}
    result[:final] = [value, soft_value].max
    result[:display] = "#{result[:final]}"
    
    if soft_value != 0 && soft_value != value
      result[:display] = "#{value}/#{soft_value}"
    end
    result # remember this is a hash!!
  end 
  
  def start_game
    suits = ['clubs', 'diamonds', 'hearts', 'spades']
    faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']
    session[:deck] = faces.product(suits)
    session[:deck].shuffle! 
    session[:player_cards] = []
    session[:dealer_cards] = []

    # deal cards
    2.times do 
      session[:player_cards] << session[:deck].shift
    end
    
    2.times do
      session[:dealer_cards] << session[:deck].shift
    end    
  end
  
  def has_blackjack?(cards)
    cards.count == 2 && hand_value(cards)[:final] == BLACKJACK_VALUE
  end
  
  def bust?(cards)
    hand_value(cards)[:final] > BLACKJACK_VALUE
  end
  
end # helpers
# ===============================================================
# ROUTES
# ===============================================================

get '/' do
  # "cookie: #{session[:player_name] == nil}"
  redirect 'new_player' if !session[:player_name]
  redirect '/new_game'
end

get '/new_player' do
  erb :new_player  
end

post '/new_player' do
  session[:player_name] = params[:player_name].capitalize
  redirect '/new_game'
end

get '/new_game' do
  start_game
  redirect '/game/player'
end

# get '/game' do
#   erb :game
# end

get '/game/player' do
  # temp so we can reload with new cards for testing
  # start_game 
  # -------------
   
  session[:player_value] = hand_value(session[:player_cards])
  session[:dealer_value] = hand_value(session[:dealer_cards])
  
  session[:player_msg] = "Your call, #{session[:player_name]}?"
  session[:dealer_msg] = "..."

  # test for blackjack after initial deal, but is not an automatic win.
  # if session[:player_value][:final] == 21
  if has_blackjack?(session[:player_cards])
    session[:player_msg] = "Player has a blackjack!!"
    redirect 'game/end'
  end
  
  erb :game_player
end

# MAKE THIS POST. MAKE BUTTONS FORMS
get '/game/player/hit' do
  # may not need to set this again here?
  session[:dealer_value] = hand_value(session[:dealer_cards])

  # add card to player
  session[:player_cards] << session[:deck].shift
  session[:player_value] = hand_value(session[:player_cards])

  # test for blackjack after initial deal, but is not an automatic win.
  # if session[:player_value][:final] > 21
  if bust?(session[:player_cards])
    session[:player_msg] = "Player busts!!"
    redirect '/game/end'
  else
    session[:player_msg] = "Your call, #{session[:player_name]}?"
  end
  
  erb :game_player
end

get '/game/player/stay' do
  # dealer's turn
  val = hand_value(session[:player_cards])[:final]
  session[:player_msg] = "#{session[:player_name]} stays at #{val}."
  redirect '/game/dealer'  
end

get '/game/dealer' do

  # reveal dealer cards
  # maybe we just do this in the dealer view?

  session[:dealer_value] = hand_value(session[:dealer_cards])
  
  # test for blackjack. Only applies to initial deal
  # if session[:dealer_cards].count == 2 && session[:dealer_value][:final] == 21
  if has_blackjack?(session[:dealer_cards])
    session[:dealer_msg] = "Dealelr has a blackjack!!"
    redirect '/game/end'
  end
  
  # test for bust
  # if session[:dealer_value][:final] > 21
  if bust?(session[:dealer_cards])
    session[:dealer_msg] = "Dealer busts!"
    redirect '/game/end'
  end
  
  erb :game_dealer
end

# CHANGE TO POST. MAKE BUTTON A FORM
get '/game/dealer/next' do
  
  if session[:dealer_value][:final] < 17
    session[:dealer_cards] << session[:deck].shift
    session[:dealer_value] = hand_value([:dealer_cards])
    session[:dealer_msg] = "Dealer hits..."
    redirect '/game/dealer'
  else
    redirect '/game/dealer/stay'
  end
    
  erb :game_dealer
end

get '/game/dealer/stay' do
  session[:dealer_msg] = "Dealer stays at #{session[:dealer_value][:final]}"
  # erb :game_end
  redirect '/game/end'
end

get '/game/end' do
  puts "game/end"
  # reveal dealers cards and make sure to test for dealer blackjack in case we can tie the player
  player_val = session[:player_value][:final]
  dealer_val = session[:dealer_value][:final]
  
  if player_val == dealer_val
    if has_blackjack?(session[:dealer_cards]) && !has_blackjack?(session:[player_cards])
      session[:win_msg] = "Dealer wins!!"
    else
      session[:win_msg] = "Push! (#{session[:player_name]} and Dealer tie)!"
    end
  elsif bust?(session[:player_cards])
      session[:win_msg] = "Dealer wins!!"
  elsif bust?(session[:dealer_cards])
      session[:win_msg] = "#{session[:player_name]} wins!!"
  elsif player_val > dealer_val
      session[:win_msg] = "#{session[:player_name]} wins!!"
  else
      session[:win_msg] = "Dealer wins!!"
  end
  erb :game_end
end

get '/reset' do
  session.clear
  redirect 'new_player'
end

get '/session_test' do
  erb :session_test
end
