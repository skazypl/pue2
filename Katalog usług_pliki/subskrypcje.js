function Subskrypcje() {
	
	this.formatter = function(val){
		if (val == 'N'){
			return 'Bez powiadamiania';
		}
		else if (val == 'Z'){
			return 'Zbiorczo';
		}
		else if (val == 'J'){
			return 'Jednostkowo';
		}
		else{
			return val;
		}
		
	};
	
	this.getSubskrypcjeStruktura = function() {
		var resp = getStructureFromAction("konfiguracja/subskrypcjeStruktura.npi");
		return {
			cells : [ {
				field : resp.ID.field,
				hidden : true
			}, {
				field : resp.SPRAWA.field,
				hidden : true
			}, {
				field : resp.PROFIL.field,
				hidden : true
			}, {
				field : resp.KOD.field,
				hidden : true
			}, {
				field : resp.NAZWA.field,
				name : resp.NAZWA.name,
				headerStyles : "text-align:center;",
				styles : "text-align:left;",
				width : 'auto'
			}, {
				field : resp.SMS.field,
				name : resp.SMS.name,
				headerStyles : "text-align:center;",
				styles : "text-align:center;",
				formatter : this.formatter,
				sortable : false,
				filterable : false,
				width : '20%'
			}, {
				field : resp.EMAIL.field,
				name : resp.EMAIL.name,
				headerStyles : "text-align:center;",
				styles : "text-align:center;",
				formatter : this.formatter,
				sortable : false,
				filterable : false,
				width : '20%'
			} ]
		}
	};

    this.ustawSubskrypcjeButtonClicked = function() {
        var selected = subskrypcjeGridId.getSelectedRecord();
        if (selected) {

            var profilDanePelne = subskrypcje.pobierzProfilDanePelne();

            // wyświetlenie okna po pobraniu danych zmniejsza czas oczekiwania użytkownika na poniżesz operacje
            subskrypcjeDialogId.show();

            if (!profilDanePelne.adresEMail) {
                alert('W danych profilu nie jest ustawiony numer adres e-mail. Subskrypcja e-mail zdarzenia nie jest możliwa.');
                subskrypcjaMailSelectId.disabled = true;
            } else {
                var email = selected["czestoscMail"];
                subskrypcjaMailSelectId.setValue(email);
            }

            var nOption = subskrypcjaMailSelectId.getOptions(0);
            if (selected["typZdarzeniaWskazanieNazwa.kod"] == "NOWY_DOK" || selected["typZdarzeniaWskazanieNazwa.kod"] == "UPD_WYG" || selected["typZdarzeniaWskazanieNazwa.kod"] == "N_DOK_PRZY") {
                nOption.disabled = true;
            } else {
                nOption.disabled = false;
            }
            subskrypcjaMailSelectId.updateOption(nOption);

            if (!profilDanePelne.numerTelefonu) {
                alert('W danych profilu nie jest ustawiony numer telefonu. Subskrypcja SMS zdarzenia nie jest możliwa.');
                subskrypcjaSmsSelectId.disabled = true;
            } else {
                var sms = selected["czestoscSms"];
                subskrypcjaSmsSelectId.setValue(sms);
            }

            subskrypcjeDialogId.selected = selected;
        }

    };

    this.pobierzProfilDanePelne = function() {

        var profilDanePelne = null;

        var args = {
            url: 'konfiguracja/pobierzProfilDanePelne.npi',
            handleAs : "json",
            sync: true,
            load: function( resp ) {

                profilDanePelne = resp.dane;

            },
            error: function( error ) {
                error( error );
            }
        };
        dojo.xhrPost( args );

        return profilDanePelne;
    };

	/**
     * Wyświetla informację o aktywności danego kanału powiadamiania, w zależności od wartości pobranego parametru.
     */
    this.sprawdzKanalySubskrypcji = function () {
        var args = {
            url: 'konfiguracja/powiadomienia-pobierz-dane.npi',
            handleAs: "json",
            load: function (resp) {
                // Sprawdzenie możliwości subskrypcji przez kanały powiadomień
                var powiadomienia = resp['powiadomienia'];

                // Jeżeli któryś z kanałów powiadomień jest zablokowany
                if (powiadomienia == false) {
                    var czyPowiadamiacPrzezMail = resp['email'];
                    var czyPowiadamiacPrzezSMS = resp['sms'];

                    // Ostrzeżenie o zablokowanym kanale e-mail
                    if (czyPowiadamiacPrzezMail == false && czyPowiadamiacPrzezSMS == true) {
                        dijit.byId("kprInformacjaInfoField1").set("style", "display: none;");
                        dojo.style(dojo.byId("kprInformacjaInfoField2"), {display: 'block'});
                        dojo.style(dojo.byId("kprInformacjaInfoField3"), {display: 'none'});
                        dojo.style(dojo.byId("kprInformacjaInfoField4"), {display: 'none'});
                    }
                    // Ostrzeżenie o zablokowanym kanale sms
                    else if (czyPowiadamiacPrzezSMS == false && czyPowiadamiacPrzezMail == true) {
                        dijit.byId("kprInformacjaInfoField1").set("style", "display: none;");
                        dojo.style(dojo.byId("kprInformacjaInfoField2"), {display: 'none'});
                        dojo.style(dojo.byId("kprInformacjaInfoField3"), {display: 'block'});
                        dojo.style(dojo.byId("kprInformacjaInfoField4"), {display: 'none'});
                    }
                    // Ostrzeżenie o zablokowanym kanale sms i e-mail
                    else {
                        dijit.byId("kprInformacjaInfoField1").set("style", "display: none;");
                        dojo.style(dojo.byId("kprInformacjaInfoField2"), {display: 'none'});
                        dojo.style(dojo.byId("kprInformacjaInfoField3"), {display: 'none'});
                        dojo.style(dojo.byId("kprInformacjaInfoField4"), {display: 'block'});
                    }
                }
                // Informacja o aktywności kanałów powiadomień
                if (powiadomienia == true) {
                    dijit.byId("kprInformacjaInfoField1").set("style", "display: block;");
                    dojo.style(dojo.byId("kprInformacjaInfoField2"), {display: 'none'});
                    dojo.style(dojo.byId("kprInformacjaInfoField3"), {display: 'none'});
                    dojo.style(dojo.byId("kprInformacjaInfoField4"), {display: 'none'});
                }
            }
        };
        dojo.xhrPost(args);
    };

	this.postLoad = function(){
		
		var currentRecord = subskrypcjeGridId.getRecordForIndex(0);
		if(currentRecord==null) return;
		subskrypcjeGridId.selectByItemIndex(0);	

		subskrypcjeCrudButtonPanel.RButton.focus();
		
	};

    this.sprawdzCzyUsunacSubskrypcje = function() {
        var args = {
            url: 'konfiguracja/sprawdzCzyUsunacSubskrypcje.npi',
            handleAs: 'json',
            sync: true,
            load: function( resp ) {
                if (resp[ 'message' ] != null) {
                    alert( resp[ 'message' ] );
                    subskrypcjeGridId.reload();
                }
            },
            error: function( error ) {
                error( error );
            }
        };
        dojo.xhrPost( args );
    }
}
var subskrypcje = new Subskrypcje();