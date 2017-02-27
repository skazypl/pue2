function ZdarzeniaBiznesowe() {
    var _this = this;

    var typPodmiotuValue = null;
    var nazwaPodmiotuValue = null;

    this.onSearchClick = function() {
        zdarzeniaBiznesowe.nazwaPodmiotuValue = "";
        logZdarzenId.filterGridWithCustomFilter();
    };

    this.getListaLogCustomFilter = function() {
        var searchParams = new Object();
        return searchParams;
    };

    this.postLoad = function() {
        kprSzczegolyZdarzenBiznesowychButton.focus();
    };

    this.przegladanieLoguZdarzenSzczegolyClick = function() {

        logZdarzenSzczegolyForm.init({
            controller : parametrySKRGridCRUDButtonsPanel,
            initButtons : true,
            submitButton : parametrySKRGridCRUDButtonsPanel.SaveButton,
            cancelButton : parametrySKRGridCRUDButtonsPanel.CancelButton,
            closeButton : parametrySKRGridCRUDButtonsPanel.CloseButton,
            workMode : new zusnpi.form.WorkMode().BROWSE
        });

        var selected = logZdarzenId.getSelectedRecord();
        if (selected) {
            logZdarzenSzczegolyForm.reset();

            document.getElementById("dataLogi").value = gridFullTimeFormatter(selected["dataOperacji"]);
            var operatorRola = _this.operatorFormatter(selected["identyfikatorZmieniajacego"]);
            if (selected["typZmieniajacy"]) {
                operatorRola += " / " + selected["typZmieniajacy"]
            }
            document.getElementById("operatorRolalogi").value = operatorRola;
//			document.getElementById("rolaLogi").value = selected["typZmieniajacy"];
            document.getElementById("typOperacjiLogi").value = _this.formatTypOperacji(selected["typOperacji"]);
            document.getElementById("podmiotZdarzeniaLogi").value = selected["identyfiaktorZmieniany"];
            document.getElementById("typWykonujacegoLogi").value = selected["typZmieniany"];
            document.getElementById("opis").value = selected["opis"];
        }
        logZdarzenSzczegolyForm.closeButton.focus();
        logZdarzenSzczegolyForm.closeButton.setAttribute('readLabel', 'Powrót do listy zdarzeń biznesowych');
    };

    this.formatTypOperacji = function(value) {
        var result = "";
        if (value == "D") {

            result = "Dodanie";

        }
        if (value == "P") {

            result = "Przegląd";

        }
        if (value == "M") {

            result = "Modyfikacja";

        }
        if (value == "U") {

            result = "Usunięcie";

        }
        return result;
    };

    this.operatorFormatter = function(val) {
        if (!val) {
            return "Brak";
        }
        if (val == "NIEDOSTEPNY") {
            return "ZUS";
        } else {
            return val;
        }
    };

    this.getLogZdarzenLista = function() {
        var resp = getStructureFromAction("zdarzenia/przegladanieLoguZdarzenStruktura.npi");

        return {
            cells : [
                {
                    field : resp.ID.field,
                    hidden : true
                },
                {
                    field : resp.TYP_ZMIENIAJACY.field,
                    hidden : true
                },
                {
                    field : resp.DATA.field,
                    name : resp.DATA.name,
                    headerStyles : "text-align:center;",
                    styles : "text-align:center;",
                    filterable : true,
                    datatype : 'date',
                    formatter : function(val) {
                        return gridFullTimeFormatter(val);
                    },
                    width : '150px'
                },
                {
                    field : resp.OPERATOR.field,
                    name : resp.OPERATOR.name,
                    headerStyles : "text-align:center;",
                    styles : "text-align:center;",
                    width : '125px',
                    formatter : _this.operatorFormatter
                },
                {
                    field : resp.TYP_OPERACJI.field,
                    name : resp.TYP_OPERACJI.name,
                    headerStyles : "text-align:center;",
                    styles : "text-align:center;",
                    width : '90px',
                    formatter : _this.formatTypOperacji
                },
                {
                    field : resp.KANAL_DOSTEPU.field,
                    name : resp.KANAL_DOSTEPU.name,
                    headerStyles : "text-align:center;",
                    styles : "text-align:center;",
                    filterable : true,
                    width : '90px'
                },
                {
                    field : resp.OPIS.field,
                    name : resp.OPIS.name,
                    headerStyles : "text-align:left;",
                    styles : "text-align:left;",
                    width : 'auto'
                }
            ]
        };
    }

}
var zdarzeniaBiznesowe = new ZdarzeniaBiznesowe();
