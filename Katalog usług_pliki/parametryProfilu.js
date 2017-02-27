function ParametryProfilu() {
	
    /**
	 * zaznacza radiobuttona z podanej grupy z podana wartoscia
	 */
    this.zaznaczRadioButtona = function(nazwaGrupy, wartosc) {
        dojo.query("input[type=radio]").forEach(function(node, index, arr){
            if(node.name == nazwaGrupy && node.value == wartosc) {
                dijit.byId(node.id).set("checked", true);
            }
        });
    }

    /*
    * wyłancza grupę radiobuttonów
    */
    this.wylaczRadioButtona = function(nazwaGrupy, stan){
        dojo.query("input[type=radio]").forEach(function(node, index, arr){
            if(node.name == nazwaGrupy) {
                dijit.byId(node.id).set("disabled", stan);
            }
        });

    }

    /*
     * włącz wyłącz w zależności od parametru
     */
    this.podpisywanieWlaczWylacz = function(){
        var grupa = "sposobyPodpisywaniaDokEPL";

        dojo.query("input[type=radio]").forEach(function(node, index, arr){
            if(node.name == "sposobyWysDokumentow" && node.value == "PAP" && node.checked) {
                parametryProfilu.wylaczRadioButtona(grupa, true);

            }
            else if (node.name == "sposobyWysDokumentow" && node.value == "ELE" && node.checked){
                parametryProfilu.wylaczRadioButtona(grupa, false);
            }
        });


    }
	
    /**
	 * tworzy radio buttona z zadanymi parametrami
	 */
    this.utworzRadioButtona = function(jsonWarSlow, nazwaGrupy, kontenerHtmlId) {
        var wartosc = jsonWarSlow["Kod"];
        var opis = jsonWarSlow["Nazwa"];				
        var newRadioButtonId = nazwaGrupy+wartosc+"Id";
        newRadioButtonId = newRadioButtonId.replace(/\s/g, '');
        // node kontenera
        var htmlNode = dojo.byId(kontenerHtmlId);
        // tworzenie nowego elementu input
        var inputDom = dojo.create("input", {
            id:newRadioButtonId
        }, kontenerHtmlId);
        // utworzenie labela
        var labelDom = dojo.create("label", {
            'for':newRadioButtonId
        });
        // dodanie napisu
        labelDom.innerHTML = " " + opis + " ";
        // dodanie do strony radioboxa
        dojo.create(inputDom, null, htmlNode);
        // dodanie do strony labela
        dojo.create(labelDom, null, htmlNode);
        // odstep miedzy radiobuttonami
        dojo.create("BR", null, htmlNode);
        // utworzenie radiobuttona i podpiecie go do elementu input
        var radioButton = new dijit.form.RadioButton({
            checked: false,
            value: wartosc,
            name: nazwaGrupy
        }, newRadioButtonId);	
        return radioButton;
    }

    /**
	 * tworzy grupe radiobuttonow z zadanymi parametrami
	 */
    this.utworzGrupeRadioButtow = function(tablicaWartSlownika, nazwaGrupy, kontenerHtmlId) {		
        for(var i = 0; i<tablicaWartSlownika.length ; i++) {	
            parametryProfilu.utworzRadioButtona(tablicaWartSlownika[i], nazwaGrupy, kontenerHtmlId);
        }
    }

    /**
        * tworzenie checkboxa z zadanymparametrem
        */
    this.utworzCheckbox = function(wartosc, nazwa, kontenerHtmlId){

        var newCheckboxId = nazwa+"CheckboxId";
        // node kontenera
        var htmlNode = dojo.byId(kontenerHtmlId);
        // tworzenie nowego elementu input
        var inputDom = dojo.create("input", {
            'id':newCheckboxId
        }, kontenerHtmlId);

        // dodanie do strony radioboxa
        dojo.create(inputDom, null, htmlNode);

        // utworzenie radiobuttona i podpiecie go do elementu input
        var checkbox = new dijit.form.CheckBox({
            checked: wartosc,
            value: "true",
            name: nazwa
        }, newCheckboxId);	

    }

	
    /**
	 * pobiera liste sposobow otrzymywania odpowiedzi
	 */
    this.pobierzDaneDoFormatki = function() {
        var args = {
            url: "konfiguracja/parametry-profilu-pobierz-dane.npi",
            handleAs: "json",
            sync: true,
            load: function(resp){
                // wartosci ustawien profilu
                var profilOtrzymywanieOdpowiedzi = resp["profilOtrzymywanieOdpowiedzi"];
                var profilWysDokumentow = resp["profilWysDokumentow"];
                var profilPodpisywaniaDokEPL = resp['profilPodpisywaniaDokEPL'];
                var profilStanPaneli = resp['profilStanPaneli'];

                // wartosci slownikowe
                var sposobyOtrzymywaniaOdpowiedzi = resp["sposobyOtrzymywaniaOdpowiedzi"];
                var sposobyWysDokumentow = resp["sposobyWysDokumentow"];
                var sposobyPodpisywaniaDokEPL = resp['sposobyPodpisywaniaDokEPL'];

              /*
                 var tak = {
                        Nazwa: "ELE",
                        Kod: "ELE"
                    }
                    var nie = {
                        Nazwa: "papier",
                        Kod: "PAP"
                    }
                    var wydok = new Array(tak, nie);
                */


                // tworzenie radiobuttonow
                parametryProfilu.utworzGrupeRadioButtow(sposobyOtrzymywaniaOdpowiedzi, "sposobyOtrzymywaniaOdpowiedzi", "sposobyOtrzymaniaContainerId");
                // tworzenie radiobuttonow
                parametryProfilu.utworzGrupeRadioButtow(sposobyWysDokumentow, "sposobyWysDokumentow", "sposobyWysylaniaContainerId");

                // tworzenie checkboxa
                parametryProfilu.utworzCheckbox(profilStanPaneli, "stanPaneli2", "stanPaneliContainerId");
                // zaznaczenie radiobuttonow
                parametryProfilu.zaznaczRadioButtona("sposobyOtrzymywaniaOdpowiedzi", profilOtrzymywanieOdpowiedzi);
                // zaznaczenie radiobuttonow
                parametryProfilu.zaznaczRadioButtona("sposobyWysDokumentow", profilWysDokumentow);




                if(profilPodpisywaniaDokEPL != null && sposobyPodpisywaniaDokEPL != null) {
                    parametryProfilu.utworzGrupeRadioButtow(sposobyPodpisywaniaDokEPL, "sposobyPodpisywaniaDokEPL", "sposobyPodpisywaniaContainerId");
                    parametryProfilu.zaznaczRadioButtona("sposobyPodpisywaniaDokEPL", profilPodpisywaniaDokEPL);

                    if(profilWysDokumentow == "PAP"){
                         parametryProfilu.wylaczRadioButtona("sposobyPodpisywaniaDokEPL", true);
                    }



                } else {
                    console.log(dijit.byId("sposobyPodpisywaniaContainerId"));
                    dijit.byId("sposobyPodpisywaniaContainerId").set('style', 'display:none');
                    dojo.style('sposobyPodpisywaniaContainerLabelId', 'display', 'none');
                }


					
            },
            error: function(error, resp){
                error(error);
            }
        };
        dojo.xhrPost(args);
    }




    /**
	 * wywoluje akcje zapisania parametrow profilu
	 */
    this.zapiszUstawieniaProfilu = function() {
        var otrzymywanieOdpowiedzi = "";		
        dojo.query("input[name=sposobyOtrzymywaniaOdpowiedzi]:checked").forEach(function(node, index, arr){
            otrzymywanieOdpowiedzi = dijit.byId(node.id).value;
        });

        var sposobWysylki = "";		
        dojo.query("input[name=sposobyWysDokumentow]:checked").forEach(function(node, index, arr){
            sposobWysylki = dijit.byId(node.id).value;
        });

        /* var stanPaneli = "";		
        dojo.query("input[name=stanPaneli]:checked").forEach(function(node, index, arr){
            stanPaneli = dijit.byId(node.id).value;
        });
        */
        var stanPaneli2 = false;
        dojo.query("input[name=stanPaneli2]:checked").forEach(function(node, index, arr){
            stanPaneli2 = dijit.byId(node.id).value;
        });
		
        var sposobyPodpisywania = "";
        dojo.query("input[name=sposobyPodpisywaniaDokEPL]:checked").forEach(function(node, index, arr){
            sposobyPodpisywania = dijit.byId(node.id).value;
        });
		
		
        var args = {
            url: "konfiguracja/parametry-profilu-zapisz.npi",
            content: {
                "otrzymywanieOdpowiedzi": otrzymywanieOdpowiedzi,
                "sposobPodpisuEplatnik": sposobyPodpisywania,
                "stanPaneli": stanPaneli2.toString(),
                "sposobWysylki": sposobWysylki
            },
            handleAs: "json",
            sync: true,
            load: function(resp){
                alert("Zapisano zmiany w parametrach profilu.\nAby zmiany odniosły skutek należy ponownie zalogować się do systemu.");
            },
            error: function(error, resp){
                error(error);
            }
        };
        dojo.xhrPost(args);
    }
	
};

var parametryProfilu = new ParametryProfilu();