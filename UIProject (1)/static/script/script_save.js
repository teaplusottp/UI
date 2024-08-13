var query_index = 1 ;
let currentItemId = null;

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
let currentQueryElement = null;

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
function saveText() {
    //lấy các ô text
    var time = document.getElementById("time").value;
    var place = document.getElementById("place").value;
    var description = document.getElementById("description").value;
    //gom lại dễ xử lý
    var query = time+", "+place+", "+ description;
    //lưu lại
    //localStorage.setItem('query'+query_index, JSON.stringify(query));
    saveDataLineByLine(query);
    //lấy item test thử
    // var storedColors = JSON.parse(localStorage.getItem('query'+query_index));
    // console.log(storedColors); 
    // console.log("index:"+query_index ); 
    //xóa đi modal
    $('#textModal').modal('hide');
    //reset lại
    document.getElementById("time").value = "";
    document.getElementById("place").value = "";
    document.getElementById("description").value = "";
    //thêm vào kia
    addQueryToHistory(query_index, "Text");
    //đánh dấu query index
    query_index+=1
}
function saveColor(){
    //lấy dữ liệu
    var color = document.getElementById('dominant_color').value;
    //lưu lại   
    //saveDataToLocalStorage(color)
    saveDataLineByLine(color);
    //in ra thử
    // var storedColors = JSON.parse(localStorage.getItem('query'+query_index));
    // console.log("Selected color:", storedColors);
    // console.log("index:"+query_index ); 
    //xóa đi modal
    $('#colorModal').modal('hide');            
    //thêm vào ui
    addQueryToHistory(query_index, "Color");
    //cộng 1
    query_index+=1;
}
function saveImg() {
    var fileInput = document.getElementById('related_image');
    var file = fileInput.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = e.target.result;
            saveDataLineByLine(img);
        }  ;
        reader.readAsDataURL(file);
    }
    addQueryToHistory(query_index, "Image");
    query_index+=1;
    $('#imageModal').modal('hide');
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

        if(linkText12.split(':')[1].trim()==='text'){

            showModal('#textModal-edit');
            var txt=getDataByIndex(id-1);

            console.log(txt)

            document.getElementById("time-edit").value = txt[0];
            document.getElementById("place-edit").value = txt[1];
            document.getElementById("description-edit").value = txt[2];
        }
        if(linkText12.split(':')[1].trim()==='image'){
            showModal('#imageModal-edit');

            var txt=getDataByIndex(id-1);
            document.getElementById('defaultImage-edit').src = txt;

        }
         if(linkText12.split(':')[1].trim()==='color'){
            showModal('#colorModal-edit');
            var txt=getDataByIndex(id-1);
            // Cập nhật giá trị input
            document.getElementById('colorPicker').value = txt;
        }
    }
});
//var addedQueries = []; // Mảng lưu trữ các index của các Query đã được thêm

//thêm html
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
