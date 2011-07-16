from google.appengine.ext import db

class Board(db.Model):
    dimension = db.IntegerProperty()
    player1 = db.UserProperty()
    player2 = db.UserProperty()

    def may_join(self, user):
        if self.player2:
            return False
        else:
            self.player2 = user
            self.put()
        return True
