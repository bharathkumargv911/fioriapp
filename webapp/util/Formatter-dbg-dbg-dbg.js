jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require('sap.m.MessageBox');
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.declare("com.arteriatech.zsf.quot.util.Formatter");
com.arteriatech.zsf.quot.util.Formatter = {};

com.arteriatech.zsf.quot.util.Formatter.formatEmphasized = function (val) {
	try {
		val = parseFloat(val);
		if (val > 0) {
			return true;
		} else {
			return false;
		}
	} catch (err) {
		return false;
	}
};
com.arteriatech.zsf.quot.util.Formatter.formatImageColor = function (fValue) {
	var img;
	if (fValue === "A") {
		img = "Error";
		return img;
	}
	if (fValue === "B") {
		img = "Warning";
		return img;
	}
	if (fValue === "C") {
		img = "Success";
		return img;
	}
};
com.arteriatech.zsf.quot.util.Formatter.formatImage = function (fValue) {
	var img;
	if (fValue === "A") {
		img = 'sap-icon://task';
		return img;
	}
	if (fValue === "B") {
		img = 'sap-icon://status-in-process';
		return img;
	}
	if (fValue === "C") {
		img = 'sap-icon://home';
		return img;
	}
};
com.arteriatech.zsf.quot.util.Formatter.formatApprovalImageColor = function (fValue) {
	var img;
	if (fValue === "A") {
		img = "Warning";
		return img;
	}
	if (fValue === "B") {
		img = "Success";
		return img;
	}
	if (fValue === "C") {
		img = "Error";
		return img;
	}
};
com.arteriatech.zsf.quot.util.Formatter.formatApprovalImage = function (fValue) {
	var img;
	if (fValue === "A") {
		img = 'sap-icon://pending';
		return img;
	}
	if (fValue === "B") {
		img = 'sap-icon://complete';
		return img;
	}
	if (fValue === "C") {
		img = 'sap-icon://sys-cancel-2';
		return img;
	}
};
com.arteriatech.zsf.quot.util.Formatter.formatAppStatusState = function (val) {
	var returnVal = "None";
	if (val === "A" || val === "") {
		returnVal = "Error";
	} else if (val === "B") {
		returnVal = "Warning";
	} else if (val === "C") {
		returnVal = "Success";
	} else if (val === "04") {
		returnVal = "Error";
	} else if (val === "01") {
		returnVal = "Warning";

	} else if (val === "03") {
		returnVal = "Success";

	}

	return returnVal;
};
com.arteriatech.zsf.quot.util.Formatter.formatPriorityImage = function (fValue) {
	var img;
	if (fValue === "1" || fValue === "2") {
		img = "sap-icon://status-negative";
		return img;
	} else if (fValue === "3" || fValue === "4") {
		img = "sap-icon://status-critical";
		return img;
	} else if (fValue === "5") {
		img = "sap-icon://status-inactive";
		return img;
	} else if (fValue === "6" || fValue === "7" || fValue === "8" || fValue === "9") {
		img = "sap-icon://status-positive";
		return img;
	}
};
com.arteriatech.zsf.quot.util.Formatter.formatPriorityImageColor = function (fValue) {
	var img;
	if (fValue === "1" || fValue === "2") {
		img = "Error";
		return img;
	} else if (fValue === "3" || fValue === "4") {
		img = "Warning";
		return img;
	} else if (fValue === "5") {
		img = "Warning";
		return img;
	} else if (fValue === "6" || fValue === "7" || fValue === "8" || fValue === "9") {
		img = "Success";
		return img;
	}
};

com.arteriatech.zsf.quot.util.Formatter.formatIsEscalatedImage = function (fValue) {
	var img;
	if (fValue === true) {
		img = "sap-icon://status-negative";
		return img;
	}
	/* else if (fValue === false) {
			img = "sap-icon://status-positive";
			return img;
		}*/
};

com.arteriatech.zsf.quot.util.Formatter.formatIsEscalatedImageColor = function (fValue) {
	var img;
	if (fValue === true) {
		img = "Error";
		return img;
	}
	/*else if (fValue === false) {
		img = "Success";
		return img;
	}*/
};
com.arteriatech.zsf.quot.util.Formatter.formatCountryNameAndPostalCode = function (CountryName, PostalCode) {
	//var text;
	if (!PostalCode && !CountryName) {
		return "";
	} else if (PostalCode && CountryName) {
		return CountryName + " - " + PostalCode;
	} else if (PostalCode && !CountryName) {
		return PostalCode;
	} else if (!PostalCode && CountryName) {
		return CountryName;
	}
};

com.arteriatech.zsf.quot.util.Formatter.formatAddressVisible = function (Key) {
	if (Key) {
		return true;
	} else {
		return false;
	}
};
com.arteriatech.zsf.quot.util.Formatter.PriceBreakUpFormatter = function (Key) {
	if (Key !== "" || Key !== undefined || Key !== "undefined") {
		return Key;
	} else {
		return "0.00";
	}
};