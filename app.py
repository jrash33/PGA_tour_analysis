# import necessary libraries
from flask import Flask, render_template, redirect, jsonify
# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo

import json

# create instance of Flask app
app = Flask(__name__)

# Create connection variable
conn = 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# connect database collection
db = client.pga_data["collection4"]

# create route that renders index.html template
@app.route("/")
def pga_data():

    return render_template("index.html")

@app.route("/data")
def data():
    pga_data_all = db.find()
    player_intro = []
    for player in pga_data_all:
        player_intro.append(player)

    return jsonify(player_intro)

# # Query the database and return the jsonified results
# @app.route("/data")
# def data():
#     sel = [func.strftime("%Y", Bigfoot.timestamp), func.count(Bigfoot.timestamp)]
#     results = db.session.query(*sel).\
#         group_by(func.strftime("%Y", Bigfoot.timestamp)).all()
#     df = pd.DataFrame(results, columns=['year', 'sightings'])
#     return jsonify(df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)