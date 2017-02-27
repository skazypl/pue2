var helpWnd = null;
function wdOpenHelp(helpId) {
	var regularExpression = /[a-zA-Z][a-zA-Z][a-zA-Z][0-9][0-9][0-9][0-9]/;
	if(helpWnd!=null) {
		helpWnd.close();
	}
	var url = "pomoc/index.html?"+helpId.toLowerCase()+".html";
	if(!regularExpression.test(helpId)) {
		var url = "pomoc/index.html";
	}
	helpWnd = window.open(url, "Pomoc"	,'width=1000, height=600, menubar=no, toolbar=no, location=no, scrollbars=yes, resizable=yes, status=no');
	//console.log("WD open help ", screenId);
}