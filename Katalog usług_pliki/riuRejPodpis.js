// Funkcje modyfikujące bieżące handlery wyniku i błędów
function setSzafirAppletResultHandler(fn) {

	riuRejPodpis.fnSzafirAppletResultHandler = fn;
}
function setSzafirAppletErrorHandler(fn) {
	riuRejPodpis.fnSzafirAppletErrorHandler = fn;
}

function setAsyncSzafirAppletResult(result) {
	if (riuRejPodpis.fnSzafirAppletResultHandler instanceof Function) {
		riuRejPodpis.fnSzafirAppletResultHandler(result);
	} else {
		alert("ERROR: fnSzafirAppletResultHandler not set");
	}
}
function setAsyncSzafirAppletError(error) {
	if (riuRejPodpis.fnSzafirAppletErrorHandler instanceof Function) {
		riuRejPodpis.fnSzafirAppletErrorHandler(error);
	} else {
		alert("ERROR: fnSzafirAppletErrorHandler not set");
	}
}


function RiuRejPodpis() {

	this.loadCallback;

	this.startCallback;

	this.signCallback;

	this.fnSzafirAppletResultHandler;
	this.fnSzafirAppletErrorHandler;

	this.szafirLoadedHanlder = function(result){
		riuRejPodpis.loadCallback();
	}

	this.szafirStartedHanlder = function(result){
		riuRejPodpis.startCallback();
	}


	this.szafirDoTaskListHandler = function(result){
		riuRejPodpis.signCallback(result);
	}

	this.defaultError = function(result){
		alert("Wystąpił błąd podczas ładowania komponentu kir ("+result+")");
	}
	
	/**
	 * wysyla dane do akcji rejestrujacej profil
	 */
	this.wyslijDane = function(urlAction) {
		var wyslijDaneButton = dijit.byId("wyslijDaneButtonId");
		dijit.byId("podpisanyDokumentTexboxId").set('value', riuRejPodpis.podpisanyDokument);
						
		var formularz = dijit.byId("formularzFormId");
		formularz.validate();
		if(formularz.isValid()) {
			wyslijDaneButton.set('disabled', true);			
			var splash = new zusnpi.layout.splash.Splashscreen({
			    parentId : formularz.domNode.id, 
			    text : 'Proszę czekać', 
			    additionalText : 'Trwa proces rejestracji profilu...', 
			    timeoutMillis : 1800000
		    });
			splash.show();
			var args = {
				url: urlAction,
				form : dojo.byId(formularz.domNode.id),
				handleAs: "json",
				sync: false,
				load: function(resp){
					var blad = resp["blad"];				
					if((blad == null || blad == "") && resp["login"] != null) {
						dijit.byId('wizardId').selectChild(dijit.byId("riuWizardPodpisSukcesId"));
						dijit.byId("loginPUE").set('value', resp["login"]);
						riu.wyswietlenieOstrzezenia(resp['ostrzezenie'], 'ostrzezenieFieldsetId', 'ostrzezenieInfoFieldId');
					} else {				
						dijit.byId('wizardId').selectChild(dijit.byId("riuWizardPodpisBladId"));
						dijit.byId("rejPodpisBladMessageId").setContentValue(blad);
					}
					splash.hide();
				}
			};
			dojo.xhrPost(args);	
		}
	}
	
	/**
	 * tresc podpisanego oswiadczenia
	 */
	this.podpisanyDokument = null;
		
	/**
	 * wypelnia sekcje z danymi identyfikacyjnymi na podstawie danych certyfikatu
	 */
	this.wypelnienieFormularza = function(dane) {
		riuRejPodpis.wytnijInformacjePodawaniaNip();
		riuRejPodpis.zablokujDaneIdentyfikacyjne();
		var nazwiskoTextbox = dijit.byId("riuNazwisko"); 
		nazwiskoTextbox.set('value', dane['certificateSubjectSurname']);
		var imieTextbox = dijit.byId("riuImiePierwsze"); 
		imieTextbox.set('value', dane['certificateSubjectGivenName']);
		var imieDrugieTextbox = dijit.byId("riuImieDrugie");
		var pesel = dane['certificateSubjectPesel'];
		if(pesel != null && pesel != "") {
			dijit.byId("pesel").set('value', pesel);
			var dataUrodzeniaTextbox = dijit.byId("dataUrodzenia");
			dataUrodzeniaTextbox.set('value', riu.dataUrodzeniaZPeselu(pesel));
		} 
		var nip = dane['certificateSubjectNip'];
		if(nip != null && nip != "") {
			var nipTextbox = dijit.byId("nip");
			nipTextbox.set("value", nip);
		}
	}

	/**
	 * blokuje sekcje formularza z danymi identyfikacyjnymi do edycji
	 */
	this.zablokujDaneIdentyfikacyjne = function() {
		dijit.byId("riuNazwisko").set('readOnly', true);
		dijit.byId("riuImiePierwsze").set('readOnly', true);
		dijit.byId("riuImieDrugie").set('readOnly', true);
		dijit.byId("nip").set('readOnly', true);
		dijit.byId("pesel").set('readOnly', true);
		dijit.byId("typDokTozsamosci").set('readOnly', true);
		dijit.byId("nrDokumentuToz").set('readOnly', true);		
		dijit.byId("dataUrodzenia").set('readOnly', false);
	}
	
	this.weryfikacjaPodpisu = function() {
		var wynik = false;
		var args = {
			url: "riu/riuRejWeryfikujPodpis.npi",
			content: {
				"podpisanyDokument" : riuRejPodpis.podpisanyDokument
			},
			handleAs: "json",
			sync: true,
			load: function(resp){
				if(resp != null) {
					wynik = resp['wynik'];							
				}
				if(wynik) {
					riuRejPodpis.wypelnienieFormularza(resp['dane']);
				} else {
					riu.komunikatBledu = resp['blad'];
				}
			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
		return wynik;
	}
	
	/**
	 * podpisanie oswiadczenia
	 */
	this.podpiszOswiadczenie = function(urlPodpisAction) {
		dijit.byId("rejPodpisOswiadczenieButtonId").set('disabled', true);
		var args = {
				url: "riu/riuXMLPodpis.npi",
				content: {
					"xmlData" : riuRejPodpis.oswiadczenieTresc,
				},
				handleAs: "json",
				sync: true,
				load: function(resp){
					var progressBar = dijit.byId("riuRejCertProgressBar");
					progressBar.set('label', 'Proszę czekać, trwa podpisywanie oświadczenia...');
					progressBar.set('style', 'display:block;width:50%; margin-left: auto; margin-right: auto;');


					setSzafirAppletResultHandler(riuRejPodpis.szafirStartedHanlder);

					riuRejPodpis.signCallback = function(result){
						riuRejPodpis.podpisanyDokument = result;
						var czyPodpisano = riuRejPodpis.weryfikacjaPodpisu(riuRejPodpis.podpisanyDokument);
						if(czyPodpisano == true) {
							dijit.byId('wizardId').selectChild(dijit.byId("riuWizardPodpisFormularzId"));
						} else {
							dijit.byId("rejPodpisBladMessageId").setContentValue(riu.komunikatBledu);
							dijit.byId('wizardId').selectChild(dijit.byId("riuWizardPodpisBladId"));
						}

					}

					riuRejPodpis.startCallback = function(){
						setSzafirAppletResultHandler(riuRejPodpis.szafirDoTaskListHandler);
						setSzafirAppletErrorHandler(riuRejPodpis.szafirDoTaskListHandler);
						document.getElementById("szafirsdk-taskList-xml").value = resp['zadania'];
						document.getElementById("szafirsdk-doTaskListNoWindow-action").click();
					}


					document.getElementById("szafirsdk-settings-uri").value = resp['settingsUrl'];
					document.getElementById("szafirsdk-startComponentUri-action").click()
				},
				error : function(error, resp) {
					error(error);
				}
			};
		dojo.xhrPost(args);	
	}
	
	/**
	 * zmienna do przechowywania tresci oswiadczenia
	 */	
	this.oswiadczenieTresc = null;
	
	/**
	 * settings xml do podpisu
	 */	
	this.taskListSettingsXml = null;
	
	/**
	 * Pobranie oświadczenia do podpisu
	 */
	this.pobierzOswiadczenie = function(urlOswiadczenie) {
 			var args = {
 					url: urlOswiadczenie,
 					content: {
 						"xmlData": ""
 					},
 					handleAs: "json",
 					sync: false,
 					load: function(resp){
 						riuRejPodpis.oswiadczenieTresc = resp['tresc'];
 					},
 					error : function(error, resp) {
						error(error);
 					}
 				};
 			dojo.xhrPost(args);
	}	
	

	/**
	 * timer za pomoca ktorego ladowane sa applety
	 */
	this.timer = null;
	
	/**
	 * dodaje applet na strone lub rejestruje przy logowaniu
	 */
	this.dodajApplet = function(logowanieCertUrl, redirect) {
		// podpiecie akcji logowania pod przycisk gdy uda sie zarejestrowac
		var zalogujButton = dijit.byId("riuRejSukcesButtonId");
    	zalogujButton.set('text', "Zaloguj do portalu");
    	zalogujButton.onClick = function() {
    		riuPodpis.xmlResult = riuRejPodpis.podpisanyDokument;
    		riu.wykonanieAkcji(logowanieCertUrl);
    		menuSelect(redirect);
    	}
    	// jesli podczas logowania nie znaleziono profilu to przejscie na regulamin
		if(riu.komunikatBledu == riu._BRAK_PROFILU_UMOZLIWIENIE_REJESTRACJI) {
			riu.komunikatBledu = null;
	    	var w = dijit.byId("wizardId");
	    	var regulaminPane = dijit.byId("regulaminRejestracjaPaneId");
	    	w.selectChild(regulaminPane);
	    	riuRejPodpis.wypelnienieFormularza(riu._brakProfiluRejDane.daneCertyfikatu);	    		    	
		} else {
			$.szafirsdk_init(function(){
				setSzafirAppletResultHandler(riuRejPodpis.szafirLoadedHanlder);
				setSzafirAppletErrorHandler(riuRejPodpis.defaultError);

				$.szafirsdk_config({
					debug: false,
					onError: riuRejPodpis.defaultError,
					onLoaded: riuRejPodpis.szafirLoadedHanlder,
					onStarted: riuRejPodpis.szafirStartedHanlder,
					onDoTaskListResult: riuRejPodpis.szafirDoTaskListHandler,
					onUnloaded: function(){},
					onIsCardInReaderResult: function(){}
				});

				riuRejPodpis.loadCallback = function(){
					var progrssBar = dijit.byId("riuRejCertProgressBar");
					progrssBar.set("style", "display: none;");
					dijit.byId("rejPodpisOswiadczenieButtonId").set('disabled', false);
				}

				document.getElementById('szafirsdk-loadSzafir-action').click();
			})
		}
	}
	
	this.wytnijInformacjePodawaniaNip = function() {
    	var infoField = dijit.byId("daneIdentyfikacyjneInfoFieldId");
    	if(infoField != null) {
    		infoField.setContentValue(infoField.content.substring(0, 155));	            		
    	}
	}
		
	/**
	 * przechowuje xml konfiguracji appletu
	 */
	this.xmlSettings = null;
	
};

var riuRejPodpis = new RiuRejPodpis();