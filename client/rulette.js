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

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (typeof navigator.getUserMedia != 'function') {
        debug('- Nessun UserMerdia trovato. Porco-dio. scarica chrome diocane!');
}else{
	 debug('- UserMedia OK) ');
}
// window.URL
window.URL = window.URL || window.webkitURL;
// Session Descriptor
try {
	SessionDescription = RTCSessionDescription || mozRTCSessionDescription;
} catch(e) {
	debug('Porcodio mozzilla fanculo');
	SessionDescription = mozRTCSessionDescription;
}

function Rulette(){
	this.namespace = '/chatroulette';
	this.socket;this.iceReady = 0;
	this.socketURL = 'http://tracciabi.li:1240'+this.namespace;
	this.media = {"audio": true, "video": {"mandatory": {}, "optional": [{RtpDataChannels: true}]}};
	this.idStatusBox = 'statusbox';
	this.nickname = 'Spippotato';
	this.idNickBox = 'nickbox';
	this.idWarnBox = 'warnbox';
	this.idRuletteBox = 'ruletteBox';
	this.pc_config = {"iceServers":[{"url":"stun:23.21.150.121"}]};
	this.localstream;this.pc;this.remotestream;this.sendChannel;
}

Rulette.prototype.validateInput = function (str){
     return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
	client.setStatusBox('ATTENDI '+client.nickname+'... , Sei connesso con: <b>'+client.validateInput(data.nickname)+'</b>');

}

Rulette.prototype.onRemoteStream = function (data) {
	debug('- Remote Stream Attached! OK) ');
	debug(data);
	var remoteCam = document.getElementById("remotevideo");
	remoteCam.style.display = 'block';
	remoteCam.style.height = '43%';
  	remoteCam.autoplay = true;
	remoteCam.src = window.URL ? window.URL.createObjectURL(data.stream) : data.stream;
	document.querySelector('input#toSend').disabled = false;
}

Rulette.prototype.onIceCandidate = function (data) {
	client.socket.emit('onIceCandidate',data);
}

