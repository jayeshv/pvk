from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.api import channel
from django.utils import simplejson

from src import get_board_from_id
from src import get_other_player_channel_key

class Strike(webapp.RequestHandler):

    def post(self):
        user = users.get_current_user()
        update = simplejson.loads(self.request.get('update'))
        board = get_board_from_id(update.get('board'))
        line_from = update.get('line_from')
        line_to = update.get('line_to')
        key = get_other_player_channel_key(board, user)
        channel.send_message(key, simplejson.dumps({'type': 'update', 'update': (line_from, line_to)}))
