// Funkcje modyfikujące bieżące handlery wyniku i błędów
function setSzafirAppletResultHandler(fn) {

	riuPodpis.fnSzafirAppletResultHandler = fn;
}
function setSzafirAppletErrorHandler(fn) {
	riuPodpis.fnSzafirAppletErrorHandler = fn;
}

function setAsyncSzafirAppletResult(result) {
	if (riuPodpis.fnSzafirAppletResultHandler instanceof Function) {
		riuPodpis.fnSzafirAppletResultHandler(result);
	} else {
		alert("ERROR: fnSzafirAppletResultHandler not set");
	}
}
function setAsyncSzafirAppletError(error) {
	if (riuPodpis.fnSzafirAppletErrorHandler instanceof Function) {
		riuPodpis.fnSzafirAppletErrorHandler(error);
	} else {
		alert("ERROR: fnSzafirAppletErrorHandler not set");
	}
}

function RiuPodpis() {

	this.loadCallback;

	this.startCallback = function(){
		setSzafirAppletResultHandler(riuPodpis.szafirDoTaskListHandler);
		setSzafirAppletErrorHandler(riuPodpis.szafirDoTaskListHandler);
		document.getElementById("szafirsdk-taskList-xml").value = riuPodpis.podpisTaskList;
		document.getElementById("szafirsdk-doTaskListNoWindow-action").click();
	}

	this.signCallback;

	this.fnSzafirAppletResultHandler;
	this.fnSzafirAppletErrorHandler;

	this.szafirLoadedHanlder = function(result){
		riuPodpis.loadCallback();
	}

	this.szafirStartedHanlder = function(result){
		riuPodpis.startCallback();
	}


	this.szafirDoTaskListHandler = function(result){
		riuPodpis.signCallback(result);
	}

	this.defaultError = function(result){
		alert("Wystąpił błąd podczas ładowania komponentu kir ("+result+")");
	}
	
	/**
	 * Sprawdzenie, czy dokument został prawidłowo podpisany
	 */
	this.sprawdzPodpis = function(xmlData) {
		var podpisany = false;
		if (xmlData){
			$.ajax("riu/riuSprawdzPodpis.npi", {
				data: {
					"xmlData": xmlData
				},
				async: false,
				type: 'POST',
				success: function (resp) {
					riu.komunikatBledu = resp['blad'];
					podpisany = resp['wartosc'];
				}
			});
		}
		return podpisany;
	}
	
	/**
	 * Pobranie oświadczenia do podpisu
	 */
	this.pobierzOswiadczenie = function(urlOswiadczenie) {
 		if (riuPodpis.xmlData == null) {
		    $.ajax(urlOswiadczenie, {
			    async: false,
			    type: 'POST',
			    success: function (resp) {
				    riuPodpis.xmlData = resp['tresc'];
			    }
		    });
 		}
	}	
	
	this.wyswietlOswiadczenie = function(urlOswiadczenie) {
		this.pobierzOswiadczenie(urlOswiadczenie);
		this.wyswietlOswiadczenieDoPodpisania(riuPodpis.xmlData);
	}
	
	this.wyswietlOswiadczenieDoPodpisania = function(tresc) {
		alert({
			   content: tresc,
			   dialogHeight : '180px',
			   dialogWidth : '780px'
			  });		
	}	
	
	/**
	 * Konfiguracje XML
	 */
	this.podpisSettings = null;
	this.podpisTaskList = null;
	this.podpisSettingUrl = null;
	
	/**
	 * Pobranie xml'ów
	 */
	this.pobierzXML = function(xmlData, wystawca, numer) {
		$.ajax("riu/riuXMLPodpis.npi", {
			data: {
				"xmlData": xmlData,
				"issuer": wystawca,
				"serial": numer
			},
			async: false,
			type: 'POST',
			headers: {
				"X-Session-Verify": getCookie('JSESSIONIDPORTAL')
			},
			success: function (resp) {
				riuPodpis.podpisSettings = resp['ustawienia'];
				riuPodpis.podpisTaskList = resp['zadania'];
				riuPodpis.podpisSettingUrl = resp['settingsUrl'];
			}
		});
	}
	
	//-------- #13567 - BEGIN
	this.dodajDokumentEPUAP = function(akcjaDodaj, akcjaBlad, splash) {
		var callback = function(){
			riuPodpis.dodajDokumentEPUACallback(akcjaDodaj, akcjaBlad);
		};
		checkEPUAPInfoAndShowMessageAsync(null, callback, callback, splash);
	}
	
	/**
	 * Dodanie dokumentu do ePUAP
	 */
	this.dodajDokumentEPUACallback = function(akcjaDodaj, akcjaBlad) {
		//-------- #13567 - END
		var args = {
				url: akcjaDodaj,
				handleAs: "json",
				sync: true,
				load: function(resp){
					url = resp['url'];
					if (url != null) {
						document.location.href = url;
					}
					else {
						riu.komunikatBledu = resp['blad'];	
				    	menuSelect(akcjaBlad);
					}    					
				},
				error : function(error, resp) {
					error(error);
				}
		};
 		dojo.xhrPost(args);		
	}


    this.zalogujSSOEPUAP = function(akcja){
        var args = {
            url: akcja,
            handleAs: "json",
            sync: true,

            load: function(resp){
                window.location.href = resp.url;
            }
        };

        dojo.xhrPost(args);
    }

	this.zalogujSSOBP = function(akcja){
		var args = {
			url: akcja,
			handleAs: "json",
			sync: true,

			load: function(resp){
				window.location.href = resp.url;
			}
		};

		dojo.xhrPost(args);
	}

	//-------- #13567 - BEGIN
	this.dodajDokumentEPUAPLogowanie = function(akcjaDodaj, akcjaBlad) {
		var callback = function(){
			riuPodpis.dodajDokumentEPUAPLogowanieCallback(akcjaDodaj, akcjaBlad);
		};
		checkEPUAPInfoAndShowMessageAsync(null, callback, callback);
	}
	
	/**
	 * Dodanie dokumentu do ePUAP
	 */
	this.dodajDokumentEPUAPLogowanieCallback = function(akcjaDodaj, akcjaBlad) {
		//-------- #13567 - END
   		var args = {
			url: akcjaDodaj,				
			handleAs: "json",
			sync: true,
			load: function(resp){
				url = resp['url'];
				if (url != null) {
					document.location.href = url;
				}
				else {
					riu.komunikatBledu = resp['blad'];	
			    	menuSelect(akcjaBlad);
				}    					
			},
			error : function(error, resp) {
				error(error);
			}
   		};
   		 	   	   		
		var splash = new zusnpi.layout.splash.Splashscreen({
		    parentId : dijit.byId("logowanieMainContainerId").containerNode.id, 
		    text : 'Proszę czekać', 
		    additionalText : 'Trwa przekierowanie na ePUAP...', 
		    timeoutMillis : 1800000
	    });
		splash.show();
	
		var t = new dojox.timing.Timer(1500);
		t.onTick = function() {
			t.stop();
			dojo.xhrPost(args);		
		}
		t.start();   			
	}
	
	/**
	 * Weryfikacja podpisanego dokumentu w ePUAP
	 */
	this.weryfikujDokumentEPUAP = function(akcjaBlad) {
		
		var args = {
				url: "riu/riuWeryfikujDokumentEPUAP.npi",
				handleAs: "json",
				sync: true,
				load: function(resp){
					zweryfikowany = resp['zweryfikowany']
					if (!zweryfikowany) {
						riu.komunikatBledu = resp['blad'];	
						menuSelect(akcjaBlad);
					}
				},
				error : function(error, resp) {
					error(error);
				}
		};
 		dojo.xhrPost(args);	
 		return zweryfikowany;
		
	}
	
	
	/*
	 * XML do podpisania
	 */
	var xmlData = null;
	/*
	 * Wynik podpisania w postaci XML'a
	 */
	var xmlResult = null;
	/*
	 * Zmienna oczekiwania na wynik
	 */
	var oczekiwanieNaWynik = false;


	/**
	 * Podpisuje dokument
	 */
	this.podpiszDokument = function(urlOswiadczenie, wystawca, numer,callback)	{
		
		if (riuPodpis.xmlData == null) {
			riuPodpis.pobierzOswiadczenie(urlOswiadczenie);
		}

		riuPodpis.pobierzXML(riuPodpis.xmlData,wystawca,numer);

		setSzafirAppletResultHandler(riuPodpis.szafirStartedHanlder);

		riuPodpis.signCallback = function(result){
			riuPodpis.xmlResult = result;
			callback(riuPodpis.sprawdzPodpis(result));
		}
		
		document.getElementById("szafirsdk-settings-uri").value = riuPodpis.podpisSettingUrl;
		document.getElementById("szafirsdk-startComponentUri-action").click()

	}
		
	/*
	 * Timer za pomoca ktorego ladowane sa applety
	 */
	this.timer = null;		

	this.appletSettingsUrl = null;
	
	/**
	 * obsluga wyjatku podczas wywolania appletu 
	 */
	this.obsluzWyjatekWywolaniaAppletu = function(e) {
		error('Wystąpił błąd podczas podpisywania dokumentu. Upewnij się, że twoja przeglądarka ma zainstalowaną i włączoną obsługę najnowszej wtyczki Javy.');
		console.error(e);
	}
	
	/**
	 * metoda sprawdzajaca czy przegladarka obsluguje jave
	 */
	this.czyJavaObslugiwana = function () {
		var czyObslugiwana = navigator.javaEnabled();
		if(!czyObslugiwana) {
			alert(riuPodpis.brakJavyKomunikat);
		}
		return czyObslugiwana;
	}
	
	this.czyUzywamyWtyczki = function () {
		if ($('#szafirsdk-mode').val() == 'SZAFIR_SDK_EXT') {
			return true;
		}
		return false;
	}
	
	/**
	 * komunikat zwracany w przypadku gdy riuPodpis.czyJavaObslugiwana() zwroci false
	 */
	this.brakJavyKomunikat = 'Twoja przeglądarka nie obsługuje Javy.\nUpewnij się, że na Twoim komputerze zainstalowana jest Java oraz jej obsługa jest włączona w przeglądarce.'; 
	
	/**
	 * Dodaje applet na strone
	 */
	this.dodajApplet = function() {
		$.szafirsdk_init(function () {
			
			// jeśli nie używamy chrome, blokujemy przycisk na czas ładowania appletu
			if (!riuPodpis.czyUzywamyWtyczki()) {
				riuPodpis.blokujPrzycisk("Proszę czekać ...");
			}
			
			setSzafirAppletResultHandler(riuPodpis.szafirLoadedHanlder);
			setSzafirAppletErrorHandler(riuPodpis.defaultError);
			
			$.szafirsdk_config({
				debug: false,
				onError: riuPodpis.defaultError,
				onLoaded: riuPodpis.szafirLoadedHanlder,
				onStarted: riuPodpis.szafirStartedHanlder,
				onDoTaskListResult: riuPodpis.szafirDoTaskListHandler,
				onUnloaded: function () {
				},
				onIsCardInReaderResult: function () {
				}
			});
			
			riuPodpis.loadCallback = function () {
				riuPodpis.zwolnijPrzycisk();
			};
			
			document.getElementById('szafirsdk-loadSzafir-action').click();
		});
	}
	
	var logowanieButton = null;
	var logowanieButtonLabel = null;
	var logowanieButtonDefaultLabel = null;
	
	var pobierzPrzyciski = function () {
		riuPodpis.logowanieButton = $('#logowanieButton');
		riuPodpis.logowanieButtonLabel = $('#logowanieButtonLabel');
		riuPodpis.logowanieButtonDefaultLabel = riuPodpis.logowanieButtonLabel.html();
	}
	
	this.blokujPrzycisk = function (tekstPrzycisku) {
		if (riuPodpis.logowanieButton == null) {
			pobierzPrzyciski();
		}
		riuPodpis.logowanieButton.prop('disabled', true);
		riuPodpis.logowanieButtonLabel.html(tekstPrzycisku);
	}
	
	this.zwolnijPrzycisk = function () {
		if (riuPodpis.logowanieButton ==  null) {
			pobierzPrzyciski();
		}
		riuPodpis.logowanieButton.prop('disabled', false);
		riuPodpis.logowanieButtonLabel.html(riuPodpis.logowanieButtonDefaultLabel);
	}
						
	var getCookie = function (cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
}

var riuPodpis = new RiuPodpis();
