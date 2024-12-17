sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.arteriatech.zsf.quot.controller.ListPage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.ListPage
		 */
		onInit: function() {
			 this.onInitHookUp();
		},

		onInitHookUp: function() {
			gListPageView = this.getView();
		}

	});

});