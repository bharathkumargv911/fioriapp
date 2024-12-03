sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	var oi18n = "",
		oPPCUtili18n = "";
	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.MaterialDetails", {
		/** * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf*/
		onInit: function() {
			this.onInitialHookUps();
		},
		onInitialHookUps: function() {
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gListPageView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
		}
	});
});