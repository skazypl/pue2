var obwDokumentOkWud = new ObwDokumentOkWud();
function ObwDokumentOkWud() {

    var currentCheckboxesIds = [];

    this.createPodstawyPrawneSelectList = function() {
        dojo.xhrPost({
            //url : "SOF/utworzNiesformalizowany.npi",
            url : "obw/slownikiZWhere/pobierzZawartoscSlownika.npi",
            content : {
                "nazwaSlownika" : "slowniki.kody_instytucji",
                "kolumnaKlucz" : "kod",
                "kolumnaWartosc" : "nazwa",
                "klauzulaWhere": "1=1"
            },
            handleAs : "json",
            load : function(resp, ioArgs)
            {
                var slownik = new Object();
                slownik.items = resp["slownik"];
                slownik.identifier = 'klucz';
                slownik.label = 'wartosc';
                var obwWyszukanie = new ObwWyszukiwanie();
                podstawaPrawnaSelect.setStore(obwWyszukanie.getSearchTypeStore(slownik));
            },
            error : function(resp)
            {
                console.log("Error : ", resp);
            }
        });
    };

    this.onChangePodstawyPrawne = function() {
        var klucz = podstawaPrawnaSelect.get("value");
        var klauzulaWhere = "kod_instytucji = '" + klucz + "' and data_od  <= sysdate and (data_do is null or data_do >=sysdate)";
        if (klucz != null  || klucz != "") {
            dojo.xhrPost({
                //url : "SOF/utworzNiesformalizowany.npi",
                url : "obw/slownikiZWhere/pobierzZawartoscSlownika.npi",
                content : {
                    "nazwaSlownika" : "slowniki.instytucje_podstawy_prawne",
                    "kolumnaKlucz" : "id",
                    "kolumnaWartosc" : "podstawa_prawna",
                    "klauzulaWhere": klauzulaWhere
                },
                handleAs : "json",
                load : function(resp, ioArgs)
                {
                    currentCheckboxesIds = [];
                    addCheckBoxOther('Inne', 'Podstawa prawna wpisana ręcznie', 'PodstawyPrawneInneId', false);
                    dojo.empty(PodstawyPrawneCheckboxesId);
                    var slownik = resp["slownik"];
                    createCheckboxesFromDictionary(slownik);
                },
                error : function(resp)
                {
                    console.log("Error : ", resp);
                }
            });
        }
    };

    var addCheckBoxOther = function(identifier, value , nodeId, disabled) {
        unregisterNode(identifier);
        addCheckBoxWithTextBoxToNode(identifier, value, nodeId, disabled);
    };

    var unregisterNode = function(didIdName) {
        var w = dijit.byId(didIdName);
        if(w) { w.destroy(); }
    };

    var addCheckBoxWithTextBoxToNode = function(identifier, value , nodeId, disabled) {
        addCheckBoxToNode(identifier, value, nodeId);
        addTextareaToNode(identifier, value, nodeId, disabled);
    };

    var addCheckBoxToNode = function(identifier, value, nodeId) {
        unregisterNode("checkBoxId" + identifier);
        var checkbox = new dijit.form.CheckBox({
            id: "checkBoxId" + identifier,
            name: "checkBoxName" + identifier,
            style: "margin-bottom: 20px; margin-right: 7px;",
            value: value
        });
        currentCheckboxesIds.push(identifier);
        checkbox.placeAt(nodeId, "last");
    };

    var addTextareaToNode = function(identifier, value, nodeId, disabled) {
        unregisterNode("textbox" + identifier);
        var textArea = new dijit.form.SimpleTextarea({
            id: "textbox" + identifier,
            title: "title",
            rows: "3",
            cols: "100",
            style: "height: 50px; margin-bottom: 7px",
            value: value,
            disabled: disabled
        });
        textArea.placeAt(nodeId, "last");
    };

    var createCheckboxesFromDictionary = function(slownik) {
        if (slownik != null) {
            var arrayLength = slownik.length;
            for (var i = 0; i < arrayLength; i++) {
                addCheckBoxWithTextBoxToNode(slownik[i].klucz, slownik[i].wartosc, "PodstawyPrawneCheckboxesId", true)
            }
        }
    };

    this.addPodstawaPrawnaToDocument = function() {
        dojo.xhrPost({
            //url : "SOF/utworzNiesformalizowany.npi",
            url : "obw/obwDokumentOkWud/uaktualnijDokumentZusOkWudOPodstawyPrawne.npi",
            content : {
                idDokumentu: obwFormularze.id_dokumentu,
                podstawaPrawna: getSelectedPodstawyPrawne(),
                instytucjaKod: podstawaPrawnaSelect.get('value')
            },
            handleAs : "json",
            load : function(resp, ioArgs)
            {
                obwDokumentOkWudPodstawaPrawnaDialog.hide();
            },
            error : function(resp)
            {
                obwDokumentOkWudPodstawaPrawnaDialog.hide();
                obwDokumentyRobocze.ustawSelekcjeNaLiscie(obwFormularze.id_dokumentu, obwFormularze.kod_formularza);
            }
        });
    };

    var getSelectedPodstawyPrawne = function() {
        var podstawyPrawne = "";
        for (var i = 0; i < currentCheckboxesIds.length; i++) {
           var checkbox = dijit.byId("checkBoxId" + currentCheckboxesIds[i]);
           var textbox = dijit.byId("textbox" + currentCheckboxesIds[i]);
           if (checkbox.checked) {
               podstawyPrawne = podstawyPrawne + textbox.value + "\n";
           }
        }
        return podstawyPrawne;
    };

    this.hideDialog = function() {
        obwDokumentOkWudPodstawaPrawnaDialog.hide();

    }

    this.ustawSelekcjeNaLiscie = function() {
        obwDokumentyRobocze.ustawSelekcjeNaLiscie(obwFormularze.id_dokumentu, obwFormularze.kod_formularza);
    }
}



