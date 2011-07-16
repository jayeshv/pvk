import random
from django.utils import simplejson

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

from src.main_page import MainPage
from src.new_board import NewBoard
from src.leave_board import LeaveBoard
from src.strike import Strike

application = webapp.WSGIApplication([
        ('/', MainPage),
        ('/new', NewBoard),
        ('/leave', LeaveBoard),
        ('/strike', Strike)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
