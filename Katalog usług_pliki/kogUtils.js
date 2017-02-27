function KogUtils() {

	this.IS_LOG_ENABLED = false;


	this.callXhrPost = function(xhrUrl, callback) {
		dojo.xhrPost({
			url : xhrUrl,
			handleAs : "json",
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				error(error);
			}
		});
	};

	this.czyJestPlatnikiem = function(callback) {
		this.callXhrPost("obszar-ogolny/isZalogowanyPlatnikMasterOsobaFizyczna.npi", callback);
	};

	this.czyZgloszenieDostepne = function(callback) {
		this.callXhrPost("obszar-ogolny/isZgloszeniePlatnikaDostepne.npi", callback);
	};

	this.log = function(text) {
		if(this.IS_LOG_ENABLED) {
			console.log('KOG LOG: ' + text);
		}
	};
}

var kogUtils = new KogUtils();
