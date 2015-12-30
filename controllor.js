$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    $("#left").click(function() {
        newCommand("L");
        return false;
    });
    $("#right").click(function() {
        newCommand("R");
        return false;
    });
    $("#up").click(function() {
        newCommand("U");
        return false;
    });
    $("#down").click(function() {
        newCommand("D");
        return false;
    });
    $("#interact").click(function() {
        newCommand("I");
        return false;
    });
    connecter.start();
});

function newCommand(command) {
    var s = {command:"move",val:command,cookies:"",}
    connecter.socket.send(JSON.stringify(s));
}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

var connecter = {
    socket: null,

    start: function() {
        var url = "ws://" + location.host + "/tetrissocket";
        connecter.socket = new WebSocket(url);
        connecter.socket.onmessage = function(event) {
            var response = JSON.parse(event.data);
            if (response.command == "role" && response.val == "R" ){
                connecter.socket.send(JSON.stringify({command:"role",val:"C",cookies:"",}));
            }else if(response.command == "link" && response.val == "R"){
                gameID=prompt('Please enter your gameID:',"");
                connecter.socket.send(JSON.stringify({command:"link",val:gameID,cookies:"",}));
            }
        }
    },
};
