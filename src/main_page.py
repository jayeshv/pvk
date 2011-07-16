import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext.webapp.util import login_required

from src.board import Board
from src import create_channel

class MainPage(webapp.RequestHandler):

    @login_required
    def get(self):
        board_id = self.request.get('game')
        user = users.get_current_user()
        if board_id:
            board = Board.get_by_id(board_id)
            if board:
                token = create_channel(str(board.key().id()) + user.user_id())
                raise NameError, token
            else:
                pass
        path = os.path.join('templates', 'pvk.html')
        self.response.out.write(template.render(path, {}))
