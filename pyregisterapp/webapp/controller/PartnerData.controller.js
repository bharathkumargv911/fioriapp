sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common",
],
function(Controller,oSSCommon,oPPCCommon){
    "use strict";
    var oi18n="",
    oPPCUtili18n ="";

    var oDevice = sap.ui.Device;
    var BusyDialog = new sap.m.BusyDialog();

    return Controller.extend("pyregisterapp.controller.PartnerData",{
        onInit:function(){
            gPartnerData = this.getView();
            this.onInitialHookUps();
        },
        onInitialHookUps:function(){
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            oi18n = this._oComponent.getModel("i18n").getResourceBundle();
            oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched:function(){
            this.setDefaultSettingsModel();
        },

        setDefaultSettingsModel:function(){
            var json = {

            }
            var oJsonModel = new sap.ui.model.json.JSONModel();
            oJsonModel.setData(json);
            this.getView().setModel(oJsonModel,"setDefaultSettingsModel")

            var tableData = [];
            var oJSONModel = new sap.ui.model.json.JSONModel();
            oJSONModel.setData(tableData);
            this.getView().setModel(oJSONModel,"PartnerTableDetails")

        },
        addData:function(){
            oPPCCommon.removeAllMsgs();
            oPPCCommon.hideMessagePopover();
            this.validateData();
            if(oPPCCommon.doErrMessageExist()){
                var oModel = this.getView().getModel("PartnerTableDetails");
                var sData = gRegisterController.getModel("CreateModel").getData();
                var oData = oModel.getProperty("/");
                var newEntry = {
					FirstName: sData.fname,
					LastName: sData.lname,
					Mobile: sData.Mobile,
					RetypeMobile: sData.Mobile2,
					email: sData.email,
                    retypeemail:sData.email2,
                    PostalCode:sData.PostalCode
				}
                oData.push(newEntry);
                oModel.setProperty("/", oData);
                gRegisterController.getModel("LocalViewSettings").setProperty("/visibleRowCount",oData.length)
                gRegisterController.getModel("LocalViewSettings").setProperty("/showCountofTable",oData.length)                
                gRegisterController.getModel("CreateModel").setData({});
            }
        },
        validateData:function(){
            var oModel = gRegisterController.getModel("CreateModel").getData();
            if(!oModel.fname){
                this.getView().byId("PartnerNameInputID").setValueState("Error");
                this.getView().byId("PartnerNameInputID").setValueStateText("Please Enter Valid Name");
                oPPCCommon.addMsg_MsgMgr("Please Enter Valid First Name");
            }
            else{
                this.getView().byId("PartnerNameInputID").setValueState("None");
                this.getView().byId("PartnerNameInputID").setValueState("");
            }
        }
    } 
)
})
