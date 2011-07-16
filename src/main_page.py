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
        board_id = self.request.get('board')
        token = ''
        user = users.get_current_user()
        if board_id:
            board = Board.get_by_id(int(board_id))
            if board:
                if board.may_join(user):
                    token = create_channel(str(board.key().id()) + user.user_id())
                else:
                    self.redirect('/')
            else:
                self.redirect('/')
        path = os.path.join('templates', 'pvk.html')
        self.response.out.write(template.render(path, {'token': token,
                                                       'board_id': board_id}))
