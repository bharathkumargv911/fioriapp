sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"com/arteriatech/ss/utils/js/UserMapping"
], function(Controller, JSONModel, History, oPPCCommon, oProductCommon, oCommonValueHelp, oProductUserMapping) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oProductUserMapping, oCommonValueHelp;
	var product = "PD";
	var busyDialog = new sap.m.BusyDialog();

	return Controller.extend("com.arteriatech.zsf.quot.controller.QuotItemCondtionsView", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemCondtionsView
		 */
		onInit: function() {
			this.onInitHookUp();
		},
		onInitHookUp: function() {
			gQuotItemCondtionsView = this.getView();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gQuotItemCondtionsView));

			//i18n
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			//Router Initialisation
			this._oRouter = this._oComponent.getRouter();
			//Attach event for routing on view patter matched 

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		exportToExcel: function() {
			if (Device.system.desktop) {
				oPPCCommon.copyAndApplySortingFilteringFromUITable({
					thisController: this,
					mTable: this.getView().byId("QuotItemConditionsTable"),
					uiTable: this.getView().byId("UIQuotItemConditionsTable")
				});
			}
			var table = this.getView().byId("QuotItemConditionsTable");
			var oModel = this.getView().getModel("QuotationConditionItemDetails");
			oPPCCommon.exportToExcel(table, oModel);

			if (this.exportToExcel_Exit) {
				this.exportToExcel_Exit();
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemCondtionsView
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemCondtionsView
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemCondtionsView
		 */
		//	onExit: function() {
		//
		//	}

	});

});