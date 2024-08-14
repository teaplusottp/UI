
import json

def read_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return [video["watch_url"].replace("watch?v=", "embed/") for video in data]

# file="D:\\code\\python\\UIProject\\Metadata.json"

# print(read_json_file(file))