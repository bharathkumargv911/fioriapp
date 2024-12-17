jQuery.sap.declare("com.arteriatech.zsf.quot.Component");
jQuery.sap.require("sap.ui.Device");
var gListPageView;
var gDetailPageView;
var gDetailPageItems;
var gQuotFunctionsView;
var gItemDetailPageView;
var gQuotItemCondtionsView;
var QuotItemSchedulesView;
var gPOMandatoryDocType;
var gQuotItemPFView;
var gDetailPageHeaderView = "";
var gObjPageLayout = "";
var gContractAttachmentView="";
var gObjectPageLayout;
var gApproveListPage;
var gApproveListView;
sap.ui.core.UIComponent.extend("com.arteriatech.zsf.quot.Component", {
	metadata: {
		manifest: "json"
	},
	init: function() {
		//Common Utils
		jQuery.sap.registerModulePath("com.arteriatech.ppc.utils", "/sap/bc/ui5_ui5/ARTEC/PPCUTIL/utils/");

		//Product Utils
		jQuery.sap.registerModulePath("com.arteriatech.ss.utils", "/sap/bc/ui5_ui5/ARTEC/SSUTIL/utils/");

		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var Device = sap.ui.Device;
		var DeviceModel = new sap.ui.model.json.JSONModel(Device);
		DeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(DeviceModel, "device");

		this.getRouter().initialize();
	}
});