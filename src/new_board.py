from google.appengine.ext import webapp
from google.appengine.api import users
from django.utils import simplejson

from src.board import Board
from src import create_channel

class NewBoard(webapp.RequestHandler):

    def post(self):
        user = users.get_current_user()
        dimension = int(self.request.POST['dimension'])
        board = Board(user, dimension=dimension)
        board.put()
        token = create_channel(str(board.key().id()) + user.user_id())
        self.response.out.write(simplejson.dumps({'board_id': board.key().id(),
                                                  'token': token}))
