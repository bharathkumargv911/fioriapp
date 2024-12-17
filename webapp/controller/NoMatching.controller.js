/*
 * Copyright (C) 2015-2016 Arteria Technologies Pvt. Ltd. All rights reserved
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";
	return Controller.extend("com.arteriatech.zsf.quot.controller.NoMatching", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 */
		onInit: function() {
			this.onInitHookUp();
		},

		onInitHookUp: function() {
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			this._oRouter = this._oComponent.getRouter();
		},
		onNavBack: function(oEvent) {
			this._oRouter.navTo("poview");
			/*var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.back();
				window.history.go(-1);
			} else {
				this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
				this._oComponent.getRouter().navTo("View");
			}*/
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 */
		//		onBeforeRendering: function() {

		//		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
		//		onAfterRendering: function() {

		//		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 */
		//		onExit: function() {

		//		}

	});
});