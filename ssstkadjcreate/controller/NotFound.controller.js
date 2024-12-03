/*
 * Copyright (C) 2015-2016 Arteria Technologies Pvt. Ltd. All rights reserved
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";
	var notFoundView;
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.NotFound", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.NotFound
		 */
		onInit: function() {
			this.onInitHookUp();
		},
		onInitHookUp: function() {
			notFoundView = this.getView();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp();
			}
		},
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.back();
				window.history.go(-1);
			} else {
				this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
				this._oComponent.getRouter().navTo("View");
			}
		},

		setNotFoundDetails: function(text, icon, description) {
				notFoundView.byId("notFoundMessagePage").setText(text);
				notFoundView.byId("notFoundMessagePage").setIcon(icon);
				notFoundView.byId("notFoundMessagePage").setDescription(description);
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf view.NotFound
			 */
			//		onBeforeRendering: function() {

		//		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf view.NotFound
		 */
		//		onAfterRendering: function() {

		//		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf view.NotFound
		 */
		//		onExit: function() {

		//		}

	});
});