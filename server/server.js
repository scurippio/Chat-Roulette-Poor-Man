/*
Server Engine Experiment:
  ____ _           _     ____             _      _   _         _____          
 / ___| |__   __ _| |_  |  _ \ ___  _   _| | ___| |_| |_ ___  |  ___|__  _ __ 
| |   | '_ \ / _` | __| | |_) / _ \| | | | |/ _ \ __| __/ _ \ | |_ / _ \| '__|
| |___| | | | (_| | |_  |  _ < (_) | |_| | |  __/ |_| ||  __/ |  _| (_) | |   
 \____|_| |_|\__,_|\__| |_| \_\___/ \__,_|_|\___|\__|\__\___| |_|  \___/|_|   
                                                                              
 ____                    __  __             
|  _ \ ___   ___  _ __  |  \/  | __ _ _ __  
| |_) / _ \ / _ \| '__| | |\/| |/ _` | '_ \ 
|  __/ (_) | (_) | |    | |  | | (_| | | | |
|_|   \___/ \___/|_|    |_|  |_|\__,_|_| |_|
											- Che lo schifo sia con voi.

Author: scurippio <scurippio@tracciabi.li>
StarDate: 2013-04-09
EndDate: undefined

*/

var namespace = '/chatroulette';

/*
	Puo' finire in 2 modi o lo trova! opppure lo mette nella stanza 
*/
function searchPartner(socket) {
	//socket.randomClient = '';
	console.log('- Search partner for:',socket.id,socket.nickname);
	console.log('clients in hell room');
	if ( io.of(namespace).clients('hell').length == 0 ) {
		console.log('- Non ci sono puzzoni devi aspettare.... ');
		socket.join('hell');
		socket.emit('onWait',{data: 'suca'});
	} else {
		console.log('- Trovati ricchioni in attesa.... ',io.of(namespace).clients('hell'));
		console.log('- Selezionato ricchione: ',io.of(namespace).clients('hell')[0].nickname);
		//rimuovo il client dalla stanza
		var amigo = io.of(namespace).clients('hell')[0];
		if (amigo.id == socket.randomClient){
			console.log('- '+socket.nickname+' è Appena stato con questo attende va..');
			socket.join('hell');
			socket.emit('onWait',{data: 'suca'});			
			return;
		}
		amigo.leave('hell');
		//comunico ai client che li ho associati
		socket.randomClient = amigo.id;
		amigo.randomClient = socket.id;
		if (amigo.id == socket.id){
				console.log('- Puzzone che si sta cercando da solo ');
				socket.join('hell');
				socket.emit('onWait',{data: 'suca'});
				return;
		} 
		//controlla che non coincidano i due id
		
		console.log('- Ricchioni associati: ',socket.randomClient, amigo.randomClient);
		//devo informare i ricchioni che sono stati associati
		socket.emit('callUser',{nickname: amigo.nickname});
		amigo.emit('onUser',{nickname: socket.nickname})
	}
}

try {
	var io = require('socket.io').listen(1240);
}catch(e){
	console.log('Dioporco',e);
}
console.log('Server Partito dioschifoso');

io.of(namespace).on('connection', function (socket) {

		console.log('Un ricchine connesso');
		socket.randomClient = '';
		socket.nickname = '';
		socket.on('joinRulette', function (data) {
		console.log('Ricevuto',data);
		socket.nickname = data.nickname.length == 0 ? 'Spippottato' : data.nickname;
		console.log(socket.nickname);
		searchPartner(socket);
		
	});
	
	socket.on('ruletta', function() {
		//se il ricchione è gia in attesa si deve ciucciare il cazzo
		if (io.of(namespace).manager.roomClients[socket.id]['/hell']){
			console.log('Sta gia in attesa il frocione',socket.nickname);
			return;
		}
		if (socket.randomClient.length > 0){
			searchPartner(io.of(namespace).socket(socket.randomClient));
		}
		console.log('in da hell: ',io.of(namespace).clients('hell').length);
		searchPartner(socket);
	});	
	//console.log('Utenti totali connessi',io.sockets.clients());
	socket.on('onAnswer',function(data){
		console.log('--- Arriva la risposta da dare al frociazzio sdp culo--');
		var amigofrogio = io.of(namespace).socket(socket.randomClient);
		amigofrogio.json.emit('recAnswer',data);
	});
	
	socket.on('onOffer', function(data) {
		console.log('-- il client accetta la offer e la manda');
		var amigofrogio = io.of(namespace).socket(socket.randomClient);
		amigofrogio.json.emit('recOffer',data);
	});
	
	socket.on('onIceCandidate', function(data){
		console.log('-- mando il candifrocIce');
		var amigofrogio = io.of(namespace).socket(socket.randomClient);
		amigofrogio.json.emit('recIce',data);
	});
	
	socket.on('disconnect',function(){
		console.log('DISCONNECT EVENT', socket.nickname,socket.randomClient.length);
		if (socket.randomClient.length > 0){
			console.log('- Mando segnale di ricerca al partner abbandonato.');
			console.log(io.of(namespace).socket(socket.randomClient));
			searchPartner(io.of(namespace).socket(socket.randomClient));
		}
	//	console.log(socket.broadcast.emit('userDisconnect', {client: socket.id}));
	//	console.log('--------SOCKET STRUCTURE AFTER DISCONNECT -------');			
	});
});
