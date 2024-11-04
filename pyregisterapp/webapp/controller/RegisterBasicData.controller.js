sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common"
],
function (Controller, oSSCommon, oPPCommon) {
    "use strict";
    var oi18n="",
    oPPCUtili18n ="";

    var oDevice = sap.ui.Device;
    var BusyDialog = new sap.m.BusyDialog();
    
    var BusyDialog = new sap.m.BusyDialog();
    return Controller.extend("pyregisterapp.controller.RegisterBasicData", {
        onInit: function () {
            this.onInitialHookUps();
            gRegisterBasicData = this.getView();
        },

        onInitialHookUps:function(){
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            oi18n = this._oComponent.getModel("i18n").getResourceBundle();
            oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched:function(){

        },
        
        onChange:function(oEvent){
            
            if(oEvent){
                BusyDialog.open();
            }
            var that = this;
            var aGetSelectedKeys = that.getView().byId("CustomerNameID").getSelectedKey();
            var oModel = that.getView().getModel("PYGWHANA");
            var oFilter = [];
            oFilter.push(new sap.ui.model.Filter("ID","EQ",aGetSelectedKeys));
            oModel.read("/UserCustomers",{
                filters: oFilter,
                success:function(response){
                    if(response){
                        BusyDialog.close();
                        var oLegalStatusResponse = response.results[0].LegalStatus;
                        for(var n=0;n<getModelData.length;n++){
                            if(oLegalStatusResponse === getModelData[n].Types){
                                response.results[0].BusinessType = getModelData[n].Typesname;
                                break
                            }
                        }
                        if(response.results[0].BusinessType === "Proprietorship"){
                            getDefaultData.setProperty("/proprietor",true)
                            getDefaultData.setProperty("/reviewButton",true)
                            getDefaultData.setProperty("/clearButton",true)
                        }
                        else if(response.results[0].BusinessType === "Partnership"){
                            getDefaultData.setProperty("/partner",true)
                            getDefaultData.setProperty("/reviewButton",true)
                            getDefaultData.setProperty("/clearButton",true)
                        }
                        else{
                            getDefaultData.setProperty("/proprietor",false)
                            getDefaultData.setProperty("/partner",false)
                        }

                        var Customer =[];
                        Customer.push(response.results);
                        var jsonModel1 = new sap.ui.model.json.JSONModel();
                        jsonModel1.setData(Customer[0]);
                        that._oComponent.setModel(jsonModel1,"CustomersData");
                        var jsonModel = new sap.ui.model.json.JSONModel();
                        jsonModel.setData(response.results[0]);
                        that._oComponent.setModel(jsonModel,"CustomersDetails");
                    }
                }
            })
        }
    });
});