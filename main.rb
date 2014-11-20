require 'rubygems'
require 'sinatra'

# set :sessions, true
use Rack::Session::Cookie, :key => 'rack.session',
                           :path => '/',
                           :secret => 'some_random_string'
                           
WIN_VALUE = 21
STAY_VALUE = 17

# ===============================================================
# HELPERS
# ===============================================================
helpers do
  def get_value(cards)
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
        soft_value += 10 if soft_value + 10 <= WIN_VALUE
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
    session[:reveal_dealer] = false

    # deal cards
    2.times do 
      session[:player_cards] << session[:deck].shift
      session[:player_new_cards] = [0, 1];
    end
    
    2.times do
      session[:dealer_cards] << session[:deck].shift
      session[:dealer_new_cards] = [0, 1];
    end    
    
    # -------------
    # TESTING ONLY
    # session[:player_cards] = [["10", "diamonds"], ["ace", "spades"]]
    # session[:dealer_cards] = [["ace", "diamonds"], ["king", "hearts"]]
    # -------------
  end
  
  def has_blackjack?(cards)
    cards.count == 2 && get_value(cards)[:final] == WIN_VALUE
  end
  
  
  def bust?(cards)
    get_value(cards)[:final] > WIN_VALUE
  end
  
  def is_new_card(index, who)
    puts("is_new_card() index: #{index} who: #{who}")
    puts("#{who=='player'}")
    puts("#{who.eql?("player")}")
    return session[:player_new_cards].include?(index) if who.eql?("player")
    return session[:dealer_new_cards].include?(index) if who.eql?("dealer")
  end
  
  def get_image(card)
    "/images/cards/#{card[1]}_#{card[0]}.jpg"
  end
end # helpers

# ===============================================================
# ROUTES
# ===============================================================

get '/' do
  redirect 'new_player' if !session[:player_name]
  redirect '/new_game'
end

get '/new_player' do
  erb :new_player  
end

post '/new_player' do
  if params[:player_name] == ""
    @error = "Please give me a name!"
    erb :new_player
  else
    session[:player_name] = params[:player_name].capitalize
    redirect '/new_game'
  end
end

get '/new_game' do
  redirect 'new_player' if !session[:player_name]
  start_game
  @hide_dealer_cards = true;
  redirect '/game/player'
end

get '/game/player' do
  session[:dealer_value] = get_value(session[:dealer_cards])
  session[:dealer_msg] = "Dealer has #{session[:dealer_value][:display]}"
  
  session[:player_value] = get_value(session[:player_cards])
  session[:player_msg] = "#{session[:player_name]}, you have #{session[:player_value][:display]}"
 
  # test for blackjack after initial deal, but it's not an automatic win.
  if has_blackjack?(session[:player_cards])
    session[:player_msg] = "#{session[:player_name]}, you hit blackjack!!"
    session[:reveal_dealer] = true
    redirect 'game/end'
  end
  # @hide_dealer_cards = true;
  @player_active = true
  @dealer_active = false
  erb :game
end

post '/game/player/hit' do
  # add card to player
  session[:player_cards] << session[:deck].shift
  session[:player_new_cards] = [session[:player_cards].length - 1]; # last card index
  session[:player_value] = get_value(session[:player_cards])
  session[:dealer_value] = get_value(session[:dealer_cards])
  session[:dealer_new_cards] = []; # no new cards

  if bust?(session[:player_cards])
    session[:player_msg] = "Doh! You busted, #{session[:player_name]}!"
    redirect '/game/end'
  else
    session[:player_msg] = "#{session[:player_name]}, you have #{session[:player_value][:display]}"
  end
  @player_active = true
  @dealer_active = false
  erb :game
end

post '/game/player/stay' do
  session[:player_new_cards] = []; # no new cards
  val = get_value(session[:player_cards])[:final]
  session[:player_msg] = "#{session[:player_name]}, you're staying at #{val}."

  # reveal dealer cards and check for dealer blackjack
  session[:reveal_dealer] = true
  session[:dealer_value] = get_value(session[:dealer_cards])
  if has_blackjack?(session[:dealer_cards])
    session[:dealer_msg] = "Dealelr has blackjack!!"
    redirect '/game/end'
  end
  
  # switch to dealer turn
  @player_active = false
  @dealer_active = true
  erb :game
end

post '/game/dealer/next' do
  if session[:dealer_value][:final] < STAY_VALUE
    redirect '/game/dealer/hit'
  else
    redirect '/game/dealer/stay'
  end
end

get '/game/dealer/hit' do
  session[:dealer_cards] << session[:deck].shift
  session[:dealer_new_cards] = [session[:dealer_cards].length - 1]; # last card index
  session[:dealer_value] = get_value(session[:dealer_cards])
  
  if bust?(session[:dealer_cards])
    session[:dealer_msg] = "Dealer busts!!"
    redirect '/game/end'
  else
    session[:dealer_msg] = "Dealer hits for #{session[:dealer_value][:display]}"
  end
  @dealer_active = true
  erb :game  
end

get '/game/dealer/stay' do
  session[:dealer_new_cards] = []; # no new cards
  session[:dealer_msg] = "Dealer stays at #{session[:dealer_value][:final]}"
  redirect '/game/end'
end

get '/game/end' do
  player_val = session[:player_value][:final]
  dealer_val = session[:dealer_value][:final]
  if player_val == dealer_val
    if has_blackjack?(session[:dealer_cards]) && !has_blackjack?(session[:player_cards])
      @loss_msg = "Dealer wins!!"
    else
      @tie_msg = "Push! (#{session[:player_name]} and Dealer tie)"
    end
  elsif bust?(session[:player_cards])
      @loss_msg = "Dealer wins!!"
  elsif bust?(session[:dealer_cards])
      @win_msg = "#{session[:player_name]}, you win!!"
  elsif player_val > dealer_val
      @win_msg = "#{session[:player_name]}, you win!!"
  else
      @loss_msg = "Dealer wins!!"
  end
  erb :game
end

get '/reset' do
  session.clear
  redirect 'new_player'
end

get '/session_test' do
  erb :session_test
end
