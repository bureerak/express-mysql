const userInputs = document.querySelectorAll('.defInput');
userInputs.forEach((input, Inputindex)=>{
    input.addEventListener('input', (e) => {

        //open slot for input
        const text = e.target.value.length;
        const responseInputs = document.querySelectorAll(`.cdInput-${Inputindex}`);

        Array.from(responseInputs).forEach((item) => {
            item.value = "";
            item.disabled = true;
        });

        const enableMapping = {
            1: [3, 4],
            2: [0, 2],
            3: [0, 1],
        };

        if (enableMapping[text]) {
            enableMapping[text].forEach((index) => {
                if (responseInputs[index]) {
                    responseInputs[index].disabled = false;
                }
            });
        }
    });

})

//parse and update (item.UserID)
load_data()
function load_data() {
    const req = new XMLHttpRequest();
    req.open('GET', '/data');
    req.onload = () => {
        const result = JSON.parse(req.responseText);
        const dataScope = document.getElementById('dataReload')
        dataScope.innerHTML = ''
        result.forEach((item) => {
            const row = document.createElement("tr");
            row.id = `trIndex${item.OrderID}`
            row.innerHTML = `
            <th><button type="button" class="btn btn-danger delete_btn" onclick="DeleteBT(trIndex${item.OrderID})">ยกเลิก</button></th>
            <th type="${item.num.length}">${item.num}</th>
            <th info="${item.top == null ? "-" : "enable"}" >${item.top == null ? "-" : item.top}</th>
            <th info="${item.tod == null ? "-" : "enable"}" >${item.tod == null ? "-" : item.tod}</th>
            <th info="${item.down == null ? "-" : "enable"}" >${item.down == null ? "-" : item.down}</th>
            <th info="${item.r_up == null ? "-" : "enable"}" >${item.r_up == null ? "-" : item.r_up}</th>
            <th info="${item.r_down == null ? "-" : "enable"}" >${item.r_down == null ? "-" : item.r_down}</th>`
            dataScope.appendChild(row);
        })
    }
    req.send()
}
//check state
function update_HTML(data) {
    const maxCredit = document.querySelectorAll('.Crd');
    maxCredit[0].innerHTML = `${data.top ? data.top : '0'}`
    maxCredit[1].innerHTML = `${data.tod ? data.tod : '0'}`
    maxCredit[2].innerHTML = `${data.down ? data.down : '0'}`
    maxCredit[3].innerHTML = `${data.r_up ? data.r_up : '0'}`
    maxCredit[4].innerHTML = `${data.r_down ? data.r_down : '0'}`
}

// Delete button
function DeleteBT(id) {
    const tr = id.querySelectorAll('th[info="enable"]');
    const orderID = id.id.slice(7);
    fetch(`/delete/${orderID}`)
    .then(res => res.json())
    .then(data => {
        load_data();
        if (data.type === 'success'){
            toastA('ดำเนินการเสร็จสิ้น' ,'success')
        } else {
            toastA('ทำรายการไม่สำเร็จ' ,'danger')
        }
    })
    .catch(err => console.log(err))
}