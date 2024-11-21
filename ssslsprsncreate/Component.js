jQuery.sap.declare("com.arteriatech.ss.slsprsn.create.Component");
jQuery.sap.require("sap.ui.Device");
var gSalesPersonHeaderCreateView="";

sap.ui.core.UIComponent.extend("com.arteriatech.ss.slsprsn.create.Component", {
	metadata: {
		manifest : "json",
		handleValidation  : true
	},
	
	init : function() {
		jQuery.sap.registerModulePath("com.arteriatech.ppc.utils","/sap/bc/ui5_ui5/ARTEC/PPCUTIL/utils/");
		jQuery.sap.registerModulePath("com.arteriatech.ss.utils","/sap/bc/ui5_ui5/ARTEC/SSUTIL/utils/");
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		var Device = sap.ui.Device;
		var DeviceModel = new sap.ui.model.json.JSONModel(Device);
		DeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(DeviceModel, "device");

		this.getRouter().initialize();
	}
});