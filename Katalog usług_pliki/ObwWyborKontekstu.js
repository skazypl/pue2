/**
 * Created by E440 on 28.05.15.
 */
function ObwWyborKontekstu() {

    var contextPaneItem;

    var wybierzNameLabel = function (roleName) {
        if (roleName == 'OGOLNA')
            return "Wybrany kontekst:";
        else if (roleName == 'SWIADCZENIOBIORCA')
            return "Wybrany świadczeniobiorca:";
        else if (roleName == 'UBEZPIECZONY')
            return "Wybrany ubezpieczony:";
        else if (roleName == 'PLATNIK')
            return "Wybrany płatnik:";
        else if (roleName == 'LEKARZ')
            return "Wybrany lekarz:";
        else if (roleName == 'KOMORNIK')
            return "Wybrany komornik:";
    };

    var wybierzRedirectUrl = function (roleName) {
        if (roleName == 'OGOLNA')
            return "obszar-roboczy.npi";
        else if (roleName == 'SWIADCZENIOBIORCA')
            return "obszar-swiadczeniobiorcy.npi";
        else if (roleName == 'UBEZPIECZONY')
            return "obszar-ubezpieczonego.npi";
        else if (roleName == 'PLATNIK')
            return "obszar-platnika.npi";
        else if (roleName == 'LEKARZ')
            return "obszar-lekarza.npi";
        else if (roleName == 'KOMORNIK')
            return "obszar-komornika.npi";
    };

    this.initContext = function () {
        var args = {
            url: 'obw/pobierzUpowaznienia/renderContextPane.npi',
            handleAs: "json",
            sync: true,
            load: function (resp) {
                var currentRole = resp["currentRole"];
                var contextName = resp["contextName"];

                var nameLabel = 'Wybrany kontekst:';
                var reUrl = 'obszar-roboczy.npi';
                var changeLabel = "Zmień";

                console.log("Przekazanie parametrow " + currentRole + " " + contextName + " " + nameLabel + " " + reUrl);
                if (currentRole == "OGOLNA") {
                    var params = {'roleName': currentRole,
                        'nameLabel': nameLabel,
                        'changeLabel': changeLabel,
                        'nameValue': contextName,
                        'redirectUrl': reUrl,
                        'id': 'changeContextPanePanelOgolny',
                        'changeClick': function () {
                            var dialogArgs = {
                                roleName: this.roleName,
                                redirectUrl: this.redirectUrl,
                                storeUrl: 'obw/pobierzUpowaznienia/pobierz.npi',
                                structureUrl: '',
                                changeContextUrl: '',
                                id: 'changeContextDialogPanelOgolny',
                                _structure: getStructure(),
                                _prepareLayout: _prepareLayout,
                                _onChooseClick: _onChooseClick
                            };
                            new zusnpi.dialog.ChooseContextDialog(dialogArgs).show();
                        }
                    };
                    contextPaneItem = new zusnpi.layout.pagetitle.ChangeContextPane(params);
                    contextPaneItem.placeAt("renderChooseContextContainer");
                    dojo.style(contextPaneItem.domNode, {display: "block"});
                }

            }
        };
        dojo.xhrPost(args);
    };


    var getStructure = function () {
        return {
            ID: {
                field: "idKontekstu",
                name: "idKontekstu"
            },
            NAZWA_PODMIOTU: {
                field: "nazwa",
                name: "Nazwa"
            },
            PESEL: {
                field: "pesel",
                name: "PESEL"
            },
            NIP: {
                field: "nip",
                name: "NIP"
            },
            NR_DOK_TOZSAMOSCI: {
                field: "numerDokumetu",
                name: "Nr Dokumentu"
            }
        };
    }

    var _structure = getStructure();

    var _prepareLayout = function () {
        return {
            cells: [
                {
                    field: _structure.ID.field,
                    hidden: true
                },
                {
                    field: _structure.NAZWA_PODMIOTU.field,
                    name: _structure.NAZWA_PODMIOTU.name,
                    width: 'auto'
                },
                {
                    field: _structure.PESEL.field,
                    name: _structure.PESEL.name,
                    width: 'auto'
                },
                {
                    field: _structure.NIP.field,
                    name: _structure.NIP.name,
                    width: 'auto'
                },
                {
                    field: _structure.NR_DOK_TOZSAMOSCI.field,
                    name: _structure.NR_DOK_TOZSAMOSCI.name,
                    width: 'auto'
                }
            ]
        };
    }

    var _onChooseClick = function () {
        var _this = this;
        var selectedRecordId = _this._getSelectedRecordId();
        var args = {
            url: 'obw/pobierzUpowaznienia/zmienKontekst.npi',
            handleAs: "json",
            content: {
                idKontekstu: selectedRecordId
            },
            load: function (resp) {
                contextPaneItem.set('nameValue', resp["contextName"]);
                window.location.reload();
            }
        };
        dojo.xhrPost(args);
    }
}

var obwWyborKontekstu = new ObwWyborKontekstu();