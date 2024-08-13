
import json


def read_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    a= [video["watch_url"] for video in data]
    for i in range(len(a)) :
        a[i]=a[i].replace("watch?v=", "embed/")
    return a

file="D:\\code\\python\\UIProject\\Metadata.json"

print(read_json_file(file))