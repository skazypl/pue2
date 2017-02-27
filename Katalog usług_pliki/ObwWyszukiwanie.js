function ObwWyszukiwanie() {
	/**
	 * Zwraca strukturę listy wiadomości
	 */
	this.getStructure = function() {
		var actionStructure = getStructureFromAction("obw/wyszukiwanie/wyszukiwanieStruktura.npi");
		return {
			
			cells : [ {
				field : actionStructure.ID.field,
				name : actionStructure.ID.name, width:"auto",
				hidden: true
			}, {
				field : actionStructure.OKRESLENIE_NAZWA_OB.field,
				name : actionStructure.OKRESLENIE_NAZWA_OB.name, width:"auto"
			}, {
				field : actionStructure.OKRESLENIE_OBIEKTU_ID.field,
				name : actionStructure.OKRESLENIE_OBIEKTU_ID.name,
				hidden: true
			}, {
				field : actionStructure.OKRESLENIE_TYP_OB.field,
				name : actionStructure.OKRESLENIE_TYP_OB.name, width:"auto",
				formatter: function(val) {
					return obwWyszukiwanie.typColumnFormatter(val);
				}
			} ]
		};

	};
	
	this.typColumnFormatter = function(value)
	{
		if(value=='USLUGA_PUE')
			return "Usługa pue";
		else if(value=='KOMUNIKAT_DO_UZYTKOWNIKA')
			return "Komunikat";
		else if(value=='WIADOMOSC')
			return "Wiadomość";
		else if(value=='SPRAWA')
			return "Sprawa";
		else if(value=='DOKUMENT_ODEBRANY')
			return "Dokument odebrany";
		else if(value=='DOKUMENT_ROBOCZY')
			return "Dokument roboczy";
		else if(value=='DOKUMENT_WYSLANY')
			return "Dokument wysłany";
	}
	
	this.onLoad = function() {
		obwWyszukiwanieGridId.set('callUserDefinedPostLoad', function(){});
		dojo.xhrPost({
			url: "obw/daneWyszukania.npi",
			handleAs: "json",
			load: function(resp) {
				if(resp.searchTerm) {
					wyszukiwanieCo.set('value', resp.searchTerm);
				}
				wyszukiwanieGdzie.setStore(obwWyszukiwanie.getSearchTypeStore(resp.comboValues));
				if(resp.typeName) {
					wyszukiwanieGdzie.setValue(resp.typeName);
				}
				
				if(resp.searchTerm && resp.typeName) {
					obwWyszukiwanie.reloadWyszukiwanieGrid();
				}
			}
		});
		wyszukiwanieCo.focus();
	};
	
	this.getSearchTypeStore = function(values) {
		return new dojo.data.ItemFileReadStore({data : values});
	};
	
	this.search = function() {
		return {
		     "wyszukiwanieCo": {
		          value: wyszukiwanieCo.get('value'),
		          datatype: 'string'
		     },
		     "wyszukiwanieGdzie": {
		          value: wyszukiwanieGdzie.get('value'),
		          datatype: 'string'
		     }
		};
	};
	
	this.searchClickButton = function() {
		obwWyszukiwanie.reloadWyszukiwanieGrid();
	};
	
	this.changeButtonPokazState = function(rec){
		if(rec!=null)
			dijit.byId("obwWyszukiwanieButtonPokaz").setAttribute('disabled', false);
		else
			dijit.byId("obwWyszukiwanieButtonPokaz").setAttribute('disabled', true);
	}
	
	this.przejdzDoElementu = function() {
		var rec = obwWyszukiwanieGridId.getSelectedRecord();
		obwUtils.log("Rec",rec);
		if(rec!=null){
			var selectedId = rec['okreslenieObiektu.id.fullId'];
			var idInt = selectedId.substring(selectedId.indexOf('&')+1,selectedId.indexOf(';'));
			if(rec['okreslenieObiektu.typOb']=='USLUGA_PUE')
			{
				obwUtils.log("Przejscie do uslugi");
				obwKatalogUslug.uslugaCustomFiltrSingleId=idInt;
				dojo.hash("KUS0001");
			}
			else if(rec['okreslenieObiektu.typOb']=='KOMUNIKAT_DO_UZYTKOWNIKA')
			{
				obwUtils.log("Przejscie do komunikatu");
				obwKomunikaty.komunikatCustomFilterId=idInt;
				dojo.hash("OBW0041");
			}
			else if(rec['okreslenieObiektu.typOb']=='WIADOMOSC')
			{
				obwUtils.log("Przejscie do wiadomosci");
				obwWiadomosci.wiadomoscCustomFilterId = idInt;
				dojo.hash("OBW0001");
			}
			else if(rec['okreslenieObiektu.typOb']=='SPRAWA')
			{
				obwUtils.log("Przejscie do sprawy");
				obwSprawy.sprawaCustomFilterId = idInt;
				dojo.hash("OBW0051");
			}
			else if(rec['okreslenieObiektu.typOb']=='DOKUMENT_ODEBRANY')
			{
				obwUtils.log("Przejscie do dokumentu odebranego");
				obwSkrzynkaOdbiorcza.dokumentOdebranyCustomFilterId=idInt;
				dojo.hash("OBW0011");
			}
			else if(rec['okreslenieObiektu.typOb']=='DOKUMENT_ROBOCZY')
			{
				obwUtils.log("Przejscie do dokumentu roboczego");
				obwDokumentyRobocze.dokumentRoboczyCustomFilterId = idInt;
				dojo.hash("OBW0031");
			}
			else if(rec['okreslenieObiektu.typOb']=='DOKUMENT_WYSLANY')
			{
				obwUtils.log("Przejscie do dokumentu wyslanego");
				obwDokumentyWyslane.dokumentWyslanyCustomFilterId = idInt;
				dojo.hash("OBW0021");
			}
		}
	}
	
	this.reloadWyszukiwanieGrid = function() {
		if(obwWyszukiwanieGridId.get('dataLoadingDisabled') == true) {
			dojo.style(obwWyszukiwanieGridId.domNode, "display", "block");
			obwWyszukiwanieGridId.update();
			obwWyszukiwanieGridId.setDataLoadingDisabled(false);
		}
		obwWyszukiwanieGridId.filterGridWithCustomFilter();
	};
	
	this.wyszukiwanieCoKeyPress = function(event){
		var keyCode = event.keyCode ? event.keyCode : event.which;
			if (keyCode == 13){
			obwWyszukiwanie.searchClickButton();
		}
	};


}

var obwWyszukiwanie = new ObwWyszukiwanie();