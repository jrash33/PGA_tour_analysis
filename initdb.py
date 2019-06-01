from PGA_tour_viz.app import db

# db.drop_all()
# db.create_all()

import os
import json
from pymongo import MongoClient


MONGO_URL = os.environ.get('MONGODB_URL')
client = MongoClient(MONGO_URL)
db = client['test_db']
collection = db['pga']

with open('pga_viz.json') as f:
    file_data = json.load(f)

collection.insert_many(file_data)  
