/*
 * Szafir Web Components v1.12 (Wersja wymaga bibliotek Szafir SDK w wersji 1.8.1 (Build 299) lub wyższej)
 * http://www.elektronicznypodpis.pl/oferta/narzedzia-programityczne/
 *
 * Krajowa Izba Rozliczeniowa (C) Wszelkie prawa zastrzeżone
 * http://www.kir.pl/
 *
 *
 * Atos Polska S.A.
 * Zmiany:
 *  - dodanie wywołania fnSzafirAppletResultHandler gdy applet jest już załadowany
 *  - dodanie parametru konfiguracyjnego cryptoapplet_jar umożliwiającego ustawienie ścieżki do pliku jar appletu
 *  - dodanie parametru konfiguracyjnego versions_file_applet ustawiającego ścieżkę do pliku versions.xml dla appletu (extension dla chroma inaczej tworzy sciężkę od appletu)
 */

function setAsyncSzafirAppletResult(result) {
	$.SzafirAppletResultHandler(result);
}

function setAsyncSzafirAppletError(error) {
	$.SzafirAppletErrorHandler(error);
}

var szafirsdk_ = (function($) {
	/*
	 $.urlParam = function(name) {
	 var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	 return (results == null ? null : results[1] || null);
	 }
	 //$.urlParam("target") == "chrome"
	 */
	var nav_ua = navigator.userAgent.toLowerCase();
	var chrome_detected = /\bchrome/.test(nav_ua) && !/\bedge/.test(nav_ua) && /google/.test(navigator.vendor.toLowerCase());

	var chrome_opera = false;

	if (chrome_detected) {
		//szukamy Opery w wersji >= 34
		var m = nav_ua.match(/\bopr\/(\d+)/);
		if (m != null) {
			if (parseInt(m[1]) >= 34) {
				chrome_opera = true;
			} else {
				chrome_detected = false;
			}
		}
	}

	var commands = { load: "load", unload: "unload", startComponent: "startComponent",
		getTaskList: "getTaskList", doTaskList: "doTaskList", doTaskListNoWindow: "doTaskListNoWindow",
		isCardInReader: "isCardInReader", getSignatureInfo: "getSignatureInfo", listCertificates: "listCertificates",
		test: "test", error: "error" }

	var szafirsdk_applet,
		szafirsdk_mode = (chrome_detected ? "SZAFIR_SDK_EXT" : "SZAFIR_SDK_APPLET"),
		szafirsdk_state = "UNLOADED", // UNLOADED -> LOADED -> STARTED -> UNLOADED lub UNLOADED -> ERROR

		szafir_config = {
			document_base_url: window.location.href,
			debug: false,
			load_szafir_immediately: false,
			sdk_location_url: "szafir_build_directory/",
			cryptoapplet_jar: "cryptoapplet.jar",
			versions_file: "versions.xml",
			versions_file_applet:"versions.xml",

			onError: undefined,						// funkcja użytkownika o sygnaturze fun(error) uruchamiana podczas obsługi błędu
			onLoaded: undefined,					// funkcja użytkownika uruchamiana po załadowaniu Szafira
			onStarted: undefined,					// funkcja użytkownika uruchamiana po wystartowaniu Szafira
			onUnloaded: undefined,					// funkcja użytkownika uruchamiana po wyładowaniu Szafira
			onGetTaskListResult: undefined,			// funkcja użytkownika o sygnaturze fun(result) obsługująca wynik funkcji SDK getTaskList, getTaskListURI
			onDoTaskListResult: undefined,			// funkcja użytkownika o sygnaturze fun(result) obsługująca wynik funkcji SDK doTaskList, doTaskListNoWindow
			onIsCardInReaderResult: undefined,		// funkcja użytkownika o sygnaturze fun(result) obsługująca wynik funkcji SDK isCardInReader
			onGetSignatureInfoResult: undefined,	// funkcja użytkownika o sygnaturze fun(result) obsługująca wynik funkcji SDK getSignatureInfo
			onListCertificatesResult: undefined		// funkcja użytkownika o sygnaturze fun(result) obsługująca wynik funkcji SDK listCertificates
		},

		fnSzafirAppletResultHandler,
		fnSzafirAppletErrorHandler = function(error) {
			postWindowErrorMsg({result: error});
		};

	$.szafirsdk_config = function(_config) {
		$.extend(szafir_config, _config);
	}

	$.isChromeOpera = function() {
		return chrome_opera;
	}
	$.SzafirAppletResultHandler = function(result) {
		if (fnSzafirAppletResultHandler instanceof Function) {
			fnSzafirAppletResultHandler(result);
		} else {
			console.log("APL.js : ERROR: fnSzafirAppletResultHandler not set");
		}
		fnSzafirAppletResultHandler = undefined;
	}
	$.SzafirAppletErrorHandler = function(error) {
		if (fnSzafirAppletErrorHandler instanceof Function) {
			fnSzafirAppletErrorHandler(error);
		} else {
			console.log("APL.js : ERROR: fnSzafirAppletErrorHandler not set");
		}
	}

	function postWindowMsg(params) {
		var msg = $.extend(params, { type: "SZAFIR_WND_MSG" });
		window.postMessage(JSON.stringify(msg), "*");
	}

	function postExtMsg(params) {
		var msg = $.extend(params, { type: "SZAFIR_EXT_MSG" });
		window.postMessage(JSON.stringify(msg), "*");
	}

	function postWindowErrorMsg(params) {
		var msg = $.extend(params, { type: "SZAFIR_WND_MSG", status: "ERROR" });
		window.postMessage(JSON.stringify(msg), "*");
	}

	function handleMsg(e) {
		// We only accept messages from ourselves
		if (e.source != window) {
			return;
		}

		var data = JSON.parse(e.data);
		if (data.type && data.type == "SZAFIR_WND_MSG") {

			if (data.status !== "ERROR") {

				switch(data.command) {
					case commands.load: onLoad(data); break;
					case commands.unload: onUnload(data); break;
					case commands.startComponent: onStartComponent(data); break;
					case commands.getTaskList: onGetTaskList(data); break;
					case commands.doTaskList:
					case commands.doTaskListNoWindow: onDoTaskList(data); break;
					case commands.isCardInReader: onIsCardInReader(data); break;
					case commands.getSignatureInfo: onGetSignatureInfo(data); break;
					case commands.listCertificates: onListCertificates(data); break;
					case commands.test: onTest(data); break;
				}

			} else {
				onError(data);
			}
		}
	}

	function handleWindowMessages() {
		if (window.addEventListener) {
			window.addEventListener("message", handleMsg);
		} else {
			//IE 8 or earlier
			window.attachEvent("onmessage", handleMsg);
		}
	}

	function onError(data) {
		console.log(data);
		if (typeof(szafir_config.onError) == "function") {
			szafir_config.onError(data.result);
		}
	}

	function onLoad(data) {
		switch(data.result) {
			case "LOADED" :
				if (typeof(szafir_config.onLoaded) == "function") {
					szafir_config.onLoaded();
				}
				break;
			case "NOHOSTAPP" :
				onErrorNoHostApp();
				break;
			case "ERROR" :
				break;
		}
	}

	function onUnload(data) {
		if (typeof(szafir_config.onUnloaded) == "function") {
			szafir_config.onUnloaded();
		}
	}

	function onStartComponent(data) {
		if (typeof(szafir_config.onStarted) == "function") {
			szafir_config.onStarted();
		}
	}

	function onGetTaskList(data) {
		if (typeof(szafir_config.onGetTaskListResult) == "function") {
			szafir_config.onGetTaskListResult(data.result);
		} else {
			$("#szafirsdk-taskList-xml").val(data.result).change();
		}
	}

	function onDoTaskList(data) {
		if (typeof(szafir_config.onDoTaskListResult) == "function") {
			szafir_config.onDoTaskListResult(data.result);
		} else {
			$("#szafirsdk-doTaskList-result").val(data.result).change();
		}
	}

	function onIsCardInReader(data) {
		if (typeof(szafir_config.onIsCardInReaderResult) == "function") {
			szafir_config.onIsCardInReaderResult(data.result);
		} else {
			$("#szafirsdk-isCardInReader-result").val(data.result).change();
		}
	}

	function onGetSignatureInfo(data) {
		if (typeof(szafir_config.onGetSignatureInfoResult) == "function") {
			szafir_config.onGetSignatureInfoResult(data.result);
		} else {
			$("#szafirsdk-getSignatureInfo-result").val(data.result).change();
		}
	}

	function onListCertificates(data) {
		if (typeof(szafir_config.onListCertificatesResult) == "function") {
			szafir_config.onListCertificatesResult(data.result);
		} else {
			$("#szafirsdk-listCertificates-result").val(data.result).change();
		}
	}

	function onTest(data) {
		$("#szafirsdk-test-result").val(data.result).change();
	}

	$.szafirsdk_detectChromeExt = function(base, if_installed, if_not_installed) {
		var s = document.createElement("script");
		s.onload = if_installed;
		s.onerror = if_not_installed;
		$("#szafirsdk-applet-placeholder").append(s);
		s.src = base + "/version.js";
	}

	$.szafirsdk_init = function(callback){
		if ($("#szafirsdk-mode").val() == "SZAFIR_SDK_APPLET") { //SZAFIR_SDK_EXT

			$("#szafirsdk-loadSzafir-action").unbind('click').click(loadSzafir);
			$("#szafirsdk-unloadSzafir-action").unbind('click').click(unloadSzafir);

			$("#szafirsdk-startComponentUri-action").unbind('click').click(startComponentURI);
			$("#szafirsdk-startComponent-action").unbind('click').click(startComponent);

			$("#szafirsdk-getTaskListUri-action").unbind('click').click(getTaskListURI);
			$("#szafirsdk-getTaskList-action").unbind('click').click(getTaskList);

			$("#szafirsdk-doTaskList-action").unbind('click').click(doTaskList);
			$("#szafirsdk-doTaskListNoWindow-action").unbind('click').click(doTaskListNoWindow);
			$("#szafirsdk-doTaskListNoWindow_1pass-action").unbind('click').click(doTaskListNoWindow1Pass);
			$("#szafirsdk-doTaskListNoWindow_2pass-action").unbind('click').click(doTaskListNoWindow2Pass);

			$("#szafirsdk-isCardInReader-action").unbind('click').click(isCardInReader);
			$("#szafirsdk-getSignatureInfo-action").unbind('click').click(getSignatureInfo);
			$("#szafirsdk-listCertificates-action").unbind('click').click(listCertificates);

			callback();

		} else {

			$.szafirsdk_detectChromeExt("chrome-extension://gjalhnomhafafofonpdihihjnbafkipc", callback, onErrorNoExtension);
		}
	}

	/***** Initialization onReady *****/
	$(function() {
		handleWindowMessages();

		$("body").append('<div id="szafirsdk-applet-placeholder"></div>');
		$("#szafirsdk-applet-placeholder").append('<input type="hidden" id="szafirsdk-params" name="szafirsdk-params" />');
		$("#szafirsdk-applet-placeholder").append('<input type="hidden" id="szafirsdk-mode" name="szafirsdk-mode" value="' + szafirsdk_mode + '" />');
		$("#szafirsdk-applet-placeholder").append('<input type="hidden" id="szafirsdk-state" name="szafirsdk-state" value="' + szafirsdk_state + '" />');
		$("#szafirsdk-applet-placeholder").append('<input type="hidden" id="szafirsdk-temp-result" name="szafirsdk-temp-result" />');
		$("#szafirsdk-applet-placeholder").append('<input type="hidden" id="szafirsdk-error" name="szafirsdk-error" />');
		$("#szafirsdk-params").val(JSON.stringify(szafir_config));

	});

	function loadSzafirAppletHandler(result) {
		postWindowMsg({command: commands.load, status: "OK", result: "LOADED"});
	}
	function loadSzafir() {
		console.log("APL.js : loadSzafir");
		fnSzafirAppletResultHandler = loadSzafirAppletHandler;
		if (szafirsdk_applet !== undefined) {
			console.log("SZAFIRSDK_APPLET_OBJECT already loaded!");
			fnSzafirAppletResultHandler();
		} else {
			var appletTag = '<object id="SZAFIRSDK_APPLET_OBJECT" name="SZAFIRSDK_APPLET_OBJECT" type="application/x-java-applet" style="margin:0; padding:0; width: 1px; height: 1px; float: left;">\
<param name="code" value="pl.com.kir.crypto.applet.CryptoApplet.class" />\
<param name="codebase" value="' + szafir_config.sdk_location_url + '" />\
<param name="archive" value="'+szafir_config.cryptoapplet_jar+'" />\
<param name="Server-Library" value="' + szafir_config.sdk_location_url + '" />\
<param name="Versions-File-Name" value="' + szafir_config.versions_file_applet + '" />\
' + (szafir_config.document_dependencies_folder !== null ? '<param name="DocumentDependenciesFolder" value="' + szafir_config.document_dependencies_folder + '" />' : '') + '\
' + (szafir_config.series_authorization !== null ? '<param name="SeriesAuthorization" value="' + szafir_config.series_authorization + '" />' : '') + '\
</object>';
			$("body").append(appletTag);
			szafirsdk_applet = document.SZAFIRSDK_APPLET_OBJECT;
		}
	}

	function unloadSzafir() {
		console.log("APL.js : unloadSzafir");
		$("#SZAFIRSDK_APPLET_OBJECT").remove();
		szafirsdk_applet = undefined;
		postWindowMsg({command: commands.unload, status: "OK", result: "UNLOADED"});
	}

	function startComponentAppletHandler(result) {
		postWindowMsg({command: commands.startComponent, status: "OK", result: "STARTED"});
	}
	function startComponentURI() {
		console.log("APL.js : startComponentURI");
		fnSzafirAppletResultHandler = startComponentAppletHandler;
		var settings_uri = $("#szafirsdk-settings-uri").val();
		szafirsdk_applet.startComponentURI(settings_uri);
	}

	function startComponent() {
		console.log("APL.js : startComponent");
		fnSzafirAppletResultHandler = startComponentAppletHandler;
		var settings_xml = $("#szafirsdk-settings-xml").val();
		szafirsdk_applet.startComponent(settings_xml);
	}

	function getTaskListAppletHandler(taskListXml) {
		postWindowMsg({command: commands.getTaskList, status: "OK", result: taskListXml});
	}
	function getTaskListURI() {
		console.log("APL.js : getTaskListURI");
		fnSzafirAppletResultHandler = getTaskListAppletHandler;
		var makeTaskListUri = $("#szafirsdk-maketasklist-uri").val();
		var taskListXml = szafirsdk_applet.getTaskListURI(makeTaskListUri);
	}

	function getTaskList() {
		console.log("APL.js : getTaskList");
		fnSzafirAppletResultHandler = getTaskListAppletHandler;
		var makeTaskListXml = $("#szafirsdk-makeTaskList-xml").val();
		var taskListXml = szafirsdk_applet.getTaskList(makeTaskListXml);
	}

	function doTaskListAppletHandler(resultXml) {
		postWindowMsg({command: commands.doTaskList, status: "OK", result: resultXml});
	}
	function doTaskList() {
		console.log("APL.js : doTaskList");
		fnSzafirAppletResultHandler = doTaskListAppletHandler;
		var taskList = $("#szafirsdk-taskList-xml").val();
		szafirsdk_applet.doTaskList(taskList);
	}

	function doTaskListNoWindowAppletHandler(resultXml) {
		postWindowMsg({command: commands.doTaskListNoWindow, status: "OK", result: resultXml});
	}
	function doTaskListNoWindow() {
		console.log("APL.js : doTaskListNoWindow");
		fnSzafirAppletResultHandler = doTaskListNoWindowAppletHandler;
		var taskList = $("#szafirsdk-taskList-xml").val();
		szafirsdk_applet.doTaskListNoWindow(taskList, true);
	}

	function doTaskListNoWindow1Pass() {
		console.log("APL.js : doTaskListNoWindow1Pass");
		fnSzafirAppletResultHandler = doTaskListNoWindowAppletHandler;
		var taskList = $("#szafirsdk-taskList-xml").val();
		var sigPass = $("#szafirsdk-taskList-pass1").val();
		szafirsdk_applet.doTaskListNoWindow(taskList, sigPass);
	}

	function doTaskListNoWindow2Pass() {
		console.log("APL.js : doTaskListNoWindow2Pass");
		fnSzafirAppletResultHandler = doTaskListNoWindowAppletHandler;
		var taskList = $("#szafirsdk-taskList-xml").val();
		var sigPass = $("#szafirsdk-taskList-pass1").val();
		var tssPass = $("#szafirsdk-taskList-pass2").val();
		szafirsdk_applet.doTaskListNoWindow(taskList, sigPass, tssPass);
	}

	function isCardInReader() {
		var inReader = szafirsdk_applet.isCardInReader();
		postWindowMsg({command: commands.isCardInReader, status: "OK", result: inReader});
	}

	function getSignatureInfoAppletHandler(resultXml) {
		postWindowMsg({command: commands.getSignatureInfo, status: "OK", result: resultXml});
	}
	function getSignatureInfo() {
		console.log("APL.js : getSignatureInfo");
		fnSzafirAppletResultHandler = getSignatureInfoAppletHandler;
		var uri = $("#szafirsdk-signature-uri").val();
		do {
			var replace = uri.replace("\\","/");
			if (replace == uri)
				break;
			uri = replace;
		} while(true);

		//uri = "file:///" + uri;
		szafirsdk_applet.getSignatureInfo(uri, false);
	}

	function listCertificatesAppletHandler(resultXml) {
		postWindowMsg({command: commands.listCertificates, status: "OK", result: resultXml});
	}
	function listCertificates() {
		console.log("APL.js : listCertificates");
		fnSzafirAppletResultHandler = listCertificatesAppletHandler;
		var type = $("#szafirsdk-certificate-type").val();
		szafirsdk_applet.listCertificates(type);
	}

	function encodeBase64() {
		console.log("APL.js : encodeBase64");
		var data = $("#szafirsdk-input").val();
		var b64 =  szafirsdk_applet.encodeBase64(data);
		$("#szafirsdk-temp-result").val(b64).change();
	}

	function onExtensionPresent() {
		console.log("APL.js : OK -> Chrome Extension Present");
	}

	function onErrorNoExtension() {
		console.log("APL.js : ERROR -> Chrome Extension Not Installed");
		$("body").append('<div id="szafirsdk-errors-overlay">');
		$("body").append('<div id="szafirsdk-errors-container">');
		$("#szafirsdk-errors-container").load("szafirsdk_web/szafirsdk-error-noextension.html?_=" + (new Date).valueOf());
	}

	function onErrorNoHostApp() {
		console.log("APL.js : ERROR -> Chrome Native Messaging Host Not Installed");
		$("body").append('<div id="szafirsdk-errors-overlay">');
		$("body").append('<div id="szafirsdk-errors-container">');
		$("#szafirsdk-errors-container").load("szafirsdk_web/szafirsdk-error-nohostapp.html?_=" + (new Date).valueOf());
	}
	/*
	 $.szafirsdk_isCardInReader = function(callback) {
	 fnCallback = callback;

	 $("#szafirsdk-isCardInReader-result").val("");
	 if (szafirsdk_mode == "SZAFIR_SDK_APPLET") {
	 isCardInReader();
	 } else {
	 postExtMsg({ params: {command: "isCardInReader"} });
	 }
	 }
	 */
})(jQuery);
