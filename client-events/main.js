var socket = io.connect('http://localhost:3000', { 'forceNew': true });

socket.on('connected', function (data) {
    document.getElementById("actions").innerHTML = data;
});

socket.on('server-message', function (data) {
    document.getElementById("actions").innerHTML = data;
});

function action1(){
    socket.emit('first-action', 'Se realizo la accion 1');
}

function action2(){
    socket.emit('second-action', 'Se realizo la accion 2');
}

function action3(){
    socket.emit('third-action', 'Se realizo la accion 3');
}
