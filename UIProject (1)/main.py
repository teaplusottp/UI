from flask import Flask, redirect, url_for, render_template, request, session, flash, jsonify
from werkzeug.utils import secure_filename
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
    
    return render_template("home.html")

@app.route('/upload', methods=['POST'])
def upload():
    data = request.get_json().get('data', [])  # Nhận danh sách

    color = ""
    base64_image = ""
    text = ""

    for item in data:
        # Kiểm tra nếu là màu (string bắt đầu bằng #)
        if isinstance(item, str) and item.startswith('#') and len(item) == 7:
            color+=item+"\n"
        # Kiểm tra nếu là ảnh base64
        elif isinstance(item, str) and item.startswith('data:image/'):
            base64_image+=item+"\n"
        # Còn lại là chuỗi văn bản thông thường
        else:
            text+=item+"\n"
    # Xử lý ảnh base64 
    if base64_image:
        #decode chuyển về ảnh thường
        header, encoded = base64_image.split(',', 1)
        image_data = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_data))
        
        # Ví dụ xử lý ảnh: chuyển ảnh sang grayscale
        grayscale_image = image.convert('L')
        
        # Lưu ảnh hoặc xử lý thêm
        buffered = io.BytesIO()
        grayscale_image.save(buffered, format="PNG")
        processed_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    else:
        processed_image_base64 = None
    
    # Trả về kết quả
    return jsonify({
        'color': color,
        'processed_image': processed_image_base64,
        'text': text
    })

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
