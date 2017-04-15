const layout_dict =
	{
		"components":
		[
			{
				"type" : "RowComponent",
				"id"  : "row0",
				"children":
				[
					{
						"type": "Heading",
						"text": "Witaj ponownie Jan!"
					}
				]
			},
			{
				"type": "PanelComponent",
				"collapse" : true,
				"hidable" : true,
				"size": {
					"large": 12,
				},
				"title": "Wniosek o ustalenie prawa do świadczenia wychowawczego",
				"children":
				[
					{
						"type": "RowComponent",
						"id": "row1",
						"children": [
							{
								"type": "LabelComponent",
								"id": "test1",
								"text": "WNIOSEK O USTALENIE PRAWA DO ŚWIADCZENIA WYCHOWAWCZEGO",
								"size": {
									"large": 5,
								}
							}
						]

					},
					{
						"type": "RowComponent",
						"id": "row1",
						"children": [
							{
								"type": "TextBox",
								"id": "test1",
								"defaultText": "Imię",
								"size": {
									"large": 5,
								}
							},
							{
								"type": "TextBox",
								"id": "test2",
								"defaultText": "Nazwisko",
								"size": {
									"large": 6,
								},
							}
						]
					},
					{
						"type": "RowComponent",
						"id": "row1",
						"children": [
							{
								"type": "PeselComponent",
								"id": "test1",
								"defaultText": "PESEL",
								"size": {
									"large": 5,
								},
							},
							{
								"type": "TextBox",
								"id": "test2",
								"defaultText": "Stan cywilny",
								"size": {
									"large": 3,
								},
							},
							{
								"type": "TextBox",
								"id": "test2",
								"defaultText": "Obywatelstwo",
								"size": {
									"large": 4,
								},
							}
						]
					},
					{
						"type": "RowComponent",
						"id": "row1",
						"children": [
							{
								"type": "TextBox",
								"id": "test1",
								"defaultText": "Miejscowość",
								"size": {
									"large": 8,
								},
							},
							{
								"type": "TextBox",
								"id": "test2",
								"defaultText": "Kod Pocztowy",
								"size": {
									"large": 3,
								},
							}
						]
					},
					{
						"type": "RowComponent",
						"id": "row1",
						"children": [
							{
								"type": "TextBox",
								"id": "test1",
								"defaultText": "Ulica",
								"size": {
									"large": 5,
								},
							},
							{
								"type": "TextBox",
								"id": "test2",
								"defaultText": "Numer Domu",
								"size": {
									"large": 3,
								},
							},
							{
								"type": "TextBox",
								"id": "test2",
								"defaultText": "Numer mieszkania",
								"size": {
									"large": 3,
								},
							},
							
						]
					},
					{
						"type": "RowComponent",
						"id": "row1",
						"children": [
							{
								"type": "ProgBar",
								"width": 3,
								"id": "cokolsiek"
							}
						]
					},
					{
						"type": "PanelComponent",
						"id": "panel1",
						"size": {
							"large": 10,
						},
						"title": "2. Ustalenie prawa do świadczenia wychowawczego na pierwsze dziecko.",
						"children": [
							{
								"type": "LabelComponent",
								"id": "test2",
								"text":
`Świadczenie wychowawcze przysługuje na pierwsze dziecko jeżeli dochód rodziny w przeliczeniu na osobę nie przekracza kwoty 800,00 zł. Jeżeli członkiem rodziny jest dziecko niepełnosprawne, świadczenie wychowawcze na pierwsze dziecko przysługuje jeżeli dochód rodziny w przeliczeniu na osobę nie przekracza kwoty 1 200,00 zł. Pierwsze dziecko oznacza jedyne lub najstarsze dziecko w rodzinie w wieku do ukończenia
18. roku życia; w przypadku dzieci urodzonych tego samego dnia, miesiąca i roku, będących
najstarszymi dziećmi w rodzinie w wieku do ukończenia 18. roku życia (czyli w przypadku wieloraczków) pierwsze dziecko oznacza jedno z tych dzieci wskazane przez
osobę ubiegającą się.
Niepełnosprawne dziecko oznacza dziecko legitymujące się orzeczeniem o niepełnosprawności
określonym w przepisach o rehabilitacji zawodowej i społecznej oraz zatrudnianiu osób
niepełnosprawnych albo orzeczeniem o umiarkowanym lub znacznym stopniu niepełnosprawności.`,
								"size": {
									"large": 10,
								}
							}
						]
					}
				]
			}
		]
	}
;
export const LAYOUT = JSON.stringify(layout_dict);
