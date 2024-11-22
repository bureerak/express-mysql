const userInputs = document.querySelectorAll('.defInput');
userInputs.forEach((input, Inputindex)=>{
    input.addEventListener('input', (e) => {
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

//parse and update
load_data()
function load_data() {
    const req = new XMLHttpRequest();
    req.open('GET', '/data');
    req.onload = () => {
        const result = JSON.parse(req.responseText);
        const dataScope = document.getElementById('dataReload')
        dataScope.innerHTML = ''
        update_HTML(result[0])
        result[1].forEach((item) => {
            const row = document.createElement("tr");
            row.id = item.UserID
            row.innerHTML = `
            <th><button type="button" class="btn btn-danger">ยกเลิก</button></th>
            <th>${item.num}</th>
            <th>${item.top == null ? "-" : item.top}</th>
            <th>${item.tod == null ? "-" : item.tod}</th>
            <th>${item.down == null ? "-" : item.down}</th>
            <th>${item.r_up == null ? "-" : item.r_up}</th>
            <th>${item.r_down == null ? "-" : item.r_down}</th>`
            dataScope.appendChild(row);
        })
    }
    req.send()
}
function update_HTML(data) {
    const maxCredit = document.querySelectorAll('#Crd');
    maxCredit[0].innerHTML = `(${data.max_up})`
    maxCredit[1].innerHTML = `(${data.max_tod})`
    maxCredit[2].innerHTML = `(${data.max_down})`
    maxCredit[3].innerHTML = `(${data.run_up})`
    maxCredit[4].innerHTML = `(${data.run_down})`
}