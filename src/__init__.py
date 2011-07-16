from google.appengine.api import channel

def create_channel(key):
    return channel.create_channel(key)

