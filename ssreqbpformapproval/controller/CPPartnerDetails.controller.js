sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.arteriatech.ssreqbpformapproval.controller.CPPartnerDetails", {

		onInit: function () {
			gCPReferenceView = this.getView();
		},

	});

});