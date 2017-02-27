function RiuRejKodem() {

	this.dataRegex = '^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$';
	this.nipRegex = '^[0-9]{11}$';
	this.numerRegex = '^[0-9]{1,}$';
	this.napisRegex = '^[a-zA-Z]{1,}$';
	this.kodPocztowyRegex = '^[0-9][0-9]-[0-9][0-9][0-9]$';
	this.rachBankowyRegex = '^[0-9]{26}$';
	this.regonRegex = '^[0-9]{9,14}$';
	
}

var riuRejKodem = new RiuRejKodem();