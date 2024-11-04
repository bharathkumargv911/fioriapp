sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
],
function (Controller,JSONModel,UIComponent,Filter,FilterOperator,DateFormat) {
    "use strict";

    return Controller.extend("newlistreport.controller.DetailsPage", {
        onInit: function () {
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            this.onInitialHookUps();  
        },

        onInitialHookUps:function(){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("DetailPage").attachPatternMatched(this.onRouteMatched,this);
        },
        onRouteMatched:function(oEvent){
            var that = this; 
            var OrderId = oEvent.getParameter("arguments").ID;
            var dFilters = [];
            dFilters.push(new Filter("ID", FilterOperator.EQ, OrderId));
            var that = this;
            var oModel = this._oComponent.getModel("PYGWHANA");
            oModel.read("/BPHeader",{
                filters:dFilters,
                success: function(oData){
 
                    var oJsonModel=new JSONModel();
                    oJsonModel.setData(oData.results);
                    that.getView().setModel(oJsonModel,"BPHeaderDetail");
                    that.getView().setModel(oJsonModel,"BPHeaderDetail1");
                   
                },
                error: function(oError,oResponse){
                }
            });
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
            var oDate = new Date(sDate);
            return oDateFormat.format(oDate);
        },

        onNaviBack : function() {
			const oHistory = sap.ui.core.routing.History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("ListPage",{},true);
			}
		}

        
    })
})