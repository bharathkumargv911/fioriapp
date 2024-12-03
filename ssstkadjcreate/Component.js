jQuery.sap.declare("com.arteria.ss.stockadjustmnt.create.Component");
jQuery.sap.require("sap.ui.Device");
var gList, gListPageView, gListView = "";
var gSADetailView, gSADetailHeaderView, gSAItemView, gSubMatListView;
sap.ui.core.UIComponent.extend("com.arteria.ss.stockadjustmnt.create.Component", {
	metadata: {
		manifest: "json"
	},
	init: function() {
		//Common Utils
		jQuery.sap.registerModulePath("com.arteriatech.ppc.utils", "/sap/bc/ui5_ui5/ARTEC/PPCUTIL/utils/");

		//Product Utils
		jQuery.sap.registerModulePath("com.arteriatech.prd.utils", "/sap/bc/ui5_ui5/ARTEC/SSUTIL/utils/");

		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var Device = sap.ui.Device;
		var DeviceModel = new sap.ui.model.json.JSONModel(Device);
		DeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(DeviceModel, "device");

		this.getRouter().initialize();
	}
});