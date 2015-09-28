var app       =     require("express")();
var mysql     =     require("mysql");
var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);

/* Creating POOL MySQL connection.*/

var connection = mysql.createPool({
	connectionLimit   :   100,
	host              :   'localhost',
	user              :   'root',
	password          :   '',
	database          :   'test',
	debug             :   false
});

app.get("/",function(req,res){
	res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on('connection',function(socket){  
	console.log("A user is connected");
	socket.on('user added',function(status){
		add_status(status,function(res){
			if(res){
				io.emit('refresh feed',status);
			} else {
				io.emit('error');
			}
		});
	});
});

var add_status = function (status,callback) {
	connection.getConnection(function(err,connection){
		if (err) {
			connection.release();
			callback(false);
			return;
		}

		connection.query('INSERT INTO `users` SET ?',status,function(err,rows){
			connection.release();
			if(!err) {
				callback(true);
			}
		});

		connection.on('error', function(err) {
			callback(false);
			return;
		});

	});
}

http.listen(3000,function(){
	console.log("Listening on 3000");
});