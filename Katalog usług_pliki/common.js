//Funkcje js wspólne dla wszystkich projektów

function toggleWD() {
    var wd = dijit.byId('asystentDialog');
    if (wd) {
        wd.toggle(getCurrentScreenId());
    }
}

function getCurrentScreenId() {
    // Funkcja recognizeTab zdefiniowana jest dla eplatnik
    if (window.recognizeTab) {
        return recognizeTab();
    } else {
        // w pozostalych modolach identyfikator okna pobierany jest z belki
        // tytulowej
        var pageTitles = dojo.query('.zusnpiPageTitlePane');
        if (pageTitles && pageTitles.length > 0) {
            var dijitPageTitle = dijit.getEnclosingWidget(pageTitles[0]);
            if (dijitPageTitle && dijitPageTitle.pageId) {
                return dijitPageTitle.pageId;
            }
        }
    }
    return undefined;
}

function menuSelect(action) {
    showSplash();
    var contextPane = dijit.byId("contextPane");
    var handle = dojo.connect(contextPane, "onLoad", this, function (data) {
        if (isStringWithIdentyfikatorLogowania(data)) {
            showExpiredSessionAlertAndReload();
            return;
        }
        hideSplash();
        dojo.disconnect(handle);

    });
    var onDownloadError = dojo.connect(contextPane, "onDownloadError", this, function (error) {
        errorLoad(error);
        dojo.disconnect(onDownloadError);
    });
    contextPane.set("href", action);
};

function setLastRole(roleName) {
    dojo.xhrPost({
        content: {
            role: roleName
        },
        handleAs: "json",
        sync: true,
        url: 'riu/riuKontekstyUstawOstatniaRole.npi',
        load: function (response) {
            dojo.cookie(response.cookieHash, response.role, {expires: response.cookieExpiryTime});
            // document.location.href = response.redirectUrl;
            window.location = response.redirectUrl;
        }
    });
}

function changeRole(roleName, redirectUrl) {
    if (helpWnd != null) {
        helpWnd.close();
    }
    dojo.xhrPost({
        content: {
            role: roleName
        },
        handleAs: "json",
        sync: true,
        url: 'riu/riuKontekstyZmienRole.npi',
        load: function (response) {
            dojo.cookie(response.cookieHash, response.role, {expires: response.cookieExpiryTime});
            // document.location.href = redirectUrl;
            window.location = redirectUrl;
        }
    });
}


function showDialog(dialog, args) {
    if (dialog && dialog.setArgs && dialog.show) {
        dialog.setArgs(args);
        dialog.show();
    }
}

// window.alert override
window.alert = function (args) {
    showDialog(new zusnpi.dialog.Alert(), args);
};

// window.confirm override
window.confirm = function (args) {
    showDialog(new zusnpi.dialog.Confirm(), args);
};

// new global function: error()
window.error = function (args) {
    showDialog(new zusnpi.dialog.Error(), args);
};

var state = {
    back: function () {
        alert("Back was clicked!");
    },
    forward: function () {
        alert("Forward was clicked!");
    }
};

var roleName;
function onHashChanged(hash) {
    var widget = dijit.byId(hash);
    var menuItemTitle;
    var menuPaneTitle;

    if (widget != null) {
        var selectedItem = null;
        var connectedMenuPane = null;

        if (widget instanceof zusnpi.menu.ToggleableMenuPane) {
            connectedMenuPane = widget;
            if (widget.selectable) {
                selectedItem = widget;
            }
        }
        else {
            selectedItem = widget;
            connectedMenuPane = dijit.getEnclosingWidget(widget.getParent().domNode.parentNode);
        }

        if (selectedItem != null) {
            menuItemTitle = selectedItem.label;
            selectedItem.markAsSelected();
            selectedItem.onHashSelected();
        }
        if (connectedMenuPane) {
            menuPaneTitle = connectedMenuPane.title;
            if (!connectedMenuPane.open) {
                connectedMenuPane.set('open', true);
                var menuPaneGroup = dijit.getEnclosingWidget(connectedMenuPane.domNode.parentNode);
                if (menuPaneGroup != null) {
                    menuPaneGroup.selectChild(connectedMenuPane);
                }
            }
        }
    }

    if (!roleName) {
        var tab = dojo.query('#tabs .selected')[0];
        if (tab) {
            roleName = tab.textContent;
        }
        else {
            roleName = "";
        }
    }
    var statusBar = dijit.byId('statusBar');
    if (statusBar) {
        statusBar.setContent(roleName, menuPaneTitle, menuItemTitle);
    }
    if (menuItemTitle) {
        document.title = menuItemTitle;
    } else if (menuPaneTitle) {
        document.title = menuPaneTitle;
    }
}

/* ========== date ========= */
var datePattern = 'yyyy-MM-dd';
var reverseDatePattern = 'dd-MM-yyyy';
var yearMonthPattern = 'yyyy/MM';
var monthDayPattern = 'dd-MM';
var timePattern = 'HH:mm';
var fullTimePattern = 'HH:mm:ss';
var dateTimePattern = 'yyyy-MM-dd HH:mm';
var dayPattern = 'EEEE';
var okresPattern = 'MM yyyy';

/*
 * function findParentWidget(domNode) { for(var p=domNode.parentNode; p;
 * p=p.parentNode){ var id = p.getAttribute && p.getAttribute("widgetId");
 * if(id){ var parent = dijit.byId(id); return parent; } } return null; };
 */

var zusNpiDateFormat = {
    selector: 'date',
    datePattern: datePattern,
    locale: 'pl'
}

var zusNpiOkresDateFormat = {
    selector: 'date',
    datePattern: okresPattern,
    locale: 'pl'
}

var zusNpiReverseDateFormat = {
    selector: 'date',
    datePattern: reverseDatePattern,
    locale: 'pl'
}

