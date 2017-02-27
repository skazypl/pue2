function errorLogoutLoad(data, ioArgs) {
	var msg = "";
	var stack = "";
	if (data.name == "Error") {
		try {
			var errorStruct = dojo.fromJson(data.responseText);
			if (errorStruct.exceptionStack != null) {
				stack += errorStruct.exceptionStack;
			}
		} catch (e) {
		}
		fireErrorLogoutDialog("Błąd", "Wystąpił niespodziewany błąd aplikacji. Skontaktuj się z administratorem systemu.", stack, errorStruct.exceptionTimestamp, errorStruct.ticket);
	}
}

function fireErrorLogoutDialog(title, content, details, errorTimestamp, errorTicket) {
	hideSplash();
	showDialog(new zusnpi.dialog.ErrorAndLogout(), {
		title: title,
		content: content,
		details: details,
		errorTimestamp: errorTimestamp,
		errorTicket: errorTicket
	});
}


function accessDeniedLogoutLoad(data) {
	var msg = "";
	var stack = "";
	if (data.name == "Error") {
		try {
			var errorStruct = dojo.fromJson(data.responseText);
			if (errorStruct.exceptionStack != null) {
				stack += errorStruct.exceptionStack;
			}
		} catch (e) {
		}
		fireErrorLogoutDialog("Błąd", "Brak uprawnień do wykonania funkcji.", stack, errorStruct.exceptionTimestamp, errorStruct.ticket);
	}
}

/**
 * Exception Handler
 *
 * @param data
 * @param ioArgs
 * @return
 */
function errorLoad(data, ioArgs) {
	if(isSessionExpired(ioArgs)) {
		showExpiredSessionAlertAndReload();
		return;
	}
	
	if(isAccessDenied(data)) {
		accessDeniedLogoutLoad(data);
		return;
	}	
	
	if (isValidationError(data)) {
		var errorStruct = dojo.fromJson(data.responseText);
		fireValidationErrorsDialog(errorStruct.ActionMessage, errorStruct.ActionErrors, errorStruct.FieldErrors);
		return;
	}
	
	var msg = "";
	var stack = "";
	if (data.name == "Error") {
		try {
			var errorStruct = dojo.fromJson(data.responseText);
			if (data.status == 0) {
				msg = "Błąd połączenia";
			} else if (data.status == 403) {
				msg = "Brak uprawnień do wykonania funkcji.";
				if (errorStruct.exceptionStack != null) {
					stack += errorStruct.exceptionStack;
				}
			} else if (data.status == 500) {
				msg = errorStruct.message;
				if (errorStruct.exceptionStack != null) {
					stack += errorStruct.exceptionStack;
				}
			} else {
				msg = errorStruct.message;
				if (errorStruct.exceptionStack != null) {
					stack += errorStruct.exceptionStack;
				}
			}
					
			if(errorStruct.type == 'info')
			{
				fireAlertDialog("Informacja", msg);
			} else
			{
				fireErrorDialog("Błąd", msg, stack, errorStruct.exceptionTimestamp, errorStruct.ticket);
			}
			
		} catch (e) {
			msg = data.message;
		}
	
			
	}
};

function isValidationError(data) {
	if (data && data.responseText && data.name == "Error") {
		var errorStruct = dojo.fromJson(data.responseText);
		if (errorStruct.DataType == "ValidationError") {
			return true;
		}
	}
	return false;
}

function isAccessDenied(data) {
	if(data.name == "Error") {
		if (data.status == 403) {
			return true;
		}
		try {
			var errorStruct = dojo.fromJson(data.responseText);
			if (errorStruct.cause == 'SOAPFaultException' && errorStruct.errorCode == 403) {
				return true;
			}
		} catch (e) {
			return false;
		}		
	}
	return false;
};

function isSessionExpired(ioArgs) {
	if(ioArgs && ioArgs.xhr && ioArgs.xhr.responseText && ioArgs.xhr.responseText.match) {
		return isStringWithIdentyfikatorLogowania(ioArgs.xhr.responseText);
	}
	return false;
};

function isStringWithIdentyfikatorLogowania(stringValue) {
	return stringValue.match("#IDENTYFIKATOR_STRONY_LOGOWANIA#") == "#IDENTYFIKATOR_STRONY_LOGOWANIA#";
};

function joinJsonValuesWithSeparator(json, separator) {
	var str = "";
	if (!json) {
		return str;
	}
	for (var key in json) {
		str += json[key] + separator;
	}
	if (str.length == 0 || !str.substr) {
		return str;
	} else if (separator){
		return str.substr(0, str.length - separator.length);
	}
}

function fireValidationErrorsDialog(actionMessages, actionErrors, fieldErrors) {
	var message = "";
	if (actionMessages) {
		message += joinJsonValuesWithSeparator(actionMessages, "\n") + "\n";
	}
	var actErrors = "";
	if (actionErrors) {
		actErrors = joinJsonValuesWithSeparator(actionErrors, "\n");
		message += actErrors + "\n";
	}
	var fErrors = "";
	if (fieldErrors) {
		fErrors = joinJsonValuesWithSeparator(fieldErrors, "\n");
		message += fErrors;
	}
	fireErrorDialog("Błąd walidacji danych", message);
}

function fireErrorDialog(title, content, details, errorTimestamp, errorTicket) {
	hideSplash();
	window.error( {
		title: title,
		content: content,
		details: details,
		errorTimestamp: errorTimestamp,
		errorTicket: errorTicket
	});
}

function fireAlertDialog(title, content) {
	hideSplash();
	window.alert( {
		title: title,
		content: content,
		details: null
	});
}

var orginal_dojo_xhrpost = dojo.xhrPost;
dojo.xhrPost = function(args) {
	if (args) {
		if(null == args.customError){
			args.error = function(error) { errorLoad(error); if (args._error) { args._error(error); }};
		}
		if(!args.headers) {
			args.headers = {};
		}
		args.headers["no-cache"] = new Date().getTime();
		if (dojo.cookie) {
			args.headers["X-Session-Verify"] = dojo.cookie("JSESSIONIDPORTAL");
		}
	}
	return orginal_dojo_xhrpost(args);
};

function globalErrorHandler(desc, page, line, chr) {
	if(isDebugMode()) {
		fireErrorDialog("Błąd", "Wystąpił błąd skryptów JavaScript!",
			"Opis błędu: " + desc + "\nAdres: " + page + "\nLinia: " + line);
	} else {
		console.error("Błąd", "Wystąpił błąd skryptów JavaScript!",
			"Opis błędu: " + desc + "\nAdres: " + page + "\nLinia: " + line);
	}
	return true;
}

dojo.addOnLoad(function() {
	window.onerror = globalErrorHandler;
});