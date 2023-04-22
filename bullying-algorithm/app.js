const express = require('express');
const app = express();
const port = 3000;

var cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.static(__dirname + '/client/'));
app.listen(port, () => console.log(`Server listen on port: ${port}`));

var leader = true;
var state = true;

app.get('/amILeader', function(req, res) {
    res.send({ leader, state });
});

app.get('/give-up', function(req, res) {
    leader = false;
    state = false;
    res.send({ leader, state });
});