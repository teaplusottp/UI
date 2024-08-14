
//script modal

var query_index = 1 ;
let currentItemId = null;

const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

let currentQueryElement = null;

//csv
function saveDataLineByLine(line) {
    let savedData = JSON.parse(localStorage.getItem('savedData')) || [];
    savedData.push(line);
    localStorage.setItem('savedData', JSON.stringify(savedData));
}
function getDataByIndex(index) {
    let savedData = JSON.parse(localStorage.getItem('savedData')) || [];
    let line = savedData[index] || null;
    if (line) {
        return line.split(',').map(item => item.trim());
    }
    return null;
}
function updateDataByIndex(index, newContent) {
    let savedData = JSON.parse(localStorage.getItem('savedData')) || [];
    if (index >= 0 && index < savedData.length) {
        savedData[index] = newContent;
        localStorage.setItem('savedData', JSON.stringify(savedData));   
        console.log("img:" + newContent);
    }
}
function delData(id) {
    let delData = JSON.parse(localStorage.getItem('delData')) || [];
    delData.push(id-1);
    localStorage.setItem('delData', JSON.stringify(delData));
}
//modal
function showSelectedModal(element) {
    currentQueryElement = element;
}
function deleteQuery() {
    if (currentQueryElement) {
        delData(currentQueryElement.id);
        currentQueryElement.remove();
        
        $('#textModal-edit').modal('hide');
        $('#imageModal-edit').modal('hide');
        $('#colorModal-edit').modal('hide');            
    }
}
//save 
function savePaint(){
    $('#drawModal').modal('hide');
    const dataURL = canvas.toDataURL('image/png');
    saveDataLineByLine(dataURL);
    console.log(dataURL);
    addQueryToHistory(query_index, "Draw");
    query_index+=1
    clearCanvas();

}
function saveText() {
    //lấy các ô text
    var time = document.getElementById("time").value;
    var place = document.getElementById("place").value;
    var description = document.getElementById("description").value;
    //gom lại dễ xử lý
    var query = time+", "+place+", "+ description;
    saveDataLineByLine(query);
    $('#textModal').modal('hide');
    //reset lại
    document.getElementById("time").value = "";
    document.getElementById("place").value = "";
    document.getElementById("description").value = "";
    addQueryToHistory(query_index, "Text");
    query_index+=1
}
function saveColor(){
    var color = document.getElementById('dominant_color').value;
    saveDataLineByLine(color);
    $('#colorModal').modal('hide');            
    addQueryToHistory(query_index, "Color");
    query_index+=1;
}
function compressImg(img, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var width = img.width;
        var height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Nén ảnh
        var compressedImg = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedImg);
    });
}
function saveImg(inputSelector) {
    var fileInput = document.querySelector(inputSelector);
    var file = fileInput.files[0];
    
    if (file && file.type.startsWith('image/')) {
        var reader = new FileReader();   
        reader.onload = function(e) {
            var img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                compressImg(img).then(compressedImg => {
                    saveDataLineByLine(compressedImg);
                    addQueryToHistory(query_index, "Image");
                    query_index += 1;
                    $('#imageModal').modal('hide');
                });
            }
        };
        reader.readAsDataURL(file);
    }
}
function saveImg2(imgPath) {
    fetch(imgPath)
        .then(response => response.blob())
        .then(blob => {
            var img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = function() {
                compressImg(img).then(compressedImg => {
                    saveDataLineByLine(compressedImg);
                    addQueryToHistory(query_index, "Image");
                    query_index += 1;
                    $('#imageModal').modal('hide');
                });
            };
        })
        .catch(error => {
            console.error("Error loading image:", error);
        });
}
function saveChange(){
    if (currentQueryElement) {

        var text = currentQueryElement.textContent || currentQueryElement.innerText;
        var parts = text.split(':');
        var result = parts.length > 1 ? parts[1].trim() : '';
        var id=currentQueryElement.id;

        if(result.toLowerCase()==='text'){            
            var time = document.getElementById("time-edit").value;
            var place = document.getElementById("place-edit").value;
            var description = document.getElementById("description-edit").value;
            var query = time+", "+place+", "+ description;
            updateDataByIndex(id-1,query);
            $('#textModal-edit').modal('hide');
        }     
        if(result.toLowerCase()==='color'){
            var query = document.getElementById('colorPicker').value;;
            updateDataByIndex(id-1,query);
            $('#colorModal-edit').modal('hide');   
        }
        if(result.toLowerCase()==='image'){
            var fileInput = document.getElementById('related_image');
            var file = fileInput.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var img = e.target.result;
                    updateDataByIndex(id-1,img);
                    document.getElementById('defaultImage-edit').src = img;
                };
                reader.readAsDataURL(file);
            }
            $('#imageModal-edit').modal('hide');
        }
    }
}
//khi người dùng click vào submenu
document.getElementById('history-submenu').addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {

        event.preventDefault(); 
        var linkText12 = event.target.innerText.trim().toLowerCase();
        var id = linkText12.match(/\d+/);
        var case_option=linkText12.split(':')[1].trim();
        if(case_option==='text'){

            showModal('#textModal-edit');
            var txt=getDataByIndex(id-1);

            console.log(txt)

            document.getElementById("time-edit").value = txt[0];
            document.getElementById("place-edit").value = txt[1];
            document.getElementById("description-edit").value = txt[2];
        }
        if(case_option==='image'){
            showModal('#imageModal-edit');

            var txt=getDataByIndex(id-1);
            document.getElementById('defaultImage-edit').src = txt;

        }
         if(case_option==='color'){
            showModal('#colorModal-edit');
            var txt=getDataByIndex(id-1);
            // Cập nhật giá trị input
            document.getElementById('colorPicker').value = txt;
        }
        if(case_option==='draw'){
            showModal('#imageModal-edit');
            var txt=getDataByIndex(id-1);
            document.getElementById('defaultImage-edit').src = txt;
        }
    }
});
function addQueryToHistory(index, type) {
    var historyMenu = document.getElementById('history-submenu');
    // Tạo phần tử mới
    var newItem = document.createElement('li');
    newItem.innerHTML = `<a href="#" id=${index} onclick="showSelectedModal(this)"   >Query ${index} : ${type}</a>`;
    // Thêm phần tử mới vào danh sách
    historyMenu.appendChild(newItem);
//    addedQueries.push(index);
}

