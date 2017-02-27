/**
 * @returns {KogFormularze}
 */
function KogFormularze() {
	this.kod_formularza = "ZFA";
	this.id_dokumentu = null;
	this.tryb_formularza = "";

	this.czyIstniejeZFA = function(callback) {
		kogUtils.callXhrPost("obszar-ogolny/formularzZFA/sprawdzCzyIstnieje.npi", callback);
	};

	this.utworzNowyZFA = function(callback) {
		kogUtils.callXhrPost("obszar-ogolny/formularzZFA/utworzNowy.npi", callback);
	};

	this.initButtons = function() {
		this.czyIstniejeZFA(function(istniejeZFA) {
			kogUtils.log(istniejeZFA.id + " " + istniejeZFA.status);
			kogFormularze.id_dokumentu = istniejeZFA.id;

			if(istniejeZFA.status != "W") {
				if(istniejeZFA.id == "-") {
					kogFormularze.tryb_formularza = new zusnpi.sof.SofFormMode().TWORZENIE_NOWEGO;
					kogFormularze.setButtonAttr("ZFAButton","label","Wypełnij formularz ZUS ZFA");
					kogFormularze.setButtonAttr("ZFAButton","readLabel","Rejestracja zgłoszenia Płatnika, Utwórz i wypełnij formularz");
				} else {
					kogFormularze.tryb_formularza = new zusnpi.sof.SofFormMode().REDAGOWANIE;
					kogFormularze.setButtonAttr("ZFAButton","label","Wypełnij formularz ZUS ZFA");
					kogFormularze.setButtonAttr("ZFAButton","readLabel","Rejestracja zgłoszenia Płatnika, Wypełnij formularz");
				}
				if(istniejeZFA.statusWeryfikacji == "P" || istniejeZFA.statusWeryfikacji == "O" || istniejeZFA.statusWeryfikacji == "Z") {
					kogFormularze.setButtonAttr("ZFAWyslij","disabled",false);
				} else {
					kogFormularze.setButtonAttr("ZFAWyslij","disabled",true);
				}
			} else {
				kogFormularze.tryb_formularza = new zusnpi.sof.SofFormMode().PODGLAD;
				kogFormularze.setButtonAttr("ZFAButton","label","Przeglądaj formularz ZUS ZFA");
				kogFormularze.setButtonAttr("ZFAButton","readLabel","Rejestracja zgłoszenia Płatnika, Przeglądaj formularz");
				kogFormularze.setButtonAttr("ZFAWyslij","disabled",true);
			}
		});
	};

	this.setButtonAttr = function(button, attr, value) {
		but=dijit.byId(button);
		if(but != undefined && but != null) {
			but.setAttribute(attr, value);
		}
	};

	this.wczytajFormularzSOF = function(typFormularza, idDokumentu, trybFormularza) {
		kogUtils.log("wyswietlFormularzSOF: typFormularza=" + typFormularza + " id_dokumentu=" + idDokumentu + "trybFormularza" +trybFormularza);
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setIdDokumentu(idDokumentu);
		sofFormContainer.setTrybFormularza(trybFormularza);
		sofFormContainer.wczytajFormularz();
	};

	/**
	 * Wywoływane w momwncie podglądu wzoru dokumentu w SOF z wyboru typu
	 * dokuementu do utworzenia
	 */
	this.wyswietlFormularzSOFPustyOdczyt = function(typFormularza) {
		kogUtils.log("wyswietlFormularzSOFPustyOdczyt: typFormularza=" + typFormularza);

		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().PODGLAD);
		sofFormContainer.wczytajFormularz();
	};
	
	/**
	 *
	 */
	this.wyswietlFormularzSOFTworzenieNowego = function(typFormularza, idDokumentu) {
		wczytajFormularzSOF(typFormularza, idDokumentu, new zusnpi.sof.SofFormMode().TWORZENIE_NOWEGO);
	};
	
	/**
	 *
	 */
	this.wyswietlFormularzSOFOdczytDokumentu = function(typFormularza, idDokumentu) {
		wczytajFormularzSOF(typFormularza, idDokumentu, new zusnpi.sof.SofFormMode().PODGLAD);
	};
	
	/**
	 * Wywoływane podczas tworzenia i edycji dokuemntu
	 */
	this.wyswietlFormularzSOFEdycjaDokumentu = function(typFormularza, idDokumentu) {
		kogUtils.log("wyswietlFormularzSOFEdycjaDokumentu: typFormularza=" + typFormularza + " id_dokumentu=" + idDokumentu);

		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setIdDokumentu(idDokumentu);
		sofFormContainer.setWersjaFormularza(wersjaWzoruDok);
		sofFormContainer.setWersjaFormularza(wersjaFormularza);
		sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().REDAGOWANIE);
		sofFormContainer.wczytajFormularz();
	};
	
	/**
	 *
	 */
	this.wyswietlFormularzSOFPodgladPdf = function(typFormularza, idDokumentu) {
		wczytajFormularzSOF(typFormularza, idDokumentu, new zusnpi.sof.SofFormMode().PODGLAD_PDF);
	};
	
	/**
	 *
	 */
	this.wyswietlFormularzSOF = function() {
		kogUtils.log("wyswietlFormularzSOF: kod_formularza=" + this.kod_formularza + " id_dokumentu=" + this.id_dokumentu + " tryb_formularza=" + this.tryb_formularza);

		if(this.id_dokumentu == "-") {
			this.utworzNowyZFA(function(nowy) {
				if(nowy != null) {
					kogFormularze.wyswietlZFA(nowy);
				}
			});
		} else {
			kogFormularze.wyswietlZFA();
		}
	};

	this.wyswietlZFA = function(idDokumentu) {
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(this.kod_formularza);
		if(idDokumentu != null) {
			this.id_dokumentu = idDokumentu;
		}
		if(this.id_dokumentu != null) {
			sofFormContainer.setIdDokumentu(this.id_dokumentu);
		}
		if(this.tryb_formularza != null) {
			sofFormContainer.setTrybFormularza(this.tryb_formularza);
		}
		sofFormContainer.wczytajFormularz();
	};
	
	this.pobierzPonownieZgloszeniePlatnika = function() {
		kogUtils.log("Ponowne wczytanie formularza ZFA");
		kogFormularze.initButtons();
	};
	
	/**
	 *
	 */
	this.ustawDaneDokumentu = function(kodTypuDokumentu, idDokumentu, trybFormularza) {
		kogUtils.log("ustawDaneDokumentu: kod typu=" + kodTypuDokumentu + "  id dokumentu=" + idDokumentu + "  tryb=" + trybFormularza);
		this.kod_formularza = kodTypuDokumentu;
		this.id_dokumentu = idDokumentu;
		this.tryb_formularza = trybFormularza;
	};

};

var kogFormularze = new KogFormularze();

dojo.ready(function() {
	if(kogFormularze != undefined && kogFormularze != null) {
		kogFormularze.initButtons();
	}
});
