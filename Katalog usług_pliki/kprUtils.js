
// Funkcje modyfikujące bieżące handlery wyniku i błędów
function setSzafirAppletResultHandler(fn) {

	kprUtils.fnSzafirAppletResultHandler = fn;
}
function setSzafirAppletErrorHandler(fn) {
	kprUtils.fnSzafirAppletErrorHandler = fn;
}

function setAsyncSzafirAppletResult(result) {
	if (kprUtils.fnSzafirAppletResultHandler instanceof Function) {
		kprUtils.fnSzafirAppletResultHandler(result);
	} else {
		kprUtils.hideSendActionSplash();
		alert("ERROR: fnSzafirAppletResultHandler not set");
	}
}
function setAsyncSzafirAppletError(error) {
	if (kprUtils.fnSzafirAppletErrorHandler instanceof Function) {
		kprUtils.fnSzafirAppletErrorHandler(error);
	} else {
		kprUtils.hideSendActionSplash();
		alert("ERROR: fnSzafirAppletErrorHandler not set");
	}
}


function KprUtils() {
	this.loadCallback = function () {
		riuPodpis.pobierzXML(kprUtils.oswiadczenieTresc, '', '');
		if (riuPodpis.podpisSettings != null && riuPodpis.podpisSettings != '') {

			setSzafirAppletResultHandler(kprUtils.szafirStartedHanlder);
			document.getElementById("szafirsdk-settings-uri").value = kprUtils.appletSettingsUrl;
			document.getElementById("szafirsdk-startComponentUri-action").click()
		} else {
			var progressBar = dijit.byId("kprPowCertProgressBarId");
			progressBar.set('style', 'visibility:hidden');
			var kprPodpiszOswiadczenieeButton = dijit.byId("kprPodpiszOswiadczenieeButtonId");
			kprPodpiszOswiadczenieeButton.set('disabled', false);
			alert('Nie udało się pobrać konfiguracji dla appletu.')
		}
	}
	
	this.startCallback = function () {
		var progressBar = dijit.byId("kprPowCertProgressBarId");
		progressBar.set('style', 'visibility:hidden');
		var kprPodpiszOswiadczenieeButton = dijit.byId("kprPodpiszOswiadczenieeButtonId");
		kprPodpiszOswiadczenieeButton.set('disabled', false);
		setSzafirAppletResultHandler(kprUtils.szafirDoTaskListHandler);
		setSzafirAppletErrorHandler(kprUtils.szafirDoTaskListHandler);
		document.getElementById("szafirsdk-taskList-xml").value = riuPodpis.podpisTaskList;
		document.getElementById("szafirsdk-doTaskListNoWindow-action").click();
	}

	this.signCallback = function (podpisaneDane) {
		var args = {
			url : kprUtils.przypisanieCertSukcesAction,
			content : {
				"danePodpisu" : podpisaneDane
			},
			handleAs : "json",
			sync : true,
			load : function(resp) {
				if (resp != null && resp["blad"] != null && resp["blad"] != '') {
					var bladInfo = dijit.byId("bladInfoId");
					bladInfo.setContentValue(resp["blad"]);
					kprPrzypiszCertWizard.selectChild(kprPrzypiszCertBlad);
				} else if (kprUtils.przypisanieCertSukcesAction) {
					kprPrzypiszCertWizard.selectChild(kprPrzypiszCertSukces);
				}
			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	}

	this.fnSzafirAppletResultHandler;
	this.fnSzafirAppletErrorHandler;

	this.szafirLoadedHanlder = function(result){
		kprUtils.loadCallback();
	}

	this.szafirStartedHanlder = function(result){
		kprUtils.startCallback();
	}


	this.szafirDoTaskListHandler = function(result){
		kprUtils.signCallback(result);
	}

	this.defaultError = function(result){
		var progressBar = dijit.byId("kprPowCertProgressBarId");
		progressBar.set('style', 'visibility:hidden');
		var kprPodpiszOswiadczenieeButton = dijit.byId("kprPodpiszOswiadczenieeButtonId");
		kprPodpiszOswiadczenieeButton.set('disabled', false);
		alert("Wystąpił błąd podczas ładowania komponentu kir ("+result+")");
	}


	this.powiazanieEPUAP = function (urlPowiazanieAction) {
        var pane = dijit.byId("powiazanieEpuapSukcesMainContentPaneId");

        var splash = new zusnpi.layout.splash.Splashscreen({
            parentId: pane.containerNode.id,
            text: 'Proszę czekać',
            additionalText: 'Trwa weryfikacja danych ePUAP...',
            timeoutMillis: 1800000
        });
        splash.show();

        var args = {
            url: urlPowiazanieAction,
            handleAs: "json",
            sync: true,
            load: function (resp) {
                var sukces = false;
                var komunikatBledu = null;
                var wizard = dijit.byId("powiazanieEPUAPWizardId");
                if (resp != null) {
                    sukces = resp['wynik'];
                    komunikatBledu = resp['komunikatBledu'];
                }
                if (komunikatBledu != null && komunikatBledu != "") {
                    var powiazanieEPUAPInfoPane = dijit.byId("powiazanieEPUAPBladInfoId");
                    powiazanieEPUAPInfoPane.setContentValue(komunikatBledu);
                    var bladPane = dijit.byId("powiazanieEPUAPBladPaneId");
                    wizard.selectChild(bladPane);
                } else if (sukces == true) {
                    var sukcesPane = dijit.byId("powiazanieEPUAPSukcesPaneId");
					wizard.selectChild(sukcesPane);
				}
				splash.hide();
			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	}

	this.podpiszOswiadczenie = function(urlAction,settings) {
		var progressBar = dijit.byId("kprPowCertProgressBarId");
		progressBar.set('style', 'visibility:visible');
		var kprPodpiszOswiadczenieeButton = dijit.byId("kprPodpiszOswiadczenieeButtonId");
		kprPodpiszOswiadczenieeButton.set('disabled', true);
		$.szafirsdk_init(function(){
			setSzafirAppletResultHandler(kprUtils.szafirLoadedHanlder);
			setSzafirAppletErrorHandler(kprUtils.defaultError);

			$.szafirsdk_config({
				debug: false,
				onError: kprUtils.defaultError,
				onLoaded: kprUtils.szafirLoadedHanlder,
				onStarted: kprUtils.szafirStartedHanlder,
				onDoTaskListResult: kprUtils.szafirDoTaskListHandler,
				onUnloaded: function(){},
				onIsCardInReaderResult: function(){}
			});
			kprUtils.przypisanieCertSukcesAction = urlAction;
			kprUtils.appletSettingsUrl = settings;
			document.getElementById('szafirsdk-loadSzafir-action').click();
		})
	}
	/**
	 * tresc podpisanego dokumentu
	 */
	this.podpisaneDane = null;

	this.anulujPobieranieAppletu = function(powrotActionUrl) {
		menuSelect(powrotActionUrl);
	}
	
	this.appletSettingsUrl = null;

	this.przypisanieCertSukcesAction = null;

	/**
	 * tresc oswiadczenia przypisania certyfikatu do podpisu
	 */
	this.oswiadczenieTresc = null;

	/**
	 * pobranie oswiadczenia przypisania certyfikatu do profilu
	 */
	this.pobierzOswiadczeniePrzypisanie = function() {
		var args = {
			url : "riu/riuOswiadczeniePrzypisanie.npi",
			content : {
				"xmlData" : ""
			},
			handleAs : "json",
			sync : false,
			load : function(resp) {
				kprUtils.oswiadczenieTresc = resp['tresc'];
			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	}
	/**
	 * wyświetlenie oświadczenia
	 */
	this.wyswietlOswiadczenie = function(tresc) {
		alert({
			content : tresc,
			dialogHeight : '180px',
			dialogWidth : '640px'
		});
	}
	/**
	 * pobrane dane profilu
	 */
	this.daneProfilu = null;

	/**
	 * tresci komunikatow i przyciskow gdy profil jest (nie) powiazany z certyfikatem
	 */
	this.brakCertKom = null;
	this.powCertKom = null;
	this.dodajCertBtnLabel = null;
	this.zmienCertBtnLabel = null;

	/**
	 * ustawia eksternalizowane komunikaty
	 */
	this.ustawKomunikaty = function(brakCertKom, powCertKom, dodajCertBttn, zmienCertBttn) {
		kprUtils.brakCertKom = brakCertKom;
		kprUtils.powCertKom = powCertKom;
		kprUtils.dodajCertBtnLabel = dodajCertBttn;
		kprUtils.zmienCertBtnLabel = zmienCertBttn;
	}

	this.uzupelnijDaneProfiluEPUAP = function(infoText, buttonEP) {

		var powiazanyEpuapInfo = dijit.byId("powiazanyEpuapInfoId");
		if (powiazanyEpuapInfo != null) {
			powiazanyEpuapInfo.setContentValue(infoText);
		}

		var button = dijit.byId("ePUAPbutton");
		if (button != null) {
			button.set('style', 'display:none');
			if (buttonEP) {
				button.set('style', 'display:block');
			}
		}
	};
	
	/**
	 * ustawia tresc informacji o tym czy profil posiada certyfikat
	 */
	this.uzupelnijDaneProfiluCertyfikat = function() {
		if (kprUtils.daneProfilu != null) {

			var certyfikatButton = dijit.byId("certyfikatButtonId");
			var certyfikatInfo = dijit.byId("certyfikatInfoId");

			if (certyfikatButton != null && certyfikatInfo != null) {
				if (kprUtils.daneProfilu["czyJestCertyfikat"] == true) {
					// profil powiazany certyfikatem
					certyfikatButton.set('label', kprUtils.zmienCertBtnLabel);
					certyfikatInfo.setContentValue(kprUtils.powCertKom);
				} else if (kprUtils.daneProfilu["czyJestCertyfikat"] == false) {
					//profil nie powiazany certyfikatem
					certyfikatButton.set('label', kprUtils.dodajCertBtnLabel);
					certyfikatInfo.setContentValue(kprUtils.brakCertKom);
				}
			}
		}
	}

		this.wyslanieDanychKontakt = function (zapisaneDaneTresc) {

        if (!dijit.byId("zmianaDanychKontaktowychFormID").validate()) {
            return;
        }

        if (kprUtils.czyUsunietoNumerTelefonu()) {
            window.confirm({
                content: 'Usunięcie numeru telefonu spowoduje wyłączenie wszystkich aktywnych subskrypcji SMS. \nCzy chcesz kontynuować?',
                onOkClick: function () {
                    kprUtils.wyslanieDanychKontaktInner(zapisaneDaneTresc);
                },
                onCancelClick: function() {
                    kprUtils.przepiszDaneKontaktowe();
                }
            });
            return;
        }

        kprUtils.wyslanieDanychKontaktInner(zapisaneDaneTresc);
    };

    this.wyslanieDanychKontaktInner = function (zapisaneDaneTresc) {
        kprUtils.wyslijFormularz('konfiguracja/zapiszProfilDaneKontaktowe.npi', 'zmianaDanychKontaktowychFormID', function (dataOrError) {
            //odswiez formularz
            var formularze = ['daneIdentyfikacyjneFormID', 'daneKontaktoweID'];
            kprUtils.wypelnijFormularz('konfiguracja/pobierzProfilDanePelne.npi', formularze);
            if (dataOrError != null && dataOrError['blad'] != null) {
                alert(dataOrError['blad']);
            } else {
                alert(zapisaneDaneTresc);
            }
        });
    };

    /**
     * Zwraca informację czy numer telefonu został usunięty.
     * @returns {boolean} true - jeśli był ustawiony, a został usunięty
     *                      false - w pozostałych przypadkach
     */
    this.czyUsunietoNumerTelefonu = function () {
        var aktualnyNumerTelefonu = dijit.byId('numerTelefonuID').get('value');
        var nowyNumerTelefonu = dijit.byId('numerTelefonuZmianaID').get('value');

        if (aktualnyNumerTelefonu == null || aktualnyNumerTelefonu == '') {
            return false;
        }

        return nowyNumerTelefonu == null || nowyNumerTelefonu == '';
    };

	this.pobierzDane = function(zapisaneDaneTresc) {
		var formularze = ['daneIdentyfikacyjneFormID', 'daneKontaktoweID'];
		kprUtils.wypelnijFormularz('konfiguracja/pobierzProfilDanePelne.npi', formularze);
	};

	this.wypelnijFormularz = function(url, formularzID) {
		var formIDsArray = this.toArray(formularzID);
		dojo.xhrPost({
			url : url,
			handleAs : "json",
			load : function(resp) {
				var dane = resp.dane;

				dane = kprUtils.formatujResponse(dane);
				dojo.forEach(formIDsArray, function(formID, i) {
					var form = dijit.byId(formID);
					if (form != null) {
						form.set('value', dane);
					}
				});

				kprUtils.daneProfilu = dane;

				kprUtils.uzupelnijDaneProfiluCertyfikat();
				kprUtils.uzupelnijDaneProfiluEPUAP(resp.infoText, resp.buttonEP);

			},
			error : function(error, resp) {
				error(error);
			}
		});
	};

	this.wyslijFormularz = function(url, formularzID, resonseFunction) {
		var args = {
			url : url,
			form : dojo.byId(formularzID),
			handleAs : "json",
			handle : function(dataOrError, ioArgs) {
				if (dojo.isFunction(resonseFunction)) {
					resonseFunction(dataOrError, ioArgs);
				}
			},
			error : function(error, resp) {
				error(error);
			}
		};
		dojo.xhrPost(args);
	};

	this.toArray = function(obj) {
		if (dojo.isArray(obj)) {
			return obj;
		}
		return [obj];
	}

	this.formatujResponse = function(resp) {
		var tmpResp = resp;
		tmpResp["dataUrodzenia"] = gridDateFormatter(tmpResp["dataUrodzenia"]);
		return tmpResp;
	}

	this.przepiszDaneKontaktowe = function() {
		dijit.byId("numerTelefonuZmianaID").set("value", dijit.byId("numerTelefonuID").value);
		dijit.byId("adresEMailZmianaID").set("value", dijit.byId("adresEMailID").value);
	}
}

var kprUtils = new KprUtils();