var zusNpiYearMonthFormat = {
    selector: 'date',
    datePattern: yearMonthPattern,
    locale: 'pl'
}

var zusNpiMonthDayFormat = {
    selector: 'date',
    datePattern: monthDayPattern,
    locale: 'pl'
}

var zusNpiTimeFormat = {
    selector: 'time',
    datePattern: timePattern,
    locale: 'pl'
}

var zusNpiDateTimeFormat = {
    selector: 'datetime',
    datePattern: datePattern,
    locale: 'pl'
}

var zusNpiFullDateTimeFormat = {
    selector: 'datetime',
    datePattern: datePattern,
    timePattern: fullTimePattern,
    locale: 'pl'
}

var zusNpiFullTimeFormat = {
    selector: 'date',
    datePattern: fullTimePattern,
    locale: 'pl'
}

var zusNpiDayFormat = {
    selector: 'date',
    datePattern: dayPattern,
    locale: 'pl'
}

function xmlDateFormatter(val) {
    if (!val) {
        return "";
    }
    return dojo.date.locale.format(new Date(val.year, val.month - 1, val.day, val.hour, val.minute, val.second), zusNpiDateTimeFormat);
};

var STATUS_ZLA_KSI_ENUM = {
    WSZYSTKIE: {value: 0, name: "Wszystkie", id: "WSZYSTKIE"},
    WYSTAWIONE: {value: 1, name: "Wystawione", id: "Wystawione", idEnum: "WYSTAWIONE"},
    SKORYGOWANE: {value: 2, name: "Skorygowane", id: "Skorygowane", idEnum: "SKORYGOWANE"},
    ANULOWANE: {value: 3, name: "Anulowane", id: "Anulowane", idEnum: "ANULOWANE"},
    WSTECZNE_DO_WYJASNIENIA: {value: 4, name: "Wsteczne \u2013 do wyja\u015bnienia", id: "Wsteczne – do wyjasnienia", idEnum: "WSTECZNE_DO_WYJASNIENIA"},
    WSTECZNE_UZASADNIONE_MEDYCZNIE: {value: 5, name: "Wsteczne \u2013 uzasadnione medycznie", id: "Wsteczne – uzasadnione medycznie", idEnum: "WSTECZNE_UZASADNIONE_MEDYCZNIE"},
    WSTECZNE_NIEUZASADNIONE_MEDYCZNIE: {value: 6, name: "Wsteczne \u2013 nieuzasadnione medycznie", id: "Wsteczne – nieuzasadnione medycznie", idEnum: "WSTECZNE_NIEUZASADNIONE_MEDYCZNIE"},
    PRAWIDLOWE: {value: 7, name: "Prawidłowe", id: "Prawidlowe", idEnum: "PRAWIDLOWE"},
    NS: {value: 8, name: "Niestawiennictwo na kontrol\u0119", id: "Niestawiennictwo na kontrol\u0119", idEnum: "NIESTAWIENNICTWO_NA_KONTROLE"},
    NIEKONTROLOWANE: {value: 9, name: "Niekontrolowane", id: "Niekontrolowane", idEnum: "NIEKONTROLOWANE"},
    W_TRAKCIE_KONTROLI: {value: 10, name: "W trakcie kontroli", id: "W trakcie kontroli", idEnum: "W_TRAKCIE_KONTROLI"},
    BEZ_ORZECZENIA_KONTROLOWANE: {value: 11, name: "Bez orzeczenia (kontrolowane)", id: "Bez orzeczenia (kontrolowane)", idEnum: "BEZ_ORZECZENIA_KONTROLOWANE"},
    ODSTAPIONO: {value: 12, name: "Odstąpiono", id: "Odstapiono", idEnum: "ODSTAPIONO"},
    WYSLANY: {value: 13, name: "Wysłany", id: "Wysłany", idEnum: "WYSLANY"}
};
function kleGenerateStatusSelect(select) {


    if (!select.isLoaded()) {
        select.setStore(new dojo.data.ItemFileWriteStore({data: {"items": [
            {"value": STATUS_ZLA_KSI_ENUM.WSZYSTKIE.value, "id": STATUS_ZLA_KSI_ENUM.WSZYSTKIE.id, "label": STATUS_ZLA_KSI_ENUM.WSZYSTKIE.name},
            {"value": STATUS_ZLA_KSI_ENUM.WYSTAWIONE.value, "id": STATUS_ZLA_KSI_ENUM.WYSTAWIONE.id, "label": STATUS_ZLA_KSI_ENUM.WYSTAWIONE.name},
            {"value": STATUS_ZLA_KSI_ENUM.SKORYGOWANE.value, "id": STATUS_ZLA_KSI_ENUM.SKORYGOWANE.id, "label": STATUS_ZLA_KSI_ENUM.SKORYGOWANE.name},
            {"value": STATUS_ZLA_KSI_ENUM.ANULOWANE.value, "id": STATUS_ZLA_KSI_ENUM.ANULOWANE.id, "label": STATUS_ZLA_KSI_ENUM.ANULOWANE.name},
            {"value": STATUS_ZLA_KSI_ENUM.WSTECZNE_DO_WYJASNIENIA.value, "id": STATUS_ZLA_KSI_ENUM.WSTECZNE_DO_WYJASNIENIA.id, "label": STATUS_ZLA_KSI_ENUM.WSTECZNE_DO_WYJASNIENIA.name},
            {"value": STATUS_ZLA_KSI_ENUM.WSTECZNE_UZASADNIONE_MEDYCZNIE.value, "id": STATUS_ZLA_KSI_ENUM.WSTECZNE_UZASADNIONE_MEDYCZNIE.id, "label": STATUS_ZLA_KSI_ENUM.WSTECZNE_UZASADNIONE_MEDYCZNIE.name},
            {"value": STATUS_ZLA_KSI_ENUM.WSTECZNE_NIEUZASADNIONE_MEDYCZNIE.value, "id": STATUS_ZLA_KSI_ENUM.WSTECZNE_NIEUZASADNIONE_MEDYCZNIE.id, "label": STATUS_ZLA_KSI_ENUM.WSTECZNE_NIEUZASADNIONE_MEDYCZNIE.name}
        ],
            "label": "label", "identifier": "id"}}));
    }
}

