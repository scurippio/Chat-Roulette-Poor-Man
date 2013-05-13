/*

Experiment:
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

/*
 Onload the windows, and check requisite.
*/

var debugMode = 1;
var client;
/*
	Application class
*/

function Rulette(){
	this.socket;
	this.media = {"audio": true, "video": {"mandatory": {}, "optional": []}};
	this.idStatusBox = 'statusbox';
	this.nickname = 'Spippotato';
	this.idNickBox = 'nickbox';
	this.idWarnBox = 'warnbox';
	this.idRuletteBox = 'ruletteBox';
	this.pc_config = {"iceServers":[{"url":"stun:23.21.150.121"}]};
	this.localstream;this.pc;this.remotestream;
}

Rulette.prototype.onConnect = function () {
	
	debug('-Ti sei connesso OK) bravo coglione!');
	client.setStatusBox('Caro '+client.nickname+', sei connesso al websocket!, alla ricerca di ricchioni...');
	//set nickname
	client.socket.emit('joinRulette',{nickname: client.nickname});
	//client.showNickbox();	
}

Rulette.prototype.onDisconnect = function () {
	debug('[ERROR] - Ti sei sconnesso!!!)');
}

Rulette.prototype.showbutton = function (){
	document.getElementById('ruletta').style.display = 'block';
}

Rulette.prototype.onUser = function (data) {
	client.showbutton();
	debug('- onUser called) ');
	debug('- recived data:', data);
	//CONTROLLARE INPUT VALIDARLO MADONNAROIA
	client.setStatusBox('ATTENDI '+client.nickname+'... , Sei connesso con: <b>'+data.nickname+'</b>');
	client.createPeer();
}

Rulette.prototype.onRemoteStream = function (data) {
	debug('- Remote Stream Attached! OK) ');
	debug(data);
	var remoteCam = document.getElementById("remotevideo");
	remoteCam.style.display = 'block';
  	remoteCam.autoplay = true;
	remoteCam.src = window.URL ? window.URL.createObjectURL(data.stream) : data.stream;
}

Rulette.prototype.onIceCandidate = function (data) {
	client.socket.emit('onIceCandidate',data);
}

Rulette.prototype.createPeer = function() {
	try{
		if (typeof client.pc == 'function'){
			client.pc.close();
		}
		if (typeof RTCPeerConnection == 'function') {
			client.pc = new RTCPeerConnection(client.pc_config);
		}else if (typeof mozRTCPeerConnection == 'function') {
			client.pc = new mozRTCPeerConnection(client.pc_config);			
		}else if (typeof webkitRTCPeerConnection == 'function') {
			client.pc = new webkitRTCPeerConnection(client.pc_config);
		}
		//attacco i porcodiohandledemmerda 
		client.pc.onicecandidate = this.onIceCandidate;
		client.pc.onconnection = function(){};
		client.pc.onaddstream = this.onRemoteStream;
		client.pc.onremovestream = function(){};
		client.pc.ondatachannel = function(){};
		client.pc.ongatheringchange = function(){};
		client.pc.onstatechange = function(){};
		client.pc.onicechange = function(){};
		client.pc.onnegotiationneeded = function(){};
		//attacco lo stream locale porco-dio-canaglia.
		client.pc.addStream(client.localstream);
		return true;
	}catch(e){ debug(e);return false; }
}
/* SDP MERDAFUNCTION */

Rulette.prototype.makeOffer = function (desc) {
	debug('MAKE OFFER PORCO-DIO');debug(desc);
	client.pc.setLocalDescription(desc);
	client.socket.emit('onOffer',desc);
}

Rulette.prototype.makeAnswer = function (desc) {
	debug('MAKE ANSWER DIO-CANE');debug(desc);
	client.pc.setLocalDescription(desc);
	client.socket.emit('onAnswer',desc);
}

Rulette.prototype.recAnswer = function (data) {
	debug('-- Answere recived handshapordio finito!');
	debug(data);
	client.pc.setRemoteDescription(new RTCSessionDescription(data));
}

Rulette.prototype.recOffer = function(data) {
	debug('-- Offer recived rispondo subito diocane');
	client.pc.setRemoteDescription(new RTCSessionDescription(data));
	client.pc.createAnswer(client.makeAnswer);
}

Rulette.prototype.recIce = function (data) {
	debug('--- Set ICE server candidate');
	debug(data);
	try {
		client.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
	} catch(e){
		debug(e);
		debug('DIO MA CANE DI DIO!- candidate stronzate exeption di fisso')
	}
}

Rulette.prototype.callUser = function (data) {
	client.showbutton();
	client.setStatusBox('ATTENDI '+client.nickname+'... , Sei connesso con: <b>'+data.nickname+'</b>');
	//ora devi chiamare cazzaro
	if (client.createPeer()){
		debug('- Peer object Creation OK! )');
		client.pc.createOffer(client.makeOffer);	
	}else{
		debug('Peer object creation filed');	
	}
}

Rulette.prototype.onWait = function (data) {
	client.setStatusBox(client.nickname+') ---- Wating nuovo ricchione disponibile --------');
	var remoteCam = document.getElementById("remotevideo");
	remoteCam.style.display = 'none';
}

Rulette.prototype.onConnectError = function(){
	debug(this);
	client.setStatusBox('Diochifoso International: Connection to WebSocket fail - service maybe down or PWONED!');
}

Rulette.prototype.onConnection = function () {
	client.setStatusBox('Connessione al server in corso... prco-dio');
}

