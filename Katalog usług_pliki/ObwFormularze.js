function ObwFormularze()
{
	this.kod_formularza = "";
	this.id_dokumentu = "";
	this.tryb_formularza = "";
	this.sygnatura_sprawy = null;
    this.kod_typu_roli = "";
    this.wybrana_rola = "";
	
	this.searchFormularze = function() {
		var inList = "";
		if (emrnt.get('value')) inList += "'EMRNT', ";
		if (emrzagr.get('value')) inList += "'EMRZAGR', ";
		if (kszs.get('value')) inList += "'KSZS', ";
		if (plsk.get('value')) inList += "'PLSK', ";
		if (poz.get('value')) inList += "'POZ', ";
		if (prireh.get('value')) inList += "'PRIREH', ";
		if (ubezp.get('value')) inList += "'UBEZP', ";
		if (wisl.get('value')) inList += "'WISL', ";
		if (zas.get('value')) inList += "'ZAS', ";
		if (uuo.get('value')) inList += "'UUO', ";
		if (kp.get('value')) inList += "'KP', ";
		if (sw.get('value')) inList += "'SW', ";
		if (inList.length > 1) inList = inList.substring(0, inList.length - 2);
		if (inList.length > 0) {
			return {
				KodGrupy: {
					value : inList,
					datatype : 'string'
				}
			}
		}
		return {
			KodGrupy: {
				value : "'empty'",
				datatype : 'string'
			}
		}
	};
	
	this.dodajDokumentRoboczyOnClick = function()
	{
		gridListaFormularzy.filterGridWithCustomFilter();
		obwFormularze.disableCheckBoxes();
	};
	
	this.zaznaczWszystkie = function()
	{
		if(all.checked){
			emrnt.set('checked', true);
			emrzagr.set('checked', true);
			kszs.set('checked', true);
			plsk.set('checked', true);
			poz.set('checked', true);
			prireh.set('checked', true);
			ubezp.set('checked', true);
			wisl.set('checked', true);
			zas.set('checked', true);
			uuo.set('checked', true);
			kp.set('checked', true);
			sw.set('checked', true);
		} else {
			emrnt.set('checked', false);
			emrzagr.set('checked', false);
			kszs.set('checked', false);
			plsk.set('checked', false);
			poz.set('checked', false);
			prireh.set('checked', false);
			ubezp.set('checked', false);
			wisl.set('checked', false);
			zas.set('checked', false);
			uuo.set('checked', false);
			kp.set('checked', false);
			sw.set('checked', false);
		}
		obwFormularze.dodajDokumentRoboczyOnClick();
	};
	
	this.enableCheckBoxes = function()
	{
		console.log('enable');
		emrnt.set('disabled', false);
		emrzagr.set('disabled', false);
		kszs.set('disabled', false);
		plsk.set('disabled', false);
		poz.set('disabled', false);
		prireh.set('disabled', false);
		ubezp.set('disabled', false);
		wisl.set('disabled', false);
		zas.set('disabled', false);
		uuo.set('disabled', false);
		kp.set('disabled', false);
		sw.set('disabled', false);
		all.set('disabled', false);
	};

	
	this.disableCheckBoxes = function()
	{
		console.log('disable');
		emrnt.set('disabled', true);
		emrzagr.set('disabled', true);
		kszs.set('disabled', true);
		plsk.set('disabled', true);
		poz.set('disabled', true);
		prireh.set('disabled', true);
		ubezp.set('disabled', true);
		wisl.set('disabled', true);
		zas.set('disabled', true);
		uuo.set('disabled', true);
		kp.set('disabled', true);
		sw.set('disabled', true);
		all.set('disabled', true);
	};

	this.gridListaFormularzyPostLoad = function()
	{
		obwFormularze.enableCheckBoxes();
	};

	/**
	 *
	 */
	this.getStructure = function()
	{
		var actionStructure = getStructureFromAction("obw/typyDokumentow/getStructure.npi");
		return {
			cells : [ {
				field : actionStructure.ID.field,
				hidden : true
			}, {
				field : actionStructure.NAZWA.field,
				name : actionStructure.NAZWA.name,
				width : '150px'
			}, {
				field : actionStructure.KOD.field,
				hidden : true
			}, {
				field : actionStructure.OPIS.field,
				name : actionStructure.OPIS.name,
				width : 'auto'
			},
			{
				field : actionStructure.MOZLIWE_ZALACZNIKI.field,
				name : actionStructure.MOZLIWE_ZALACZNIKI.name,
				datatype : 'bool',
				hidden: true
				
			},
			{
				field : actionStructure.INICJUJE_SPRAWE.field,
				name : actionStructure.INICJUJE_SPRAWE.name,
				datatype : 'bool',
				hidden: true
			}/*,
			
			{				
				name : "Załączniki / Sprawa",				
				width : '90px',
				filterable : false,
				sortable : false,
				formatter : function(value, rowIndex)
				{
					var rec = getGridObject().getRecordForIndex(rowIndex);
					var isZalaczniki = true == rec["mozliweZalaczniki"];
					var isSprawa =  true == rec["inicjujeSprawe"];
					var result = (isZalaczniki ? 'tak':'nie') + ' / ' + (isSprawa ? 'tak':'nie')
					return result;
				}								
			}*/
			
			]
		};
	};
	
	/**
	 * Wywoływane w momwncie podglądu wzoru dokumentu w SOF z wyboru typu dokuementu do utworzenia
	 */
	this.wyswietlFormularzSOFPustyOdczyt = function(typFormularza, wersjaWzoruDok, wersjaFormularza)
	{
		obwUtils.log("wyswietlFormularzSOFPustyOdczyt: typFormularza=" + typFormularza);
		
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setWersjaWzoruDok(wersjaWzoruDok);
		sofFormContainer.setWersjaWzoruDok(wersjaFormularza);
		sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().PODGLAD);
		sofFormContainer.wczytajFormularz();
	};
	
	/**
	 * Wywoływane w momwncie podglądu wzoru dokumentu w SOF z wyboru typu dokuementu do utworzenia
	 */
	this.wyswietlFormularzSOFPustyWydruk = function(typFormularza, wersjaWzoruDok, wersjaFormularza)
	{
		obwUtils.log("wyswietlFormularzSOFPustyOdczyt: typFormularza=" + typFormularza);
		
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setWersjaWzoruDok(wersjaWzoruDok);
		sofFormContainer.setWersjaWzoruDok(wersjaFormularza);
		sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().WYDRUK_PUSTEGO);
		sofFormContainer.wczytajFormularz();
	};
	
	/**
	 *
	 */
	this.wyswietlFormularzSOFTworzenieNowego = function(typFormularza, idDokumentu)
	{
		obwUtils.log("wyswietlFormularzSOFTworzenieNowego: typFormularza=" + typFormularza+ " id_dokumentu=" + idDokumentu);

		obwDokumentyRobocze.czyDokumentPrzeznaczonyDoWysylki(function () {
			sofFormContainer.resetSofRequestParams();
			sofFormContainer.setKodTypuDok(typFormularza);
			sofFormContainer.setIdDokumentu(idDokumentu);
			sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().TWORZENIE_NOWEGO);
			sofFormContainer.wczytajFormularz();
		});
	};
	
	/**
	 * Wykorzystywane w wyborze sposobu wizualizacji formularza
	 */
	this.wyswietlFormularzSOFOdczytDokumentu = function(typFormularza, wersjaWzoruDok, wersjaFormularza, idDokumentu)
	{
		obwUtils.log("wyswietlFormularzSOFOdczytDokumentu: typFormularza=" + typFormularza + " id_dokumentu=" + idDokumentu);
		obwUtils.log("wersjaWzoruDok: " + wersjaWzoruDok);
		obwUtils.log("wersjaFormularza: " + wersjaFormularza);
	
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setWersjaWzoruDok(wersjaWzoruDok);
		sofFormContainer.setWersjaFormularza(wersjaFormularza);
		sofFormContainer.setIdDokumentu(idDokumentu);
		sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().PODGLAD);
		sofFormContainer.wczytajFormularz();
	};
	
	/**
	 * Wywoływane podczas tworzenia i edycji dokuemntu
	 */
	this.wyswietlFormularzSOFEdycjaDokumentu = function(typFormularza, idDokumentu)
	{
		obwUtils.log("wyswietlFormularzSOFEdycjaDokumentu: typFormularza=" + typFormularza + " id_dokumentu=" + idDokumentu);

		obwDokumentyRobocze.czyDokumentPrzeznaczonyDoWysylki(function () {
			sofFormContainer.resetSofRequestParams();
			sofFormContainer.setKodTypuDok(typFormularza);
			sofFormContainer.setIdDokumentu(idDokumentu);
			sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().REDAGOWANIE);
			sofFormContainer.wczytajFormularz();
		});
	};
	
	
	
	/**
	 *
	 */
	this.wyswietlFormularzSOFPodgladPdf = function(typFormularza, idDokumentu)
	{
		obwUtils.log("wyswietlFormularzSOFPodgladPdf: typFormularza=" + typFormularza + " id_dokumentu=" + idDokumentu);
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(typFormularza);
		sofFormContainer.setIdDokumentu(idDokumentu);
		sofFormContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().PODGLAD_PDF);
		sofFormContainer.wczytajFormularz();
	};	

	/**
	 *
	 */
	this.wswietlFormularzSOF = function(rowIndex)
	{
		obwUtils.log("wswietlFormularzSOF: kod_formularza=" + this.kod_formularza + " id_dokumentu=" + this.id_dokumentu + " tryb_formularza=" + this.tryb_formularza);
		sofFormContainer.resetSofRequestParams();
		sofFormContainer.setKodTypuDok(this.kod_formularza);
		if (this.id_dokumentu != null)
			sofFormContainer.setIdDokumentu(this.id_dokumentu);
		if (this.tryb_formularza != null)
			sofFormContainer.setTrybFormularza(this.tryb_formularza);
		sofFormContainer.wczytajFormularz();
	};

	/**
	 * Tworzy nowy dokument w określonym kontekscie wywołania
	 * @param kodTypuDokumentu
	 * @param roleId
	 * @param kontekst
	 * @param sygnatura_sprawy
	 * @param parametryWywolania
	 */
	this.utworzDokumentWKontekscie = function(kodTypuDokumentu, roleId,kontekstWywolania, sygnatura_sprawy, parametryWywolania){
		obwUtils.obwShowSplash();
		dojo.xhrPost({
			//url : "SOF/utworzNiesformalizowany.npi",
			url : "obw/dokumentyNiesformalizowane/utworzNowy.npi",
			content : {
				"kodTypuDokumentu" : kodTypuDokumentu,
				"roleId" : roleId,
				"sygnatura" : sygnatura_sprawy,
				"parametryWywolania": parametryWywolania,
				"kontekstWywolania": kontekstWywolania
			},
			handleAs : "json",
			load : function(resp, ioArgs)
			{
				obwDokumentyRobocze.idDokumentuDoZaznaczenia = resp;
				obwDokumentyRobocze.typ=kodTypuDokumentu
				obwDokumentyRobocze.zaznaczDokumentRoboczy = true;
				obwDokumentyRobocze.otworzDokumentPoZaladodaniu = false;
				obwDokumentyRobocze.otworzFormularz = true;
				obwUtils.obwHideSplash();
				dojo.hash("OBW0031");

			},
			error : function(resp)
			{
				console.log("Error : ", resp);
				obwUtils.obwHideSplash();

			}
		});

	};

	/**
	 * Tworzenie nowego dokumentu o przekazanym kodzie typu dokumentu
	 */
	this.utworzDokument = function(kodTypuDokumentu, roleId, sygnatura_sprawy, parametryWywolania, typRoli, idKsiZus, czyRolaInna)
	{

		obwUtils.disableButton('obwDokumentyRoboczeWyslijDokument');
		obwUtils.log("utworzDokument: kodTypuDokumentu=" + kodTypuDokumentu);
        obwUtils.log("utworzDokument: idKsiZus=" + idKsiZus);
        obwUtils.log("utworzDokument: typRoli=" + typRoli);

        _this = this;
		this.kod_formularza = kodTypuDokumentu;

		dojo.xhrPost({
			//url : "SOF/utworzNiesformalizowany.npi",
			url : "obw/dokumentyNiesformalizowane/utworzNowy.npi",
			content : {
				"kodTypuDokumentu" : this.kod_formularza,
				"roleId" : roleId,
				"sygnatura" : sygnatura_sprawy,
				"parametryWywolania": parametryWywolania,
                "typRoli": typRoli,
                "idKsiZus" : idKsiZus,
                "czyRolaInna" : czyRolaInna
			},
			handleAs : "json",
			load : function(resp, ioArgs)
			{
				obwUtils.log("utworzDokument->onLoad: " + resp);
				_this.id_dokumentu = resp;
                _this.zapiszOswiadczenieMetadokumentu(idKsiZus);
                wyborTypuFormularzaDialog.hide();
                if (_this.kod_formularza === "ZUS-OK-WUD-01") {
                    obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
                    obwDokumentOkWudPodstawaPrawnaDialog.show();
                } else {
                    obwDokumentyRobocze.ustawSelekcjeNaLiscie(_this.id_dokumentu, _this.kod_formularza);
                    obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
                }
			},
			error : function(resp)
			{
				console.log("Error : ", resp);
				
				obwUtils.enableButton('obwDokumentyRoboczeWyslijDokument');
			}
		});
	};

	/**
	 *
	 */
	this.ustawDaneDokumentu = function(kodTypuDokumentu, idDokumentu, trybFormularza)
	{
		obwUtils.log("ustawDaneDokumentu: kod typu=" + kodTypuDokumentu +"  id dokumentu=" + idDokumentu + "  tryb=" + trybFormularza);
		this.kod_formularza = kodTypuDokumentu;
		this.id_dokumentu = idDokumentu;
		this.tryb_formularza = trybFormularza;
	};
	
	this.ustawSygnatureSprawy = function(sygnatura_sprawy){
		obwFormularze.sygnatura_sprawy = sygnatura_sprawy;
	}
	
	/**
	 * Wywoływane w momencie wyboru typu formularza i wybraniu "Utwórz"
	 */
	this.obwWyborTypuFormularzaDialogOnUtworz = function(data)
	{
		var rec = sprawdzZaznaczenieTypuDokumentu();
		if(rec)
		{	
			
			
			var typFormularza = rec['kod'];
			obwFormularze.utworzFormularz(typFormularza);
			obwUtils.log("obwWyborTypuFormularzaDialogOnUtwor: typFormularza=" + typFormularza);
			
			
		}
	};
	
	
	/**
	 * Wywoływane w momencie 
	 */
	this.obwZapisFormularzyDlaNiezalogowanego = function(typFormularza)
	{
		
			alert("js ObwFormularze.obwZapisFormularzyDlaNiezalogowanego, typ: "+typFormularza);
			importDokumentowDialog.show();
			obwUtils.log("obwWyborTypuFormularzaDialogOnUtwor: typFormularza=" + typFormularza);
		
	};
	
	
	
	/**
	 *  Utworzenie formularza
	 */
	this.utworzFormularz = function(typFormularza, parametryWywolania){
		var sygnatura = obwFormularze.sygnatura_sprawy;
		
		wyborTypuFormularzaDialog.hide(); 
		
		var contentVar = {
				'kodDok': typFormularza
			};

		var args = {
			url : 'obw/dokumentyRobocze/isDialog.npi',
			content : contentVar,
			handleAs : "json",
			load : function(resp)
			{
                var typRoli = resp["typRoli"];

				if(resp["blad"]){
					alert(resp["komunikat"]);
					return;
				}
				if(resp["dialog"]){
					setKodDokumentu(typFormularza);
					
					var potwierdz = resp["isOgolny"];
					if(potwierdz){
                        wyborRoliDlaDokumentu.onHide = function(){
                            if(getWyborRoliDlaDokumentuSuccess()){
                                if(getRolaOgolnaId() == getWyborRoliDlaDokumentuSelectValue()) {
                                    var dialogPotwierdzeniaRoliOgolnej = new zusnpi.dialog.YesNoCancelDialog({
                                        dialogHeight: '300px',
                                        title: "Wybór roli",
                                        content: "Wniosek z roli ogólnej może być wysłany wyłącznie w sytuacji, gdy "
                                        +"dane identyfikacyjne lub adresowe, którymi inicjuje się wniosek we "
                                        +"właściwej roli, są nieprawidłowe i nie ma możliwości ich zmiany przed "
                                        + "złożeniem wniosku.\n\n"
                                        + "Czy na pewno chcesz utworzyć dokument bez przypisania do właściwej roli?"
                                    });
                                    dialogPotwierdzeniaRoliOgolnej.onNoClick = function(){
                                        wyborRoliDlaDokumentu.show();
                                    }

                                    dialogPotwierdzeniaRoliOgolnej.onYesClick = function(){
                                        setKodDokumentu(kodDokumentu);
                                        wyborRoliOgolnejDlaDokumentu.onHide= function(){
                                            if(getWyborRoliOgolnejDlaDokumentuSuccess()) {
                                                obwFormularze.utworzDokument(typFormularza, getRolaOgolnaId(), sygnatura, parametryWywolania, getWyborTypuRoliOgolnejDlaDokumentuSelectValue(), getWyborIdKsiZusRolaOgolnaSelectValue(), false);
                                            }
                                        }
                                        wyborRoliOgolnejDlaDokumentu.show();
//                                        obwFormularze.utworzDokument(typFormularza, getWyborRoliDlaDokumentuSelectValue(), sygnatura, parametryWywolania, getWyborTypuRoliDlaDokumentuSelectValue(), getWyborIdKsiZusSelectValue());
                                    }

                                    dialogPotwierdzeniaRoliOgolnej.onCancelClick = function(){
                                    }

                                    dialogPotwierdzeniaRoliOgolnej.setArgs();
                                    dialogPotwierdzeniaRoliOgolnej.show();
                                } else if (getRolaInnaId() == getWyborRoliDlaDokumentuSelectValue()){
                                    setKodDokumentu(kodDokumentu);
                                    wyborRoliMocodawcyDlaDokumentu.onHide= function(){
                                        if(getWyborRoliMocodawcyDlaDokumentuSuccess()) {
                                            obwFormularze.utworzDokument(typFormularza, getRolaOgolnaId(), sygnatura, parametryWywolania, wyborRoliMocodawcySelect.get('typRoli'), getWyborIdKsiZusMocodawcySelectValue(), true);
                                        }
                                    }
                                    wyborRoliMocodawcyDlaDokumentu.show();
                                }
                                else {
                                    obwFormularze.utworzDokument(typFormularza, getWyborRoliDlaDokumentuSelectValue(), sygnatura, parametryWywolania, getWyborTypuRoliDlaDokumentuSelectValue(), getWyborIdKsiZusSelectValue());
                                }
                            }
                            else{
                                wyborRoliSelect.removeOption(wyborRoliSelect.getOptions());
                            }
                        }
                        wyborRoliDlaDokumentu.show();
					} else {
//						wyborRoliDlaDokumentu.onHide = function(){
//							if(getWyborRoliDlaDokumentuSuccess()){
								obwFormularze.utworzDokument(typFormularza, resp["roleId"], sygnatura, parametryWywolania, getWyborTypuRoliDlaDokumentuSelectValue(), getWyborIdKsiZusSelectValue(), false);
//							}
//						}
//						wyborRoliDlaDokumentu.show();
					}
				}
			}
		};
			
		dojo.xhrPost(args);
	};
	
	/**
	 *  Anulowanie dodawania dokumentu
	 */
	this.obwWyborTypuFormularzaDialogOnCancel = function()
	{	
		obwFormularze.sygnatura_sprawy = null;
		wyborTypuFormularzaDialog.hide();
	};
	
	/**
	 * Podgląd wzoru formularza w SOF
	 */
	this.obwWyborTypuFormularzaDialogOnPodglad = function()
	{
		var rec = sprawdzZaznaczenieTypuDokumentu();
		if(rec)
		{
			var typFormularza = rec['kod'];
			obwFormularze.wyswietlFormularzSOFPustyWydruk(typFormularza)
		}
	};

	/**
	 * Podgląd wzoru formularza w SOF
	 */
	var sprawdzZaznaczenieTypuDokumentu = function()
	{
		var rec = getGridObject().getSelectedRecord();
		if(rec == null) alert('Nie wybrano typu dokumentu.');
		return rec;		
	};
	
	/**
	 * Funkcja zwracająca jdId grida
	 */
	var getGridObject = function()
	{
		return gridListaFormularzy;
	};

    this.zapiszOswiadczenieMetadokumentu = function(idKsiZus) {
        var _this = this;
        if (_this.kod_typu_roli == undefined || _this.kod_typu_roli == "") {
            return;
        }
        var argsContent = {
            id: _this.id_dokumentu,
            kodTypuRoli: _this.kod_typu_roli,
            wybranaRola : _this.wybrana_rola,
            idKsiZus: idKsiZus
        };
        var args = {
            url: "obw/oswiadczenieMetadokuemtu/zapiszOswiadczenie.npi",
            content: argsContent,
            handleAs: "json",
            sync: true,
            load : function(resp) {
                _this.kod_typu_roli = "";
                _this.wybrana_rola = "";
            }
        };
        dojo.xhrPost(args);
    };


}

var obwFormularze = new ObwFormularze();