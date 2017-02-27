function ObwWalidacja() {

	// Wyrażenie regularne dla obiektu PESEL.
	regPESEL = new RegExp('[0-9]{11}');
	// Wyrażenie regularne dla obiektu NIP.
	regNIP = new RegExp('[0-9]{10}');
	// Wyrażenie regularne dla obiektu Data urodzenia.
	regDataUrodzenia = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}');
	// Wyrażenie regularne dla obiektu EMail.
    this.regEMail = "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";
	// Wyrażenie regularne dla obiektu Numer telefonu.
	regNrTel = new RegExp('[0-9]{9}');
	// Wyrażenie regularne dla krótkiego numeru REGON.
	regREGONkrotki = new RegExp('[0-9]{9}');
	// Wyrażenie regularne dla długiego numeru REGON.
	regREGONdlugi = new RegExp('[0-9]{14}');
	// Wyrażenie regularne dla siedmiocyfrowego numeru REGON.
	regREGONstary = new RegExp('[0-9]{7}');
	
	var polskieZnakiMale = "\u0105\u0107\u0119\u0142\u0144\u00F3\u015B\u017A\u017C";
    var polskieZnakiDuze = "\u0104\u0106\u0118\u0141\u0143\u00D3\u015A\u0179\u017B";
    var specjalneZnakiDuze = "\u0104\u0141\u013D\u015A\u0160\u015E\u0164\u0179\u017D\u017B\u0154\u00C1\u00C2\u0102\u00C4\u0139\u0106\u00C7\u010C\u00C9\u0118\u00CB\u011A\u00CD\u00CE\u010E\u0110\u0143\u0147\u00D3\u00D4\u0150\u00D6\u0158\u016E\u00DA\u0170\u00DC\u00DD\u0162";
    
	regNazwiskoImie = new RegExp('^([A-Z'+specjalneZnakiDuze+' \'.-]*)$');
	regDokTozs = new RegExp('^([A-Z0-9]*)$');
	regNazwaPelnaSkrucona = new RegExp('^([A-Za-z0-9'+polskieZnakiMale+polskieZnakiDuze+'\u005C\u005C\u005C\u002D \'./_&$,"]*)$');
	regGmiMiejUli = new RegExp('^([A-Za-z0-9'+polskieZnakiMale+polskieZnakiDuze+'\u005C\u005C\u005C\u002D \'./ ]*)$');
	regNrDomLokalu = new RegExp('^([A-Za-z0-9'+polskieZnakiMale+polskieZnakiDuze+'\u005C\u002D .,/ ]*)$');
	regKodP = new RegExp('[0-9]{5}');
	regMail = new RegExp('^[A-Za-z0-9\u005C\u005C\u005C/._%+-]+@[A-Za-z0-9\u005C\u005C\u005C/.-]+\.[A-Za-z]{2,}$');
	regTel = new RegExp('^([0-9 +-]*)$');
	
	
    
	// Flaga - wypełnienie jednego z pól 'PESEL', 'NIP', 'dokumentu tożsamości', jest wymagane.
	this.zalezne = false;
	// Flaga - dane pole zależne (wymagane w przypadku nie uzupełnienia pozostałych) zostało uzupełnione.
	this.wypelnionoPesel = false;
	this.wypelnionoNip = false;
	this.wypelnionoNrDokTozsamosci = false;
	
	// Flaga - wypełnienie pola nazwiska, imienia i daty urodzenia jest wymagane w przypadku wypełnienia jednego z nich.
	this.powiazane = false;
	// Flaga - dane pole zależne (wymagane w przypadku uzupełnienia jednego z pozostałych) zostało uzupełnione.
	this.wypelnionoNazwisko = false;
	this.wypelnionoImie = false;
	this.wypelnionoDateUrodzenia = false;
	
	/*
	 * Walidacja nazwiska w przypadku powiązania pola z imieniem i datą urodzenia.
	 *
	 * @param dok - obiekt reprezentujący nazwisko.
	 *
	 */
	this.validNazwisko = function (nazwisko){
		if(nazwisko.getDisplayedValue() != ''){
			this.wypelnionoNazwisko = true;
			if(this.powiazane){
				if(this.wypelnionoNazwisko && this.wypelnionoImie && this.wypelnionoDateUrodzenia){
					return true;
				} else {
					nazwisko.invalidMessage = "Nie wypełniono pól powiązanych: imienia i daty urodzenia.";
					return false;
                }
            }
        } else {
			this.wypelnionoNazwisko = false;
        }
        return true;
	};
	
	/*
	 * Walidacja imienia w przypadku powiązania pola z nazwiskiem i datą urodzenia.
	 *
	 * @param dok - obiekt reprezentujący imie.
	 *
	 */
	this.validImie = function (imie){
		if(imie.getDisplayedValue() != ''){
			this.wypelnionoImie = true;
			if(this.powiazane){
				if(this.wypelnionoNazwisko && this.wypelnionoImie && this.wypelnionoDateUrodzenia){
					return true;
				} else {
					imie.invalidMessage = "Nie wypełniono pól powiązanych: nazwiska i daty urodzenia.";
					return false;
                }
            }
        } else {
			this.wypelnionoImie = false;
        }
        return true;
	};

    /*
     * Sprawdzenie czy numer i rodzaj dokumentu tożsamości został wpisany.
     *
     * @param dok - obiekt reprezentujący wybrany dokument tożsamości.
     * @param nrDok - obiekt reprezentujący numer wybranego dokumentu tożsamości.
     *
     */
    this.validDok = function (dok, nrDok) {
        if (dok.getDisplayedValue() != '' && nrDok.getDisplayedValue() != '') {
            this.wypelnionoNrDokTozsamosci = true;
            return true;
        }

        this.wypelnionoNrDokTozsamosci = false;

        if (dok.getDisplayedValue() == '' && nrDok.getDisplayedValue() == '') {
            if (this.zalezne && !(this.wypelnionoPesel || this.wypelnionoNip || this.wypelnionoNrDokTozsamosci)) {
                dok.invalidMessage = "Pole PESEL, NIP lub numer dokumentu tożsamości musi zostać uzupełnione.";
                nrDok.invalidMessage = "Pole PESEL, NIP lub numer dokumentu tożsamości musi zostać uzupełnione.";
                return false;
            } else {
                return true;
            }
        } else {
            if (dok.getDisplayedValue() == '') {
                this.wypelnionoNrDokTozsamosci = false;
                nrDok.invalidMessage = "Nie wybrano rodzaju dokumentu tożsamości.";
            }
            if (nrDok.getDisplayedValue() == '') {
                this.wypelnionoNrDokTozsamosci = false;
                nrDok.invalidMessage = "Nie wprowadzono numeru dokumentu tożsamości.";
            }
            return false;
        }
    };
	
	/*
	 * Sprawdzenie czy osoba zakładająca profil ma ukończone 18 lat.
	 *
	 * @param data - data urodzenia w postaci stringu: yyyy-MM-dd.
	 *
	 */
	this.isPelnoletni = function (data){
		if(data != null && data != ''){
			var obecnaData = new Date();
			var dataUrodzenia = data.split('-');
			if(obecnaData.getFullYear() >= parseInt(dataUrodzenia[0],10)+18 ){
				if(obecnaData.getFullYear() >= parseInt(dataUrodzenia[0],10)+19) return true;
				if(obecnaData.getMonth()+1 > parseInt(dataUrodzenia[1],10) ) return true;
				if(obecnaData.getMonth()+1 == parseInt(dataUrodzenia[1],10) && obecnaData.getDate() >= parseInt(dataUrodzenia[2],10) ) return true;
			}
		}
		return false;
	};
	
	/*
	 * Sprawdzenie poprawności daty urodzenia.
	 *
	 * @param data - obiekt reprezentujący datę urodzenia.
	 *
	 */
	this.validDataUrodzenia = function (data){
		if(data.getDisplayedValue() == ''){
			this.wypelnionoDateUrodzenia = false;
			return true;
		} else {
			this.wypelnionoDateUrodzenia = true;
			if(!regDataUrodzenia.test(data.getDisplayedValue())){
				data.invalidMessage = "Wprowadzona wartość nie jest poprawną datą.";
				return false;
			}
			if(!this.isPelnoletni(data.toString())){
				data.invalidMessage = "Profil PUE można zakładać wyłącznie dla osób pełnoletnich.";
				return false;
            }
            if(this.powiazane){
				if(this.wypelnionoNazwisko && this.wypelnionoImie && this.wypelnionoDateUrodzenia){
					return true;
				} else {
					data.invalidMessage = "Nie wypełniono pól powiązanych: nazwiska i imienia.";
					return false;
                }
            } else {
				return true;
            }
        }
	};
	
	/*
	 * Sprawdzenie poprawności daty urodzenia. Wyszukiwana osoba nie musi być pełnoletnia
	 *
	 * @param data - obiekt reprezentujący datę urodzenia.
	 *
	 */
	this.validDataUrodzeniaWyszukiwana = function (data){
		if(data.getDisplayedValue() == ''){
			this.wypelnionoDateUrodzenia = false;
			return true;
		} else {
			this.wypelnionoDateUrodzenia = true;
			if(parseDate(data.getDisplayedValue(), zusNpiDateFormat) == null) {
				data.invalidMessage = "Wprowadzona wartość nie jest poprawną datą.";
				return false;
		    }
			if(!regDataUrodzenia.test(data.getDisplayedValue())){
				data.invalidMessage = "Wprowadzona wartość nie jest poprawną datą.";
				return false;
			}
			if(this.powiazane){
				if(this.wypelnionoNazwisko && this.wypelnionoImie && this.wypelnionoDateUrodzenia){
					return true;
				} else {
					data.invalidMessage = "Nie wypełniono pól powiązanych: nazwiska i imienia.";
					return false;
                }
            } else {
				return true;
            }
        }
	};
	
	/*
	 * Sprawdzenie poprawności daty urodzenia.
	 *
	 * @param data - obiekt reprezentujący datę urodzenia.
	 *
	 */
	this.validDataUrodzeniaWymagana = function (data){
		if(data.getDisplayedValue() == ''){
			this.wypelnionoDateUrodzenia = false;
			return false;
		} else {
			this.wypelnionoDateUrodzenia = true;
			if(!regDataUrodzenia.test(data.getDisplayedValue())){
				data.invalidMessage = "Wprowadzona wartość nie jest poprawną datą.";
				return false;
			}
			if(!this.isPelnoletni(data.toString())){
				data.invalidMessage = "Profil PUE można zakładać wyłącznie dla osób pełnoletnich.";
				return false;
            }
            if(this.powiazane){
				if(this.wypelnionoNazwisko && this.wypelnionoImie && this.wypelnionoDateUrodzenia){
					return true;
				} else {
					data.invalidMessage = "Nie wypełniono pól powiązanych: nazwiska i imienia.";
					return false;
                }
            } else {
				return true;
            }
        }
	};
	
	/*
	 * Sprawdzenie poprawności daty trwania upoważnienia.
	 *
	 * @param dataOd - data od kiedy obowiązuje upoważnienie.
	 * @param dataDo - data do kiedy obowiązuje upoważnienie.
	 */
	this.validDataUpowaznienia = function (dataOd, dataDo){
		if(dataDo.getDisplayedValue() == ''){
			if(dataOd.getDisplayedValue() != ''){
				if(!regDataUrodzenia.test(dataOd.getDisplayedValue())){
					dataOd.invalidMessage = "Wprowadzona wartość nie jest poprawną datą.";
					return false;
                }
                return true;
            }
            return false;
		} else {
			if(dataOd.getDisplayedValue() == ''){
				dataOd.invalidMessage = "Ta wartość jest wymagana.";
				return false;
            }
            if(!regDataUrodzenia.test(dataDo.getDisplayedValue())){
				dataOd.invalidMessage = "Data wygaśnięcia upoważnienia nie jest poprawną datą.";
				return false;
            }
            if(!regDataUrodzenia.test(dataOd.getDisplayedValue())){
				dataOd.invalidMessage = "Wprowadzona wartość nie jest poprawną datą.";
				return false;
            }
            if(!this.isDataStarsza(dataOd.toString(),dataDo.toString())){
				dataOd.invalidMessage = "Data wygaśnięcia upoważnienia nie może być starsza od daty nadania upoważnienia.";
				return false;
			} else {
				return true;
			}
        }
	};
	
	/*
	 * Sprawdzenie czy data nadania upoważnienia jest starsza od daty wygaśnięcia upoważnienia.
	 *
	 * @param dataOd - data nadania upoważnienia w postaci stringu: yyyy-MM-dd
	 * @param dataDo - data wygaśnięcia upoważnienia w postaci stringu: yyyy-MM-dd
	 *
	 */
	this.isDataStarsza = function (dataOd, dataDo){
		if(dataDo != null && dataDo != ''){
			var dataOdT = dataOd.split('-');
			var dataDoT = dataDo.split('-');
			
			if(parseInt(dataDoT[0],10) > parseInt(dataOdT[0],10)) return true;
			if(parseInt(dataDoT[0],10) == parseInt(dataOdT[0],10)){
				if(parseInt(dataDoT[1],10) > parseInt(dataOdT[1],10)) return true;
				if(parseInt(dataDoT[1],10) == parseInt(dataOdT[1],10)){
					if(parseInt(dataDoT[2],10) >= parseInt(dataOdT[2],10)) return true;
                }
            }
        }
        return false;
	};
	
	/*
	 * Sprawdzenie poprawności numeru telefonu.
	 *
	 * @param nrTel - obiekt reprezentujący numer telefonu.
	 *
	 */
	this.validNrTel = function (nrTel){
		if(nrTel.getDisplayedValue() != ''){
			if(regNrTel.test(nrTel.getDisplayedValue()) && nrTel.getDisplayedValue().length == 9){
				return true;
			} else {
				nrTel.invalidMessage = "Numer telefonu musi składać się z 9 cyfr.";
				return false;
            }
        } else {
			return true;
        }
    };
	
	/*
	 * Sprawdzenie poprawności wprowadzonego numeru NIP.
	 *
	 * @param nip - obiekt reprezentujący numer nip.
	 *
	 */
	this.validNIP = function (nip){
		if(nip.getDisplayedValue() != ''){
			this.wypelnionoNip = true;
			if (!regNIP.test(nip.getDisplayedValue()) && nip.getDisplayedValue().length == 10){
				nip.invalidMessage = "NIP musi składać się z 10 cyfr.";
				return false;
			} else {
				if (this.liczbaKontrolnaNIP(nip.getDisplayedValue())){
					return true;
				} else {
					nip.invalidMessage = "Numer NIP jest niepoprawny.";
					return false;
                }
            }
        }
        this.wypelnionoNip = false;
		if(this.zalezne && !(this.wypelnionoPesel || this.wypelnionoNip || this.wypelnionoNrDokTozsamosci)){
			nip.invalidMessage = "Pole PESEL, NIP lub numer dokumentu tożsamości musi zostać uzupełnione.";
			return false;
		} else {
			return true;
        }
    };
    
    this.validNIPMocodawcy = function (nip){
		if(nip.getDisplayedValue() != ''){
			this.wypelnionoNip = true;
			if (!regNIP.test(nip.getDisplayedValue()) && nip.getDisplayedValue().length == 10){
				return "NIP musi składać się z 10 cyfr.";
			} else {
				if (this.liczbaKontrolnaNIP(nip.getDisplayedValue())){
					return null;
				} else {
					return "Numer NIP jest niepoprawny.";
                }
            }
        }
		return null;
    };
    
    this.validNazwiskoImieMocodawcy = function (nazwisko,imie){
		if(nazwisko.getDisplayedValue() != ''){
			if(!regNazwiskoImie.test(nazwisko.getDisplayedValue())){
				return "Pole Nazwisko zawiera niedozwolone znaki.";
            }
		}
		if(imie.getDisplayedValue() != ''){
			if(!regNazwiskoImie.test(imie.getDisplayedValue())){
				return "Pole Imię zawiera niedozwolone znaki.";
            }
        }
		return null;
    };
    
    this.validDokTozsMocodawcy = function (dokTozs){
		if(dokTozs.getDisplayedValue() != ''){
			if(!regDokTozs.test(dokTozs.getDisplayedValue())){
				return "Pole Seria i numer dokumentu zawiera niedozwolone znaki.";
            }
        }
		return null;
    };
    
    this.validNazwaPelnaSKRMocodawcy = function (nazwaP,nazwaS){
		if(nazwaP.getDisplayedValue() != ''){
			if(!regNazwaPelnaSkrucona.test(nazwaP.getDisplayedValue())){
				return "Pole Nazwa pełna zawiera niedozwolone znaki.";
            }
		}
		if(nazwaS.getDisplayedValue() != ''){
			if(!regNazwaPelnaSkrucona.test(nazwaS.getDisplayedValue())){
				return "Pole Nazwa skrócona zawiera niedozwolone znaki.";
            }
        }
		return null;
    };
    
    
    this.validAdresMocodawcy = function (kodP,gmina,miejscowosc,ulica,nrDomu,nrLokalu,adresEmail,nrTelefonu) {
		if(kodP != ''){
			if(!regKodP.test(kodP)){
				return "Pole Kod pocztowy musi składać się z pięciu cyfr.";
            }
        }
		if(gmina != ''){
			if(!regGmiMiejUli.test(gmina)){
				return "Pole Gmina zawiera niedozwolone znaki.";
            }
        }
		if(miejscowosc != ''){
			if(!regGmiMiejUli.test(miejscowosc)){
				return "Pole Miejscowość zawiera niedozwolone znaki.";
            }
        }
		if(ulica != ''){
			if(!regGmiMiejUli.test(ulica)){
				return "Pole Ulica zawiera niedozwolone znaki.";
            }
        }
		if(nrDomu != ''){
			if(!regNrDomLokalu.test(nrDomu)){
				return "Pole Nr domu zawiera niedozwolone znaki.";
            }
        }
		if(nrLokalu != ''){
			if(!regNrDomLokalu.test(nrLokalu)){
				return "Pole Nr lokalu zawiera niedozwolone znaki.";
            }
        }
		if(adresEmail != ''){
			if(!regMail.test(adresEmail)){
				return "Adres email jest niepoprawny.";
            }
        }
		if(nrTelefonu != ''){
			if(!regTel.test(nrTelefonu)){
				return "Pole Nr telefonu zawiera niedozwolone znaki.";
            }
        }
		return null;
    };

	this.wynijMyslnikiNip = function (nipTextbox) {
        if (nipTextbox != null) {
            var nip = nipTextbox.get("value");
            if (nip != null && typeof nip === "string" && nip.indexOf("-") != -1) {
                while (nip.indexOf("-") != -1) {
                    nip = nip.replace("-", "");
                }
                nipTextbox.set('value', nip);
            }
        }
    };
	
	/*
	 * Sprawdzenie sumy kontrolnej numeru NIP.
	 *
	 * @param nip - string reprezentujący numer nip.
	 *
	 */
	this.liczbaKontrolnaNIP = function (nip){

		var sumaIloczynow = 0;
		sumaIloczynow += parseInt(nip[0]) * 6;
		sumaIloczynow += parseInt(nip[1]) * 5;
		sumaIloczynow += parseInt(nip[2]) * 7;
		sumaIloczynow += parseInt(nip[3]) * 2;
		sumaIloczynow += parseInt(nip[4]) * 3;
		sumaIloczynow += parseInt(nip[5]) * 4;
		sumaIloczynow += parseInt(nip[6]) * 5;
		sumaIloczynow += parseInt(nip[7]) * 6;
		sumaIloczynow += parseInt(nip[8]) * 7;
		var liczbaKontrolna = sumaIloczynow % 11;
		//if(liczbaKontrolna == 10) liczbaKontrolna = 0;
		return (liczbaKontrolna == parseInt(nip[9]));
	};


        this.ustawDateUrodzenia = function (rok, miesiac, dzien, idkontenera) {
            var data = new Date(rok, miesiac - 1, dzien);

            console.debug(data);
            if (dijit.byId(idkontenera) != null)
                dijit.byId(idkontenera).set("value", data);
        };

        this.ustawDateUrodzeniaPoPeselu = function (pesel) {
            var rok = parseInt(pesel.substring(0, 2), 10);
            var miesiac = parseInt(pesel.substring(2, 4), 10);
            var dzien = parseInt(pesel.substring(4, 6), 10);
            if (miesiac > 80) {
                miesiac -= 80;
                rok += 1800;

            } else if (miesiac > 60) {
                miesiac -= 60;
                rok += 2200;

            } else if (miesiac > 40) {
                miesiac -= 40;
                rok += 2100;

            } else if (miesiac > 20) {
                miesiac -= 20;
                rok += 2000;

            } else {
                rok += 1900;
            }
            var idkontenera = "kpValRejDataUrodzenia";
            this.ustawDateUrodzenia(rok, miesiac, dzien, idkontenera);
        };

	
	/*
	 * Sprawdzenie poprawności wprowadzonego numeru REGON.
	 *
	 * @param regon - obiekt reprezentujący numer REGON.
	 *
	 */
	this.validREGON = function (regon){
		if(regon.getDisplayedValue() != ''){
			if (regREGONdlugi.test(regon.getDisplayedValue()) && regon.getDisplayedValue().length == 14){
				if (this.liczbaKontrolnaREGONkrotki(regon.getDisplayedValue())){
					if (this.liczbaKontrolnaREGONdlugi(regon.getDisplayedValue())){
						return true;
					} else {
						regon.invalidMessage = "Numer REGON jest niepoprawny.";
						return false;
                    }
                } else {
					regon.invalidMessage = "Numer REGON jest niepoprawny.";
					return false;
                }
            }
            if (regREGONkrotki.test(regon.getDisplayedValue()) && regon.getDisplayedValue().length == 9){
				if (this.liczbaKontrolnaREGONkrotki(regon.getDisplayedValue())){
					return true;
				} else {
					regon.invalidMessage = "Numer REGON jest niepoprawny.";
					return false;
                }
            }
            if (regREGONstary.test(regon.getDisplayedValue()) && regon.getDisplayedValue().length == 7){
				regon.invalidMessage = "REGON musi składać się z 9 lub 14 cyfr.<br />Przed 7 cyfrowym numerem REGON należy dopisać dwa zera.";
				return false;
            }
            regon.invalidMessage = "REGON musi składać się z 9 lub 14 cyfr.";
			return false;
        }
        return true;
	};
	
	this.validREGONMocodawcy = function (regon){
		if(regon.getDisplayedValue() != ''){
			if (regREGONdlugi.test(regon.getDisplayedValue()) && regon.getDisplayedValue().length == 14){
				if (this.liczbaKontrolnaREGONkrotki(regon.getDisplayedValue())){
					if (this.liczbaKontrolnaREGONdlugi(regon.getDisplayedValue())){
						return null;
					} else {
						return "Numer REGON jest niepoprawny.";
                    }
                } else {
                	return "Numer REGON jest niepoprawny.";
                }
            }
            if (regREGONkrotki.test(regon.getDisplayedValue()) && regon.getDisplayedValue().length == 9){
				if (this.liczbaKontrolnaREGONkrotki(regon.getDisplayedValue())){
					return null;
				} else {
					return "Numer REGON jest niepoprawny.";
                }
            }
            if (regREGONstary.test(regon.getDisplayedValue()) && regon.getDisplayedValue().length == 7){
            	return "REGON musi składać się z 9 lub 14 cyfr.<br />Przed 7 cyfrowym numerem REGON należy dopisać dwa zera.";
            }
            return "REGON musi składać się z 9 lub 14 cyfr.";
        }
        return null;
	};
	
	/*
	 * Sprawdzenie sumy kontrolnej krótkiego numeru REGON.
	 *
	 * @param regon - string reprezentujący numer REGON.
	 *
	 */
	this.liczbaKontrolnaREGONkrotki = function (regon){
		var sumaIloczynow = 0;
		sumaIloczynow += parseInt(regon[0])*8;
		sumaIloczynow += parseInt(regon[1])*9;
		sumaIloczynow += parseInt(regon[2])*2;
		sumaIloczynow += parseInt(regon[3])*3;
		sumaIloczynow += parseInt(regon[4])*4;
		sumaIloczynow += parseInt(regon[5])*5;
		sumaIloczynow += parseInt(regon[6])*6;
		sumaIloczynow += parseInt(regon[7])*7;
		var liczbaKontrolna = sumaIloczynow % 11;
		if(liczbaKontrolna == 10) liczbaKontrolna = 0;
		return (liczbaKontrolna == parseInt(regon[8]));
	};
	
	/*
	 * Sprawdzenie sumy kontrolnej długiego numeru REGON.
	 *
	 * @param regon - string reprezentujący numer REGON.
	 *
	 */
	this.liczbaKontrolnaREGONdlugi = function (regon){
		var sumaIloczynow = 0;
		sumaIloczynow += parseInt(regon[0])*2;
		sumaIloczynow += parseInt(regon[1])*4;
		sumaIloczynow += parseInt(regon[2])*8;
		sumaIloczynow += parseInt(regon[3])*5;
		sumaIloczynow += parseInt(regon[4])*0;
		sumaIloczynow += parseInt(regon[5])*9;
		sumaIloczynow += parseInt(regon[6])*7;
		sumaIloczynow += parseInt(regon[7])*3;
		sumaIloczynow += parseInt(regon[8])*6;
		sumaIloczynow += parseInt(regon[9])*1;
		sumaIloczynow += parseInt(regon[10])*2;
		sumaIloczynow += parseInt(regon[11])*4;
		sumaIloczynow += parseInt(regon[12])*8;
		var liczbaKontrolna = sumaIloczynow % 11;
		if(liczbaKontrolna == 10) liczbaKontrolna = 0;
		return (liczbaKontrolna == parseInt(regon[13]));
	};

    /*
     * Sprawdzenie poprawności wprowadzonego numeru Pesel.
     *
     * @param pesel - obiekt reprezentujący numer Pesel.
     *
     */
    this.validPesel = function (pesel) {
        if (pesel.getDisplayedValue() != '') {
            this.wypelnionoPesel = true;

            if (regPESEL.test(pesel.getDisplayedValue()) && pesel.getDisplayedValue().length == 11) {
                if (this.liczbaKontrolnaPESEL(pesel.getDisplayedValue())) {
                    return true;
                } else {
                    return "Numer PESEL może być niepoprawny.";
                }
            } else {
                pesel.invalidMessage = "PESEL musi składać się z jedenastu cyfr.";
                return false;
            }
        }

        this.wypelnionoPesel = false;
        if (this.zalezne && !(this.wypelnionoPesel || this.wypelnionoNip || this.wypelnionoNrDokTozsamosci)) {
            pesel.invalidMessage = "Pole PESEL, NIP lub numer dokumentu tożsamości musi zostać uzupełnione.";
            return false;
        } else {
            return true;
        }
    };
    
    this.validPeselMocodawcy = function (pesel) {
        if (pesel.getDisplayedValue() != '') {
            this.wypelnionoPesel = true;

            if (regPESEL.test(pesel.getDisplayedValue()) && pesel.getDisplayedValue().length == 11) {
                if (this.liczbaKontrolnaPESEL(pesel.getDisplayedValue())) {
                    return null;
                } else {
                    return "Numer PESEL może być niepoprawny.";
                }
            } else {
                return "PESEL musi składać się z jedenastu cyfr.";
            }
        }
        return null;
    };
	
	/*
	 * Sprawdzenie sumy kontrolnej numeru Pesel.
	 *
	 * @param pesel - string reprezentujący numer pesel.
	 *
	 */
	this.liczbaKontrolnaPESEL = function (pesel){
        if(!pesel) {
            return false;
        }
		var sumaIloczynow = 0;
        sumaIloczynow += parseInt(pesel[0]) * 1;
        sumaIloczynow += parseInt(pesel[1]) * 3;
        sumaIloczynow += parseInt(pesel[2]) * 7;
        sumaIloczynow += parseInt(pesel[3]) * 9;
        sumaIloczynow += parseInt(pesel[4]) * 1;
        sumaIloczynow += parseInt(pesel[5]) * 3;
        sumaIloczynow += parseInt(pesel[6]) * 7;
        sumaIloczynow += parseInt(pesel[7]) * 9;
        sumaIloczynow += parseInt(pesel[8]) * 1;
        sumaIloczynow += parseInt(pesel[9]) * 3;
        var liczbaKontrolna = (10 - (sumaIloczynow % 10)) % 10;
        return (liczbaKontrolna == parseInt(pesel[10]));
	};

    this.uzupelnienieDatyUrodzenia = function () {
        console.log('uzupelnienieDatyUrodzenia');
        var peselTextbox = dijit.byId('kpValRejPesel');
        if (peselTextbox.state == "") {
            var pesel = peselTextbox.get('value');
            var dataTextbox = dijit.byId('kpValRejDataUrodzenia');
            var data = kpWalidacja.dataUrodzeniaZPeselu(pesel);
            dataTextbox.set('value', data);
        }
    };

    /**
     * zwraca obiekt Date na podstawie stringa z peselem
     */
    this.dataUrodzeniaZPeselu = function (pesel) {
        if (pesel != null && pesel.length == 11) {
            var dataStr = '19' + pesel.charAt(0) + pesel.charAt(1) + '-' + pesel.charAt(2) + pesel.charAt(3) + '-' + pesel.charAt(4) + pesel.charAt(5);
            return parseDate(dataStr, zusNpiDateFormat);
        }
        return null;
    }
		
}
var obwWalidacja = new ObwWalidacja();