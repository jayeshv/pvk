from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.api import channel
from django.utils import simplejson

from src import get_board_from_request
from src import get_other_player_channel_key

class Strike(webapp.RequestHandler):

    def post(self):
        user = users.get_current_user()        
        board = get_board_from_request(self.request)
        #do board action
        xvalue = self.request.get('xvalue')
        yvalue = self.request.get('yvalue')
        key = get_other_player_channel_key(board, user)
        channel.send_message(key, simplejson.dumps({'type': 'update', 'update': (xvalue, yvalue)}))
