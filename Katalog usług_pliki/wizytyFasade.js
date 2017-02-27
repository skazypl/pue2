function WizytyFasade() {

	this.anulujWizyte = function(param, callback, callbackError) {
		//  "numerRezerwacji" : "1006",
		//  "idRezerwacji" : "1002",
		//  "typWizyty" : "N",
		//  "dzienWizyty" : "2011-10-03",
		//  "godzinaWizyty" : "16:10:00",
		//  "grupaSpraw" : "8"
		//  "idLokalizacjiTJO" : 666
		dojo.xhrPost({
			url : "konfiguracja/anulujWizyte.npi",
			handleAs : "json",
			content : param,
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Wizyta nie została anulowana");
				callbackError(error);
			}
		});
	}

	this.zarezerwujWizyte = function(param, callback, callbackError) {

		//  "enumTypWizyty": "N";
		//  "idKontekstu": "1234";
		//  "idWolnegoTerminu": "1002";
		//  "idSKR": "1000";
		//  "dzienWizyty": "2011-10-10";
		//  "godzinaRozpoczeciaWizyty": "12:30:00";
		//  "grupaSpraw": "17";

		dojo.xhrPost({
			url : "konfiguracja/zarezerwujWizyte.npi",
			handleAs : "json",
			content : param,
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Blad podczas wykonania akcji zarezerwujWizyte");
				callbackError(error);
			}
		});
	}
	this.zarezerwujWizyteSpecjalna = function(param, callback, callbackError) {

		//  "enumTypWizyty": "N";
		//  "idKontekstu": "1234";
		//  "idWolnegoTerminu": "1002";
		//  "idSKR": "IP";
		//  "dzienWizyty": "2011-10-10";
		//  "godzinaRozpoczeciaWizyty": "12:30:00";
		//  "grupaSpraw": "17";

		dojo.xhrPost({
			url : "konfiguracja/zarezerwujWizyteSpecjalna.npi",
			handleAs : "json",
			content : param,
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Blad podczas wykonania akcji zarezerwujWizyteSpecjalna");
				callbackError(error);
			}
		});
	}

	this.pobierzAktualneRezerwacjeZwykle = function(callback, callbackError) {
		// bez parametrow
		dojo.xhrPost({
			url : "konfiguracja/pobierzMojeRezerwacjeZwykle.npi",
			handleAs : "json",
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				callbackError(error);
			}
		});
	}
	this.pobierzPrzypisanychSpecjalistowDoKlienta = function(callback, callbackError) {
		// bez parametrow
		dojo.xhrPost({
			url : "konfiguracja/specjalisciPrzypisaniDoKlienta.npi",
			handleAs : "json",
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Wystąpił błąd przy pobieraniu listy specjalistow.\n " + error);
				callbackError(error);
			}
		});
	}
	this.pobierzPrzypisanychSpecjalistow = function(callback, callbackError) {
		// bez parametrow
		dojo.xhrPost({
			url : "konfiguracja/pobierzPrzypisanychSpecjalistow.npi",
			handleAs : "json",
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Wystąpił błąd przy pobieraniu listy specjalistow.\n " + error);
				callbackError(error);
			}
		});
	}
	this.pobierzZdarzeniaKalendarzaRezerwacjiWizytyZwyklej = function(param, callback, callbackError) {
		//  "idLokalizacjiTjo": "123";
		//  "idGrupySpraw": "123";
		//  "start": "1234"; dataStartu w milis
		//  "end": "1002"; dataStop w milis
		dojo.xhrPost({
			url : "konfiguracja/kalendarzWizytZwyklyListaZdarzen.npi",
			handleAs : "json",
			content : param,
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Wystąpił błąd przy pobieraniu listy specjalistow.\n " + error);
				callbackError(error);
			}
		});
	}
	this.pobierzZdarzeniaKalendarzaRezerwacjiWizytySpecjalnej = function(param, callback, callbackError) {
		//  "idSpecjalisty": "123";
		//  "start": "1234"; dataStartu w milis
		//  "end": "1002"; dataStop w milis
		dojo.xhrPost({
			url : "konfiguracja/kalendarzRezerwacjiWizytySpecjalnejListaZdarzen.npi",
			handleAs : "json",
			content : param,
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				alert("Wystąpił błąd przy pobieraniu listy specjalistow.\n " + error);
				callbackError(error);
			}
		});
	}
	// Pobiera opcje rezerewacji
	this.pobierzOpcjeRezerwacji = function(param, callback, callbackError) {
		dojo.xhrPost({
			url : "konfiguracja/listaOpcjiDodatkowych.npi",
			handleAs : "json",
			content : param,
			load : function(resp) {
				callback(resp);
			},
			error : function(error, resp) {
				callbackError(error);
			}
		});

	}
	//    this.pobierzZdjecieSpecjalisty = function (param, callback, callbackError) {
	//        dojo.xhrPost({
	//            url: "konfiguracja/pobierzZdjecieSpecjalisty.npi",
	//            handleAs: "json",
	//            content: param,
	//            load: function(resp) {
	//                callback(resp);
	//            },
	//            error: function(error, resp) {
	//                callbackError(error);
	//            }
	//        });
	//    }
}

var wizytyFasade = new WizytyFasade();
