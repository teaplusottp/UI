
//script modal


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

function Ouput_Appearance(imageUrls){
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 
    imageUrls.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        gallery.appendChild(img);
    });
}

document.getElementById('start-query').addEventListener('click', function (event) {
//    event.preventDefault();
    
    let savedData = JSON.parse(localStorage.getItem('savedData')) || [];
    let delData = JSON.parse(localStorage.getItem('delData')) || [];
    let filteredData = savedData.filter((_, index) => !delData.includes(index));

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
    .catch(error => console.error('Error:', error));
    //sendDataToServer();
    
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