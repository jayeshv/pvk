import urllib, hashlib

from google.appengine.api import channel

from src.board import Board

def create_channel(key):
    return channel.create_channel(key)

def get_board_from_request(request):
    board_id = request.get('board')
    if board_id:
        return Board.get_by_id(int(board_id))
    return None

def get_other_player_channel_key(board, user):
    if board.player1 == user:
        return str(board.key().id()) + board.player2.user_id()
    else:
        return str(board.key().id()) + board.player1.user_id()

def get_gravatar_url(email):
    pass