Rulette.prototype.createPeer = function() {
	client.iceReady = 0;
	try{
		if (typeof client.pc == 'object'){
			try { client.pc.close(); } catch(e) {}
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
		client.pc.onremovestream = function(){
			document.getElementById('toSend').disabled = 'disabled';
		};
		client.pc.ondatachannel = function(){};
		//client.pc.ongatheringchange = function(){};
		client.pc.onstatechange = function(){};
		//client.pc.onicechange = function(){};
		client.pc.onnegotiationneeded = function(){};
		//attacco lo stream locale porco-dio-canaglia.
		client.pc.addStream(client.localstream);
		client.pc.ondatachannel = this.onDataChannel;
		this.sendChannel = client.pc.createDataChannel('FagChan',{reliable: false});
		this.sendChannel.onmessage = this.onChannelMessage;
		return true;
	}catch(e){ debug(e);return false; }
}
/* SDP MERDAFUNCTION */
Rulette.prototype.onChannelMessage = function (event){
	try {
		console.log(event,event.data,event.data.length);
		var chatbox = document.getElementById('chatfag');	
		if (event.data.toString() == 'FagChan') {
			chatbox.value = '---- CHAT CONNECTED WITH OTHER RICCHIONE ----'+"\n";
		}else{	
			chatbox.value = chatbox.value+"\n"+'Friend: '+event.data;
		}
	}catch(e){
		console.log(e);
	}
}
Rulette.prototype.onDataChannel = function (event) {
	rchan = event.channel;
	console.log('event',event,event.channel);
	rchan.onmessage = client.onChannelMessage;
}
Rulette.prototype.sendMsg = function () {
	var text = document.getElementById('toSend').value;
	var chatbox = document.getElementById('chatfag');
	chatbox.value = chatbox.value+"\n"+'You: '+text;
	this.sendChannel.send(text);
	document.getElementById('toSend').value = '';
}

Rulette.prototype.makeOffer = function (desc) {
	debug('MAKE OFFER PORCO-DIO');debug(desc);
	client.pc.setLocalDescription(desc);
	client.socket.emit('onOffer',desc);
}

Rulette.prototype.makeAnswer = function (desc) {
	debug('MAKE ANSWER DIO-CANE');debug(desc);
	client.pc.setLocalDescription(desc);
	client.socket.emit('onAnswer',desc);
	client.iceReady = 1;
}

Rulette.prototype.recAnswer = function (data) {
	debug('-- Answere recived handshapordio finito!');
	client.iceReady = 1;
	debug(data);
	client.pc.setRemoteDescription(new SessionDescription(data));
}

Rulette.prototype.recOffer = function(data) {
	debug('-- Offer recived rispondo subito diocane');
	client.createPeer();
	client.pc.setRemoteDescription(new SessionDescription(data));
	client.pc.createAnswer(client.makeAnswer,function(e){ debug('error'); debug(e); },{mandatory:{OfferToReceiveAudio:true,OfferToReceiveVideo:true}});
}

Rulette.prototype.recIce = function (data) {
	if (!client.iceReady) { debug('--- NON PRONTO PER RICEVERE IL CANDIDATO --- ');return; }
	debug('--- Set ICE server candidate');
	//debug(data);
	if (data.candidate === null) {debug('no-candidate'); return; }
	try {
		var RTCIceCandidate = window.mozRTCIceCandidate || window.webkitRTCIceCandidate || window.RTCIceCandidate;
		var oDioPorco = new RTCIceCandidate({ sdpMLineIndex: data.candidate.sdpMLineIndex, candidate: data.candidate.candidate });
		client.pc.addIceCandidate(oDioPorco);
	} catch(e){
		console.log(e);
		debug('DIO MA CANE DI DIO!- candidate stronzate exeption di fisso')
	}
}

Rulette.prototype.callUser = function (data) {
	client.showbutton();
	client.setStatusBox('ATTENDI '+client.nickname+'... , Sei connesso con: <b>'+data.nickname+'</b>');
	//ora devi chiamare cazzaro
	if (client.createPeer()){
		debug('- Peer object Creation OK! )');
		client.pc.createOffer(client.makeOffer,function(e){ debug('error'); debug(e); },{mandatory:{OfferToReceiveAudio:true,OfferToReceiveVideo:true}});	
	}else{
		debug('Peer object creation filed');	
	}
}

Rulette.prototype.onWait = function (data) {
	client.setStatusBox(client.nickname+') ---- Wating nuovo ricchione disponibile --------');
	if (typeof client.pc == 'object'){
		try { client.pc.close(); } catch(e) {}
	}
	var remoteCam = document.getElementById("remotevideo");
	remoteCam.style.display = 'none';
	document.getElementById('chatfag').value = '';
	document.getElementById('toSend').disabled = "disabled";
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
		this.joinRulette();
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
	myvideo.muted = 'muted';
	myvideo.style.height = '43%';
	myvideo.setAttribute('muted',true);
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
		this.socket = io.connect(this.socketURL);
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
		// Session Descriptor
		SessionDescription = RTCSessionDescription || mozRTCSessionDescription;
		
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

		this.nickname = this.validateInput((document.getElementsByName('nickname')[0].value.length > 0 ? document.getElementsByName('nickname')[0].value : client.nickname));	
		//connessione al webfrocet!
		debug(this.nickname);
		document.getElementById(this.idNickBox).style.display = 'none';
		this.connect();
	} catch(e) {
		debug(e, '(SCUREGGIA IMPREVISTA PORCO-PORCO-DIO)');
	}

}

Rulette.prototype.ruletta = function () {
	document.querySelector('input#toSend').disabled = true;

	client.socket.emit('ruletta');
}

Rulette.prototype.fsendMsg = function () {
	console.log(e);
	if(e.keyCode == 13) {
		this.sendMsg();
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
	//mostro ildioporco nickname
	//client.showNickbox();	
	
}
function diop (e) {
	if (e.keyCode == 13) {
		client.sendMsg();
	}
}
