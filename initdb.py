from PGA_tour_viz.app import db

# db.drop_all()
# db.create_all()

import json
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['test_db']
collection = db['pga']

with open('pga_viz.json') as f:
    file_data = json.load(f)

collection.insert_many(file_data)  
