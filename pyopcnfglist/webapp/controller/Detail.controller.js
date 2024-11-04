sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCCommon) {
    "use strict";
    var oi18n = "",
		oPPCUtili18n = "";
	var oDevice = sap.ui.Device;
	var BusyDialog = new sap.m.BusyDialog();
	var contextPath;
    return Controller.extend("pyopcnfglist.controller.Detail", {
        onInit: function () {
			this.onInitialHookUps();
		},
		onInitialHookUps: function () {
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.setDefaultSettingsModel();
			// this.getAggregators();
		},
        setDefaultSettingsModel: function () {
			var json = {
				messageLength: 0,
				Detail: true,
				Edit: false,
				saveBtn: false
			};
			var ojsonmodel = new sap.ui.model.json.JSONModel();
			ojsonmodel.setData(json);
			this.getView().setModel(ojsonmodel, "LocalViewSettingsDetail");
		},
        onRouteMatched: function (oEvent) {

			var oHistory = sap.ui.core.routing.History.getInstance();
			if (oEvent.getParameter("name") !== "Detail") {
				return;
			}
			if (oHistory.getDirection() !== "Backwards") {
				contextPath = oEvent.getParameter("arguments").contextPath;

				this.getDetailData();
			}
		},
        getDetailData:function(){

			var that = this;
			BusyDialog.open();
			var oModel = that._oComponent.getModel("PYGWHANA");
			var oFilter = [];

			var ID = oPPCCommon.getPropertyValueFromContextPath(contextPath, "ID");
			oFilter.push(new sap.ui.model.Filter("ID", "EQ", ID));
			oModel.read("/OPCNFG", {
				filters: oFilter,
				success: function (oData) {
					BusyDialog.close();
					if (oData) {
						// var oData = that.formatoData(oData.results);
						var jsonModel = new sap.ui.model.json.JSONModel(oData.results[0]);
						that._oComponent.setModel(jsonModel, "DetailModel");
						// that.setTableLength(oData.length);
					}
				},
				error: function () {
					BusyDialog.close();
					var jsonModel = new sap.ui.model.json.JSONModel({});
					that._oComponent.setModel(jsonModel, "DetailModel");
					// that.setTableLength(0);
				}
			});
		
        }
    });
});
