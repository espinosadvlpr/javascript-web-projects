window.onload = function onload() {
    amILeader();
}

async function amILeader() {
    const rawResponse = await fetch('http://127.0.0.1:3000/amILeader', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const content = await rawResponse.json();
    setLeader(content.leader);
    setState(content.state);
}

async function giveUp() {
    const rawResponse = await fetch('http://127.0.0.1:3000/give-up', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const content = await rawResponse.json();
    setLeader(content.leader);
    setState(content.state);
    fillTable('Has renunciado como lider.');
}

function setLeader(leader) {
    var label = document.getElementById("leader");
    if (leader == true) {
        label.innerHTML = "SOY LIDER";
        document.getElementById("give-up").style.display = "initial";
    } else {
        label.innerHTML = "NO SOY LIDER";
        document.getElementById("give-up").style.display = "none";
    }
}

function setState(state) {
    var label = document.getElementById("online");
    if (state == true) {
        label.innerHTML = "EN LINEA";
    } else {
        label.innerHTML = "FUERA DE LINEA";
    }
}

function fillTable(log) {
    var tr = document.createElement('tr');
    var tdhour = document.createElement("td");
    var tdlog = document.createElement("td");

    var hour = document.createTextNode(new Date());
    var log = document.createTextNode(log);

    tdhour.appendChild(hour);
    tdlog.appendChild(log);
    tr.appendChild(tdhour);
    tr.appendChild(tdlog);
    document.getElementById("table").appendChild(tr);
}