const userInput = document.getElementById('defInput')
userInput.addEventListener('input', (e) => {
    const text = e.target.value.length
    const responseInputs = document.getElementsByClassName('cdInput')
    for (let responseInput of responseInputs) {
        responseInput.value = "";
    }
    if (text === 0) {
        for (let responseInput of responseInputs) {
            responseInput.disabled = true;
        }
    } else if (text === 1) {
        Array.from(responseInputs).forEach((item, index) => {
            item.disabled = true;
            if ([3, 4].includes(index)) {
                item.disabled = false;
            }
        })
    } else if (text === 2) {
        Array.from(responseInputs).forEach((item, index) => {
            item.disabled = true;
            if ([0, 2].includes(index)) {
                item.disabled = false;
            }
        })
    } else if (text === 3) {
        Array.from(responseInputs).forEach((item, index) => {
            item.disabled = true;
            if ([0, 1].includes(index)) {
                item.disabled = false;
            }
        })
    }
})

//parse and update
load_data()
function load_data() {
    const req = new XMLHttpRequest();
    req.open('GET', '/data');
    req.onload = () => {
        const [result] = JSON.parse(req.responseText);
        update_HTML(result)
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