function trim(stringValue){
    if(stringValue == null || stringValue == undefined){
        return '';
    }
    return stringValue.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function kleStatusFormatter(objectValue, rowValue) {
    if (objectValue != null) {
        objectValue = trim(objectValue)
        switch (objectValue) {
            case STATUS_ZLA_KSI_ENUM.WSTECZNE_DO_WYJASNIENIA.idEnum:
                return STATUS_ZLA_KSI_ENUM.WSTECZNE_DO_WYJASNIENIA.name;
            case STATUS_ZLA_KSI_ENUM.WSTECZNE_UZASADNIONE_MEDYCZNIE.idEnum:
                return STATUS_ZLA_KSI_ENUM.WSTECZNE_UZASADNIONE_MEDYCZNIE.name;
            case STATUS_ZLA_KSI_ENUM.PRAWIDLOWE.idEnum:
                return STATUS_ZLA_KSI_ENUM.PRAWIDLOWE.name;
            case STATUS_ZLA_KSI_ENUM.ANULOWANE.idEnum:
                var seriaFormularzaZla = rowValue.seriaFormularzaZla || rowValue.identyfikatorZla.seriaZla;
                var numerFormularzaZla = rowValue.numerFormularzaZla || rowValue.identyfikatorZla.numerZla;
                return STATUS_ZLA_KSI_ENUM.ANULOWANE.name + " " +
                    '<a href="#" onclick="onLinkToAzlaClick(\'' + seriaFormularzaZla + '\',\'' + numerFormularzaZla + '\'); return false;">(AZLA)</a>';
            case STATUS_ZLA_KSI_ENUM.WYSTAWIONE.idEnum:
                return STATUS_ZLA_KSI_ENUM.WYSTAWIONE.name;
            case STATUS_ZLA_KSI_ENUM.NS.idEnum:
                return STATUS_ZLA_KSI_ENUM.NS.name;
            case STATUS_ZLA_KSI_ENUM.WSTECZNE_NIEUZASADNIONE_MEDYCZNIE.idEnum:
                return STATUS_ZLA_KSI_ENUM.WSTECZNE_NIEUZASADNIONE_MEDYCZNIE.name;
            case STATUS_ZLA_KSI_ENUM.ODSTAPIONO.idEnum:
                return STATUS_ZLA_KSI_ENUM.ODSTAPIONO.name;
            case STATUS_ZLA_KSI_ENUM.SKORYGOWANE.idEnum:
                return STATUS_ZLA_KSI_ENUM.SKORYGOWANE.name;
            case STATUS_ZLA_KSI_ENUM.NIEKONTROLOWANE.idEnum:
                return STATUS_ZLA_KSI_ENUM.NIEKONTROLOWANE.name;
            case STATUS_ZLA_KSI_ENUM.W_TRAKCIE_KONTROLI.idEnum:
                return STATUS_ZLA_KSI_ENUM.W_TRAKCIE_KONTROLI.name;
            case STATUS_ZLA_KSI_ENUM.BEZ_ORZECZENIA_KONTROLOWANE.idEnum:
                return STATUS_ZLA_KSI_ENUM.BEZ_ORZECZENIA_KONTROLOWANE.name;
            case STATUS_ZLA_KSI_ENUM.WYSLANY.idEnum:
                return STATUS_ZLA_KSI_ENUM.WYSLANY.name;
            default:
                return objectValue;
        }
    }
}

function onLinkToAzlaClick(seriaZla, numerZla) {
    var id = null;

    var path = dojo.hash();

    if(path.indexOf('KLE') != -1){
        path = 'obszar-lekarza'
    } else if (path.indexOf('EPL') != -1){
        path = 'eplatnik'
    } else if (path.indexOf('KPL') != -1){
        path = 'obszar-platnika'
    } else if (path.indexOf('KSW') != -1){
        path = 'obszar-swiadczeniobiorcy'
    } else if (path.indexOf('KUB') != -1){
        path = 'obszar-ubezpieczonego'
    }


    dojo.xhrPost({
        url: path + "/pobierzAzlaDlaZla.npi",
        handleAs: "json",
        content: {
            seriaZLA: seriaZla,
            numerZLA: numerZla
        },
        sync: true,
        load: function (resp) {
            if (resp.idAZLA) {
                id = resp.idAZLA;
                var formContainer = new zusnpi.sof.SofFormContainer();
                formContainer.setTrybFormularza(new zusnpi.sof.SofFormMode().PODGLAD_BEZ_WALIDACJI);
                formContainer.setKodTypuDok("ZUS_AZLA");
                formContainer.setIdDokumentu(id);
                formContainer.actionUrl = "pobierzFormularzSWF/kleFormularzeZla.npi";

                ustawDaneFomrularza(formContainer);
            } else {
                var dialogSynNaLiscie = new zusnpi.dialog.YesNoDialog({
                    title: "Wystąpił błąd",
                    noText: "OK",
                    content: 'Zaświadczenie zostało anulowane. Dokument nie jest dostępny w PUE.'
                });
                dialogSynNaLiscie.yesButton.hide();
                dialogSynNaLiscie.setArgs();
                dialogSynNaLiscie.show();
            }
        },
        error: function (error) {
            showDialog(new zusnpi.dialog.Error(), error);
        }
    });
}

/**
 * Parsuje string do typu Date zadanego constrainta - używać z zusNpiDateFormat,
 * zusNpiTimeFormat, zusNpiDateTimeFormat
 *
 * @param val
 * @param constraints
 * @returns
 */
function parseDate(val, constraints) {
    if (!val) {
        return null;
    }
    if (constraints) {
        return dojo.date.locale.parse(val, constraints);
    }
    return dojo.date.locale.parse(val, zusNpiFullDateTimeFormat);
}

/**
 * Formatuje obiekt typu Date jako string wg zadanego constrainta - używać z
 * zusNpiDateFormat, zusNpiTimeFormat, zusNpiDateTimeFormat
 *
 * @param val
 * @param constraints
 *            jeśli nie podany, przyjmuje zusNpiDateTimeFormat
 * @returns
 */
function formatDate(val, constraints) {
    if (!val) {
        return "";
    }
    if (!(val instanceof Date)) {
        return val;
    }
    if (constraints) {
        return dojo.date.locale.format(val, constraints);
    }
    return dojo.date.locale.format(val, zusNpiDateTimeFormat);
}

/**
 * Formatuje string zapisujący walutę w formacie zgodnym z przechowywanym w
 * cookies
 *
 * @param val
 * @returns
 */
function gridCurrencyFormatter(value) {
    if (!this.currencyFormatter) {
        this.currencyFormatter = new CurrencyFormatter();
    }
    return this.currencyFormatter.format(value);
}

/**
 * Formatuje string zapisujący datę w formacie który przychodzi z serwera
 * (yyyy-MM-dd HH:mm) jako string wg formatu zusNpiDateFormat
 *
 * @param val
 * @returns
 */
function gridDateFormatter(val) {
    return formatDate(parseDate(val), zusNpiDateFormat);
};

function gridFullTimeFormatter(val) {
    return formatDate(parseDate(val), zusNpiFullDateTimeFormat);
}

function gridOkresDateFormatter(val) {
    return formatDate(parseDate(val), zusNpiOkresDateFormat);
};

/**
 * Formatuje string zapisujący datę w formacie który przychodzi z serwera
 * (yyyy-MM-dd HH:mm) jako string wg formatu zusNpiYearMonthFormat
 *
 * @param val
 * @returns
 */
function gridYearMonthFormatter(val) {
    return formatDate(parseDate(val), zusNpiYearMonthFormat);
};

/**
 * Formatuje string zapisujący datę w formacie który przychodzi z serwera
 * (yyyy-MM-dd HH:mm) jako string wg formatu zusNpiDateTimeFormat
 *
 * @param val
 * @returns
 */
function gridDateTimeFormatter(val) {
    return formatDate(parseDate(val), zusNpiDateTimeFormat);
};

/**
 * Formatuje string zapisujący datę w formacie który przychodzi z serwera
 * (yyyy-MM-dd HH:mm) jako string wg formatu zusNpiTimeFormat
 *
 * @param val
 * @returns
 */
function gridTimeFormatter(val) {
    return formatDate(parseDate(val), zusNpiTimeFormat);
};

var PROFILE_REHABILITACYJNE = {
    rehabilitacjaPoOperacjiNowotworuPiersi: "Rehabilitacja po leczeniu nowotworu gruczołu piersiowego",
    schorzeniaNarzadowRuchu: "Schorzenia narządu ruchu",
    schorzeniaPsychosomatyczne: "Schorzenia psychosomatyczne",
    schorzeniaUkladuKrazenia: "Schodzenia układu krążenia",
    schorzeniaUkladuOddechowego: "Schorzenia układu oddechowego"
};
/**
 * Formatuje profile rehabilitacyjne
 * @param val
 */
function gridProfilRehabilitacjiFormatter(val) {
    var profileRehabilitacyjne = "";

    if (val.rehabilitacjaPoOperacjiNowotworuPiersi == "true") {
        profileRehabilitacyjne += PROFILE_REHABILITACYJNE.rehabilitacjaPoOperacjiNowotworuPiersi;
    }
    if (val.schorzeniaNarzadowRuchu == "true") {
        if (profileRehabilitacyjne.length > 0) {
            profileRehabilitacyjne += ", ";
        }
        profileRehabilitacyjne += PROFILE_REHABILITACYJNE.schorzeniaNarzadowRuchu;
    }
    if (val.schorzeniaPsychosomatyczne == "true") {
        if (profileRehabilitacyjne.length > 0) {
            profileRehabilitacyjne += ", ";
        }
        profileRehabilitacyjne += PROFILE_REHABILITACYJNE.schorzeniaPsychosomatyczne;
    }
    if (val.schorzeniaUkladuKrazenia == "true") {
        if (profileRehabilitacyjne.length > 0) {
            profileRehabilitacyjne += ", ";
        }
        profileRehabilitacyjne += PROFILE_REHABILITACYJNE.schorzeniaUkladuKrazenia;
    }
    if (val.schorzeniaUkladuOddechowego == "true") {
        if (profileRehabilitacyjne.length > 0) {
            profileRehabilitacyjne += ", ";
        }
        profileRehabilitacyjne += PROFILE_REHABILITACYJNE.schorzeniaUkladuOddechowego;
    }
    if (val.inneSchorzeniaOpis !== null) {
        if (profileRehabilitacyjne.length > 0) {
            profileRehabilitacyjne += ", ";
        }
        profileRehabilitacyjne += val.inneSchorzeniaOpis;
    }

    if (profileRehabilitacyjne.length === 0) {
        profileRehabilitacyjne = null;
    }

    return profileRehabilitacyjne;
};
/**
 * Zwraca obecny moment czasu wg formatu z datą
 *
 * @returns
 */
function getNowAsDate() {
    return formatDate(new Date(), zusNpiDateFormat);
}

/**
 * Zwraca obecny moment czasu wg formatu z datą i czasem
 *
 * @returns
 */
function getNowAsDateTime() {
    return formatDate(new Date(), zusNpiDateTimeFormat);
}

/**
 * Zwraca obecny moment czasu wg domyślnego formatu z datą i czasem - takiego
 * jak przesyła serwer i ma wygodną nazwę.
 *
 * @returns
 */
function getNow() {
    return getNowAsDateTime();
}

// =========== SPLASH

var timer;
var timeoutMillis = 5000;

function stopSplashTimer() {
    try {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    } catch (exception) {
        console.error("STOP SPLASH TIMER ERROR", exception);
    }
};

function startSplashTimer() {
    try {
        timer = setTimeout("hideSplash();", timeoutMillis);
    } catch (exception) {
        console.error("START SPLASH TIMER ERROR", exception);
    }
};

function hideSplash() {
    var splash = getSplashComponent();
    if (canChangeDisplayForSplash(splash)) {
        stopSplashTimer();
        splash.style.display = "none";
    }
};

function showSplash() {
    var splash = getSplashComponent();
    if (canChangeDisplayForSplash(splash)) {
        splash.style.display = "block";
    }
    startSplashTimer();
};

function getSplashComponent() {
    return dojo.byId("loaderSplash");
};

function canChangeDisplayForSplash(splash) {
    return splash;
};

// === GETTING STRUCTURE

function getStructureFromAction(url) {
    var structure = null;
    if (!url) {
        return structure;
    }
    var args = {
        sync: true,
        url: url,
        handleAs: "json",
        load: function (resp) {
            structure = resp;
        }
    };

    dojo.xhrPost(args);
    return structure;
};

function compare(objA, objB) {
    if (typeof objA != "object" || typeof objB != "object") {
        return false;
    }

    var props = {};
    for (prop in objA) {
        if (!dojo.isFunction(objA[prop]))
            props[prop] = 1;
    }
    for (prop in objB) {
        if (!dojo.isFunction(objB[prop]))
            props[prop] = 1;
    }

    for (prop in props) {
        if (objA[prop] == undefined || objB[prop] == undefined) {
            return false;
        } else if (typeof objA[prop] == "object" && typeof objB[prop] == "object") {
            if (!compare(objA[prop], objB[prop])) {
                return false;
            }
        } else if (objA[prop] !== objB[prop]) {
            return false;
        }
    }
    return true;
}

function resizeContextPane() {
    var contextPane = dijit.byId("contextPane");
    if (contextPane && contextPane.resize) {
        contextPane.resize();
    }
}

function getCheckboxColumn(title, width, gridId) {
    return getCheckboxColumnExt({
        title: title,
        width: width,
        gridId: gridId
    });
}

function getCheckboxColumnExt(args/* title, width, gridId */) {

    var fieldTitle = 'Wybór';
    var fieldWidth = '30px';
    var showHeaderCheckbox = false;
    var headerCheckFuncName = 'grid.setAllRecordsSelected';
    if (args) {
        if (args.title) {
            fieldTitle = args.title;
        }

        if (args.width) {
            fieldWidth = args.width;
        }
        if (args.showHeaderCheckbox) {
            showHeaderCheckbox = true;
        }
        if (args.onHeaderCheckFunctionName) {
            headerCheckFuncName = args.onHeaderCheckFunctionName;
        }
    }

    return {
        field: 'zusnpiGridMultiSelectionField',
        name: fieldTitle,
        width: fieldWidth,
        filterable: false,
        sortable: false,
        styles: 'text-align: center;',
        datatype: 'boolean',
        noresize: true,
        showHeaderCheckbox: showHeaderCheckbox,
        onHeaderCheckFunctionName: headerCheckFuncName,
        formatter: function (objectValue, rowNumber, cellInfo) {

            // GETTING CHECKBOX
            var check;
            if (objectValue && objectValue) {
                check = new dijit.form.CheckBox({checked: 'checked'});
            } else {
                check = new dijit.form.CheckBox({});
            }

            // GETTING GRID
            var grid;
            if (args && args.gridId) {
                grid = dijit.byId(args.gridId);
            } else if (cellInfo && cellInfo.grid) {
                grid = cellInfo.grid;
            }

            // IF GRID EXISTS ADD ONCHANGE EVENT
            if (grid) {
                check.onChange = function (newValue) {
                    grid.addOrRemoveIdToSelection(newValue, rowNumber);
                }
            }

            return check;
        }
    }
}

// ESB
function getDateLongFromDateString(stringDate) {
    if (stringDate == null) {
        return stringDate;
    }
    return Date.parse(stringDate);
}

// ustawia cookie z parametrami CurrencyFormattera
CurrencyFormatter.InitializeCookies = function (synchronous) {
    if (!synchronous) {
        synchronous = false;
    }
    dojo.xhrPost({
        url: "getCurrencyParams.npi",
        handleAs: "json",
        load: function (resp, ioArgs) {
            if (this.currencyFormatter) {
                this.currencyFormatter.getConfigFromCookies();
            }
        },
        sync: synchronous
    });
};

// CURRENCY FORMATTER
function CurrencyFormatter(plnToEurRate, inputCurrency, presentationFormat) {
    this.currencySeparator = " / ";

    this.getConfigFromCookies = function () {
        var plnToEurRate = dojo.cookie("KURS-EUR");
        if (typeof plnToEurRate == "undefined") {
            plnToEurRate = 1;
        }
        else if (typeof plnToEurRate == "string") {
            plnToEurRate = plnToEurRate.replace(/"/g, "");
        }
        this.plnToEurRate = this.fixDecimalSeparator(plnToEurRate);
        this.inputCurrency = dojo.cookie("WALUTA-ZAPISU-KWOT");
        if (typeof this.inputCurrency != "undefined") {
            this.inputCurrency = this.inputCurrency.replace(/"/g, "");
        }
        this.presentationFormat = dojo.cookie("WALUTA-PREZENTACJI-KWOT");
        if (typeof this.presentationFormat != "undefined") {
            this.presentationFormat = this.presentationFormat.replace(/"/g, "");
        }
    };

    this.initializeCookies = function () {
        CurrencyFormatter.InitializeCookies(true);
        this.getConfigFromCookies();
    };

    this.format = function (value) {
        if (!value) {
            value = 0;
        }

        value = this.fixDecimalSeparator(value);
        return this._formatValue(value, this.plnToEurRate, this.presentationFormat);
    };

    this.fixDecimalSeparator = function (value) {
        if (typeof value == "number") {
            return value;
        }
        var valueCommaSep = value.replace(',', '.');
        var parsedValue = parseFloat(valueCommaSep);
        return parsedValue;
    };

    this.formatCell = function (row, item) {
        return this.format(item[0]);
    };

    this.apply = this.formatCell;

    this._formatValue = function (value, plnToEur, presentationFormat) {
        if (presentationFormat == CurrencyFormatter.PRESENTATION_FORMAT_ENUM.EUR_AND_PLN) {
            return this._eurAsString(value) + this.currencySeparator + this._plnAsString(value);
        }
        else if (presentationFormat == CurrencyFormatter.PRESENTATION_FORMAT_ENUM.PLN_AND_EUR) {
            return this._plnAsString(value) + this.currencySeparator + this._eurAsString(value);
        }
        else if (presentationFormat == CurrencyFormatter.PRESENTATION_FORMAT_ENUM.EUR_ONLY) {
            return this._eurAsString(value);
        }
        else if (presentationFormat == CurrencyFormatter.PRESENTATION_FORMAT_ENUM.PLN_ONLY) {
            return this._plnAsString(value);
        }
        else {
            console.warn("Invalid presentation format");
            return value;
        }
    };

    this._plnAsString = function (value) {
        var plns = value;
        if (this.inputCurrency != CurrencyFormatter.INPUT_CURRENCY_ENUM.PLN) {
            plns = this._eurToPln(value);
        }
        return dojo.currency.format(plns, {currency: "PLN"});
    };

    this._eurToPln = function (value) {
        return value * this.plnToEurRate;
    };

    this._eurAsString = function (value) {
        var eurs = value;
        if (this.inputCurrency != CurrencyFormatter.INPUT_CURRENCY_ENUM.EUR) {
            eurs = this._plnToEur(value);
        }
        return dojo.currency.format(eurs, {currency: "EUR"});
    };

    this._plnToEur = function (value) {
        return value / this.plnToEurRate;
    };

    this._toFixed = function (number, digits) {
        if (number.toFixed) {
            return number.toFixed(digits);
        }
        // no browser support for currency formatting
        console.warn("This browser does not support currency formatting");
        return number;
    };

    this.getConfigFromCookies();
    if (!this.plnToEurRate || !this.inputCurrency || !this.presentationFormat) {
        this.initializeCookies();
    }

// if (plnToEurRate) {
// this.plnToEurRate = plnToEurRate;
// }
// if (inputCurrency) {
// this.inputCurrency = inputCurrency;
// }
// if (presentationFormat) {
// this.presentationFormat = presentationFormat;
// }
}

CurrencyFormatter.INPUT_CURRENCY_ENUM = {
    EUR: "EUR",
    PLN: "PLN"
};

CurrencyFormatter.PRESENTATION_FORMAT_ENUM = {
    EUR_AND_PLN: "EUR/PLN",
    PLN_AND_EUR: "PLN/EUR",
    EUR_ONLY: "EUR",
    PLN_ONLY: "PLN"
};


function callback() {
    console.log("CALLBACK");
}

function getIdFromFullId(fullId, idNo) {

    var start;
    var stop;
    if (idNo > 5)
        return fullId;

    switch (idNo) {
        case 1:
            start = fullId.indexOf("b&");
            stop = fullId.indexOf(";");
            break;
        default:
            start = fullId.indexOf(idNo + "&");
            if (idNo == 5)
                stop = fullId.lastIndexOf("");
            else
                stop = fullId.indexOf(";idObCz" + (idNo + 1));
            break;
    }

    return fullId.substring(start + 2, stop);
};

function createFullId() {
    var id = "";
    //idOb&665;idObCz2&h;idObCz3&null;idObCz4&null;idObCz5&null;idObRand&517685803288
    for (var i = 1; i < 6; i++) {
        id += "idOb" + ((i == 1) ? "" : "Cz" + i) + "&" + (arguments[i] != null) ? arguments[i] : "null";
    }
    return id;
}

function ustawDaneFomrularza(sofContainer, dialog, id) {
    if (dialog != null) {
        dialog.onHide();
    }

    var content = {
        "context": dojo.hash(),
        "request.kodTypuDok": sofContainer._kodTypuDok,
        "request.wersjaWzoruDok": sofContainer._wersjaWzoruDok,
        "request.wersjaFormularza": sofContainer._wersjaFormularza
    }
    if (id != null) {
        content["id.fullId"] = id;
    }

    dojo.xhrPost({
        url: sofContainer.actionUrl,
        content: content,
        handleAs: "json",
        load: function (resp, ioArgs) {
            dojo.mixin(resp, {
                trybFormularza: sofContainer.trybFormularza,
                idDokumentu: sofContainer._idDokumentu
            });
            resp.swfURL = fixSwfUrl(resp.swfURL);
            sofContainer._sofFormConfig = resp;
            wczytajFormularzWgKonfiguracji(
                sofContainer._sofFormConfig,
                sofContainer.onSofFormClose,
                sofContainer);
        },
        error: function (error) {
            console.log(error);
        }
    });
};

// Form export
function exportGrid(exportUrl, fileExtension, externalParams, afterExportCallback) {
    exportForm(exportUrl, fileExtension, externalParams, afterExportCallback);
};
function exportForm(exportUrl, fileExtension, externalParams, afterExportCallback) {

    var content = { exportType: fileExtension };

    if (externalParams != null) {
        for (var key in externalParams) {
            content[key] = externalParams[key];
        }
    }

    if (!afterExportCallback) {
        afterExportCallback = function () {
            longSplash.destroy();
            downloadLastExportedFile();
        };
    }
    var longSplash = new zusnpi.layout.splash.LongActionSplashscreen({
        parentId: dojo.body(),
        actionUrl: exportUrl,
        getContentArgs: function () {
            return content;
        },
        onSuccessCallback: afterExportCallback
    });
    longSplash.fireAction();

};

function downloadLastExportedFile() {
    dojo.io.iframe.send({
        timeout: 1000,
        url: 'downloadFile.npi',
        form: "GRID_EXPORT_FORM_ID"
    });
};

// deprecated - redmine 5616, 10333
function pobierzPodgladPDFostatniegoFormularzaZUS() {
    // setTimeout(previewLastSavedPdfFile(),2000);
    previewLastSavedPdfFile();
};

function previewLastSavedPdfFile() {
    var preview = new zusnpi.dialog.PdfView({
        type: "VIEW_LAST"
    });
};

function recursiveDestroy(obiekt) {
    dojo.forEach(obiekt.getChildren(), recursiveDestroy);
    obiekt.destroy();
};

var helpWnd = null;
// Otwiera okno pomocy kontekstowej z zadanym plikiem pomocy
function openHelpDialog(helpId, height, width, title) {
    var url;
    if (helpId == "kontaktCIT") {
        url = "pomoc/kontakt_z_cit.html";
    } else {
        var regularExpression = /[a-zA-Z][a-zA-Z][a-zA-Z][0-9][0-9][0-9][0-9]/;
        if (helpWnd != null) {
            helpWnd.close();
        }
        url = "pomoc/index.html?" + helpId.toLowerCase() + ".html";
        if (!regularExpression.test(helpId)) {
            url = "pomoc/index.html";
        }
    }
    helpWnd = window.open(url, title, 'width=1000, height=600, menubar=no, toolbar=no, location=no, scrollbars=yes, resizable=yes, status=no');
    /*
     * var dialog = new zusnpi.dialog.ContextualHelpDialog( { title: title,
     * helpPageId: helpId, width: width, height: height }); dialog.show();
     */
};
// Otwiera okno wirtualnego doradcy z wybranym tematem pomocy
function openHelpWithWD(helpId) {
    var asystentDialog = dijit.byId("asystentDialog");
    asystentDialog.show();
    // ... dodać przekazanie tematu rozmowy do asystenta
};

function changeMainTitleAndPageId(mainContentPaneId, newTitle, newPageId) {
    var mainContentPane = dijit.byId(mainContentPaneId);
    mainContentPane.changeTitleAndHelpId(newTitle, newPageId);
};

function isSupportedBrowser() {

    var setInSession = false;
    dojo.xhrPost({
        url: "isUnsupportedBrowserIgnored.npi",
        sync: true,
        handleAs: "json",
        load: function (resp) {
            setInSession = resp.result;
        }
    });

    if (setInSession == true) {
        return true;
    }

    return isDojoSupportedBrowser();
};

function isDojoSupportedBrowser() {
    if (dojo.isIE >= 8) {
        return true;
    } else if (dojo.isFF >= 3) {
        return true;
    } else if (dojo.isChrome >= 8) {
        return true;
    } else if (dojo.isSafari >= 4) {
        return true;
    } else if (dojo.isAndroid) {
        return true;
    } else if (dojo.isIos) {
        return true;
    } else {
        var ie11 = !!navigator.userAgent.match(/Trident\/7\..*rv:11\./);
        if (ie11) {
            return true;
        }
        var ie10 = !!navigator.userAgent.match(/MSIE 10\./) || !!navigator.userAgent.match(/Trident\/6\./);
        if (ie10) {
            return true;
        }
        var ie9 = !!navigator.userAgent.match(/MSIE 9\./) || !!navigator.userAgent.match(/Trident\/5\./);
        if (ie9) {
            return true;
        }
    }
    return false;
}

var sessionExpiredDialog = null;
function showExpiredSessionAlertAndReload() {
    if (sessionExpiredDialog != null) {
        return;
    }
    hideSplash();
    hidePdfPreview();
    if (sessionWillExpireDialog != null) {
        sessionWillExpireDialog.hide();
    }
    sessionExpiredDialog = new zusnpi.dialog.Alert({
        content: 'Ważność Twojej sesji wygasła. Proszę zalogować się ponownie.',
        _onHide: function () {
            sessionExpiredDialog = null;
            window.location = "index.npi";
        }
    });
    sessionExpiredDialog.show();
};

var sessionWillExpireDialog = null;
function showSessionWillExpireAlertAndReload() {

    if (sessionWillExpireDialog != null) {
        return;
    }

    hideSplash();
    hidePdfPreview();

    sessionWillExpireDialog = new zusnpi.dialog.Alert({
        content: 'Ważność Twojej sesji wkrótce wygaśnie. Naciśnij OK aby przedłużyć.',
        _onHide: function () {
            sessionWillExpireDialog = null;
            prolongateSessionAndUpdateStatusBar();
        }
    });
    sessionWillExpireDialog.show();
};

function hidePdfPreview() {
    var preview = getPdfPreviewDialog();
    if (preview && preview.hide) {
        preview.hide();
    }
};

function getPdfPreviewDialog() {
    var dialog = null;
    var viewContainers = dojo.query("*[dojoAttachPoint='pdfViewContainer']");
    if (viewContainers && viewContainers[0]) {
        var parent = viewContainers[0].parentNode;
        while (!dialog || parent) {
            var id = dojo.getNodeProp(parent, "id");
            if (id) {
                var parentWidget = dijit.byId(id);
                if (parentWidget instanceof dijit.Dialog) {
                    dialog = parentWidget;
                }
            }
            parent = parent.parentNode;
        }
    }
    return dialog;
};

function prolongateSessionAndUpdateStatusBar() {
    dojo.xhrPost({
        url: "sessionProlongation.npi",
        load: function () {
            updateStatusBarWithLeftSeconds(getSessionLeftMinsString());
        }
    });
}

var checkSessionTimerPingSeconds = 60;
var checkSessionTimerPingMillis = checkSessionTimerPingSeconds * 1000;
function checkSessionIsActive() {
    dojo.xhrPost({
        url: "inactiveSessionServletCheck",
        handleAs: "json",
        load: function (resp) {
            if (resp.answer == "DIE") {
                showExpiredSessionAlertAndReload();
            } else {
                if (resp.leftSeconds <= 2 * checkSessionTimerPingSeconds) {
                    showSessionWillExpireAlertAndReload();
                }
                setTimeout("checkSessionIsActive()", checkSessionTimerPingMillis);
                updateStatusBarWithLeftSeconds(resp.leftSeconds);
            }
        }
    });
};

function getSessionLeftMinsString() {
    var mins = "";
    dojo.xhrPost({
        url: "inactiveSessionServletCheck",
        handleAs: "json",
        sync: true,
        load: function (resp) {
            if (resp.answer != "DIE") {
                mins = getMinsStringForSeconds(resp.leftSeconds);
            }
        }
    });
    return mins;
};

function updateStatusBarWithLeftSeconds(/* number */ leftSeconds) {
    var statusBar = dijit.byId("statusBar");
    if (statusBar) {
        statusBar.setSessionActiveTime(getMinsStringForSeconds(leftSeconds));
    }
};

function getMinsStringForSeconds(/* number */ seconds) {
    return Math.round(seconds / 60) + "";
};

function isDebugMode() {
    return dojo.cookie("IS-DEBUG-MODE") == "true";
};

function isTitlePaneDefaultOpened() {
    return dojo.cookie("OPEN-ALL-TITLE-PANES") == "true";
};

function getAdresStronyGlownej() {
    var adres = "";
    var args = {
        url: "riu/strona-glowna-adres.npi",
        handleAs: "json",
        sync: true,
        load: function (resp) {
            if (resp != null && resp['adres'] != null) {
                adres = resp['adres'];
            }
        }
    };
    dojo.xhrPost(args);
    return adres;
};

function getCOTSkypeId() {
    var skypeCotId = "";
    var args = {
        url: "riu/cotSkypeId.npi",
        handleAs: "json",
        sync: true,
        load: function (resp) {
            if (resp && resp['cotSkypeId']) {
                skypeCotId = resp['cotSkypeId'];
            }
        }
    };
    dojo.xhrPost(args);
    return skypeCotId;
}

/**
 * Sprawdza czy zostala ustawiona flaga świadcząca o niedostępności ePUAP.
 *
 */
function checkEPUAPInfoAndShowMessageAsync(parent, onSuccess, onError, splash) {

    //#13567 - przeniesiono do wersji 1.9
    onSuccess();
    return;

    var splashEPUAP = splash;
    if (splashEPUAP == null) {
        splashEPUAP = new zusnpi.layout.splash.Splashscreen(
            {
                parentId: parent,
                text: 'Proszę czekać',
                additionalText: 'Trwa sprawdzanie dostępności na ePUAP...'
            });
        splashEPUAP.show();
    }

    var args = {
        url: "riu/pobierzKomunikatNiedostepnosciEPUAP.npi",
        handleAs: "json",
        sync: false,
        load: function (resp) {
            if (resp != null && resp.komunikat != null) {
                showEPUAPErrorDialog(resp.komunikat);

                splashEPUAP.hide();
                splashEPUAP.destroy();
            } else {
                onSuccess();
                // zewnetrzny splash chowamy tylko w przypadku gdy nie
                // ustawiony parametr
                if (splash == null) {
                    splashEPUAP.hide();
                    splashEPUAP.destroy();
                }
            }
        },
        error: function (error) {
            onError(error);
            // zewnetrzny splash chowamy tylko w przypadku gdy nie
            // ustawiony parametr
            if (splash == null) {
                splashEPUAP.hide();
                splashEPUAP.destroy();
            }
        }
    };
    dojo.xhrPost(args);
};

function showEPUAPErrorDialog(komunikat) {
    var dialogAlertu = new zusnpi.dialog.Alert({
        dialogHeight: '150px',
        dialogWidth: '460px',
        title: "Serwis ePUAP jest niedostępny",
        content: komunikat
    });
    dialogAlertu.show();
};

function fixSwfUrl(url) {
    return url.replace(/\\/g, '/');
}

function pokazRaportORoli(url) {
    dojo.xhrPost({
        content: {},
        handleAs: "text",
        sync: true,
        url: url,
        load: function (resp) {
            var _window = window.open('about:blank', 'raport', 'scrollbars=1,width=600,height=300,left=0,top=100,screenX=0,screenY=100');
            _window.document.write(resp);
            _window.document.close();
        }
    });
};

/** ************************************************* */
/** ************ KOD EKSPERYMENTALNY **************** */
/** ************************************************* */
function hideConnectedDijitTooltipForWidgetId(widgetId) {
    if (widgetId) {
        var tooltipNodeArray = dojo.query("*[connectId='" + widgetId + "']");
        if (tooltipNodeArray) {
            for (var index in tooltipNodeArray) {
                var tooltipId = dojo.getNodeProp(tooltipNodeArray[index], "id");
                if (tooltipId) {
                    var tooltip = dijit.byId(tooltipId);
                    if (tooltip && tooltip instanceof dijit.Tooltip && tooltip.close) {
                        tooltip.close();
                    }
                }
            }
        }
    }
};
/** ************************************************* */
/** ******** KONIEC KODU EKSPERYMENTALNEGO ********** */
/** ************************************************* */