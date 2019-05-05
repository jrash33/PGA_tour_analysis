# import HTMLSession from requests_html
from requests_html import HTMLSession
 
# create an HTML Session object
session = HTMLSession()
 
# Use the object above to connect to needed webpage
resp = session.get("https://www.pgatour.com/players/player.01006.john-adams.html")
 
# Run JavaScript code on webpage
resp.html.render()

resp.html.html

print(resp.html.html)