document.addEventListener("DOMContentLoaded", function() {
    localStorage.clear();  // Xóa toàn bộ dữ liệu trong localStorage
    console.log("đã xóa");
});

let arrow = document.querySelectorAll(".arrow");
    console.log(arrow);
    for (var i = 0; i < arrow.length; i++) {
        arrow[i].addEventListener("click", (e) => {
            let arrowParent = e.target.parentElement.parentElement.parentElement;
            console.log(arrowParent);
            arrowParent.classList.toggle("showMenu");
        });
    }
    
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});


document.getElementById('upload-link').addEventListener('click', function (event) {
    event.preventDefault();
    triggerFileUpload();
});

document.getElementById('upload-submenu').addEventListener('click', function (event) {
    event.preventDefault();
    triggerFileUpload();
});

function getFileName(path) {
    return path.split('/').pop(); 
}

function addToQuery(card,filepath){
   card.addEventListener("click", function() {
        saveImg2(filepath) ;
        var newItem = document.createElement('li');
        newItem.innerHTML = `<a href="#" id=${query_index} onclick="showSelectedModal(this)"   >Query ${query_index} : Image</a>`;
    });
}

function Ouput_Appearance(imageUrls){
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ''; 
    imageUrls.forEach(image => {
        // Tạo thẻ div chứa card
        const card = document.createElement("div");
        const fileName=getFileName(image);
        card.className = "card";

        // Tạo thẻ img cho hình ảnh
        const img = document.createElement("img");
        img.src = image;
        img.alt = fileName;

        // Tạo thẻ div cho tên ảnh
        const name = document.createElement("div");
        name.className = "name";
        name.innerText = fileName;

        card.appendChild(img);
        card.appendChild(name);
        addToQuery(card,image);

        // Gắn card vào gallery
        gallery.appendChild(card);
});
}


document.getElementById('start-query').addEventListener('click', function (event) {
//    event.preventDefault();
    
    let savedData = JSON.parse(localStorage.getItem('savedData')) || [];
    let delData = JSON.parse(localStorage.getItem('delData')) || [];
    let filteredData = savedData.filter((_, index) => !delData.includes(index));
    console.log(filteredData);

    fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: filteredData})  // Đặt danh sách vào một đối tượng JSON
    })

    .then(response => response.json())
    .then(data => {
        //console.log(data['imageUrls']);  
        Ouput_Appearance(data['imageUrls']);
    })
});

