sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.arteriatech.ssreqbpformapproval.controller.ApprovalHistory", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.ApprovalHistory
		 */
		onInit: function () {

		},
		formatDate: function (date) {
			if (date) {
			date = date.split("T")[0].split("-")
				return `${date[2]}/${date[1]}/${date[0]}`;
			} else {
				return null;
			}
		},
		formatTime: function (date) {
			if (date) {
			date = date.split("T")[0].split("-")
				return `${date[2]}/${date[1]}/${date[0]}`;
			} else {
				return null;
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.ApprovalHistory
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.ApprovalHistory
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.ssreqbpformapproval.view.ApprovalHistory
		 */
		//	onExit: function() {
		//
		//	}

	});

});