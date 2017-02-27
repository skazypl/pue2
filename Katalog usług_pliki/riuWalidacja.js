/*
 * Funkcje walidacji pól formularza rejestracji nowego profilu PUE.
 * 
 */
function RiuWalidacja() {

    this.uzupelnienieDatyUrodzenia = function() {
        console.log('uzupelnienieDatyUrodzenia');
        var peselTextbox = dijit.byId("pesel");
        if(peselTextbox.state == "") {
            var pesel = peselTextbox.get('value');
            var dataTextbox = dijit.byId("dataUrodzenia");
            var data = riu.dataUrodzeniaZPeselu(pesel);
            dataTextbox.set('value', data);
        }
    }

    // Wyrażenie regularne dla obiektu PESEL.
    regPESEL = new RegExp('[0-9]{11}');
    // Wyrażenie regularne dla obiektu NIP.
    regNIP = new RegExp('[0-9]{10}');
    // Wyrażenie regularne dla obiektu hasło CIT.
    regCIT = new RegExp('^[0-9]{8,}$');
    // Wyrażenie regularne dla emaila
    this.regEMail = "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";

    // True, gdy jedno z pól PESEL, NIP lub rodzaj dokumentu tożsamości, zostało wpisane.
    this.poleWymagane = false;
    this.poleWymagane2 = false;
    this.poleWymagane3 = false;
    // Czy walidować pola zależne: PESEL, NIP i numer dokumentu tożsamości.
    var validateZalezne = true;

    /* 
     * Sprawdzenie czy jedno z wymaganych pól jest uzupełnione.
     *
     * @param pesel - obiekt reprezentujący numer pesel.
     * @param dataUrodzenia - obiekt reprezentujący datę urodzenia.
     *
     */
    this.wymaganePolaPESEL = function (pesel, dataUrodzenia){
        if(pesel.value !='' && pesel.value !=null){
            valPESEL =  this.validPESEL(pesel,dataUrodzenia);
            if(validateZalezne){
                validateZalezne = false;
                dijit.byId('nip').validate();
                dijit.byId('nrDokumentuToz').validate();
                validateZalezne = true;
            };
            return valPESEL;
        } else {
            this.poleWymagane = false;
        };
        if(!this.poleWymagane && !this.poleWymagane2 && !this.poleWymagane3){
            pesel.invalidMessage = 'Wymagane jest jedno z pól: PESEL, NIP, rodzaj dokumentu tożsamości.';
            return false;
        };
        return true;
    };

    /* 
     * Sprawdzenie czy jedno z wymaganych pól jest uzupełnione.
     *
     * @param nip - obiekt reprezentujący numer nip.
     *
     */
    this.wymaganePolaNIP = function (nip){
        if(nip.value !='' && nip.value !=null){
            valNIP = this.validNIP(nip);
            if(validateZalezne){
                validateZalezne = false;
                dijit.byId('pesel').validate();
                dijit.byId('nrDokumentuToz').validate();
                validateZalezne = true;
            };
            return valNIP;
        } else {
            this.poleWymagane3 = false;
        };
        if(!this.poleWymagane && !this.poleWymagane2 && !this.poleWymagane3){
            nip.invalidMessage = 'Wymagane jest jedno z pól: PESEL, NIP, rodzaj dokumentu tożsamości.';
            return false;
        };
        return true;
    };

    this.wynijMyslnikiNip = function(nipTextbox) {
        if(nipTextbox != null) {
            var nip = nipTextbox.get("value");
            if(nip != null && typeof nip === "string" && nip.indexOf("-") != -1) {
                while(nip.indexOf("-") != -1) {
                    nip = nip.replace("-", "");
                }
                nipTextbox.set('value', nip);
            }
        }
    }

    /* 
     * Sprawdzenie czy jedno z wymaganych pól jest uzupełnione.
     *
     * @param dokumentToz - obiekt reprezentujący numer dokumentu tożsamości.
     * @param rodzajDokumentu - obiekt reprezentujący typ dokumentu tożsamości.
     *
     */
    this.wymaganePolaDokument = function (dokumentToz, rodzajDokumentu){
        if(dokumentToz.value !=''){
            this.poleWymagane2 = true;
            if(validateZalezne){
                validateZalezne = false;
                dijit.byId('pesel').validate();
                dijit.byId('nip').validate();
                validateZalezne = true;
            };
            if(rodzajDokumentu =='' || rodzajDokumentu == null){
                dokumentToz.invalidMessage = 'Należy wybrać rodzaj dokumentu tożsamości.';
                return false;
            }
        } else {
            this.poleWymagane2 = false;
            if(rodzajDokumentu !='' && rodzajDokumentu != null){
                dokumentToz.invalidMessage = 'Wybrano rodzaj dokumentu tożsamości. Należy podać serie i numer dokumentu tożsamości.';
                return false;
            }
        };
        if(!this.poleWymagane && !this.poleWymagane2 && !this.poleWymagane3){
            dokumentToz.invalidMessage = 'Wymagane jest jedno z pól: PESEL, NIP, rodzaj dokumentu tożsamości.';
            return false;
        };
        return true;
    };

    /* 
     * Sprawdzenie poprawności daty urodzenia.
     *
     * @param data - obiekt reprezentujący datę urodzenia.
     * @param pesel - obiekt reprezentujący numer pesel.
     *
     */
    this.validDataUrodzenia = function (data, pesel){
        var czyPelnoletni = this.isPelnoletni(data.toString());
        if(czyPelnoletni === true) {
            if(!this.dataUrodzeniaPESEL(pesel, data.toString())){
                data.invalidMessage = "Wprowadzono niepoprawny numer PESEL lub datę urodzenia.";
                return false;
            } else {
                return true;
            };
        }  else if(czyPelnoletni === false) {
            data.invalidMessage = "Wyłącznie osoby pełnoletnie mogą zakładać profil.";
            return false;
        } else {
            data.invalidMessage = "Niepoprawna data.";
        }
        return false;
    };

    /* 
     * Sprawdzenie czy osoba zakładająca profil ma ukończone 18 lat.
     *
     * @param data - data urodzenia w postaci stringu: yyyy-MM-dd.
     *
     */
    this.isPelnoletni = function (data){
        if(data != null && data != ''){
            if(parseDate(data, zusNpiDateFormat) == null) {
                return null;
            }
            var obecnaData = new Date();
            var dataUrodzenia = data.split('-');
            if(obecnaData.getFullYear() >= parseInt(dataUrodzenia[0],10)+18 ){
                if(obecnaData.getFullYear() >= parseInt(dataUrodzenia[0],10)+19 ) return true;
                if(obecnaData.getMonth()+1 > parseInt(dataUrodzenia[1],10) ) return true;
                if(obecnaData.getMonth()+1 == parseInt(dataUrodzenia[1],10) && obecnaData.getDate() >= parseInt(dataUrodzenia[2],10) ) return true;
            }
            return false;
        }
        return null;
    };

    /* 
     * Sprawdzenie poprawności wprowadzonego numeru PESEL.
     *
     * @param pesel - obiekt reprezentujący numer pesel.
     * @param dataUrodzenia - obiekt reprezentujący datę urodzenia.
     *
     */
    this.validPESEL = function (pesel, dataUrodzenia){
        if(pesel.value != null && pesel.value != ''){
            this.poleWymagane = true;
            if(regPESEL.test(pesel.value)){
                if(this.dataUrodzeniaPESEL(pesel, dataUrodzenia.toString())){
                    if (this.liczbaKontrolnaPESEL(pesel)){ // PESEL może mieć niepoprawną sumę kontrolną
                        return true;
                    } else {
                        pesel.invalidMessage = "Numer PESEL jest niepoprawny.";
                        return false;
                    };
                } else {
                    pesel.invalidMessage = "Wprowadzono niepoprawny numer PESEL lub datę urodzenia.";
                    return false;
                };
            } else {
                pesel.invalidMessage = "PESEL musi składać się z jedenastu cyfr.";
                return false;
            };
        };
        // powyższy warunek zawsze spełniony gdy funkcja wywołana przez this.wymaganePolaPESEL
        this.poleWymagane = false;
        return true;
    };

    /* 
     * Sprawdzenie daty urodzenia w numerze PESEL.
     *
     * @param pesel - obiekt reprezentujący numer pesel.
     * @param data - string reprezentujący datę urodzenia.
     *
     */
    this.dataUrodzeniaPESEL = function (pesel, data){
        if(data != '' && pesel.value !=''){
            if(pesel.value[0] != data[2]) return false;
            if(pesel.value[1] != data[3]) return false;
            if((parseInt(pesel.value[2]) % 2) != data[5]) return false;
            if(pesel.value[3] != data[6]) return false;
            if(pesel.value[4] != data[8]) return false;
            if(pesel.value[5] != data[9]) return false;
        };
        return true;
    };

    /* 
     * Sprawdzenie sumy kontrolnej numeru PESEL.
     *
     * @param pesel - obiekt reprezentujący numer pesel.
     *
     */
    this.liczbaKontrolnaPESEL = function (pesel){
        var sumaIloczynow = 0;
        sumaIloczynow += parseInt(pesel.value[0]) * 1;
        sumaIloczynow += parseInt(pesel.value[1]) * 3;
        sumaIloczynow += parseInt(pesel.value[2]) * 7;
        sumaIloczynow += parseInt(pesel.value[3]) * 9;
        sumaIloczynow += parseInt(pesel.value[4]) * 1;
        sumaIloczynow += parseInt(pesel.value[5]) * 3;
        sumaIloczynow += parseInt(pesel.value[6]) * 7;
        sumaIloczynow += parseInt(pesel.value[7]) * 9;
        sumaIloczynow += parseInt(pesel.value[8]) * 1;
        sumaIloczynow += parseInt(pesel.value[9]) * 3;
        var liczbaKontrolna = (10 - (sumaIloczynow % 10)) % 10;
        return (liczbaKontrolna == parseInt(pesel.value[10]));
    };

    /* 
     * Sprawdzenie poprawności wprowadzonego numeru NIP.
     *
     * @param nip - obiekt reprezentujący numer nip.
     *
     */
    this.validNIP = function (nip){
        if(nip.value != null && nip.value != ''){
            this.poleWymagane3 = true;
            if (!regNIP.test(nip.value)){
                nip.invalidMessage = "NIP musi składać się z dziesięciu cyfr.";
                return false;
            } else {
                if (this.liczbaKontrolnaNIP(nip)){
                    return true;
                } else {
                    nip.invalidMessage = "Numer NIP jest niepoprawny.";
                    return false;
                };
            };
        };
        // powyższy warunek zawsze spełniony gdy funkcja wywołana przez this.wymaganePolaNIP
        this.poleWymagane3 = false;
        // jesli przekazano kontrolke dijit to zwracana flaga czy wartosc wymagana
        if(nip != null && nip.get != null && nip.get('required') != null) {
            return !nip.get('required');
        }
        // w przeciwnym wypadku - WTF?!
        return true;
    };

    /* 
     * Sprawdzenie sumy kontrolnej numeru NIP.
     *
     * @param nip - obiekt reprezentujący numer nip.
     *
     */
    this.liczbaKontrolnaNIP = function (nip){
        var sumaIloczynow = 0;
        sumaIloczynow += parseInt(nip.value[0])*6;
        sumaIloczynow += parseInt(nip.value[1])*5;
        sumaIloczynow += parseInt(nip.value[2])*7;
        sumaIloczynow += parseInt(nip.value[3])*2;
        sumaIloczynow += parseInt(nip.value[4])*3;
        sumaIloczynow += parseInt(nip.value[5])*4;
        sumaIloczynow += parseInt(nip.value[6])*5;
        sumaIloczynow += parseInt(nip.value[7])*6;
        sumaIloczynow += parseInt(nip.value[8])*7;
        var liczbaKontrolna = sumaIloczynow % 11;
        return (liczbaKontrolna==parseInt(nip.value[9]));
    };

    /*
     * Włączenie/wyłączenie wysyłania wraz z formularzem hasła dostępu do CIT.
     *
     * @param cit - checkbox wymuszający wysłanie hasła CIT gdy zaznaczony.
     * @param hasloCIT1 - obiekt reprezentujący hasło CIT.
     * @param hasloCIT2 - obiekt reprezentujący powtórzone hasło CIT.
     *
     */
    this.wprowadzHasloCIT =function(cit,hasloCIT1,hasloCIT2){
        if(cit.checked){
            hasloCIT1.set('disabled', false);
            hasloCIT2.set('disabled', false);
            hasloCIT1.set('required', true);
            hasloCIT2.set('required', true);
        } else {
            hasloCIT1.set('disabled', true);
            hasloCIT2.set('disabled', true);
            hasloCIT1.set('required', false);
            hasloCIT2.set('required', false);
            hasloCIT1.set('value', '');
            hasloCIT2.set('value', '');
        }
    };

    // Czy walidować pole zależne (drugie pole z hasłem CIT).
    var validateHasloCIT = true;
    /* 
     * Sprawdzenie poprawności wprowadzonego hasła CIT.
     *
     * @param hasloCIT1 - obiekt reprezentujący hasło CIT.
     *
     */
    this.validHasloCIT = function (hasloCIT1){
        var nieCyfraRegexp = new RegExp('[^0-9]');
        if(nieCyfraRegexp.test(hasloCIT1.get('value'))){
            hasloCIT1.invalidMessage = 'Hasło COT zawiera niedopuszczalny znak.';
            return false;
        };        
        if (!regCIT.test(hasloCIT1.get('value'))){
            hasloCIT1.invalidMessage = 'Hasło COT musi składać się z co najmniej 8 cyfr.';
            return false;
        }
        return true;        
    };

    // Czy walidować pole zależne (drugie pole z hasłem).
    var validateHasloNPI = true;

    /* 
     * Sprawdzenie poprawności wprowadzonego hasła PUE.
     *
     * @param haslo1 - kontrolka z hasłem PUE
     * @param haslo2 - kontrolka z powtórzonym hasłem PUE
     * @param login - kontrolka zawierająca login
     * @param imie - kontrolka zawierająca imię
     * @param nazwisko - kontrolka zawierająca nazwisko
     * @param dataUrodzenia - kontrolka zawierająca datę urodzenia
     *
     */
    this.validHaslo = function (haslo1Widget, loginWidget, imieWidget, nazwiskoWidget, dataUrodzeniaWidget,
                                peselWidget, nipWidget, nrDokTozsamosciWidget) {
        // walidacja tylko wtedy gdy wszystkie pola są wygenerowane
        if (!haslo1Widget) {
            return true;
        }

        login = loginWidget ? (loginWidget.isValid() ? loginWidget.get('value') : null) : null;
        imie = imieWidget ? (imieWidget.isValid() ? imieWidget.get('value') : null) : null;
        nazwisko = nazwiskoWidget ? (nazwiskoWidget.isValid() ? nazwiskoWidget.get('value') : null) : null;
        dataUrodzenia = dataUrodzeniaWidget ? (dataUrodzeniaWidget.isValid() ? dataUrodzeniaWidget.get('displayedValue') : null) : null;
        pesel = peselWidget ? (peselWidget.isValid() ? peselWidget.get('value') : null) : null;
        nip = nipWidget ? (nipWidget.isValid() ? nipWidget.get('value') : null) : null;
        nrDokTozsamosci = nrDokTozsamosciWidget ? (nrDokTozsamosciWidget.isValid() ? nrDokTozsamosciWidget.get('value') : null) : null;

        return this.bezpieczneHaslo(haslo1Widget, login, imie, nazwisko, dataUrodzenia, pesel, nip, nrDokTozsamosci);
    };

    /**
     * Sprawdzenie czy hasło jest bezpieczne.
     *
     * Hasło jest bezpieczne gdy składa się z:
     * - conajmniej jednej dużej litery
     * - conajmniej jednej małej litery
     * - conajmniej jednej cyfry
     * - conajmniej jednego znaku specjalnego.
     *
     * @param haslo - string reprezentujący hasło.
     *
     */
    this.bezpieczneHaslo = function(hasloWidget, login, imie, nazwisko, dataUrodzenia, pesel, nip, nrDokTozsamosci) {
        var haslo = hasloWidget.get('value');

        if (haslo.length < 8) {
            hasloWidget.invalidMessage = 'Hasło PUE musi mieć co najmniej 8 znaków.';
            return false;
        }

        if (login && this.containsIgnoreCase(haslo, login)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać loginu.';
            return false;
        }

        if (imie && this.containsIgnoreCase(haslo, imie)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać imienia.';
            return false;
        }

        if (nazwisko && this.containsIgnoreCase(haslo, nazwisko)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać nazwiska.';
            return false;
        }

        if (dataUrodzenia && this.passContainsDateOfBirth(haslo, dataUrodzenia)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać daty urodzenia.';
            return false;
        }

        if (pesel && this.containsIgnoreCase(haslo, pesel)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać numeru PESEL.';
            return false;
        }

        if (nip && this.containsIgnoreCase(haslo, nip)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać numeru NIP.';
            return false;
        }

        if (nrDokTozsamosci && this.containsIgnoreCase(haslo, nrDokTozsamosci)) {
            hasloWidget.invalidMessage = 'Haslo PUE nie może zawierać numeru dokumentu tożsamości.';
            return false;
        }

        var polskieZnakiMale = "\u0105\u0107\u0119\u0142\u0144\u00F3\u015B\u017A\u017C";
        var polskieZnakiDuze = "\u0104\u0106\u0118\u0141\u0143\u00D3\u015A\u0179\u017B"

        var reg = new RegExp('[a-z' + polskieZnakiMale + ']');
        if (!reg.test(haslo)){
            hasloWidget.invalidMessage = "Hasło musi zawierać conajmniej jedną małą litere.";
            return false;
        };

        reg = new RegExp('[0-9]');
        if (!reg.test(haslo)){
            hasloWidget.invalidMessage = "Hasło musi zawierać conajmniej jedną cyfre.";
            return false;
        };

        reg = new RegExp('[A-Z' + polskieZnakiDuze + ']');
        if (!reg.test(haslo)){
            hasloWidget.invalidMessage = "Hasło musi zawierać conajmniej jedną dużą literę.";
            return false;
        };

        reg = new RegExp('[^(A-Za-z0-9' + polskieZnakiMale + polskieZnakiDuze + ')]|[\)\(]');
        if (!reg.test(haslo)){
            hasloWidget.invalidMessage = "Hasło musi zawierać conajmniej jeden znak specjalny.";
            return false;
        };

        return true;
    };

    /**
     * Sprawdza czy string <b>a</b> zawiera string <b>b</b>
     * ignorując wielkość liter.
     *
     * @param a pierwszy łańcuch
     * @param b drugi łańcuch
     * @return true - zawiera
     *          false - nie zawiera
     */
    this.containsIgnoreCase = function(a, b) {
        if (!a || !b) {
            return;
        }

        return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
    }

    /**
     * Sprawdza czy hasło zawiera datę urodzenia.
     *
     * Niedozwolone są hasła zawierające:
     * - rok (yyyy)
     *
     * @param pass hasło do sprawdzenia
     * @param dateOfBirth data urodzenia w formacie yyyy-MM-dd
     * @return boolean true - hasło zawiera datę urodzenia
     *                  false - hasło nie zawiera daty urodzenia
     */
    this.passContainsDateOfBirth = function(pass, dateOfBirth) {
        var year = dateOfBirth.substring(0, 4);
        var month = dateOfBirth.substring(4, 6);
        var day = dateOfBirth.substring(6);

        return pass.indexOf(year) > -1;
    }

    this.czyHasloPowtorzone = function(haslo1WidgetId, haslo2WidgetId) {
        if(dijit.byId(haslo1WidgetId).isValid()) {
            dijit.byId(haslo2WidgetId).invalidMessage = 'Powtórzone hasło jest niepoprawne.';
            return dijit.byId(haslo1WidgetId).get('value') === dijit.byId(haslo2WidgetId).get('value');
        }
        return true;
    };
}

var riuWalidacja = new RiuWalidacja();
