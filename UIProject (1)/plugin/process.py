import json
import os
from flask import jsonify


def del_img(output_folder):
    for filename in os.listdir(output_folder):
        file_path = os.path.join(output_folder, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)
def process_ai(this):
    return this
def get_image_urls(output_folder):
    image_files = [f for f in os.listdir(output_folder) if os.path.isfile(os.path.join(output_folder, f))]
    image_urls = [f'/static/output/{filename}' for filename in image_files]
    print(jsonify({'imageUrls': image_urls}))
    return jsonify({'imageUrls': image_urls})