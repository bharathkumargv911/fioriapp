sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
function (Controller,JSONModel) {
    "use strict";

    return Controller.extend("newlistreport.controller.List", {
        onInit: function () {
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            this.onInitialHookUps();
        },

        onInitialHookUps:function(){
            this.setDefaultSettings();
        },      
        
        setDefaultSettings:function(){
            var defValues = {
                TableRowCount : 0,
                setRowCount: 10,
                setVisible: true
            }
            var defaultJsonModel = new JSONModel();
            defaultJsonModel.setData(defValues);
            this.getView().setModel(defaultJsonModel, "LocalViewSettings");
        },

        onSearch: function(){
            var that = this;
            var oModel = this._oComponent.getModel("PYGWHANA");
            oModel.read("/BPHeader",{
                success: function(oResponse){
                    var oJsonModel = new JSONModel();
                    oJsonModel.setData(oResponse.results);
                    that.getView().setModel(oJsonModel,"BPHeader")
                    that.getView().getModel("LocalViewSettings").setProperty("/TableRowCount",oResponse.results.length);
                }
            })
        },

        onPress: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var orderval = oEvent.getSource().getText();
            oRouter.navTo("DetailPage", {
                "ID": orderval
            });
    
        }
    });
});