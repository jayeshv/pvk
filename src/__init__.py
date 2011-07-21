import urllib, hashlib

from django.utils import simplejson
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

def get_user_dump(user, format='json'):
    if user:
        avatar = get_gravatar_url(user.email())
        if format == 'dict':
            return {'id': user.user_id(), 'name': user.nickname(), 'avatar': avatar}
        elif format == 'json':
            return simplejson.dumps({'id': user.user_id(), 'name': user.nickname(), 'avatar': avatar})
    return None

def get_gravatar_url(email, size=60):
    default = "http://www.gravatar.com/avatar/0?s=60"
    gravatar_url = "http://www.gravatar.com/avatar.php?"
    gravatar_url += urllib.urlencode({
        'gravatar_id':hashlib.md5(email.lower()).hexdigest(),
        'default':default, 'size':str(size)
    })
    return gravatar_url