Rulette.prototype.setStatusBox = function (msg) {
	debug('[STATUS] : '+msg);
	try{ document.getElementById(this.idStatusBox).innerHTML = msg; } catch(e){
		debug('Dom sputtanato, dio cristo merda');
	}
}

Rulette.prototype.showNickbox = function () {
	debug(this.idNickBox);
	
	try {
		document.getElementById(this.idNickBox).style.display = 'block';
		document.getElementById(this.idWarnBox).style.display = 'none';
		
		this.setStatusBox(' Devi scrivere il tuo nome da ricchionazza e premere JOINT PORCCODDIO ');
		
	} catch (e) {
		alert('non ci sono tutti gli oggetti del dom diocane serve un div con id uguale a ', this.idNickBox);	
	}
}

Rulette.prototype.getUserMedia = function () {
	try {
		navigator.getUserMedia(this.media,this.onMediaSuccess,this.onMediaFailure);
	}catch (e){
		debug('[BESTEMMIA CON ME PORCCODIIIIOOOOOHHH]',e);
	}	
	
}

Rulette.prototype.onMediaSuccess = function (localStream) {
	debug('- MEDIA ACCESS OK ) ');
	//mostro la tua facciademmerda
	debug('- show media box ');
	//imposto l'oggetto local stream
	client.localstream = localStream;
 	var myvideo = document.createElement("video");
  	myvideo.autoplay = true;
  	myvideo.setAttribute("id",'mycam');
	myvideo.src = window.URL ? window.URL.createObjectURL(localStream) : localStream;
	document.getElementById(client.idRuletteBox).appendChild(myvideo);
	//mostro ildioporco nickname
	client.showNickbox();
}

Rulette.prototype.onMediaFailure = function (err) {
	debug('[PORCODIO] scureggia sui muri ha rifiutato err:',err);
	alert('se vuoi usare questa merda devi accedere alla webcam, ricarica la pagina vah');
}

Rulette.prototype.connect = function(){
	try {
		this.socket = io.connect('http://tracciabi.li:1240');
		//Merdler.io
		this.socket.on('connecting',this.onConnection);
		this.socket.on('connect',this.onConnect);
		this.socket.on('disconnect',this.onDisconnect);
		this.socket.on('connect_failed', function () {  });
		this.socket.on('error', this.onConnectError);
		this.socket.on('reconnect_failed', function () {});
		this.socket.on('reconnect', function () {});
		this.socket.on('reconnecting', function () {});
		this.socket.on('message', function (message, callback) {});
		this.socket.on('anything', function(data, callback) {});
		//Custom merdevent.suka.io
		this.socket.on('onUser',this.onUser);
		this.socket.on('callUser',this.callUser);
		this.socket.on('onWait',this.onWait);
		
		//s.d.p =  sesso dio porco
		this.socket.on('recOffer', this.recOffer);
		this.socket.on('recAnswer',this.recAnswer);
		this.socket.on('recIce',this.recIce);
	} catch (e){
		debug(e,'Diomerda websocket/and fall back fail');
		return false;
	}

	return true;
}

Rulette.prototype.showBrowserIncompatibleMessage = function () {
	document.getElementsByTagName('body').innerHTML = ' BROWSER NON SUPPORTATO , SCARICA CHROMEMINCHIA O FIREFROCIO! ';	
}

Rulette.prototype.checkBrowser = function (){
	try{
		debug('--Checking UserMedia--');
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia || navigator.msGetUserMedia;
		
		if (typeof navigator.getUserMedia != 'function') {
			debug('- Nessun UserMerdia trovato. Porco-dio. scarica chrome diocane!');
			return false;
		}else{
			debug('- UserMedia OK) ');
		}
		// window.URL
		window.URL = window.URL || window.webkitURL;
		debug('--Checking P2P Feature--');		
		if (typeof RTCPeerConnection == 'function') {
			debug('- Standard mode OK)');
		}else if (typeof mozRTCPeerConnection == 'function') {
			debug('- Mozilla diocane mode OK)');			
		}else if (typeof webkitRTCPeerConnection == 'function') {
			debug('- WebKit modaporcoddio OK)');
		}else {
			debug('- Puttana la madonna. il browser non è supportminchiato');
			return false;
		}	
		
	}catch(e){ 
		return false; 
	}
	return true;
}

/*
	PORCODIO RULETTAMI
*/
Rulette.prototype.joinRulette = function () {

	try {
		this.nickname = (document.getElementsByName('nickname')[0].value.length > 0 ? document.getElementsByName('nickname')[0].value : client.nickname);
		
		//connessione al webfrocet!
		debug(this.nickname);
		document.getElementById(this.idNickBox).style.display = 'none';
		this.connect();
	} catch(e) {
		debug(e, '(SCUREGGIA IMPREVISTA PORCO-PORCO-DIO)');
	}

}

function debug(arg) {
	if (!debugMode) { return false; }
	console.log(arg);
}

window.onload = function(){
	debug('-----Welcome to chat roulette for poor man ------');	
	debug('- Create App object');
	try {
		client = new Rulette();
		debug('- Play browser check )');
		if (!client.checkBrowser()) {
			client.showBrowserIncompatibleMessage();
		}	
	}catch(e){ 
		debug('_BROWSER_UNSUPPORT_CLASS_MAYBE_IE6_DIOPORCO_'); 
		document.getElementsByTagName('body').innerHTML = ' BROWSER NON SUPPORTATO , SCARICA CHROMEMINCHIA O FIREFROCIO! ';
	}
	//get user media 
	client.getUserMedia();
	//client.connect();		
}



