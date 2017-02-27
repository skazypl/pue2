var obwUtils = {

    /**
     * Splash pokazywany podczas wysyłania dokumentów
     */
    sendActionSplash : new zusnpi.layout.splash.Splashscreen({
        // id komponentu który ma zostać zakryty (puste ponieważ ma zakryć cały
        // ekran)
        parentId : '',
        // parametr nieobowiązkowy, główny tekst komunikatu na splashscreenie,
        // domyślna wartość taka jak podana
        text : 'Proszę czekać',
        // parametr nieobowiązkowy, dodatkowy tekst komunikatu na
        // splashscreenie, domyślnie pusty
        additionalText : 'Trwa wysyłanie danych...',
        // parametr nieobowiązkowy, czas po którym splash zniknie samoistnie,
        // nawet bez wywoływania metody hide(), jeśli ustawione 0 nigdy nie
        // znika
        timeoutMillis : 0,
        // parametr nieobowiązkowy, nazwa klasy css z ikoną wyświetlaną nad
        // głównym tekstem, domyślnia wartość taka jak podana
        loaderImageClass : 'loadingPanelLoaderImage'
    }),

    /**
     * Pokazuje splasha podczas wysyłania dokumentów
     */
    showSendActionSplash : function() {
        obwUtils.sendActionSplash.show();
    },

    /**
     * Chowa splasha podczas wysyłania dokumentów
     */
    hideSendActionSplash : function() {
        obwUtils.sendActionSplash.hide();
    },

    /** Flaga określająca czy logowanie javacript jest włączone */
    IS_LOG_ENABLED : true,

    /**
     * Zwraca pogrubiony tekst, jeśli ustawiona flaga bolded
     */
    getBoldedText : function(value, bolded) {
        if (bolded)
            return '<b>' + value + '</b>';
        return value;
    },

    /**
     * Zwraca czerwony tekst, jeśli ustawiona flaga error
     */
    getErrorText : function(value, error) {
        if (error)
            return '<span style="color: #ff0000">' + value + '</span>';
        return value;
    },

    getOrangeText : function(value) {
        if (value) {
            return '<span style="color: #f88017">' + value + '</span>';
        }
        return '';
    },

    getGrayText : function(value, gray) {
        if (value == null)
            value = '';
        if (gray)
            return '<span style="color: #aaa;">' + value + '</span>';
        return value;
    },

    getItalicText : function(value, kursywa) {
        if (kursywa) {
            return '<span style="font-style: italic;">' + value + '</span>';
        }
        return value;
    },

    /**
     * Zwraca obcięty tekst do pełnych wyrazów o maksymaknej długości jak w
     * przekazanym parametrze limit
     */
    getTruncatedText : function(text, limit) {
        var bits, i;

        bits = text.split('');
        if (bits.length > limit) {
            for (i = bits.length - 1; i > -1; --i) {
                if (i > limit) {
                    bits.length = i;
                } else if (' ' === bits[i]) {
                    bits.length = i;
                    break;
                }
            }
            bits.push('...');
        }
        return bits.join('');
    },

    /**
     * Zwraca fullId dla zaznaczonego rekordu w przekazanym jako parametr
     * gridzie
     */
    getFullIdForSelectedRecord : function(grid) {
        var rec = grid.getSelectedRecord();
        var fullId = rec['id.fullId'];

        return fullId;
    },

    /**
     * Zwraca fullId dla rekordu o określonej pozycji na przekazanym jako
     * parametr gridzie
     */
    getFullIdForRowIndex : function(grid, rowIndex) {
        return grid.getRecordForIndex(rowIndex)["id.fullId"]
    },

    getFullIdsForGridSelection : function(grid){
        var selectedIds = [];
        var allIds = grid.getMultiSelectionSelectedIds();
        selectedIds = allIds.split(",");
        return selectedIds;
    },

    /**
     * Wywołuje akcę strutsową z podanym contentem i pozwala podpiąć funkcję
     * callback
     */
    invokeSimpleAction : function(contentVar, url, onLoadFunction) {

        var args = {
            url : url,
            content : contentVar,
            handleAs : "json",
            load : function(resp) {
                onLoadFunction(resp);
            }
        }
        dojo.xhrPost(args);
    },

    /**
     * Wywołuje akcę strutsową przyjmującą jako parametr fullId o przekazanym
     * url'u i pozwala podpiąć funkcję callback
     */
    invokeAction : function(fullId, url, onLoadFunction) {
        var contentVar = {
            'id.fullId' : fullId
        };

        obwUtils.invokeSimpleAction(contentVar, url, onLoadFunction);
    },

    /**
     * Pokazuje splasha bez timera
     */
    obwShowSplash : function() {
        var splash = getSplashComponent();
        if (canChangeDisplayForSplash(splash)) {
            splash.style.display = "block";
        }
    },

    /**
     * Chowa splasha bez timera
     */
    obwHideSplash : function() {
        var splash = getSplashComponent();
        if (canChangeDisplayForSplash(splash)) {
            stopSplashTimer();
            splash.style.display = "none";
        }
    },

    /**
     * Blokuje przycisk
     */
    disableButton : function(buttonId) {
        if (buttonId) {
            var buttonComponent = dijit.byId(buttonId);
            if (buttonComponent) {
                buttonComponent.set('disabled', true);
            }
        }
        obwUtils.obwShowSplash();
    },

    /**
     * Wlacza ponownie przycisk
     */
    enableButton : function(buttonId) {
        if (buttonId) {
            var buttonComponent = dijit.byId(buttonId);
            if (buttonComponent) {
                buttonComponent.set('disabled', false);
            }
        }
        obwUtils.obwHideSplash();
    },

    /**
     * Wywołuje akcję gridową z pytaniem potwierdzającym.
     */
    invokeGridAction : function(fullId, title, messageSingle, url, gridJsId,
            showMessage, onExecutedFunction, onCancelFunction) {

        confirm({
            title : title,
            content : messageSingle,
            onOkClick : function() {
                obwUtils.invokeAction(fullId, url, function(resp) {
                    obwUtils.onGridActionLoad(resp, gridJsId, showMessage,
                            false, onExecutedFunction);
                });
            },
            onCancelClick : function() {
                if (onCancelFunction != null)
                    onCancelFunction();
            }
        });

    },

    /**
     * Standardowa akcja onLoad na wykonanie akcji gridowej pokazująca komnikat
     * wykonania
     */
    onGridActionLoad : function(resp, gridJsId, showMessage, clearSelection,
            onExecutedFunction) {
        if (showMessage && resp && resp["komunikat"]) {
            alert({
                content : resp["komunikat"],

                dialogWidth : '450px',
                dialogHeight : '150px',
                onOkClick : function() {
                    gridJsId.reload();
                }
            });
        }
        if (clearSelection) {
            gridJsId._clearMultiSelection();
            gridJsId.reload();
        }
        if (onExecutedFunction != null)
            onExecutedFunction();
    },

    decodeRole : function(role) {
        switch (role) {
        case 'OGOLNA':
            return 'Ogólna';
        case 'LEKARZ':
            return 'Lekarz';
        case 'SWIADCZENIOBIORCA':
            return 'Świadczeniobiorca';
        case 'PLATNIK':
            return 'Płatnik';
        case 'UBEZPIECZONY':
            return 'Ubezpieczony';
        default:
            return role;
        }
    },

        /**
     * Wywołuje akcję gridową obdługującą zarówno pojedyncze, jak i wiele
     * rekordów naraz z pytaniem potwierdzającym.
     */
//	flaga : false,
    invokeSingleMultiGridAction : function(fullId, title, messageSingle,
            messageMultiOne, messageMultiMany, url, gridJsId, isExportAction,
            onExecutedFunction, onCancelFunction, sourceButton) {
        if (sourceButton) {
            obwUtils.disableButton(sourceButton);
        }
        var selectedCount = gridJsId.getMultiSelectionSelectedRecordsCount();
//                console.log('fullId = ' + fullId);
//		console.log('selectedCount = ' + selectedCount);
//		console.log('bylo usuniecie z checkboxem 1 = ' + obwUtils.flaga);
//		console.log('gridJsId = '+gridJsId.valueOf());
//		if(obwUtils.flaga== true) {
//		    selectedCount -= 1;
//		    obwUtils.flaga = false;
//		}
//		if(selectedCount == 1 && fullId !=null) {
//		    obwUtils.flaga = true;
//		}
//		console.log('bylo usuniecie z checkboxem 2 = ' + obwUtils.flaga);
        if (fullId == null && selectedCount && selectedCount > 0) {
            confirm({
                title : title,
                content : (selectedCount > 1 ? messageMultiMany + ' '
                        + selectedCount + '.' : messageMultiOne),
                onOkClick : function() {
                    if (isExportAction) {
                        obwUtils.invokeExportAction(null, url, gridJsId);
                    } else {
                        obwUtils.obwShowSplash();
                        gridJsId.sendSelectedIdsToAction(url, function(resp) {
                            obwUtils.onGridActionLoad(resp, gridJsId, true,
                                    true, onExecutedFunction);
                            obwUtils.obwHideSplash();
                        });

                    }
                    if (sourceButton) {
                        obwUtils.enableButton(sourceButton);
                    }
                },
                onCancelClick : function() {
                    if (onCancelFunction != null) {
                        onCancelFunction();
                    }
                    if (sourceButton) {
                        obwUtils.enableButton(sourceButton);
                    }
                }
            });
        } else {
            if (fullId == null) {
                var selectedRecord = gridJsId.getSelectedRecord();
                if (selectedRecord)
                    fullId = selectedRecord["id.fullId"];
            }

            if (fullId != null) {
                if (isExportAction)
                    obwUtils.invokeExportAction(fullId, url, gridJsId);
                else
                    obwUtils.invokeGridAction(fullId, title, messageSingle,
                            url, gridJsId, true, onExecutedFunction,
                            onCancelFunction);
            } else
                alert("Nie wybrano żadnego rekordu.");

            if (sourceButton) {
                obwUtils.enableButton(sourceButton);
            }
        }
    },

    invokeSimpleMultiGridAction : function(fullId, url, gridJsId,
            onExecutedFunction) {
        gridJsId.sendSelectedIdsToAction(url, function(resp) {
            obwUtils.onGridActionLoad(resp, gridJsId, true, true,
                    onExecutedFunction);
        });
    },

    /**
     * Wywołuje akcję eksortu (url) elementu o przekazanym fullId dla wskazanego
     * grida(gridJsId) zeby wywolac eksport jednego dokumentu nalezy podac
     * gridJsId jako null, zeby wywolac eksport wszystkich zaznaczonych z danego
     * grida nalezy podac id grida
     */
    invokeExportAction : function(fullId, url, gridJsId) {
        if (fullId == null && gridJsId == null) {
            console.log('Nie ustawiono ani id, ani grida');
            return;
        }
        var args = null;
        // console.log("wybrano: " + gridJsId.getSelectedRecordsCount());
        if (fullId != null) {
            args = {
                url : url,
                content : {
                    'id.fullId' : fullId != null ? fullId : gridJsId
                            .getSelectedRecord()["id.fullId"]
                },
                timeout : 1000
            };
        } else if (gridJsId != null
                && gridJsId.getMultiSelectionSelectedRecordsCount() > 0) {

            args = {
                url : url,
                content : {
                    'selectedRows' : gridJsId.getMultiSelectionSelectedIds()
                },
                timeout : 1000
            };
        } /*
             * else { args = { url : url, content : { 'id.fullId' : fullId !=
             * null ? fullId : gridJsId.getSelectedRecord()["id.fullId"] },
             * timeout : 1000 }; }
             */
        exportForm(url, '', args.content);
    },

    /**
     * Zwraca id dla przekazanego fullId
     */
    getIdFromFullId : function(fullId) {
        return fullId.substring(fullId.indexOf("&") + 1, fullId.indexOf(";"));
    },

    /**
     * Wyszukuje na wskazanym gridzie rekord o przekazanym id i ustawia go jako
     * bieżący. Zwraca czy udało się odnaleść rekord.
     */
    findRecordById : function(grid, seekId) {
        id = seekId.substring(seekId.indexOf("&") + 1, seekId.indexOf(";"));

        var i = 0;
        while (i < 100) {
            var rec = grid.getRecordForIndex(i);
            if (rec == null)
                return;

            var fullId = rec['id.fullId'];
            var realId = fullId.substring(fullId.indexOf("&") + 1, fullId
                    .indexOf(";"));

            if (realId == id) {
                grid.selectByItemIndex(i);
                return true;
            }
            i++;
        }
        return false;
    },

    /**
     * Zwraca link menu o przekazanej nazwie i wywoływanej akcji
     */
    getMenuLink : function(name, action) {
        return '<a href="javascript:' + action + '">' + name + '</a>';
    },

    /**
     * Wypisuje informację na konsoli, jeśli flaga logowania jest ustawiona na
     * true
     */
    log : function(text) {
        if (obwUtils.IS_LOG_ENABLED) {
            console.log('OBW LOG: ' + text);
        }
    },

    /**
     * Wypisuje informację na konsoli, jeśli flaga logowania jest ustawiona na
     * true
     */
    log : function(text, data) {
        if (obwUtils.IS_LOG_ENABLED) {
            console.log('OBW LOG: ' + text, data);
        }
    },

    /**
     * Funkcja odpowiedzialna za drukowanie fragmentu strony zawartej w iFremeId
     * z div'a oznaczonego jako elementToPrintId
     */
    obwDrukujElement : function(iFrameId, elementToPrintId) {
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
            printDoc
                    .write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">');
            printDoc.write('<html><head><title></title>');
            printDoc
                    .write('</head><body onload="this.focus(); this.print();">');
            printDoc.write(content + '</body></html>');
            printDoc.close();
        }

        // Jeżeli z jakiegoś powodu powyższe instrukcje zawiodą cały dokument
        // zostanie wydrukowany w normalny sposób
        catch (e) {
            self.print();
        }
    },

    obwDrukujDokumentHtml : function(iFrameId, elementToPrintId) {
        try {
            var iFrame = document.getElementById(iFrameId);



            var content = document.getElementById(elementToPrintId).contentDocument.body.outerHTML;
            var head = document.getElementById(elementToPrintId).contentDocument.head.outerHTML;
            /* Określenie jakiego modelu DOM użyć */
            var printDoc = (iFrame.contentWindow || iFrame.contentDocument);
            if (printDoc.document) {
                printDoc = printDoc.document;
            }

            /* Tworzenie dokumentu HTML który będzie zawierać się w iFrame */
            /* Tytuł pojawi się na wydruku */
            printDoc
                    .write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">');
            printDoc.write('<html>');
            printDoc.write(head);
            printDoc
                    .write('</head><body onload="this.focus(); this.print();">');
            printDoc.write(content + '</body></html>');
            printDoc.close();
        }

        // Jeżeli z jakiegoś powodu powyższe instrukcje zawiodą cały dokument
        // zostanie wydrukowany w normalny sposób
        catch (e) {
            self.print();
        }
    },

    kwotaFormatter : function(value) {
        if (value != null) {
            var valueStr = value.toString();

            if (valueStr.indexOf(".", 0) > 0) {
                valueStr = valueStr.replace(".", ",");
                if (valueStr.indexOf(",") + 3 > valueStr.length)
                    valueStr += "0";
            } else
                valueStr += ",00";
            return valueStr;
        }
        return "0,00 PLN";
    }

}