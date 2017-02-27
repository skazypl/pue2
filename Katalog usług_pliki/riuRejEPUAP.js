function RiuRejEPUAP() {
		
	this.infoDalej = function(urlAction) {
		var epuapOKDalejButton = dijit.byId("epuapOKDalejButtonId");
		epuapOKDalejButton.set('disabled', true);
		menuSelect(urlAction);
	},
	
	/**
	 * wypelnia i blokuje do edycji dane identyfikacyjne na formularzu,
	 * przycina informacje o rejestracji z nipem, podpina akcje logowania pod przycisk
	 */
	this.przygotujFormularz = function(daneProfilu, bladUrl, redirectUrl, rejEpuapUrl) {
    	riuRejPodpis.zablokujDaneIdentyfikacyjne();
		var riuNazwisko = dijit.byId("riuNazwisko");
    	riuNazwisko.set('value', daneProfilu['nazwisko']);
    	var riuImiePierwsze = dijit.byId("riuImiePierwsze");
    	riuImiePierwsze.set('value', daneProfilu['imie']);
    	var pesel = dijit.byId("pesel");
    	pesel.set('value', daneProfilu['pesel']);
    	var dataUrodzenia = dijit.byId("dataUrodzenia");
    	var data = riu.dataUrodzeniaZPeselu(daneProfilu['pesel']);
    	dataUrodzenia.set('value', data);
    	riuRejPodpis.wytnijInformacjePodawaniaNip();
    	var zalogujButton = dijit.byId("riuRejSukcesButtonId");
    	zalogujButton.set('text', "Zaloguj do portalu");
    	zalogujButton.onClick = function() {
    		riu.logowanieEPUAP(bladUrl, redirectUrl, rejEpuapUrl)
    	}        	
	}
	
	this.inicjalizacjaFormularza = function(weryfikujUrl, bladUrl, redirectUrl, rejEpuapUrl) {
		var w = dijit.byId("wizardId");
    	var regulaminPane = dijit.byId("regulaminRejestracjaPaneId");
    	var formularzPane = dijit.byId("riuRejEPUAPFormularzPaneId");
		var args = {
	        url : weryfikujUrl,
	        handleAs : "json",
	        sync : true,
	        load : function(resp) {
	        	if(riu.komunikatBledu == riu._BRAK_PROFILU_UMOZLIWIENIE_REJESTRACJI) {
	        		// rejestracja przy logowaniu
	        		riuRejEPUAP.przygotujFormularz(riu._brakProfiluRejDane.daneProfilu, bladUrl, redirectUrl, rejEpuapUrl);
	        		// najpierw trzeba pokazac regulamin
	    	    	w.selectChild(regulaminPane);
	        	} else {
	        		// normalna rejestracja
	        		// przechodzimy do formularza
	        		w.selectChild(formularzPane);
		        	var daneProfilu = null;
		        	var zweryfikowany = false;
		            if(resp != null && (daneProfilu = resp['daneProfilu']) != null && (zweryfikowany = resp['zweryfikowany']) == true) {
		            	// nie ma bledu - wypelnienie formularza
		            	riuRejEPUAP.przygotujFormularz(daneProfilu, bladUrl, redirectUrl, rejEpuapUrl);
		            } else if(resp != null && resp['blad'] != null){
		            	// byl blad - wyswietlenie komunikatu
		            	var komunikatBledu = resp['blad'];
		            	var alertArgs = {
	            			_onHide : function() {
	            				riu.przejdzNaStroneGlowna();
	        				},
	        				content : komunikatBledu
		            	}
		            	var a = zusnpi.dialog.Alert(alertArgs);
		            	a.show();
		            } 
	        	}
	        }
	    };
	    dojo.xhrPost(args);	
	},
	
	this.wyslijFormularz = function(urlAction) {
		var form = dijit.byId("riuRejEPUAPFormId");
		form.validate();
		if(form.isValid()) {
			var submitButton = dijit.byId("riuRejEPUAPSubmitButtonId");
			submitButton.set('disabled', true);
			var splash = new zusnpi.layout.splash.Splashscreen({
			    parentId : 'riuRejEPUAPFormId', 
			    text : 'Proszę czekać', 
			    additionalText : 'Trwa proces rejestracji profilu...', 
			    timeoutMillis : 1800000
		    });
			splash.show();
			var args = {
			        url : urlAction,
			        form : dojo.byId('riuRejEPUAPFormId'),
			        handleAs : "json",
			        sync : false,
			        load : function(resp) {
			        	var wynik = false;
			        	var captcha = false;
			        	var komunikatBledu = null;
			        	var login = null;
			        	var wizard = dijit.byId("wizardId");
			        	if(resp != null) {
			        		wynik = resp['wynik'];
			        		captcha = resp['captcha'];
			        		komunikatBledu = resp['komunikatBledu'];
			        		login = resp['login'];
			        	}
			        	if (!wynik && komunikatBledu != null) {
			        		var infoFieldErrorPane = dijit.byId("infoFieldError");
			        		infoFieldErrorPane.setContentValue(komunikatBledu);
			        		wizard.selectChild(dijit.byId("riuRejEPUAPBladPaneId"));
			        	} else if (wynik && login != null) {
			        		var loginPUETextbox = dijit.byId("loginPUE");
			        		loginPUETextbox.set('value', login);
			        		wizard.selectChild(dijit.byId("riuRejEPUAPSukcesPaneId"));
			        		riu.wyswietlenieOstrzezenia(resp['ostrzezenie'], 'ostrzezenieFieldsetId', 'ostrzezenieInfoFieldId');
			        	}
			        	splash.hide();
			        }
			    };
		    dojo.xhrPost(args);	
		}
	}
}

var riuRejEPUAP = new RiuRejEPUAP();