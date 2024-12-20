var contextData = [];
var gList;
var gDetailPageView;
var gAggregatorID;
var gEntityGuid;
var gPartnerGuid;
var gFrieght;
var gListView;
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/arteriatech/ssfrieghtlist/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.arteriatech.ssfrieghtlist.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			jQuery.sap.registerModulePath("com.arteriatech.ppc.utils", "/sap/bc/ui5_ui5/ARTEC/PPCUTIL/utils/");
			jQuery.sap.registerModulePath("com.arteriatech.ss.utils", "/sap/bc/ui5_ui5/ARTEC/SSUTIL/utils/");
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});