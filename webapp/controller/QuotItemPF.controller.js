sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	var oi18n, oUtilsI18n;
	var Device = sap.ui.Device;
	var oPPCCommon = com.arteriatech.ppc.utils.js.Common;
	var oProductCommon, oCommonValueHelp;
	var product = "PD";
	return Controller.extend("com.arteriatech.zsf.quot.controller.QuotItemPF", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemPF
		 */
		onInit: function() {
			this.onInitHookUp();
		},
		onInitHookUp: function() {
			this._oView = this.getView();
			
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));

			if (product === "PPS") {
				oProductCommon = com.arteriatech.pps.utils.js.Common;
				oCommonValueHelp = com.arteriatech.pps.utils.js.CommonValueHelp;
			} else if (product === "PD") {
				oProductCommon = com.arteriatech.ss.utils.js.Common;
				oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;
			} else if (product === "CL") {
				oProductCommon = com.arteriatech.cl.utils.js.Common;
				oCommonValueHelp = com.arteriatech.cl.utils.js.CommonValueHelp;
			}
			/*else {
								//<ToAdd if any new product> 
							}*/

			//i18n
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		exportToExcel: function(oEvent) {
			if (Device.system.desktop) {
				oPPCCommon.copyAndApplySortingFilteringFromUITable({
					thisController: this,
					mTable: this.getView().byId("PartnerFunctionsTable"),
					uiTable: this.getView().byId("UIQuotItemPFTable")
				});
			}
			var table = this.getView().byId("PartnerFunctionsTable");
			var oModel = this.getView().getModel("QuotationPFItemDetails");
			oPPCCommon.exportToExcel(table, oModel);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemPF
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemPF
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.zsf.quot.view.view.QuotItemPF
		 */
		//	onExit: function() {
		//
		//	}

	});

});