var wizytyUtils = {

	sklejAdresLokalizacjiTjo : function(lokalizacjaTjo) {
		var tmp = '';
		tmp = lokalizacjaTjo.ulica + String.fromCharCode(160) + lokalizacjaTjo.nrDomu;
		if (lokalizacjaTjo.nrLokalu && lokalizacjaTjo.nrLokalu.length > 0) {
			tmp = tmp + '/' + lokalizacjaTjo.nrLokalu;
		}
		if (lokalizacjaTjo.nazwaSali && lokalizacjaTjo.nazwaSali.length > 0) {
			tmp = tmp + ', ' + lokalizacjaTjo.nazwaSali;
		}

		tmp = tmp + ', <br />' + lokalizacjaTjo.kodPocztowy + String.fromCharCode(160) + lokalizacjaTjo.miejscowosc;
		return tmp;
	},

	formatujGrupeSprawOld : function(nazwaGrupySprawNadrzednej, nazwaGrupySpraw) {
		var output = "<div style='vertical-align: middle;'><b>" + nazwaGrupySprawNadrzednej + "</b><li style='padding-left:20px'>" + nazwaGrupySpraw + "</li></div>";
		return output;
	},

	formatujGrupeSpraw : function(nazwaGrupySprawNadrzednej, nazwaGrupySpraw) {
		var output = nazwaGrupySprawNadrzednej + "<br />&nbsp;&nbsp;&nbsp; <i>" + nazwaGrupySpraw + "</i>";
		return output;
	},

	sklejGrupySpraw : function(grupySpraw) {
		if (!grupySpraw || grupySpraw == null) {
			return "";
		}
		var jsonTree = this.convertGrupySprawToJsonTree(grupySpraw);
		var tmp = "<ul style=\"padding-left:15px\" >";
		dojo.forEach(jsonTree.items, function(grupaNadrzedna, i) {
			tmp += "<li><b>" + grupaNadrzedna.label + "</b></li>";
			tmp += "<ul style=\"padding-left:15px\">";
			dojo.forEach(grupaNadrzedna.children, function(grupaSpraw, i) {
				tmp += "<li tabindex=\"0\">" + grupaSpraw.label + "</li>";
			})
			tmp += "</ul>";
		})
		tmp += "</ul>"

		return tmp;
	},
	convertGrupySprawToJsonTree : function(grupySpraw) {
		var wynik = {
			label : 'label',
			identifier : 'id',
			items : []
		}
		dojo.forEach(grupySpraw, function(entry, i) {
			var newRoot = {
				id : entry.idGrupyNadrzednej,
				label : entry.nazwaGrupyNadrzednej,
				children : []
			}
			var root = null;
			dojo.forEach(wynik.items, function(existingRoot, i) {// znajduje istniejacy root
				if (existingRoot.id == newRoot.id) {
					root = existingRoot;
					return;
				}
			})
			if (!root) {// jezeli nie znaleziono roota to go dodaj
				root = newRoot;
				wynik.items.push(root);
			}
			var newChild = {
				id : entry.idGrupySpraw,
				label : entry.nazwaGrupySpraw
			}
			var child = null;
			dojo.forEach(root.children, function(existingChild, i) {// znajduje istniejace dziecko
				if (existingChild.id == newChild.id) {
					child = existingChild;
					return;
				}
			})
			if (!child) {// jezeli nie znaleziono dziecka to go dodaj
				child = newChild;
				root.children.push(child);
			}
		});
		this._sortJsonTree(wynik);
		return wynik;
	},
	_sortJsonTree : function(jsonTree) {
		var sortByNameFun = function(a, b) {
			if (a.label < b.label)//sort string ascending
				return -1
			if (a.label > b.label)
				return 1
			return 0;
		};
		jsonTree.items.sort(sortByNameFun);
		dojo.forEach(jsonTree.items, function(item, i) {
			item.children.sort(sortByNameFun);
		})
	},
	createGrupySprawTreeModel : function(grupySpraw) {
		var jsonTree = this.convertGrupySprawToJsonTree(grupySpraw);
		var store = new dojo.data.ItemFileReadStore({
			data : jsonTree
		});
		var treeModel = new dijit.tree.ForestStoreModel({
			store : store,
			rootLabel : "Grupy spraw"
		});
		return treeModel;
	},

	formatujIdentyfikatory : function(objectValue, rowNumber, cellInfo) {
		var item = cellInfo.grid.getItem(rowNumber).i;
		var wpisy = new Array();
		// pesel
		var pesel = (item["PESEL"] == null) ? item["pesel"] : item["PESEL"];
		if (pesel != null) {
			wpisy.push("<b>PESEL:</b> " + pesel);
		}
		// nip
		var nip = (item["NIP"] == null) ? item["nip"] : item["NIP"];
		if (nip != null) {
			wpisy.push("<b>NIP:</b> " + nip);
		}
		// dokument tozsamosci
		var dokTozs = item["seriaNrDokumentuTozsamosci"];
		var rodzDokTozs = (item["rodzajDokumentuTozsamosci"] == "Dowód osobisty") ? "Dow.osob." : item["rodzajDokumentuTozsamosci"];
		if (dokTozs != null && rodzDokTozs != null) {
			wpisy.push("<b>" + rodzDokTozs + ":</b> " + dokTozs);
		}
		// wynikowy napis
		var result = "";
		for (var i = 0; i < wpisy.length; i++) {
			result += wpisy[i];
			// pominiecie nowej lini w ostatnim elemencie
			if (i != wpisy.length - 1) {
				result += "<BR/>";
			}
		}
		return result;
	},

	/**
	 * Funkcja odpowiedzialna za drukowanie fragmentu strony zawartej w iFremeId z div'a oznaczonego jako elementToPrintId
	 */
	drukujElement : function(iFrameId, elementToPrintId, opcjeDodatkoweId) {
		try {
			var iFrame = document.getElementById(iFrameId);
			var content = document.getElementById(elementToPrintId).innerHTML;

			/* Określenie jakiego modelu DOM użyć */
			var printDoc = (iFrame.contentWindow || iFrame.contentDocument);
			if (printDoc.document) {
				printDoc = printDoc.document;
			}

			/* Tworzenie dokumentu HTML który będzie zawierać się w iFrame */
			/* Tytuł pojawi się na wydruku */
			printDoc.write("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">");
			printDoc.write("<html><head><title></title>");
			printDoc.write("</head><body onload='this.focus(); this.print();'>");
			printDoc.write("<div style=\'width:100%; display:inline-block\'>");
			printDoc.write("<div style=\'float:left\'><img height=\"80px\" src=\"css/img/logo_zus_2.jpg\"></div>");
			printDoc.write("<div style=\'float:right\'><img height=\"80px\" src=\"css/img/logo_pue_2.jpg\"></div>");
			printDoc.write("</div><br /><br />");
			printDoc.write("<h2><p style='text-align: center;'><b>Potwierdzenie rezerwacji wizyty</b></p></h2>");
			printDoc.write(content);
			if (opcjeDodatkoweId != null) {
				if (dijit.byId(opcjeDodatkoweId).domNode.children.length > 0) {
					printDoc.write("<br /><b>Opcje dodatkowe:</b><br />");
					printDoc.write("<ul>");
					for (var i = 0; i < dijit.byId(opcjeDodatkoweId).domNode.children.length; i++) {
						printDoc.write("<li>");
						printDoc.write(dijit.byId(dijit.byId(opcjeDodatkoweId).domNode.children[i].id.toString()).labelAP.innerHTML);
						printDoc.write("<br />");
						printDoc.write("</li>");
					}
					printDoc.write("</ul>");
				}
			}
			printDoc.write("<br /><p style='text-align: center; font-style:italic;'><b>Proszę wprowadzić login PUE " + "w dyspenserze (biletomacie) <br />systemu kolejkowego po przybyciu do jednostki ZUS</b></p><br />");
			printDoc.write("<p style='text-align:center;font-size:12px'>Dokument sporządzony w systemie Nowy Portal Informacyjny Platforma Usług Elektronicznych dla Klientów ZUS<br /><br />Data wydruku: " + formatDate(new Date(), dateTimePattern) + "</p>");
			printDoc.write("</body></html>");
			printDoc.close();
		}

		// Jeżeli z jakiegoś powodu powyższe instrukcje zawiodą cały dokument zostanie wydrukowany w normalny sposób
		catch(e) {
			self.print();
		}
	},
}
