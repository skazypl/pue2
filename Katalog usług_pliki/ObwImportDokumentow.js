function ObwImportDokumentow() {

	this.roles = [];

	/**
	 * Wywoływane na on load dialogu improtu dokumentów. Czyści sesję i
	 * wyświetlaną listę z ewentualnych pozostałości po poprzednich uplaodach
	 */
	this.obwImportDokumentowDialogOnShow = function() {
		obwUtils.log('start');
		obwImportDokumentowButtonId.setAttribute('disabled', true);
		obwImportUsunDuplikatyButtonId.setAttribute('disabled', true);
		obwImportDokumentow.wyswietlPliki(null);
		obwProgressBar.clear();

		var args = null;
		args = {
			url : 'obw/importDokumentow/wyczyscListe.npi',
			timeout : 1000
		};
		dojo.xhrPost(args);
		obwUtils.log('koniec');
	};

	/**
	 * Zamknięcie okna importu dokumentów
	 */
	this.obwImportDokumentowDialogOnAnuluj = function() {
		obwProgressBar.cancelProgress();
		dojo.byId('obwImportDokumentowAjaxLoader').style.visibility = 'hidden';
		importDokumentowDialog.hide();
		obwImportUploaderId.resetUploader();
		var args = null;
		args = {
			url : 'obw/importDokumentow/wstrzymajImport.npi'
		};
		dojo.xhrPost(args);

	};

	/**
	 * Funkcja wywoływana na zakończenie akcji uploadu pliku na serwer Pobiera z
	 * sesji bieżącą listę zuploadowanych plików wraz z ich statusami i
	 * wyświetla w dialogu
	 */
	this.filesUploadOnComplete = function() {
		// zainicjowanie progresu
		obwProgressBar.clear();
		obwProgressBar.init();
		dojo.byId('obwImportDokumentowAjaxLoader').style.visibility = '';
		var uploaderId = obwImportUploaderId.getUploaderId();
		var contentVar = {
			'uploaderId' : uploaderId
		};
		var args = {
			url : 'obw/importDokumentow/listaWczytanych.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp) {
				if (resp["blad"]) {
					alert(resp["blad"]);
				}
				obwImportDokumentow.wyswietlPliki(resp);
				obwUtils.log("Pliki po załadowaniu" + resp["dane"]);
				dojo.byId('obwImportDokumentowAjaxLoader').style.visibility = 'hidden';
			},
			error : function() {
				obwProgressBar.cancelProgress();
				obwProgressBar.clear();
			}
		};
		dojo.xhrPost(args);
		obwImportUploaderId.resetUploader();
	};

	/**
	 * Wyświetla pliki zapisane w sesji i przekazane w odpowiedzi z serwera
	 */
	this.wyswietlPliki = function(resp) {
		if (resp != null) {
			obwImportDokumentow.zapiszWybraneRole();
			dijit.byId('obwImportDokumentowId').attr('content', '');
			danePlikow = resp["dane"];
			obwImportDokumentow.utworzListePlikow(danePlikow,
					'obwImportDokumentowId', true);
			if (resp["podsumowanie"] != null) {
				var dialogAlertu = new zusnpi.dialog.AlertCustom({
					dialogHeight : '350px',
					dialogWidth : '650px',
					content : resp["podsumowanie"],
					iconPath : "css/img/error.png"
				});
				dialogAlertu.onOkClick = function() {
					dialogAlertu.hide();
				};
				dialogAlertu.show();
				/*
				 * alert({dialogHeight : '150px', dialogWidth :
				 * '650px',resp["podsumowanie"]});
				 */
			}
		} else {
			obwImportDokumentow.utworzListePlikow(null,
					'obwImportDokumentowId', true);
		}
	};

	/**
	 * Tworzy listę wyświetlanych plików na postawie przekazanych parametrów
	 */
	this.utworzListePlikow = function(danePlikow, idElementu, usunLink) {
		var status = false;
		var duplikaty = false;
		obwUtils.log("Dane plikow" + danePlikow);

		if (danePlikow != null && danePlikow[0] != null) {
			new dijit.layout.ContentPane({
				content : ''
			}).placeAt(dijit.byId(idElementu).domNode, 'only');
		} else
			new dijit.layout.ContentPane({
				content : '<i>Brak wczytanych plików</i>'
			}).placeAt(dijit.byId(idElementu).domNode, 'only');
		var numerSekcji = -1;
		dojo.forEach(danePlikow, function(entry, i) {
			if (entry["sekcja"] != null && entry["sekcja"] != numerSekcji) {
				numerSekcji = entry["sekcja"];
				obwImportDokumentow.utworzNaglowekSekcji(idElementu,
						entry["nazwaSekcji"]);
			}
			obwImportDokumentow.utworzPojedynczyWpis(++i, entry, usunLink,
					idElementu);
			if (entry['status'] == true) {
				status = true;
			}
			if ((numerSekcji == 11) || (numerSekcji == 12)) {
				duplikaty = true;
			}
			// if((entry['prawidlowyRozmiar'] == true) && entry['status'] ==
			// true)
			// {
			// status = true;
			// }
		});

		// ustaw możliwość importu, jeśli przynajmniej jeden z plików jest
		// poprawn
			obwImportDokumentowButtonId.setAttribute('disabled', !status);
		// ustaw możliwość usunięcia dubli, jeśli takie istnieją
		obwImportUsunDuplikatyButtonId.setAttribute('disabled', !duplikaty);
	};

	this.utworzNaglowekSekcji = function(idElementu, nazwaSekcji) {
		// var naglowekSekcji = '<div style="text-align:center"><hr
		// style="width:30%;float:left"/>'+nazwaSekcji+'<hr
		// style="width:30%;float:right"/></div><br/>';
		var naglowekSekcji = '<div style="text-align:center"><hr/></div><br/>';
		new dijit.layout.ContentPane({
			content : naglowekSekcji
		}).placeAt(dijit.byId(idElementu).domNode, 'last');
	};

	/**
	 * Tworzy wpis dla pojedynczego pliku na liście do importu
	 */
	this.utworzPojedynczyWpis = function(i, entry, usunLink, idElementu) {
		var uploaderId = obwImportUploaderId.getUploaderId();
		// var status;
		//		
		// if(entry['prawidlowyRozmiar'] == false)
		// {
		// status = 'Nieprawidłowy rozmiar pliku.';
		// }
		// else if(entry['status'] == false)
		// {
		// status = 'Dokument niepoprawny.';
		// }
		// else
		// {
		// status = 'OK - typ ' + entry['typ'];
		// }
		//		
		var status = entry['status'];
		var info = entry['info'];
		if (info == null)
			info = "";
		var typ = entry['typ'];

		var opis = info;

		opis = obwUtils.getBoldedText(opis, status);
		opis = obwUtils.getErrorText(opis, !status);
		var warning = obwUtils.getOrangeText(entry['warning']);

		var plikItem = i
				+ ': '
				+ entry['nazwa']
				+ '&nbsp;'
				+ obwUtils.getMenuLink('Pobierz',
						'obwImportDokumentow.pobierzPlik(\''
								+ entry["id"]["fullId"] + '\', ' + uploaderId
								+ ');')
				+ (usunLink ? ('&nbsp;' + obwUtils.getMenuLink('Usuń',
						'obwImportDokumentow.usunPlik(\''
								+ entry["id"]["fullId"] + '\', ' + uploaderId
								+ ');')) : '') + " " + opis + "  " + warning;
		var j = i;

		var poprawnaRola = obwImportDokumentow.roles[j - 1];

		var contentVar = {
			'type' : entry['typ']
		};

		var args = {
			url : 'obw/importDokumentow/pobierzRoleDlaDokumentu.npi',
			sync : true,
			content : contentVar,
			handleAs : "json",
			load : function(resp) {
				if (resp["rolesExist"] && status) {
					var comboBox = '<div style="margin: 5px;"> Wybierz rolę dla dokumentu: <select style="width: 70%;" data-dojo-type="dijit.form.Select" id="roles'
							+ j + '" name="roles' + j + '">';

					var rolesList = resp["roles"];

					for ( var i = 0; i < rolesList.length; i++) {
						var role = rolesList[i];
						if (poprawnaRola == role.roleId) {
							comboBox += '<option selected="selected" value="'
									+ role.roleId + '" >';
						} else {
							comboBox += '<option value="' + role.roleId + '">';
						}

						if (role.role != 'OGOLNA') {
							comboBox += obwUtils.decodeRole(role.role) + ' - '
									+ role.contextName;
						} else {
							comboBox += obwUtils.decodeRole(role.role);
						}

						comboBox += '</option>';
					}

					comboBox += '</select> </div>';
					plikItem += comboBox;
				} else {
					plikItem += '<div style="margin-bottom: 15px;"/>';
				}

				new dijit.layout.ContentPane({
					content : plikItem
				}).placeAt(dijit.byId(idElementu).domNode, 'last');
			}
		};
		dojo.xhrPost(args);
	};

	this.obwImportDokumentowDialogOnHide = function() {
		var i = 0;
		while (i < 100) {
			var role = dijit.byId('roles' + i);
			if (role) {
				role.destroyRecursive(true);
			}
			i++;
		}
	};

	this.zapiszWybraneRole = function() {
		var i = 0;
		obwImportDokumentow.roles = [];
		while (i < 100) {
			var role = dijit.byId('roles' + i);

			if (role && role.value) {
				obwImportDokumentow.roles[i - 1] = role.value;
			}
			i++;
		}
	};

	/**
	 * Tworzy link umożliwiający pobranie zuploadowanego pliku
	 */
	this.pobierzPlik = function(id, uploaderId) {
		tempId = id;
		tempIdUploader = uploaderId;

		if (tempId == null) {
			obwUtils.log('Nie ustawiono id');
			return;
		}

		if (tempIdUploader == null) {
			obwUtils.log('Nie ustawiono uploader id');
			return;
		}

		var args = null;
		args = {
			url : 'obw/importDokumentow/pobierz.npi',
			content : {
				'id.fullId' : tempId,
				'uploaderId' : tempIdUploader
			},
			timeout : 1000,
			load : function(resp) {
				dojo.io.iframe.send({
					timeout : 1000,
					url : 'downloadFile.npi',
					form : "GRID_EXPORT_FORM_ID"
				});
			}

		};
		dojo.xhrPost(args);
	};

	/**
	 * Tworzy link umożliwiający usunięcie zuploadowanego pliku
	 */
	this.usunPlik = function(id, uploaderId) {
		tempId = id;
		tempUploaderId = uploaderId;
		confirm({		
			title : 'Potwierdzenie usunięcia pliku',
			content : 'Czy na pewno chcesz usunąć wybrany plik z listy importowanych dokumentów?',
			onOkClick : function() {
					var contentVar = {
					'id.fullId' : tempId,
					'uploaderId' : tempUploaderId
				};
				var args = {
					url : 'obw/importDokumentow/usun.npi',
					content : contentVar,
					handleAs : "json",
					load : function(resp) {
						obwImportDokumentow.wyswietlPliki(resp);
						console.log("Pliki po usunieciu :" + resp["dane"]);

					}
				};
				dojo.xhrPost(args);
			}
			
		});
	};

	/**
	 * Wywołuje akcje importu dokumentów
	 */
	this.obwImportDokumentowDialogOnImport = function() {
		var uploaderId = obwImportUploaderId.getUploaderId();
		obwImportDokumentow.zapiszWybraneRole();

		var contentVar = {
			'uploaderId' : uploaderId,
			'roles' : obwImportDokumentow.roles
		};
		var args = {
			url : 'obw/importDokumentow/importuj.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp) {
				/* var komunikat = 'Brak poprawnych plików do zaimportowania'; */
				var komunikat = 'Conajmniej jeden dokument jest nieprawidłowy.';
				if (resp['stan'] == 'true') {
					komunikat = 'Zaimportowano wybrane dokumenty.';
					if (resp['robocze'] != null && resp['robocze'] != ""
							&& resp['robocze'] > 0)
						komunikat += '\n Ilość dokumentów zaimportowanych do skrzynki roboczej: '
								+ resp['robocze'] + '.';
					if (resp['zlecenia'] != null && resp['zlecenia'] != ""
							&& resp['zlecenia'] > 0)
						komunikat += '\n Ilość dokumentów zaimportowanych do zleceń: '
								+ resp['zlecenia'] + '.';
					alert(komunikat);
					obwGridListaDokumentowRoboczych.sort();
				} else {
					alert(komunikat);
				}
			}
		};
		dojo.xhrPost(args);
		importDokumentowDialog.hide();
	};

	/**
	 * Wywołuje akcję usuwania zdublowanych dokumentów zus-eks (w bazie i na
	 * liście do importu)
	 */
	this.obwImportDokumentowDialogOnUsunDuplikaty = function() {

		var uploaderId = obwImportUploaderId.getUploaderId();
		confirm({
			title : "Potwierdzenie usunięcia duplikatów",
			content : "Czy na pewno chcesz usunąć duplikaty z listy importowanych dokumentów?",
			onOkClick : function() {
				var contentVar = {
					'uploaderId' : uploaderId
				};
				var args = {
					url : "obw/importDokumentow/usunDuplikaty.npi",
					content : contentVar,
					handleAs : "json",
					load : function(resp) {
						if (resp["blad"]) {
							alert(resp["blad"]);
						}
						obwImportDokumentow.wyswietlPliki(resp);
						obwUtils.log("Pliki po usunięciu" + resp["dane"]);
						dojo.byId('obwImportDokumentowAjaxLoader').style.visibility = 'hidden';
					},
					error : function() {
					}
				};
				dojo.xhrPost(args);
			}
		});
	};
}

var obwImportDokumentow = new ObwImportDokumentow();