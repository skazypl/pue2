function Riu() {

	/**
	 * zwraca obiekt Date na podstawie stringa z peselem
	 */
	this.dataUrodzeniaZPeselu = function(pesel) {
		if (pesel != null && pesel.length == 11) {
			var dataStr = '19' + pesel.charAt(0) + pesel.charAt(1) + '-'
					+ pesel.charAt(2) + pesel.charAt(3) + '-' + pesel.charAt(4)
					+ pesel.charAt(5);
			var data = parseDate(dataStr, zusNpiDateFormat);
			return data;
		}
		return null;
	}

	/**
	 * dodaje zawartosc do infofielda pierwszy parametr - id infofielda kolejne
	 * parametry - stringi ktore maja byc razem dodane do zawartosci infofielda
	 */
	this.dodajZawartoscDoInfoFielda = function(infoFieldId) {
		var infoField = dijit.byId(infoFieldId);
		if (infoField != null) {
			var content = "";
			for ( var i = 1; i < arguments.length; i++) {
				content += arguments[i];
			}
			infoField.setContentValue(content);
		}
	}

	/**
	 * pobiera odnosnik do strony z lista jednostek terenowych zus jako parametr
	 * przyjmuje klucz eksternalizowanej tresci wiadomosci
	 */
	this.pobierzKomunikatTJO = function(kodSlownika) {
		var result = null;
		var args = {
			url : "riu/pobierzListeTerenowychJednostek.npi",
			content : {
				"kodSlownika" : kodSlownika
			},
			handleAs : "json",
			sync : true,
			load : function(resp) {
				console.log('resp');
				console.log(resp);
				if (resp != null && resp['komunikat'] != null) {
					riu.komunikatTJOTresc = resp['komunikat'];
					result = resp['komunikat'];
					console.log("result w srodku: " + result);
				}
			}
		};
		dojo.xhrPost(args);
		return result;
	}

	/**
	 * przejscie na strone glowna portalu
	 */
	this.przejdzNaStroneGlowna = function() {
		var args = {
			url : "riu/strona-glowna-adres.npi",
			handleAs : "json",
			sync : true,
			load : function(resp) {
				if (resp != null && resp['adres'] != null) {
					console.log(resp);
					document.location.href = resp['adres'];
				}
			}
		};
		dojo.xhrPost(args);
	};

	/**
	 * steruje textboxami w zaleznosci od wybranego radiobuttona
	 */
	this.przypomnienieHaslaWyborSposobu = function() {
		var smsRadio = dijit.byId("przypomnienieSmsRadioButtonId");
		var emailRadio = dijit.byId("przypomnienieEmailRadioButtonId");
		var numerTelefonuTextBox = dijit.byId("numerTelefonuTextBoxId");
		var emailTextBox = dijit.byId("emailTextBoxId");

		emailTextBox.set("value", "");
		numerTelefonuTextBox.set("value", "");

		if (smsRadio.checked == true) {
			numerTelefonuTextBox.set("disabled", false);
			emailTextBox.set("disabled", true);
		} else if (emailRadio.checked == true) {
			numerTelefonuTextBox.set("disabled", true);
			emailTextBox.set("disabled", false);
		}

	}

	/**
	 * wywolanie akcji przypomnienia hasla
	 */
	this.przypomnienieHaslaWyslijDane = function(przekierowanieLink) {
		var przypomnienieHaslaForm = dijit.byId("przypomnienieHaslaFormId");
		if (przypomnienieHaslaForm.validate()) {
			var urlAction = "riu/przypomnij-haslo-email.npi";
			var smsRadio = dijit.byId("przypomnienieSmsRadioButtonId");
			if (smsRadio.get('checked') === true) {
				urlAction = "riu/przypomnij-haslo-sms.npi";
			}

			var args = {
				url : urlAction,
				form : przypomnienieHaslaForm.domNode,
				handleAs : "json",
				sync : false,
				load : function(resp) {
					riu.pokazZmianaHaslaKodDialog(resp);
				},
				error : function(err, ioArgs) {
					console.error(err);
				}
			};
			dojo.xhrPost(args);
		}
	}


	this.ofeNiezalogowanyCaptchaFunction = function() {
		var ofeNiezalogowanyCaptcha = dijit.byId("ofeNiezalogowanyCaptchaId");
		var kodZObrazka = dijit.byId("kodZObrazka").value;
		var ukryjCaptche = dojo.byId("ofeNiezalogowanyCaptchaId");
		var ukryjWyslij = dojo.byId("wyslijButtonId");
		if(ofeNiezalogowanyCaptcha.validate()) {
		    	var args = {
					url : "ofe/riuSprawdzCaptche.npi",
					content : {
						"kodZObrazka" : kodZObrazka
					},
					handleAs : "json",
					sync 	 : true,
					load : function(resp){
						if(resp["wynik"]){
							
							ukryjCaptche.style.display = 'none';
							ukryjWyslij.style.display = 'none';
							dojo.byId('FormularzOFE').click();
					} else {
						alert("Niepoprawny kod. Odśwież obrazek z kodem i spróbuj ponownie.");
					}
				},
				error : function(resp) {
					console.log("Error : ", resp);
				}
			};
			try {
				console.log("KodZObrazka: ", KodZObrazka);
			} catch (e) {
			}
			dojo.xhrGet(args);
		}
		// dojo.byId('ofeDlaNiezalogowanychCaptchaId').style="display:none";

	}

	/**
	 * wyswietlenie dialogu po zmianie hasla (przy przypomnieniu i zmianie z
	 * linka z maila)
	 */
	this.pokazZmianaHaslaKodDialog = function(resp) {
		var captchaPoprawna = resp["captcha"];
		// uniemożliwienie wielokrotnego klikania w Wyślij
		var wyslijButton = dijit.byId("zmianaHaslaWyslijButtonId");
		if (wyslijButton != null) {
			wyslijButton.set('disabled', true);
		}
		if (captchaPoprawna == null || captchaPoprawna == true) {
			// captchy nie bylo lub kod captchy byl wprowadzony poprawnie
			var komunikatLabel = dojo.byId("komunikatLabelId");
			var komunikatLabelBlad = dojo.byId("komunikatLabelIdBlad");

			if (resp["blad"] == null && resp["wynik"] != null
					&& komunikatLabel != null) {
				komunikatLabel.innerHTML = resp["wynik"];

				// pokazujemy dialog do przekierowania
				zmianaHaslaKodDialog.show();
			} else if (resp["blad"] != null && komunikatLabelBlad != null) {
				komunikatLabelBlad.innerHTML = resp["blad"];
				zmianaHaslaKodDialogBlad.show();
				if (wyslijButton != null) {
					wyslijButton.set('disabled', false);
				}
			}

		} else if (captchaPoprawna == false) {
			// kod captchy wprowadzony niepoprawnie
			wyslijButton.set('label', 'Wyślij');
			wyslijButton.set('disabled', false);
			riuCaptcha.odswiezObrazek();
		}
	}

	/**
	 * ustawia walidacje na formatce zmiany hasla za pomoca linka
	 */
	this.zmianaHaslaLinkPostCreate = function() {
		var kanal = "NPI";
		var queryStringArray = decodeURIComponent(window.location.search)
				.substring(1).split('&');
		for ( var i = 0; i < queryStringArray.length; i++) {
			var splitted = queryStringArray[i].split('=');
			if (splitted.length = 2) {
				var param = splitted[0];
				var value = splitted[1];
				if (param == 'kanal') {
					var kanalTextbox = dijit.byId("kanalTextbox");
					kanalTextbox.set('value', value);
					kanal = value;
				}
				if (param == 'kod') {
					var queryStringTextbox = dijit.byId("queryStringTextbox");
					queryStringTextbox.set('value', value);
				}
			}
		}
		var noweHasloTextbox = dijit.byId("noweHasloTextbox");
		var noweHasloPowtorzoneTextbox = dijit
				.byId("noweHasloPowtorzoneTextbox");

		if (kanal == "NPI") {
			dijit.byId("opisHaslaCITInfoId").set('style',
					'display: none; width: 0px; height: 0px');
			noweHasloTextbox.set("validator", function() {
				return riuWalidacja.validHaslo(dijit.byId('noweHasloTextbox'));
			});
			noweHasloPowtorzoneTextbox.set("validator", function() {
				return riuWalidacja.czyHasloPowtorzone(dijit
						.byId('noweHasloTextbox'), dijit
						.byId('noweHasloPowtorzoneTextbox'));
			});
		} else if (kanal == "CIT") {
			dijit.byId("opisHaslaNPIInfoId").set('style',
					'display: none; width: 0px; height: 0px');
			noweHasloTextbox.set("validator", function() {
				return riuWalidacja.validHasloCIT(dijit
						.byId('noweHasloTextbox'));
			});
			noweHasloPowtorzoneTextbox.set("validator", function() {
				return riuWalidacja.czyHasloPowtorzone(dijit
						.byId('noweHasloTextbox'), dijit
						.byId('noweHasloPowtorzoneTextbox'));
			});
		} else if (kanal == null) {
			riu.przejdzNaStroneGlowna();
		}

		// Przechwycenie ENTER'a
		dojo.connect(dijit.byId('noweHasloTextbox'), "onKeyPress", function(
				event) {
			if (event.charOrCode == "13") {
				if (riuWalidacja
						.bezpieczneHaslo(dijit.byId('noweHasloTextbox'))) {
					if (riuWalidacja.bezpieczneHaslo(dijit
							.byId('noweHasloPowtorzoneTextbox'))) {
						dijit.byId('riuZmianaHaslaLinkWyslijButton').focus();
					} else {
						dijit.byId('noweHasloPowtorzoneTextbox').focus();
					}
				}
			}
		});

		// Przechwycenie ENTER'a
		dojo.connect(dijit.byId('noweHasloPowtorzoneTextbox'), "onKeyPress",
				function(event) {
					if (event.charOrCode == "13") {
						if (riuWalidacja.bezpieczneHaslo(dijit
								.byId('noweHasloPowtorzoneTextbox'))) {
							if (riuWalidacja.bezpieczneHaslo(dijit
									.byId('noweHasloTextbox'))) {
								// riu.zmianaHaslaLink();
								dijit.byId('riuZmianaHaslaLinkWyslijButton')
										.focus();
							} else {
								dijit.byId('noweHasloTextbox').focus();
							}
						}
					}
				});
	}

	/**
	 * wywolanie akcji zmiany hasla za pomoca otrzymanego linku
	 */
	this.zmianaHaslaLink = function() {
		var form = dijit.byId("zmianaHaslaLinkFormId");
		form.validate();
		if (form.isValid()) {
			var args = {
				url : "zmien-haslo-link.npi",
				content : {
					"kod" : dojo.byId("queryStringTextbox").value,
					"kanal" : dojo.byId("kanalTextbox").value,
					"noweHaslo" : dojo.byId("noweHasloTextbox").value,
					"noweHasloPowtorzone" : dojo
							.byId("noweHasloPowtorzoneTextbox").value
				},
				handleAs : "json",
				sync : true,
				load : function(resp) {
					riu.pokazZmianaHaslaKodDialog(resp);
				},
				error : function(err, ioArgs) {
					console.error(err);
				}
			};
			dojo.xhrPost(args);
		}
	};

	/**
	 * Logowanie do PUE przy pomocy loginu i hasła.
	 */
	this.logowanie = function() {
		var form = dijit.byId("formularzForm");
		var response = null;
		var args = {
			form : dojo.byId("formularzForm"),
			handleAs : "json",
			sync : true,
			url : "riu/riuZalogujLoginHaslo.npi",
			load : function(resp) {
				response = resp;
				if (resp != null && resp["blad"] != null) {
					riu.komunikatBledu = resp["blad"];
				}
			}
		};
		formularzForm.validate();
		if (formularzForm.isValid()) {
			dojo.xhrPost(args);
			return response;
		}
		return null;
	};

	this.komunikatBledu = "";

    /**
     * Sprawdzenie i pobranie komunikatu FLEX.
     */
    this.sprawdzCzyDostepnaTechnologiaFlex = function() {
        var args = {
            handleAs : "json",
            sync : true,
            url : "riu/pobierzKomunikatCzyWyswietlacFlex.npi",
            load : function(resp) {
                if (resp != null && resp["czyWyswietlacKomunikatFlex"] != null) {
                    if(resp["czyWyswietlacKomunikatFlex"] == "true"){
                        flexInfoId.setContentValue(resp["komunikatFlex"]);
                        if (!isFlashEnabled() || isUsingPepperFlash()) {
                            flexInfoId.domNode.style.display = "inline-block";
                            flexInfoId.domNode.style.width = "97%"
                        }
                        else{
                            flexInfoId.domNode.style.display = "none";
                        }
                    }
                }
                else{
                    flexInfoId.domNode.style.display = "none";
                }
            }
        };
        dojo.xhrPost(args);
    };

	this.wyslijFormularzKodAktywOdpowiedzi = function() {
		var odpowiedzi = new Array();
		odpowiedzi.push(dijit.byId("pytanie1").get('value'));
		odpowiedzi.push(dijit.byId("pytanie2").get('value'));
		odpowiedzi.push(dijit.byId("pytanie3").get('value'));

		for ( var i = 0; i < riu.pytania.length; i++) {
			var typOdp = riu.pytania[i]['typOdpowiedzi'];
			if (typOdp == 'KOD_POCZTOWY') {
				var kodPoczt = odpowiedzi[i].substring(0, 2)
						+ odpowiedzi[i].substring(3);
				odpowiedzi[i] = kodPoczt;
			} else if (typOdp == 'OFE') {
				var wybraneOFE = dijit.byId("listaOFESelectId").get('value');
				odpowiedzi[i] = wybraneOFE;
			} else if (typOdp == 'DATA') {
				var data = dijit.byId("pytanie" + (i + 1) + 'Data').toString();
				odpowiedzi[i] = data;
			}
		}

		var args = {
			url : "riu/riuWyslijFormularzKodAktywOdp.npi",
			form : dojo.byId("formularzForm"),
			content : {
				"kodAktywacyjny" : dojo.byId("kodAktywacyjny").value,
				"pytanie1" : odpowiedzi[0],
				"pytanie2" : odpowiedzi[1],
				"pytanie3" : odpowiedzi[2],
				"nrPytanie1" : nrPytanie1,
				"nrPytanie2" : nrPytanie2,
				"nrPytanie3" : nrPytanie3,
				"kodZObrazka" : dijit.byId("kodZObrazka").get('value')
			},
			handleAs : "json",
			sync : true,
			load : function(resp) {
				console.log('riuWyslijFormularzKodAktywOdp resp');
				console.log(resp);
				riu.resp = resp;
				var loginPUE = resp['login'];
				var akcja = resp['akcja'];
				var liczbaBledow = resp['bledy'];
				var komunikatBledu = resp['blad'];
				if (resp['captcha'] == false) {
					riuCaptcha.odswiezObrazek();
				} else if (liczbaBledow == 0 && loginPUE != null) {
					dijit.byId('wizardId').forward();
					dijit.byId('loginPUE').set('value', loginPUE);
					riu.wyswietlenieOstrzezenia(resp['ostrzezenie'],
							'ostrzezenieFieldsetId', 'ostrzezenieInfoFieldId');
				} else if ((liczbaBledow > 0 || loginPUE == null || loginPUE == '')
						&& komunikatBledu != null || komunikatBledu != '') {
					dijit.byId("rejPodpisBladMessageId").setContentValue(
							komunikatBledu);
					dijit.byId("wizardId").selectChild(
							dijit.byId("rejBladRejestracjiPaneId"));
				} else {
					dijit.byId("wizardId").selectChild(
							dijit.byId("rejBladInfoPaneId"));
				}
			}
		};
		pytaniaOdpowiedzi.validate();
		if (pytaniaOdpowiedzi.isValid()) {
			formularzForm.validate();
			if (formularzForm.isValid()) {
				dojo.xhrPost(args);
			}
		}
	};

	this.pytania = null;

	this.wyslijFormularzKodAktyw = function() {
		var args = {
			url : "riu/riuWyslijFormularzKodAktyw.npi",
			content : {
				"kodZObrazka" : dojo.byId("kodZObrazka").value,
				"kodAktywacyjny" : dojo.byId("kodAktywacyjny").value,
				"nazwisko" : dojo.byId("riuNazwisko").value,
				"imiePierwsze" : dojo.byId("riuImiePierwsze").value,
				"dataUrodzenia" : dojo.byId("dataUrodzenia").value,
				"pesel" : dojo.byId("pesel").value,
				"nip" : dojo.byId("nip").value,
				"kodTypDokTozsamosci" : dojo.byId("typDokTozsamosci").value,
				"nrDokTozsamosci" : dojo.byId("nrDokumentuToz").value
			},
			handleAs : "json",
			sync : true,
			load : function(resp) {
				console.log('wyslijFormularzKodAktyw resp');
				console.log(resp);
				liczbaBledow = resp['bledy'];
				komunikatBledu = resp['blad'];
				pytanie1 = resp['pytanie1'];
				pytanie2 = resp['pytanie2'];
				pytanie3 = resp['pytanie3'];
				nrPytanie1 = resp['nrPytanie1'];
				nrPytanie2 = resp['nrPytanie2'];
				nrPytanie3 = resp['nrPytanie3'];
				akcja = resp['akcja'];

				// czy byl blad
				if (komunikatBledu == null || komunikatBledu == '') {
					riu.pytania = resp['pytania'];

					// id textboxow
					var pytIdValue = 'pytanie';
					// przechodzimy po wszystkich pytaniach
					for ( var i = 0; i < riu.pytania.length; i++) {
						var textbox = dijit.byId(pytIdValue + (i + 1));
						var textboxData = dijit.byId(pytIdValue + (i + 1)
								+ 'Data');
						var ofeSelect = dijit.byId("listaOFESelectId");
						var typOdpowiedzi = riu.pytania[i]['typOdpowiedzi'];

						if (typOdpowiedzi == 'DATA') {
							// jesli typ odpowiedzi data to pokaz data textboxa
							// i ukryj pozostale
							console.log('typ odpowiedzi - DATA');
							textbox.set('required', false);
							textbox.set('style', 'display: none');
							textboxData.set('style', 'display: inline-block');
							textboxData.set('required', true);
						} else if (typOdpowiedzi == 'OFE') {
							// jesli typ odpowiedzi ofe to pokaz selecta i ukryj
							// textboxa
							console.log('typ odpowiedzi - OFE');
							textbox.set('required', false);
							textbox.set('style', 'display: none');
							textboxData.set('required', false);
							textboxData.set('style', 'display: none');
							var ofeOdpContainer = 'ofeOdpContainer' + (i + 1);
							ofeSelect.set('required', true);
							ofeSelect.set('style',
									'width: 400px; display: inline-block');
							ofeSelect.placeAt(ofeOdpContainer);
						} else {
							// i steruj textboxem w zaleznosci od typu
							// odpowiedzi
							textbox.set('required', true);
							textbox.set('style', 'display: inline-block');
							switch (typOdpowiedzi) {
							case 'NUMER':
								console.log('typ odpowiedzi - NUMER');
								textbox.set('maxLength', 255);
								textbox.set("regExp", riuRejKodem.numerRegex);
								break;
							case 'NAPIS':
								console.log('typ odpowiedzi - NAPIS');
								textbox.set('maxLength', 255);
								textbox.set("regExp", riuRejKodem.napisRegex);
								break;
							case 'KOD_POCZTOWY':
								console.log('typ odpowiedzi - KOD_POCZTOWY');
								textbox.set('maxLength', 6);
								textbox.set("regExp",
										riuRejKodem.kodPocztowyRegex);
								break;
							case 'REGON':
								console.log('typ odpowiedzi - REGON');
								textbox.set('maxLength', 14);
								textbox.set("regExp", riuRejKodem.regonRegex);
								break;
							case 'NIP':
								console.log('typ odpowiedzi - NIP');
								textbox.set('maxLength', 11);
								textbox.set("regExp", riuRejKodem.nipRegex);
								break;
							case 'RACHUNEK_BANKOWY':
								console
										.log('typ odpowiedzi - RACHUNEK_BANKOWY');
								textbox.set('maxLength', 26);
								textbox.set("regExp",
										riuRejKodem.rachBankowyRegex);
								break;
							default:
								console.log('typ odpowiedzi - nieznany');
								// cos sie zdupczylo
								textbox.set('disabled', true);
								textbox.set('value', '');
								textbox.set('required', true);
								break;
							}
						}
					}
					dijit.byId("riuPytanie1").setContentValue(pytanie1);
					dijit.byId("riuPytanie2").setContentValue(pytanie2);
					dijit.byId("riuPytanie3").setContentValue(pytanie3);
					dijit.byId('wizardId').forward();
				} else {
					dijit.byId("rejPodpisBladMessageId").setContentValue(
							komunikatBledu);
					dijit.byId("wizardId").selectChild(
							dijit.byId("rejBladRejestracjiPaneId"));
				}
			}
		};
		kodAktywacyjnyForm.validate();
		if (kodAktywacyjnyForm.isValid()) {
			dojo.xhrPost(args);
		}
	};

	this.wylogowanie = function(trybKP){
		dojo.xhrPost({
			url: "riu/riuKontekstySprawdzCzyIstniejeRola.npi",
			handleAs: "json",
			content: {
				roleToCheck: "LEKARZ"
			},
			load: function(resp){
				if(resp === true){
					riu.sprawdzDokumentyFZLA(riu.sprawdzNiewyslaneDokumenty, riu.wyloguj, trybKP, true);
				}else{
					riu.wyloguj(trybKP);
				}
			}
		})
	};

	this.dokumentyNieWyslaneCookie = "DOKUMENTY-NIEWYSLANE-KOMUNIKAT";
	this.zalogowany = function(){
		var dokumentyNieywslane = dojo.cookie(this.dokumentyNieWyslaneCookie);
		if(dokumentyNieywslane == null || (dokumentyNieywslane && dokumentyNieywslane === "")){
			dojo.cookie(riu.dokumentyNieWyslaneCookie, true);
			dojo.xhrPost({
				url: "riu/riuKontekstySprawdzCzyIstniejeRola.npi",
				handleAs: "json",
				content: {
					roleToCheck: "LEKARZ"
				},
				load: function(resp){
					if(resp === true){
						riu.sprawdzNiewyslaneDokumenty();
					}
				}
			})
		}
	};

	this.sprawdzNiewyslaneDokumenty = function(callback, callbackParams, wylogowanie){
		var akcja = "obszar-lekarza/lekarzSprawdzNiewyslaneDokumenty.npi";
		dojo.xhrPost({
			url: akcja,
			handleAs: "json",
			load: function(resp){
				if(resp.niewyslane){
					showD(resp, callback, callbackParams, wylogowanie);
				}else{
					if(callback != null && callback != undefined){
						callback(callbackParams);
					}
				}
			}
		});

		function showD(resp, callback, callbackArg, wylogowanie){
			var displayYesBtn = true,
				displayNoBtn = true,
				displayCancelBtn = true,
				yesText = (resp.zla || resp.azla) ? "Przejdź do dokumentów ZLA/AZLA" : (displayYesBtn = false),
				noText = (resp.pr4) ? "Przejdź do dokumentów PR-4" : (displayNoBtn = false),
				cancelText = (wylogowanie == true) ? "Wyloguj się" : "Anuluj";

			showDialog(zusnpi.dialog.YesNoCancelDialog(), {
				title: resp.title,
				content: resp.content,
				yesText: yesText,
				noText: noText,
				cancelText: cancelText,
				displayYesBtn: displayYesBtn,
				displayNoBtn: displayNoBtn,
				displayCancelBtn: displayCancelBtn,
				dialogWidth: '650px',
				dialogHeight: '150px',
				onYesClick: function () {
					changeRole('LEKARZ','obszar-lekarza.npi#KLE0005')
				},
				onNoClick: function () {
					changeRole('LEKARZ','obszar-lekarza.npi#OBW0031')
				},
				onCancelClick: function(){
					if(callback != null && callback != undefined){
						callback(callbackArg);
					}
				}
			});
		}

	}

	this.sprawdzDokumentyFZLA = function(callback, secondCallback, trybKP, wylogowanie){
		var akcja = "obszar-lekarza/lekarzMiejsceWykonywaniaZawoduGetCurrent.npi";
		dojo.xhrPost({
			url: akcja,
			handleAs: "json",
			load: function(resp){
				if(resp.status && resp.status === "NEW"){
					//wyswietl okno o przypomnieniu o wyslanie FZLA
					var params = [secondCallback, trybKP, wylogowanie];
					new zusnpi.dialog.AddNewWorkingPlaceInfo({
						onOkCallback: callback,
						onOkCallbackParams: {callback: secondCallback, trybPK: trybKP, wylogowanie: wylogowanie}
					}).show();
				}else{
					callback(secondCallback, trybKP, wylogowanie);
				}
			}
		})
	}

    this.wyloguj = function(trybKP){
		akcja = "riu/riuWylogujPUE.npi";
		if (trybKP) {
			akcja = "riu/riuWyloguj.npi";
		}

		dojo.xhrPost({
			url : akcja,
			handleAs : "json",
			load : function(resp) {
				dojo.cookie(riu.dokumentyNieWyslaneCookie, null, {expires: -1});
				if (!trybKP) {
					if (resp !== null && typeof resp['epuap_logout_url'] !== 'undefined') {
						document.location.href = resp['epuap_logout_url'];
					} else {
						document.location.href = "logowanie.npi";
					}
				}
				else {
					document.location.href = "wylogowanie.npi";
				}
			},
			error : function(error, resp) {
				error(error);
			}
		});
    };

	this.wyslijFormularz = function() {
		formularzForm.validate();
		if (formularzForm.isValid()) {
			riuRejNiezaufanegoWyslijFormularzButton.set('disabled', true);
			var akcja;
			var liczbaBledow;
			var komunikatBledu;
			var loginPUE;

			var args = {
				url : "riu/riuWyslijFormularz.npi",
				form : dojo.byId("formularzForm"),
				handleAs : "json",
				sync : true,
				load : function(resp) {
					riuRejNiezaufanegoWyslijFormularzButton.set('disabled',
							false);
					loginPUE = resp['login'];
					akcja = resp['akcja'];
					liczbaBledow = resp['bledy'];
					komunikatBledu = resp['blad'];
					if (akcja == false && liczbaBledow == null) {
						riuCaptcha.odswiezObrazek();
					} else if (liczbaBledow == 0 && loginPUE != null) {
						dijit.byId('wizardId').forward();
						dijit.byId('loginPUE').set('value', loginPUE);
					} else if (liczbaBledow > 0 && komunikatBledu != null) {
						dijit.byId('infoFieldError').setContentValue(
								komunikatBledu);
						dijit.byId('wizardId').forward();
						dijit.byId('wizardId').forward();
					}
				}
			};
			dojo.xhrPost(args);
		}
	};

	this.akceptuj_regulamin = function(komunikat) {
		if (dijit.byId('regCheck').checked
				&& dijit.byId('regCheckPrzetwarzanie').checked) {
			dojo.xhrPost({
				url : "riu/riuRegulaminOtrzymywanieWiadomosciEmail.npi",
				content : {
					"checkboxOtrzymywanieWiadomosciEmail" : dijit
							.byId('regCheckOtrzymywanie').checked
				},
				handleAs : "json",
				sync : true,
				load : function(resp) {
					dijit.byId('wizardId').forward();
				},
				error : function(error, resp) {
					error(error);
				}
			});
		} else {
			alert(komunikat);
		}
	}

	this.akceptuj_nowy_regulamin = function(komunikat, akcja) {
		if (dijit.byId('regCheck').checked
				&& dijit.byId('regCheckPrzetwarzanie').checked) {
			dojo.xhrPost({
				url : "riu/riuRegulaminOtrzymywanieWiadomosciEmail.npi",
				content : {
					"checkboxOtrzymywanieWiadomosciEmail" : dijit
							.byId('regCheckOtrzymywanie').checked
				},
				handleAs : "json",
				sync : true,
				load : function(resp) {
					menuSelect(akcja);
				},
				error : function(error, resp) {
					error(error);
				}
			});
		} else {
			alert(komunikat);
		}
	}

	this.wprowadzono_login = function() {
		if (dijit.byId('riuLogin').value != "") {
			dijit.byId('wizardId').forward();
		} else {
			alert("By przejść dalej musisz podać swój login!");
		}
	}

	this.pobierzRegulamin = function() {
		dojo
				.xhrPost({
					url : "riu/riuRegulaminPobierzNajnowszy.npi",
					handleAs : "json",
					load : function(resp) {
						dijit.byId('trescRegulaminu').set('value',
								resp['tresc']);

						dojo.byId('regCheckPrzetwarzanieLabel').innerHTML = resp['trescCheckbox1']
								+ '.';
						dojo.byId('regCheckOtrzymywanieLabel').innerHTML = resp['trescCheckbox2']
								+ '.';
						dijit.byId('regCheckOtrzymywanie').set('checked',
								resp['czyOtrzymywac']);

						dijit.byId('regCheck').setDisabled(false);
						dijit.byId('regCheckPrzetwarzanie').setDisabled(false);
						dijit.byId('regCheckOtrzymywanie').setDisabled(false);
					},
					error : function(error, resp) {
						error(error);
					}
				});
	}

	/**
	 * zmienne do trzymania danych do rejestracji gdy profil nie istnieje przy
	 * logowaniu certyfikatem lub epuapem
	 */
	this._BRAK_PROFILU_UMOZLIWIENIE_REJESTRACJI = "brakProfiluPodpis";
	this._brakProfiluRejDane = null;

	/**
	 * logowanie przy pomocy podpisu elektronicznego
	 */
	this.akcjaPodpis = function (oswiadczenieUrl, idPolaXml, idFormularza) {
		
		// na czas wybierania certyfikatu blokujemy przycisk
		riuPodpis.blokujPrzycisk("Proszę czekać ...");
		
		riuPodpis.podpiszDokument(oswiadczenieUrl, null, null, function (wynikPodpisu) {
			riuPodpis.zwolnijPrzycisk();
			
			// jeśli nie wystąpił żaden błąd, wyślij formularz
			if (wynikPodpisu) {
				document.getElementById(idPolaXml).value = riuPodpis.xmlResult;
				document.getElementById(idFormularza).submit();
			}
			else {
				alert(riu.komunikatBledu);
			}
		});
	};

	this.odblokujKanal = function(odblokujUrl, oswiadczenieUrl, bladUrl) {
		dijit.byId("riuProgressBarPodpis").set("style", "display: block;");
		dijit.byId("riuPrzyciskPodpis").set("disabled", "true");

		riuPodpis.podpiszDokument(oswiadczenieUrl, null, null,function(wynikPodpisaniaLubOdblokowania){
			if (wynikPodpisaniaLubOdblokowania) {
				wynikPodpisaniaLubOdblokowania = riu
					.wykonanieAkcji(odblokujUrl);
			}
			if (wynikPodpisaniaLubOdblokowania) {
				var w = dijit.byId("wizardId")
				if (w) {
					w.selectChild(dijit.byId("odblokowanieSukcesPaneId"));
				}
			} else {
				menuSelect(bladUrl);
			}
		});
	}

	/**
	 * wykonanie logowania lub odblokowania za pomoca podpisu elektronicznego
	 */
	this.wykonanieAkcji = function(url) {
		var brakBledu = true;
		$.ajax(url, {
			data: {
				"token": riuPodpis.xmlResult
			},
			async: false,
			type: 'POST',
			success: function (resp) {
				if (resp['blad'] != null && resp['blad'] != "") {
					riu.komunikatBledu = resp['blad'];
					brakBledu = false;
					// gdy podczas logowania nie zostanie znaleziony profil to
					// ustawiamy dane potrzebne do rejestracji
					if (riu.komunikatBledu == riu._BRAK_PROFILU_UMOZLIWIENIE_REJESTRACJI) {
						riu._brakProfiluRejDane = resp;
						riuRejPodpis.podpisanyDokument = resp['podpisanyDokument'];
					}
				}
			}
		});
		riuPodpis.xmlData = null;
		return brakBledu;
	};

	this.pobierzKomunikatSukcesRejNiezaufanego = function() {
		var args = {
			url : "riu/pobierzLiczbeDniWaznosciKontaNiezaufanego.npi",
			handleAs : "json",
			sync : true,
			load : function(resp) {
				dijit.byId('sukcesRejNiezaufany').setContentValue(
						resp['komunikat']);
			}
		};
		dojo.xhrPost(args);
	};

	/**
	 * Zmiana hasła do kanału.
	 */
	this.zmienHaslo = function() {
		var args = {
			content : {
				"login" : document.getElementById("riuLogin").value,
				"haslo" : document.getElementById("riuHaslo").value
			},
			handleAs : "json",
			sync : true,
			url : "riu/riuHaslaZmien.npi",
			load : function(resp) {
				zmienione = resp['zmienione'];
				riu.komunikatBledu = resp['blad'];
			}
		};
		formularzForm.validate();
		if (formularzForm.isValid()) {
			dojo.xhrPost(args);
			return zmienione;
		}
		return false;
	};

	/**
	 * Logowanie do PUE przy użyciu profilu zaufanego ePUAP.
	 */
	this.logowanieEPUAP = function(bladUrl, redirectUrl, rejEpuapUrl) {
		var args = {
			url : "riu/riuEPUAPLogSSO.npi",
			handleAs : "json",
			sync : true,
			load : function(resp) {
				riu.komunikatBledu = resp["blad"];
				if (riu.komunikatBledu == riu._BRAK_PROFILU_UMOZLIWIENIE_REJESTRACJI) {
					riu._brakProfiluRejDane = resp;
					menuSelect(rejEpuapUrl);
				} else if (riu.komunikatBledu != null
						&& riu.komunikatBledu != "") {
					menuSelect(bladUrl);
				} else {
					menuSelect(redirectUrl);
				}
			}
		};
		dojo.xhrPost(args);
	};

	this.riuLogZmianaHaslaLoadData = function(actionUrl) {
		var args = {
			url : actionUrl,
			handleAs : "json",
			sync : true,
			load : function(resp) {
				dijit.byId('riuLoginH').set('value', resp['login'], false);
				dijit.byId('riuImieH').set('value', resp['imie'], false);
				dijit.byId('riuNazwiskoH')
						.set('value', resp['nazwisko'], false);
				dijit.byId('riuDataUrodzeniaH').set('value',
						resp['data_urodzenia'], false);
				dijit.byId('riuPeselH').set('value', resp['pesel'], false);
				dijit.byId('riuNipH').set('value', resp['nip'], false);
				dijit.byId('riuNrDokH').set('value', resp['nr_dok_tozsamosci'],
						false);
			}
		};

		dojo.xhrPost(args);
	}

	/**
	 * podmienia pierwsza czesc komunikatu przy odblokowaniu kanalu jesli
	 * ustawiono blokade czasowa
	 */
	this.odblokowanieKomunikat = function(url) {
		if (url != null) {
			var args = {
				url : url,
				content : {
					"komunikatBledu" : riu.komunikatBledu
				},
				handleAs : "json",
				sync : true,
				load : function(resp) {
					var komunikat = resp != null ? resp['komunikat'] : null;
					if (komunikat != null) {
						var infoPane = dijit.byId("odblokowanieInfoPaneId")
								|| dijit.byId("infoFieldError");
						if (infoPane != null) {
							infoPane.setContentValue(komunikat);
						}
					}
				}
			};
			dojo.xhrPost(args);
		}
	}

	this.wyswietlenieOstrzezenia = function(komunikatyBledow,
			ostrzezenieFieldsetId, ostrzezenieInfoFieldId) {
		var ostrzezenieFieldset = dijit.byId(ostrzezenieFieldsetId);
		var ostrzezenieInfoField = dijit.byId(ostrzezenieInfoFieldId);
		if (komunikatyBledow != null && komunikatyBledow != ""
				&& ostrzezenieFieldset != null && ostrzezenieInfoField != null) {
			var komunikat = ostrzezenieInfoField.get('content');
			komunikat = komunikat.replace("#bledy#", komunikatyBledow);
			ostrzezenieInfoField.setContentValue(komunikat);
			ostrzezenieFieldset.set('style', 'display: block');
		}
	}

	this.logowanieBankSSO = function() {
        var response = null;
        var args = {
            handleAs: "json",
            sync: true,
            url: "riu/riuZalogujBankSSOToken.npi",
            load: function (resp) {
                response = resp;
                if (resp != null && resp["blad"] != null) {
                    riu.komunikatBledu = resp["blad"];
                }
            }
        };
        dojo.xhrPost(args);
        return response;
    };

}

var riu = new Riu();
