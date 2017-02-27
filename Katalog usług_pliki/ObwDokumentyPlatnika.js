/**
 *  @author Sygnity S.A.
 * change this template use File | Settings | File Templates.
 */
function ObwDokumentyPlatnika() {

    this.postLoad = function() {
        dojo.connect(obwImportPlatnikaUploaderId.fileUploader, "onChange", function() {
            obwUtils.showSendActionSplash();
        });
    };

    this.getStructure = function() {
		var actionStructure = getStructureFromAction('obw/dokumentyPlatnika/getStructure.npi');
		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
				field : actionStructure.TYP_DOKUMENTU.field,
				name : actionStructure.TYP_DOKUMENTU.name,
				datatype : 'string',
				width : 'auto'
			}, {
				field : actionStructure.IDENTYFIKATOR.field,
				name : actionStructure.IDENTYFIKATOR.name,
				datatype : 'string',
				width : '75px',
				filterable : true,
				sortable : true,
				styles : 'text-align: center;'
			}, {
				field : actionStructure.DATA_UTWORZENIA.field,
				name : actionStructure.DATA_UTWORZENIA.name,
				datatype : 'date',
				width : '130px',
				sortable : true,
				filterable : true,
				styles : 'text-align: center;',
				formatter : gridDateFormatter
			}, {
				field : actionStructure.DATA_IMPORTU.field,
				name : actionStructure.DATA_IMPORTU.name,
				datatype : 'date',
				width : '130px',
				sortable : true,
				filterable : true,
				styles : 'text-align: center;',
				formatter : gridDateTimeFormatter
			}, {
				field : actionStructure.WERSJA_KEDU.field,
				name : actionStructure.WERSJA_KEDU.name,
				datatype : 'string',
				width : '60px',
				sortable : true,
				filterable : true,
				styles : 'text-align: center;'
			}, getCheckboxColumnExt({
				title : "Wybór",
				width : "45px",
				gridId : "obwGridListaDokumentowPlatnika",
				showHeaderCheckbox : true
			}) ]
		};
    };

    this.onClickUsun = function(fullId) {

		obwUtils.invokeSingleMultiGridAction(
			fullId,
			'Usuń',
			'Chcesz usunąć wybrany dokument?',
			'Chcesz usunąć wybrany dokument?',
			'Chcesz usunąć wybrane dokumenty? Liczba wybranych dokumentów:',
			'obw/dokumentyPlatnika/usunDokument.npi',
			getGridObject());

	// confirm({
	// title: "",
	// content: "Czy na pewno chcesz usunąć dokument?",
	// onOkClick : function() {
	// var selectedRecord =
	// obwGridListaDokumentowPlatnika.getSelectedRecord();
	// var fullId = selectedRecord['id.fullId'];
	// var idDokumentu = fullId.substring(0,
	// fullId.indexOf(';')).replace('idOb&', '');
	//
	// var args = {
	// sync: true,
	// url: 'obw/dokumentyPlatnika/usunDokument.npi',
	// content: {
	// 'idDokumentu' : idDokumentu
	// },
	// handleAs: "json",
	// load: function (resp) {
	// if (resp != null && resp['blad'] != null) {
	// alert( resp['blad'] );
	// return;
	// }
	//
	// obwGridListaDokumentowPlatnika.reload();
	// alert('Dokument usunięto.');
	// },
	// error: function (error) {
	// error(error);
	// }
	// };
	//
	// dojo.xhrPost(args);
	// }
	// });
    };

    /**
     * Funkcja zwracająca ID grida
     */
    var getGridObject = function() {
		return obwGridListaDokumentowPlatnika;
    };

    this.onClickEksportuj = function(fullId) {

		getGridObject().sendSelectedIdsToAction(
			'obw/dokumentyPlatnika/sprawdzWersje.npi',
			function(resp) {
			    if (resp.jednaWersjaDokuentow == true) {

					var selectedCount = obwGridListaDokumentowPlatnika.getMultiSelectionSelectedRecordsCount();
					if (selectedCount == 0) {
						var selectedRecord = obwGridListaDokumentowPlatnika.getSelectedRecord();
						if (selectedRecord != null) {
							fullId = selectedRecord["id.fullId"];
						} else {
                            alert("Nie wybrano żadnego rekordu.");
                        }
					}

					obwUtils.invokeExportAction(
							fullId,
							'obw/dokumentyPlatnika/eskportujDokumenty.npi',
							obwGridListaDokumentowPlatnika);
				} else {
					alert('Eksportowane dokumenty muszą być w tej samej wersji KEDU.')
				}
			});
    };

    this.onImportStart = function() {
        obwUtils.showSendActionSplash();
    };

    this.onImport = function() {

        var uploaderId = obwImportPlatnikaUploaderId.getUploaderId();
        var contentVar = {
            'uploaderId' : uploaderId
        };
        var args = {
            url : 'obw/dokumentyPlatnika/dodajDokument.npi',
            content : contentVar,
            handleAs : "json",
            sync: false,
            load : function(resp) {

                var komunikat = 'Co najmniej jeden dokument jest nieprawidłowy.';
                if (resp['status'] == 'ok') {
                    komunikat = 'Zaimportowano wybrane dokumenty.';
                    if (resp['robocze'] != null && resp['robocze'] != "" && resp['robocze'] > 0) {
                        komunikat += '\nIlość dokumentów zaimportowanych: ' + resp['robocze'] + '.';
                    }

                    obwGridListaDokumentowPlatnika.reload();
                }

                alert(komunikat);

                obwUtils.hideSendActionSplash();
            }
        };
        dojo.xhrPost(args);
    };
};

var obwDokumentyPlatnika = new ObwDokumentyPlatnika();
