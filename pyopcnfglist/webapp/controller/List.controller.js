sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCCommon) {
    "use strict";
    var oi18n;
    var oPPCUtili18n;
    var oDevice = sap.ui.Device;
    var BusyDialog = new sap.m.BusyDialog();
    return Controller.extend("pyopcnfglist.controller.List", {
        onInit: function () {
            this.onInitialHookUps(); 
        },
        onInitialHookUps:function(){
            this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.setDefaultSettings();
			//Attach event for routing on view patter matched 
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			// if (this.onInitialHookUps_Exit) {
			// 	this.onInitialHookUps_Exit();
			// }
        },
        setDefaultSettings:function(){
			var json = {
				visibleRowCount: 0,
				ItemsCount: 0
			};
			var ojsonmodel = new sap.ui.model.json.JSONModel();
			ojsonmodel.setData(json);
			this.getView().setModel(ojsonmodel, "LocalViewSettings");
		
        },
        onSearch:function(){
			var that = this;
			BusyDialog.open();
            
			var oModel = this.getView().getModel("PYGWHANA");
			var oFilter = [];
			if (this.getView().byId("DP11").getDateValue()) {
				oFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilter, "CreatedOn", sap.ui.model.FilterOperator.BT, [
					this.getView().byId("DP11").getDateValue(), this.getView().byId("DP11").getSecondDateValue(),
				], false, false, false);
			}
			oModel.read("/OPCNFG", {
				filters: oFilter,
				success: function (oData) {
					BusyDialog.close();
					if (oData) {
						// var oData = that.formatoData(oData.results);
						var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
						that._oComponent.setModel(jsonModel, "ListItems");
						that.setTableLength(oData.results.length);
					}
				},
				error: function () {
					BusyDialog.close();
					var jsonModel = new sap.ui.model.json.JSONModel([]);
					that._oComponent.setModel(jsonModel, "ListItems");
					that.setTableLength(0);
				}
			});
		
        },
        goToDetail: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("ListItems").getObject();
			var ID = object.ID;
			var contextpath = "path(ID=" + ID + "')";
			this._oRouter.navTo("Detail", {
				contextPath: contextpath
			}, false);
		},
        exportToExcel:function(){

			var table = this.getView().byId("ListData");
			var oModel = this.getView().getModel("ListItems");
			var items, mParameters;
			items = table.getItems();
			if (items.length > 0) {
				if (oDevice.system.desktop) {
					oPPCCommon.copyAndApplySortingFilteringFromUITable({
						thisController: this,
						mTable: this.getView().byId("ListData"),
						uiTable: this.getView().byId("UITableData")
					});
				}
			}
			oPPCCommon.exportToExcel(table, oModel, {
				bExportAll: false,
				oController: this,
				bLabelFromMetadata: false,
				sFileName: "OPCNFG Data",
				sModel: "PYGWHANA",
				sEntityType: "OPCNFG",
				oUtilsI18n: oPPCUtili18n
			});
		
        },
        handleChange:function(){

        },
        setTableLength: function (length) {
			this.getView().getModel("LocalViewSettings").setProperty("/ItemsCount", length);
            gVar =length;
			if (length > 10) {
				this.getView().getModel("LocalViewSettings").that.setTableLength(0);("/visibleRowCount", 10);
			} else {
				this.getView().getModel("LocalViewSettings").setProperty("/visibleRowCount", length);
			}
		},
    });
});
