from flask import Flask, redirect, url_for, render_template, request, session, flash, jsonify
from werkzeug.utils import secure_filename
from plugin.process import del_img,process_ai,get_image_urls
from PIL import Image
import base64
import json
import os
import io

app = Flask(__name__)
app.secret_key = 'super_secret_key'

# Configurations
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'json'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def read_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return [video["watch_url"].replace("watch?v=", "embed/") for video in data]

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        if 'json_file' not in request.files:
            flash('No JSON file provided!')
            return redirect(request.url)
        
        json_file = request.files['json_file']
        if json_file and allowed_file(json_file.filename):
            filename = secure_filename(json_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            json_file.save(filepath)
            metadata_urls = read_json_file(filepath)
            session['metadata_urls'] = metadata_urls
            flash('Metadata uploaded and processed successfully!')
            return redirect(url_for('display_results'))
    #thu thập ảnh từ file đã xử lý
    relative_path = 'UIProject/static/output'
    image_folder = os.path.abspath(relative_path)
    images = [f for f in os.listdir(image_folder) if os.path.isfile(os.path.join(image_folder, f))]

    return render_template("home.html",images=images)

@app.route('/upload', methods=['POST'])
def upload():
    data = request.get_json().get('data', [])

    color = ""
    base64_images = []
    text = ""

    for item in data:
        if isinstance(item, str) and item.startswith('#') and len(item) == 7:
            color += item + "\n"
        elif isinstance(item, str) and item.startswith('data:image/'):
            base64_images.append(item)
        else:
            text += item + "\n"

    # Đảm bảo thư mục tồn tại trước khi ghi file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    color_file_path = os.path.join(base_dir, 'static', 'input', 'color.txt')
    text_file_path = os.path.join(base_dir, 'static', 'input', 'text.txt')
    input_folder =  os.path.join(base_dir, 'static', 'input', 'img')
    output_folder = os.path.join(base_dir, 'static', 'output')
    
    os.makedirs(os.path.dirname(color_file_path), exist_ok=True)

    # Lưu nội dung vào file
    with open(color_file_path, 'w') as f:
        f.write(color)
    
    with open(text_file_path, 'w') as f:
        f.write(text)

    os.makedirs(input_folder, exist_ok=True)

    del_img(input_folder)

    # Xử lý ảnh base64 nếu có
    processed_images = []
    os.makedirs(input_folder, exist_ok=True)  # Tạo thư mục nếu chưa tồn tại
    for i, base64_image in enumerate(base64_images):
        header, encoded = base64_image.split(',', 1)
        image_data = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_data))
        #  xử lý ảnh:
        grayscale_image = process_ai(image)

        output_path = os.path.join(input_folder, f'processed_image_{i}.png')
        grayscale_image.save(output_path)
        buffered = io.BytesIO()
        grayscale_image.save(buffered, format="PNG")
        processed_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        processed_images.append(processed_image_base64)
    return get_image_urls(output_folder)

    
@app.route("/delete_metadata", methods=["POST"])
def delete_metadata():
    if 'metadata_urls' in session:
        session.pop('metadata_urls', None)
        flash('Metadata deleted successfully!')
    else:
        flash('No metadata to delete!')
    return redirect(url_for('home'))









if __name__ == "__main__":
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)
