sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
    "com/arteriatech/ppc/utils/js/Common",
    "sap/ui/core/format/DateFormat",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/m/library"
],
    function (Controller, oSSCommon, oPPCommon, DateFormat, Dialog, Button, MessageBox, coreLibrary, mobileLibrary) {
        "use strict";
        var oi18n = "",
            oPPCUtili18n = "";
        var BusyDialog = new sap.m.BusyDialog();
        var ValueState = coreLibrary.ValueState;
        var DialogType = mobileLibrary.DialogType;

        return Controller.extend("pycreateapp.controller.DetailPage", {
            onInit: function () {
                this.onInitialHookUps();
            },
            onInitialHookUps: function () {
                gObjectPageLayoutID = this.getView().byId("ObjectPageLayoutID");
                this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
                oi18n = this._oComponent.getModel("i18n").getResourceBundle();
                oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRouteMatched(this.onRouteMatched, this);
            },

            setDefaultSettingsModel: function () {
                var json = {
                    messageLength: 0,
                    Detail: false,
                    Edit: false,
                    saveBtn: false,
                    CreatePage: true,
                    ReviewPage: false,
                    reviewbtn: true,
                    errormsg: false,
                    backbtn: false,
                    clearbtn: true,
                    Detail1: true
                }
                var ojsonmodel = new sap.ui.model.json.JSONModel();
                ojsonmodel.setData(json);
                this.getView().setModel(ojsonmodel, "LocalViewSettingsDetail");

                var json1 = {
                    aggrid: ""
                }
                var ojsonmodel = new sap.ui.model.json.JSONModel();
                ojsonmodel.setData(json1);
                this.getView().setModel(ojsonmodel, "CreateModel");
            },

            onReview: function () {
                oPPCommon.removeAllMsgs();
                oPPCommon.hideMessagePopover();
                this.validateData();
                if (oPPCommon.doErrMessageExist()) {
                    // this.getView().getModel("LocalViewSettingsDetail").setProperty("/CreatePage", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/ReviewPage", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewbtn", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/saveBtn", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/backbtn", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/clearbtn", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/Detail", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/Detail1", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
                        .getData().length);
                } else {
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
                        .getData().length);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/errormsg", true);
                    // oPPCCommon.showMessagePopover(gDetailPageBasic);
                    // oPPCCommon.showMessagePopover(gDetailBusiness1);
                    // oPPCCommon.showMessagePopover(gDetailBusiness2);
                    this.onshowerrorpopup();
                }

            },
            // onshowerrorpopup:function(){

            // },
            onSavePopup: function () {

                if (!this.oFixedSizeDialog) {
                    this.oFixedSizeDialog = new Dialog({
                        title: "Confirmation",
                        content: new sap.m.Text({
                            text: "Do you want to save?",
                        }),
                        beginButton: new Button({
                            text: "OK",
                            press: function () {
                                this.onSave();
                                this.oFixedSizeDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Close",
                            press: function () {
                                this.oFixedSizeDialog.close();
                            }.bind(this)
                        })
                    });

                    //to get access to the controller's model
                    this.getView().addDependent(this.oFixedSizeDialog);
                }

                this.oFixedSizeDialog.open();
            },
            onSave: function () {
                var that = this;
                BusyDialog.open();
                var oModel = this.getView().getModel("PYGWHANA");
                var oData = this.getView().getModel("CreateModel").getData();
                var ID = oPPCommon.generateUUID();
                oData.ID = ID;
                delete oData.aggrid;
                delete oData.IncorporationDate;
                oModel.create("/BPHeader", oData, {
                    success: function (data, status) {
                        BusyDialog.close();
                        if (status.statusCode === "201") {
                            // MessageBox.success("Record Created Successfully!!"); 
                            var oSuccessMessageDialog = new Dialog({
                                title: "Success",
                                type: DialogType.Message,
                                state: ValueState.Success,
                                content: new sap.m.Text({
                                    text: "Record Created Successfully"
                                }),
                                beginButton: new Button({
                                    text: "OK",
                                    press: function () {
                                        //this._common = [];
                                        // window.location.reload()
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/ReviewPage", false);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/CreatePage", true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewbtn", true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/saveBtn", false);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/backbtn", false);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/clearbtn", true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/Detail", false);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/Detail1", true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
                                            .getData().length);
                                        oSuccessMessageDialog.close();
                                    }.bind(that)
                                })
                            });

                            oSuccessMessageDialog.open();

                        } else {
                            MessageBox.warning("Please check Again")
                        }
                    },
                    error: function (data) {
                        BusyDialog.close();
                        MessageBox.error("Record Not Created, Please check Again!!")
                    }
                });
            },

            onClear: function () {
                this.getView().getModel("CreateModel").setData({});
                this.clearValueState([
                    "idUtilDistrict",
                    "idCPGuid"
                ]);
            },
            clearValueState: function (array) {
                array.forEach(function (getID) {
                    gDetailPageBasic.byId(getID).setValueState("None");
                    gDetailPageBasic.byId(getID).setValueStateText("");

                })
            },

            onshowerrorpopup: function () {
                oPPCommon.showMessagePopover(gObjectPageLayoutID);
                // oPPCommon.showMessagePopover(gDetailBusiness1);
                // oPPCommon.showMessagePopover(gDetailBusiness2);
            },

            validateData: function () {
                var oModel = this.getView().getModel("CreateModel").getData();
                if(!oModel.CPGuid){
                    gDetailPageBasic.byId("idCPGuid").setValueState("Error");
                    gDetailPageBasic.byId("idCPGuid").setValueStateText(oi18n.getText("Error.cpguid"));
                    oPPCommon.addMsg_MsgMgr(oi18n.getText("Error.cpguid"));
                } 
                else{
                    gDetailPageBasic.byId("idCPGuid").setValueState("None");
                    gDetailPageBasic.byId("idCPGuid").setValueStateText("");
                }
                // if(!oModel.CPType){
                //     gDetailPageBasic.byId("idCPType").setValueState("Error");
                //     gDetailPageBasic.byId("idCPType").setValueStateText(oi18n.getText("Error.cptype"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.cptype"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idCPType").setValueState("None");
                //     gDetailPageBasic.byId("idCPType").setValueStateText("");
                // }
                // if(!oModel.CPName){
                //     gDetailPageBasic.byId("idCPName").setValueState("Error");
                //     gDetailPageBasic.byId("idCPName").setValueStateText(oi18n.getText("Error.cpname"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.cpname"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idCPName").setValueState("None");
                //     gDetailPageBasic.byId("idCPName").setValueStateText("");
                // }
                // if(!oModel.UtilDistrict){
                //     gDetailPageBasic.byId("idUtilDistrict").setValueState("Error");
                //     gDetailPageBasic.byId("idUtilDistrict").setValueStateText(oi18n.getText("Error.UtilDistrict"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.UtilDistrict"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idUtilDistrict").setValueState("None");
                //     gDetailPageBasic.byId("idUtilDistrict").setValueStateText("");
                // }
                if (!oModel.IncorporationDate) {
                    gDetailPageBasic.byId("DP1").setValueState("Error");
                    gDetailPageBasic.byId("DP1").setValueStateText(oi18n.getText("Error.IncorporationDate"));
                    oPPCommon.addMsg_MsgMgr(oi18n.getText("Error.IncorporationDate"));
                }
                else {
                    gDetailPageBasic.byId("DP1").setValueState("None");
                    gDetailPageBasic.byId("DP1").setValueStateText("");
                }


                // if(!oModel.LegalStatus){
                //     gDetailPageBasic.byId("idLegalStatus").setValueState("Error");
                //     gDetailPageBasic.byId("idLegalStatus").setValueStateText(oi18n.getText("Error.LegalStatus"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.LegalStatus"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idLegalStatus").setValueState("None");
                //     gDetailPageBasic.byId("idLegalStatus").setValueStateText("");
                // }
                // if(!oModel.Address1){
                //     gDetailPageBasic.byId("idAddress1").setValueState("Error");
                //     gDetailPageBasic.byId("idAddress1").setValueStateText(oi18n.getText("Error.Address1"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address1"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idAddress1").setValueState("None");
                //     gDetailPageBasic.byId("idAddress1").setValueStateText("");
                // }
                // if(!oModel.Address2){
                //     gDetailPageBasic.byId("idAddress2").setValueState("Error");
                //     gDetailPageBasic.byId("idAddress2").setValueStateText(oi18n.getText("Error.Address2"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address2"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idAddress2").setValueState("None");
                //     gDetailPageBasic.byId("idAddress2").setValueStateText("");
                // }
                // if(!oModel.Address3){
                //     gDetailPageBasic.byId("idAddress3").setValueState("Error");
                //     gDetailPageBasic.byId("idAddress3").setValueStateText(oi18n.getText("Error.Address3"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address3"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idAddress3").setValueState("None");
                //     gDetailPageBasic.byId("idAddress3").setValueStateText("");
                // }
                // if(!oModel.Address4){
                //     gDetailPageBasic.byId("idAddress4").setValueState("Error");
                //     gDetailPageBasic.byId("idAddress4").setValueStateText(oi18n.getText("Error.Address4"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address4"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idAddress4").setValueState("None");
                //     gDetailPageBasic.byId("idAddress4").setValueStateText("");
                // }
                // if(!oModel.District){
                //     gDetailPageBasic.byId("idDistrict").setValueState("Error");
                //     gDetailPageBasic.byId("idDistrict").setValueStateText(oi18n.getText("Error.District"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.District"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idDistrict").setValueState("None");
                //     gCreateObjectDetail.byId("idDistrict").setValueStateText("");
                // }
                // if(!oModel.City){
                //     gDetailPageBasic.byId("idCity").setValueState("Error");
                //     gDetailPageBasic.byId("idCity").setValueStateText(oi18n.getText("Error.City"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.City"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idCity").setValueState("None");
                //     gDetailPageBasic.byId("idCity").setValueStateText("");
                // }
                // if(!oModel.State){
                //     gDetailPageBasic.byId("idState").setValueState("Error");
                //     gDetailPageBasic.byId("idState").setValueStateText(oi18n.getText("Error.State"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.State"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idState").setValueState("None");
                //     gDetailPageBasic.byId("idState").setValueStateText("");
                // }
                // if(!oModel.StateDesc){
                //     gDetailPageBasic.byId("idStateDesc").setValueState("Error");
                //     gDetailPageBasic.byId("idStateDesc").setValueStateText(oi18n.getText("Error.StateDesc"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.StateDesc"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idStateDesc").setValueState("None");
                //     gDetailPageBasic.byId("idStateDesc").setValueStateText("");
                // }
                // if(!oModel.Country){
                //     gDetailPageBasic.byId("idCountry").setValueState("Error");
                //     gDetailPageBasic.byId("idCountry").setValueStateText(oi18n.getText("Error.Country"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Country"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idCountry").setValueState("None");
                //     gDetailPageBasic.byId("idCountry").setValueStateText("");
                // }
                // if(!oModel.CountryDesc){
                //     gDetailPageBasic.byId("idCountryDesc").setValueState("Error");
                //     gDetailPageBasic.byId("idCountryDesc").setValueStateText(oi18n.getText("Error.CountryDesc"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.CountryDesc"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idCountryDesc").setValueState("None");
                //     gDetailPageBasic.byId("idCountryDesc").setValueStateText("");
                // }
                // var pincodeRegex = /^[1-9][0-9]{5}$/
                // if(!pincodeRegex.test(oModel.Pincode)){
                //     gDetailPageBasic.byId("idPincode").setValueState("Error");
                //     gCreateObjectDetail.byId("idPincode").setValueStateText(oi18n.getText("Error.Pincode"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Pincode"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idPincode").setValueState("None");
                //     gDetailPageBasic.byId("idPincode").setValueStateText("");
                // }
                // if(!oModel.EntityType){
                //     gDetailPageBasic.byId("idEntityType").setValueState("Error");
                //     gDetailPageBasic.byId("idEntityType").setValueStateText(oi18n.getText("Error.EntityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.EntityType"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idEntityType").setValueState("None");
                //     gDetailPageBasic.byId("idEntityType").setValueStateText("");
                // }
                // if(!oModel.EntityID){
                //     gDetailPageBasic.byId("idEntityID").setValueState("Error");
                //     gDetailPageBasic.byId("idEntityID").setValueStateText(oi18n.getText("Error.EntityID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.EntityID"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idEntityID").setValueState("None");
                //     gDetailPageBasic.byId("idEntityID").setValueStateText("");
                // }
                // if(!oModel.ParentNo){
                //     gDetailPageBasic.byId("idParentNo").setValueState("Error");
                //     gDetailPageBasic.byId("idParentNo").setValueStateText(oi18n.getText("Error.ParentNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ParentNo"));
                // } 
                // else{
                //     gDetailPageBasic.byId("idParentNo").setValueState("None");
                //     gDetailPageBasic.byId("idParentNo").setValueStateText("");
                // }
                // if(!oModel.ParentTypeID){
                //     gDetailBusiness1.byId("idParentTypeID").setValueState("Error");
                //     gDetailBusiness1.byId("idParentTypeID").setValueStateText(oi18n.getText("Error.ParentTypeID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ParentTypeID"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idParentTypeID").setValueState("None");
                //     gDetailBusiness1.byId("idParentTypeID").setValueStateText("");
                // }
                // if(!oModel.ParentName){
                //     gDetailBusiness1.byId("idParentName").setValueState("Error");
                //     gDetailBusiness1.byId("idParentName").setValueStateText(oi18n.getText("Error.ParentName"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ParentName"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idParentName").setValueState("None");
                //     gDetailBusiness1.byId("idParentName").setValueStateText("");
                // }
                // if(!oModel.URCEntityType){
                //     gDetailBusiness1.byId("idURCEntityType").setValueState("Error");
                //     gDetailBusiness1.byId("idURCEntityType").setValueStateText(oi18n.getText("Error.URCEntityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCEntityType"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idURCEntityType").setValueState("None");
                //     gDetailBusiness1.byId("idURCEntityType").setValueStateText("");
                // }
                // if(!oModel.URCActivityType){
                //     gDetailBusiness1.byId("idURCActivityType").setValueState("Error");
                //     gDetailBusiness1.byId("idURCActivityType").setValueStateText(oi18n.getText("Error.URCActivityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCActivityType"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idURCActivityType").setValueState("None");
                //     gDetailBusiness1.byId("idURCActivityType").setValueStateText("");
                // }
                // if(!oModel.URCSectorCode){
                //     gDetailBusiness1.byId("idURCSectorCode").setValueState("Error");
                //     gDetailBusiness1.byId("idURCSectorCode").setValueStateText(oi18n.getText("Error.URCSectorCode"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCSectorCode"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idURCSectorCode").setValueState("None");
                //     gDetailBusiness1.byId("idURCSectorCode").setValueStateText("");
                // }
                // if(!oModel.URCSubSectorCode){
                //     gDetailBusiness1.byId("idURCSubSectorCode").setValueState("Error");
                //     gDetailBusiness1.byId("idURCSubSectorCode").setValueStateText(oi18n.getText("Error.URCSubSectorCode"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCSubSectorCode"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idURCSubSectorCode").setValueState("None");
                //     gDetailBusiness1.byId("idURCSubSectorCode").setValueStateText("");
                // }
                // if(!oModel.URCDocURL){
                //     gDetailBusiness1.byId("idURCDocURL").setValueState("Error");
                //     gDetailBusiness1.byId("idURCDocURL").setValueStateText(oi18n.getText("Error.URCDocURL"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCDocURL"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idURCDocURL").setValueState("None");
                //     gDetailBusiness1.byId("idURCDocURL").setValueStateText("");
                // }
                // if(!oModel.ODAccountNo){
                //     gDetailBusiness1.byId("idODAccountNo").setValueState("Error");
                //     gDetailBusiness1.byId("idODAccountNo").setValueStateText(oi18n.getText("Error.ODAccountNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ODAccountNo"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idODAccountNo").setValueState("None");
                //     gDetailBusiness1.byId("idODAccountNo").setValueStateText("");
                // }
                // if(!oModel.URCRegistrationDate){
                //     gDetailBusiness1.byId("DP2").setValueState("Error");
                //     gDetailBusiness1.byId("DP2").setValueStateText(oi18n.getText("Error.URCRegistrationDate"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCRegistrationDate"));
                // } 
                // else{
                //     gDetailBusiness1.byId("DP2").setValueState("None");
                //     gDetailBusiness1.byId("DP2").setValueStateText("");
                // }
                // if(!oModel.Source){
                //     gDetailBusiness1.byId("idSource").setValueState("Error");
                //     gDetailBusiness1.byId("idSource").setValueStateText(oi18n.getText("Error.Source"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Source"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idSource").setValueState("None");
                //     gDetailBusiness1.byId("idSource").setValueStateText("");
                // }
                // if(!oModel.SourceReferenceID){
                //     gDetailBusiness1.byId("idSourceReferenceID").setValueState("Error");
                //     gDetailBusiness1.byId("idSourceReferenceID").setValueStateText(oi18n.getText("Error.SourceReferenceID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.SourceReferenceID"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idSourceReferenceID").setValueState("None");
                //     gDetailBusiness1.byId("idSourceReferenceID").setValueStateText("");
                // }
                // var phoneRegex = /^[1-9][0-9]{9}$/
                // if(!phoneRegex.test(oModel.Mobile1)){
                //     gDetailBusiness1.byId("idMobile1").setValueState("Error");
                //     gDetailBusiness1.byId("idMobile1").setValueStateText(oi18n.getText("Error.Mobile1"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Mobile1"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idMobile1").setValueState("None");
                //     gDetailBusiness1.byId("idMobile1").setValueStateText("");
                // }
                // var phoneRegex2 = /^[1-9][0-9]{9}$/
                // if(!phoneRegex2.test(oModel.Mobile2)){
                //     gDetailBusiness1.byId("idMobile2").setValueState("Error");
                //     gDetailBusiness1.byId("idMobile2").setValueStateText(oi18n.getText("Error.Mobile2"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Mobile2"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idMobile2").setValueState("None");
                //     gDetailBusiness1.byId("idMobile2").setValueStateText("");
                // }
                // if(!oModel.LandLine1){
                //     gDetailBusiness1.byId("idLandLine1").setValueState("Error");
                //     gDetailBusiness1.byId("idLandLine1").setValueStateText(oi18n.getText("Error.LandLine1"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.LandLine1"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idLandLine1").setValueState("None");
                //     gDetailBusiness1.byId("idLandLine1").setValueStateText("");
                // }
                // var emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
                // if(!emailRegex.test(oModel.EmailID)){
                //     gDetailBusiness1.byId("idEmailID").setValueState("Error");
                //     gDetailBusiness1.byId("idEmailID").setValueStateText(oi18n.getText("Error.EmailID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.EmailID"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idEmailID").setValueState("None");
                //     gDetailBusiness1.byId("idEmailID").setValueStateText("");
                // }

                // var panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/
                // if(!panRegex.test(oModel.PAN)){
                //     gDetailBusiness1.byId("idPAN").setValueState("Error");
                //     gDetailBusiness1.byId("idPAN").setValueStateText(oi18n.getText("Error.PAN"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.PAN"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idPAN").setValueState("None");
                //     gDetailBusiness1.byId("idPAN").setValueStateText("");
                // }
                // var gstRegex=/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[A-Z\d]{1}$/
                // var getPan = gDetailBusiness1.byId("idPAN").getValue();
                // var getGST = oModel.GSTIN
                // if(!oModel.GSTIN){
                //     gDetailBusiness1.byId("idGSTIN").setValueState("Error");
                //     gDetailBusiness1.byId("idGSTIN").setValueStateText(oi18n.getText("Error.GSTIN"));
                //     oPPCommon.addMsg_MsgMgr(oi18n.getText("Error.GSTIN"));
                // }
                // else if(!gstRegex.test(getGST)){
                //     gDetailBusiness1.byId("idGSTIN").setValueState("Error");
                //     gDetailBusiness1.byId("idGSTIN").setValueStateText(oi18n.getText("Error.GSTIN"));
                //     oPPCommon.addMsg_MsgMgr(oi18n.getText("Error.GSTIN"));
                // }
                // else if(getPan && getGST.substr(2,10)!=getPan){
                //     gDetailBusiness1.byId("idGSTIN").setValueState("Error");
                //     gDetailBusiness1.byId("idGSTIN").setValueStateText(oi18n.getText("Error.GSTIN"));
                //     oPPCommon.addMsg_MsgMgr(oi18n.getText("Error.GSTIN"));
                // }
                // else{
                //     gDetailBusiness1.byId("idGSTIN").setValueState("None");
                //     gDetailBusiness1.byId("idGSTIN").setValueStateText("");
                // }
                // if(!oModel.StatusID){
                //     gDetailBusiness1.byId("idStatusID").setValueState("Error");
                //     gDetailBusiness1.byId("idStatusID").setValueStateText(oi18n.getText("Error.StatusID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.StatusID"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idStatusID").setValueState("None");
                //     gDetailBusiness1.byId("idStatusID").setValueStateText("");
                // }
                // if(!oModel.ApproverRemarks){
                //     gDetailBusiness1.byId("idApproverRemarks").setValueState("Error");
                //     gDetailBusiness1.byId("idApproverRemarks").setValueStateText(oi18n.getText("Error.ApproverRemarks"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ApproverRemarks"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idApproverRemarks").setValueState("None");
                //     gDetailBusiness1.byId("idApproverRemarks").setValueStateText("");
                // }
                // if(!oModel.MSME){
                //     gDetailBusiness1.byId("idMSME").setValueState("Error");
                //     gDetailBusiness1.byId("idMSME").setValueStateText(oi18n.getText("Error.MSME"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.MSME"));
                // } 
                // else{
                //     gDetailBusiness1.byId("idMSME").setValueState("None");
                //     gDetailBusiness1.byId("idMSME").setValueStateText("");
                // }
                // if(!oModel.UdyamRegNo){
                //     gDetailBusiness2.byId("idUdyamRegNo").setValueState("Error");
                //     gDetailBusiness2.byId("idUdyamRegNo").setValueStateText(oi18n.getText("Error.UdyamRegNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.UdyamRegNo"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idUdyamRegNo").setValueState("None");
                //     gDetailBusiness2.byId("idUdyamRegNo").setValueStateText("");
                // }
                // if(!oModel.HgdFrgnCurrExposure){
                //     gDetailBusiness2.byId("idHgdFrgnCurrExposure").setValueState("Error");
                //     gDetailBusiness2.byId("idHgdFrgnCurrExposure").setValueStateText(oi18n.getText("Error.HgdFrgnCurrExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.HgdFrgnCurrExposure"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idHgdFrgnCurrExposure").setValueState("None");
                //     gDetailBusiness2.byId("idHgdFrgnCurrExposure").setValueStateText("");
                // }
                // if(!oModel.UnHgdFrgnCurrExposure){
                //     gDetailBusiness2.byId("idUnHgdFrgnCurrExposure").setValueState("Error");
                //     gDetailBusiness2.byId("idUnHgdFrgnCurrExposure").setValueStateText(oi18n.getText("Error.UnHgdFrgnCurrExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.UnHgdFrgnCurrExposure"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idUnHgdFrgnCurrExposure").setValueState("None");
                //     gDetailBusiness2.byId("idUnHgdFrgnCurrExposure").setValueStateText("");
                // }
                // if(!oModel.TotalFrgnCurrExposure){
                //     gDetailBusiness2.byId("idTotalFrgnCurrExposure").setValueState("Error");
                //     gDetailBusiness2.byId("idTotalFrgnCurrExposure").setValueStateText(oi18n.getText("Error.TotalFrgnCurrExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.TotalFrgnCurrExposure"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idTotalFrgnCurrExposure").setValueState("None");
                //     gDetailBusiness2.byId("idTotalFrgnCurrExposure").setValueStateText("");
                // }
                // if(!oModel.FundBasedExposure){
                //     gDetailBusiness2.byId("idFundBasedExposure").setValueState("Error");
                //     gDetailBusiness2.byId("idFundBasedExposure").setValueStateText(oi18n.getText("Error.FundBasedExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.FundBasedExposure"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idFundBasedExposure").setValueState("None");
                //     gDetailBusiness2.byId("idFundBasedExposure").setValueStateText("");
                // }
                // if(!oModel.NonFundBasedExposure){
                //     gDetailBusiness2.byId("idNonFundBasedExposure").setValueState("Error");
                //     gDetailBusiness2.byId("idNonFundBasedExposure").setValueStateText(oi18n.getText("Error.NonFundBasedExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.NonFundBasedExposure"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idNonFundBasedExposure").setValueState("None");
                //     gDetailBusiness2.byId("idNonFundBasedExposure").setValueStateText("");
                // }
                // if(!oModel.TotalBankingExposure){
                //     gDetailBusiness2.byId("idTotalBankingExposure").setValueState("Error");
                //     gDetailBusiness2.byId("idTotalBankingExposure").setValueStateText(oi18n.getText("Error.TotalBankingExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.TotalBankingExposure"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idTotalBankingExposure").setValueState("None");
                //     gDetailBusiness2.byId("idTotalBankingExposure").setValueStateText("");
                // }
                // if(!oModel.CorporateIdentificationNo){
                //     gDetailBusiness2.byId("idCorporateIdentificationNo").setValueState("Error");
                //     gDetailBusiness2.byId("idCorporateIdentificationNo").setValueStateText(oi18n.getText("Error.CorporateIdentificationNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.CorporateIdentificationNo"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idCorporateIdentificationNo").setValueState("None");
                //     gDetailBusiness2.byId("idCorporateIdentificationNo").setValueStateText("");
                // }
                // if(!oModel.FacilityType){
                //     gDetailBusiness2.byId("idFacilityType").setValueState("Error");
                //     gDetailBusiness2.byId("idFacilityType").setValueStateText(oi18n.getText("Error.FacilityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.FacilityType"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idFacilityType").setValueState("None");
                //     gDetailBusiness2.byId("idFacilityType").setValueStateText("");
                // }
                // if(!oModel.BPRejectionRemarks){
                //     gDetailBusiness2.byId("idBPRejectionRemarks").setValueState("Error");
                //     gDetailBusiness2.byId("idBPRejectionRemarks").setValueStateText(oi18n.getText("Error.BPRejectionRemarks"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.BPRejectionRemarks"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idBPRejectionRemarks").setValueState("None");
                //     gDetailBusiness2.byId("idBPRejectionRemarks").setValueStateText("");
                // }
                // if(!oModel.LEINumber){
                //     gDetailBusiness2.byId("idLEINumber").setValueState("Error");
                //     gDetailBusiness2.byId("idLEINumber").setValueStateText(oi18n.getText("Error.LEINumber"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.LEINumber"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idLEINumber").setValueState("None");
                //     gDetailBusiness2.byId("idLEINumber").setValueStateText("");
                // }
                // if(!oModel.ERP_CPName){
                //     gDetailBusiness2.byId("idERP_CPName").setValueState("Error");
                //     gDetailBusiness2.byId("idERP_CPName").setValueStateText(oi18n.getText("Error.ERP_CPName"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ERP_CPName"));
                // } 
                // else{
                //     gDetailBusiness2.byId("idERP_CPName").setValueState("None");
                //     gDetailBusiness2.byId("idERP_CPName").setValueStateText("");
                // }

            },
            onRouteMatched: function () {
                this.setDefaultSettingsModel();
                this.getDetailData();
            },
            getDetailData: function () {
                var that = this;
                BusyDialog.open();
                var oModel = that._oComponent.getModel("PYGWHANA");
                oModel.read("/BPHeader", {
                    success: function (oData) {
                        BusyDialog.close();
                        if (oData) {
                            var jsonModel = new sap.ui.model.json.JSONModel();
                            jsonModel.setData(oData.results);
                            that._oComponent.setModel(jsonModel, "DetailModel");

                        }
                    }
                })

            },

            onBack: function () {
                if (this.getView().getModel("LocalViewSettingsDetail").getProperty("/saveBtn")) {
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/CreatePage", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/ReviewPage", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewbtn", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/saveBtn", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/backbtn", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/clearbtn", true);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/Detail", false);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/Detail1", true);

                } else {
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("DetailPage", {}, true);
                }

            },
            formatDate: function (sDate) {
                if (!sDate) {
                    return "";
                }
                var oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
                var oDate = new Date(sDate);
                return oDateFormat.format(oDate);
            }
        });
    });