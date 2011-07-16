from google.appengine.api import channel

from src.board import Board

def create_channel(key):
    return channel.create_channel(key)

def get_board_from_request(request):
    board_id = request.get('board')
    if board_id:
        return Board.get_by_id(int(board_id))
    return None