//?
function sendDataToServer() {
    let data = getAllData();

    // Gửi dữ liệu đến server
    fetch('/results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => console.log('Data sent:', result))
    .catch(error => console.error('Error:', error));
}
function getAllData(){
    let savedData = JSON.parse(localStorage.getItem('savedData')) || [];
    let delData = JSON.parse(localStorage.getItem('delData')) || [];
    let filteredData = savedData.filter((_, index) => !delData.includes(index));

    let text = filteredData.join('\n');
    // filename='filteredData.txt'

    console.log(text);
    return text;
    // let element = document.createElement('a');
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    // element.setAttribute('download', filename);

    // element.style.display = 'none';
    // document.body.appendChild(element);

    // element.click();

    // document.body.removeChild(element);

}

function triggerFileUpload() {
    document.getElementById('file-input').click();
}

document.getElementById('file-input').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;
            try {
                const jsonContent = JSON.parse(fileContent);
                console.log(jsonContent);
                // You can now work with the parsed JSON content here
            } catch (err) {
                console.error('Invalid JSON file:', err);
            }
        };
        reader.readAsText(file);
    }
});

// Function to show modals
function showModal(modalId) {
    $(modalId).modal('show');
}
// Adding event listeners to "Text", "Image", "Color"
document.querySelectorAll('.sub-menu a').forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        const linkText = event.target.innerText.trim().toLowerCase();
        if (linkText === 'text') {
            showModal('#textModal');
        } else if (linkText === 'image') {
            showModal('#imageModal');
        } else if (linkText === 'color') {
            showModal('#colorModal');
        }else if (linkText === 'draw') {
            //showModal('#colorModal');
            showModal('#drawModal');
        }
    });
});




function deleteMetadata() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/delete_metadata", true);
    xhr.onload = function () {
        location.reload();
    }
    xhr.send();
}
    
function addQuery() {
    var queryArea = document.getElementById('queryArea');
    var queryDiv = document.createElement('div');
    queryDiv.innerHTML = `
        <select name="query_type" onchange="updateQueryFields(this)">
            <option value="" disabled selected>Choose query type</option>
            <option value="text_description">Text Description</option>
            <option value="related_image">Related Image</option>
            <option value="dominant_color">Dominant Color</option>
        </select>
        <div class="query-fields"></div>
        <button type="button" onclick="removeQuery(this)">Delete Query</button>`;
    queryArea.appendChild(queryDiv);
    console.log('Query added with empty fields');
}

function updateQueryFields(select) {
    var queryFieldsDiv = select.parentElement.querySelector('.query-fields');
    console.log('Changing query type to:', select.value); // Debug the selected value
    switch (select.value) {
        case "text_description":
            queryFieldsDiv.innerHTML = `
                <div class="form-group">
                    <label for="time">Time</label>
                    <input type="text" class="form-control" id="time" name="time" placeholder="Enter the time that happens in the video" required>
                </div>
                <div class="form-group">
                    <label for="place">Place</label>
                    <input type="text" class="form-control" id="place" name="place" placeholder="Enter where the frame was taken" required>
                </div>
                <div class="form-group">
                    <label for="description">More specific description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" placeholder="Enter a more specific description" required></textarea>
                </div>`;
            console.log('Fields for Text Description added');
            break;
        case "related_image":
            queryFieldsDiv.innerHTML = `
                <div class="form-group">
                    <label for="related_image">Upload Related Image</label>
                    <input type="file" class="form-control" id="related_image" name="related_image" accept="image/*">
                </div>`;
            break;
        case "dominant_color":
            queryFieldsDiv.innerHTML = `
                <div class="form-group">
                    <label>Select Dominant Color:</label>
                    <div class="color-picker">
                        <div class="color-swatch" style="background-color: red;" onclick="setColor('red')"></div>
                        <div class="color-swatch" style="background-color: blue;" onclick="setColor('blue')"></div>
                        <div class="color-swatch" style="background-color: green;" onclick="setColor('green')"></div>
                        <div class="color-swatch" style="background-color: yellow;" onclick="setColor('yellow')"></div>
                        <div class="color-swatch" style="background-color: orange;" onclick="setColor('orange')"></div>
                        <div class="color-swatch" style="background-color: purple;" onclick="setColor('purple')"></div>
                        <div class="custom-color" onclick="triggerColorPicker()"></div>
                        <input type="color" id="colorInput" onchange="setColor(this.value)">
                    </div>
                    <input type="hidden" id="dominant_color" name="dominant_color">
                </div>`;
            break;
        default:
            queryFieldsDiv.innerHTML = '';
            console.log('Fields cleared');
    }
}

function triggerColorPicker() {
    document.getElementById('colorInput').click();
}

function setColor(color) {
    document.getElementById('dominant_color').value = color;
    const customColor = document.querySelector('.custom-color');
    customColor.style.backgroundColor = color;
}

function removeQuery(button) {
    button.parentElement.remove();
}

function startProcessing() {
    // This function can submit the form data or process it via Ajax
    
}




function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = document.getElementById('brushSize').value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = document.getElementById('colorPicker').value;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeBackgroundColor() {
    const bgColor = document.getElementById('bgColorPicker').value;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);