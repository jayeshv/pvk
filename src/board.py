from google.appengine.ext import db

class Board(db.Model):
    dimension = db.IntegerProperty()
    player1 = db.UserProperty()
    player2 = db.UserProperty()

    def __init__(self, user, dimension=10):
        super(Board, self).__init__()
        self.player1 = user
        self.dimension = dimension
