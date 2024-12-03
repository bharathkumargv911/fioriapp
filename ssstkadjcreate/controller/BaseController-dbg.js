sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ca/ui/message/message",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ca/ui/model/format/AmountFormat"
], function(Controller) {
	"use strict";

	var oDialog = new sap.m.BusyDialog();
	var i18nURL = ""; // sap.ui.getCore().getModel("i18n").getResourceBundle();

	return Controller.extend("com.arteria.ss.stockadjustmnt.create.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getText: function() {

		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			var i18nURL = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		}

	});

});