from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.api import channel
from django.utils import simplejson

from src import get_board_from_request

class Strike(webapp.RequestHandler):

    def post(self):
        user = users.get_current_user()
        board = get_board_from_request(self.request)
        #do board action
        channel_key1 = str(board.key().id()) + board.player1.user_id()
        channel_key2 = str(board.key().id()) + board.player2.user_id()
        channel.send_message(channel_key1, simplejson.dumps(''))
        channel.send_message(channel_key2, simplejson.dumps(''))
        
