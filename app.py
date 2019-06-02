# import necessary libraries
from flask import Flask, render_template, redirect, jsonify, url_for, request
# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo
import os
import ssl
import json
import pandas as pd

# create instance of Flask app
app = Flask(__name__)

#Create connection variable
conn = 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# connect database collection
db = client.pga_data['collection5']

# create route that renders index.html template
@app.route("/")
def pga_data():

    return render_template("index.html")

@app.route("/swing")
def swing():

    return render_template("swing.html")
    

@app.route("/data")
def data():
  
    pga_data_all = db.find()
    player_intro = []
    for player in pga_data_all:
        player_intro.append(player)

    return jsonify(player_intro)

@app.route('/', methods=['GET', 'POST'])
def index_func():
    if request.method == 'POST':
        # do stuff when the form is submitted
        # redirect to end the POST handling
        # the redirect can be to the same route or somewhere else
        return redirect(url_for('index'))
    # show the form, it wasn't submitted
    return render_template('swing.html')


if __name__ == "__main__":
    app.run(debug=True)