sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
    "com/arteriatech/ppc/utils/js/Common",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/m/library"
],
    function (Controller, oSSCommon, oPPCCommon,Dialog, Button, MessageBox, coreLibrary, mobileLibrary) {
        "use strict";
        var oi18n = "",
            oPPCUtili18n = "";

        var oDevice = sap.ui.Device;
        var BusyDialog = new sap.m.BusyDialog();
        var ValueState = coreLibrary.ValueState;
        var DialogType = mobileLibrary.DialogType;
        var contextPath;

        return Controller.extend("pytabledetails.controller.CreatePage", {
            onInit: function () {
                this.onInitialHookUps();
            },
            onInitialHookUps: function () {
                this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
                oi18n = this._oComponent.getModel("i18n").getResourceBundle();
                oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRouteMatched(this.onRouteMatched, this);
            },

            setDefaultSettingsModel: function () {
                var json = {
                    messageLength: 0,
                    Detail: true,
                    Edit: false,
                    // saveBtn: false,
                    CreatePage: true,
                    ReviewPage: false,
                    reviewbtn: true,
                    savebtn: false,
                    errormsg:false
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
                oPPCCommon.removeAllMsgs();
                oPPCCommon.hideMessagePopover();
                this.validateData();
                if(oPPCCommon.doErrMessageExist()){
                this.getView().getModel("LocalViewSettingsDetail").setProperty("/CreatePage", false);
                this.getView().getModel("LocalViewSettingsDetail").setProperty("/ReviewPage", true);
                this.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewbtn", false);
                this.getView().getModel("LocalViewSettingsDetail").setProperty("/savebtn", true);
                this.getView().getModel("LocalViewSettingsDetail").setProperty("/messageLength",sap.ui.getCore().getMessageManager().getMessageModel()
					.getData().length);
                }else{
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/messageLength",sap.ui.getCore().getMessageManager().getMessageModel()
					.getData().length);
                    this.getView().getModel("LocalViewSettingsDetail").setProperty("/errormsg", true);
                    //oPPCCommon.showMessagePopover(gCreateObjectDetail);
                    this.onshowerrorpopup();
                }
                
            },
            onshowerrorpopup:function(){
                oPPCCommon.showMessagePopover(gCreateObjectDetail);
            },
            validateData:function(){
                var oModel = this.getView().getModel("CreateModel").getData();
                // if(!oModel.CPGuid){
                //     gCreateObjectDetail.byId("idCPGuid").setValueState("Error");
                //     gCreateObjectDetail.byId("idCPGuid").setValueStateText(oi18n.getText("Error.cpguid"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.cpguid"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCPGuid").setValueState("None");
                //     gCreateObjectDetail.byId("idCPGuid").setValueStateText("");
                // }
                // if(!oModel.CPType){
                //     gCreateObjectDetail.byId("idCPType").setValueState("Error");
                //     gCreateObjectDetail.byId("idCPType").setValueStateText(oi18n.getText("Error.cptype"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.cptype"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCPType").setValueState("None");
                //     gCreateObjectDetail.byId("idCPType").setValueStateText("");
                // }
                // if(!oModel.CPName){
                //     gCreateObjectDetail.byId("idCPName").setValueState("Error");
                //     gCreateObjectDetail.byId("idCPName").setValueStateText(oi18n.getText("Error.cpname"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.cpname"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCPName").setValueState("None");
                //     gCreateObjectDetail.byId("idCPName").setValueStateText("");
                // }
                // if(!oModel.UtilDistrict){
                //     gCreateObjectDetail.byId("idUtilDistrict").setValueState("Error");
                //     gCreateObjectDetail.byId("idUtilDistrict").setValueStateText(oi18n.getText("Error.UtilDistrict"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.UtilDistrict"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idUtilDistrict").setValueState("None");
                //     gCreateObjectDetail.byId("idUtilDistrict").setValueStateText("");
                // }
                if(!oModel.IncorporationDate){
                    gCreateObjectDetail.byId("DP1").setValueState("Error");
                    gCreateObjectDetail.byId("DP1").setValueStateText(oi18n.getText("Error.IncorporationDate"));
                    oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.IncorporationDate"));
                } 
                else{
                    gCreateObjectDetail.byId("DP1").setValueState("None");
                    gCreateObjectDetail.byId("DP1").setValueStateText("");
                }
                // if(!oModel.LegalStatus){
                //     gCreateObjectDetail.byId("idLegalStatus").setValueState("Error");
                //     gCreateObjectDetail.byId("idLegalStatus").setValueStateText(oi18n.getText("Error.LegalStatus"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.LegalStatus"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idLegalStatus").setValueState("None");
                //     gCreateObjectDetail.byId("idLegalStatus").setValueStateText("");
                // }
                // if(!oModel.Address1){
                //     gCreateObjectDetail.byId("idAddress1").setValueState("Error");
                //     gCreateObjectDetail.byId("idAddress1").setValueStateText(oi18n.getText("Error.Address1"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address1"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idAddress1").setValueState("None");
                //     gCreateObjectDetail.byId("idAddress1").setValueStateText("");
                // }
                // if(!oModel.Address2){
                //     gCreateObjectDetail.byId("idAddress2").setValueState("Error");
                //     gCreateObjectDetail.byId("idAddress2").setValueStateText(oi18n.getText("Error.Address2"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address2"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idAddress2").setValueState("None");
                //     gCreateObjectDetail.byId("idAddress2").setValueStateText("");
                // }
                // if(!oModel.Address3){
                //     gCreateObjectDetail.byId("idAddress3").setValueState("Error");
                //     gCreateObjectDetail.byId("idAddress3").setValueStateText(oi18n.getText("Error.Address3"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address3"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idAddress3").setValueState("None");
                //     gCreateObjectDetail.byId("idAddress3").setValueStateText("");
                // }
                // if(!oModel.Address4){
                //     gCreateObjectDetail.byId("idAddress4").setValueState("Error");
                //     gCreateObjectDetail.byId("idAddress4").setValueStateText(oi18n.getText("Error.Address4"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Address4"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idAddress4").setValueState("None");
                //     gCreateObjectDetail.byId("idAddress4").setValueStateText("");
                // }
                // if(!oModel.District){
                //     gCreateObjectDetail.byId("idDistrict").setValueState("Error");
                //     gCreateObjectDetail.byId("idDistrict").setValueStateText(oi18n.getText("Error.District"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.District"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idDistrict").setValueState("None");
                //     gCreateObjectDetail.byId("idDistrict").setValueStateText("");
                // }
                // if(!oModel.City){
                //     gCreateObjectDetail.byId("idCity").setValueState("Error");
                //     gCreateObjectDetail.byId("idCity").setValueStateText(oi18n.getText("Error.City"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.City"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCity").setValueState("None");
                //     gCreateObjectDetail.byId("idCity").setValueStateText("");
                // }
                // if(!oModel.State){
                //     gCreateObjectDetail.byId("idState").setValueState("Error");
                //     gCreateObjectDetail.byId("idState").setValueStateText(oi18n.getText("Error.State"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.State"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idState").setValueState("None");
                //     gCreateObjectDetail.byId("idState").setValueStateText("");
                // }
                // if(!oModel.StateDesc){
                //     gCreateObjectDetail.byId("idStateDesc").setValueState("Error");
                //     gCreateObjectDetail.byId("idStateDesc").setValueStateText(oi18n.getText("Error.StateDesc"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.StateDesc"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idStateDesc").setValueState("None");
                //     gCreateObjectDetail.byId("idStateDesc").setValueStateText("");
                // }
                // if(!oModel.Country){
                //     gCreateObjectDetail.byId("idCountry").setValueState("Error");
                //     gCreateObjectDetail.byId("idCountry").setValueStateText(oi18n.getText("Error.Country"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Country"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCountry").setValueState("None");
                //     gCreateObjectDetail.byId("idCountry").setValueStateText("");
                // }
                // if(!oModel.CountryDesc){
                //     gCreateObjectDetail.byId("idCountryDesc").setValueState("Error");
                //     gCreateObjectDetail.byId("idCountryDesc").setValueStateText(oi18n.getText("Error.CountryDesc"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.CountryDesc"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCountryDesc").setValueState("None");
                //     gCreateObjectDetail.byId("idCountryDesc").setValueStateText("");
                // }
                // var pincodeRegex = /^[1-9][0-9]{5}$/
                // if(!pincodeRegex.test(oModel.Pincode)){
                //     gCreateObjectDetail.byId("idPincode").setValueState("Error");
                //     gCreateObjectDetail.byId("idPincode").setValueStateText(oi18n.getText("Error.Pincode"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Pincode"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idPincode").setValueState("None");
                //     gCreateObjectDetail.byId("idPincode").setValueStateText("");
                // }
                // if(!oModel.EntityType){
                //     gCreateObjectDetail.byId("idEntityType").setValueState("Error");
                //     gCreateObjectDetail.byId("idEntityType").setValueStateText(oi18n.getText("Error.EntityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.EntityType"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idEntityType").setValueState("None");
                //     gCreateObjectDetail.byId("idEntityType").setValueStateText("");
                // }
                // if(!oModel.EntityID){
                //     gCreateObjectDetail.byId("idEntityID").setValueState("Error");
                //     gCreateObjectDetail.byId("idEntityID").setValueStateText(oi18n.getText("Error.EntityID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.EntityID"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idEntityID").setValueState("None");
                //     gCreateObjectDetail.byId("idEntityID").setValueStateText("");
                // }
                // if(!oModel.ParentNo){
                //     gCreateObjectDetail.byId("idParentNo").setValueState("Error");
                //     gCreateObjectDetail.byId("idParentNo").setValueStateText(oi18n.getText("Error.ParentNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ParentNo"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idParentNo").setValueState("None");
                //     gCreateObjectDetail.byId("idParentNo").setValueStateText("");
                // }
                // if(!oModel.ParentTypeID){
                //     gCreateObjectDetail.byId("idParentTypeID").setValueState("Error");
                //     gCreateObjectDetail.byId("idParentTypeID").setValueStateText(oi18n.getText("Error.ParentTypeID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ParentTypeID"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idParentTypeID").setValueState("None");
                //     gCreateObjectDetail.byId("idParentTypeID").setValueStateText("");
                // }
                // if(!oModel.ParentName){
                //     gCreateObjectDetail.byId("idParentName").setValueState("Error");
                //     gCreateObjectDetail.byId("idParentName").setValueStateText(oi18n.getText("Error.ParentName"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ParentName"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idParentName").setValueState("None");
                //     gCreateObjectDetail.byId("idParentName").setValueStateText("");
                // }
                // if(!oModel.URCEntityType){
                //     gCreateObjectDetail.byId("idURCEntityType").setValueState("Error");
                //     gCreateObjectDetail.byId("idURCEntityType").setValueStateText(oi18n.getText("Error.URCEntityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCEntityType"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idURCEntityType").setValueState("None");
                //     gCreateObjectDetail.byId("idURCEntityType").setValueStateText("");
                // }
                // if(!oModel.URCActivityType){
                //     gCreateObjectDetail.byId("idURCActivityType").setValueState("Error");
                //     gCreateObjectDetail.byId("idURCActivityType").setValueStateText(oi18n.getText("Error.URCActivityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCActivityType"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idURCActivityType").setValueState("None");
                //     gCreateObjectDetail.byId("idURCActivityType").setValueStateText("");
                // }
                // if(!oModel.URCSectorCode){
                //     gCreateObjectDetail.byId("idURCSectorCode").setValueState("Error");
                //     gCreateObjectDetail.byId("idURCSectorCode").setValueStateText(oi18n.getText("Error.URCSectorCode"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCSectorCode"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idURCSectorCode").setValueState("None");
                //     gCreateObjectDetail.byId("idURCSectorCode").setValueStateText("");
                // }
                // if(!oModel.URCSubSectorCode){
                //     gCreateObjectDetail.byId("idURCSubSectorCode").setValueState("Error");
                //     gCreateObjectDetail.byId("idURCSubSectorCode").setValueStateText(oi18n.getText("Error.URCSubSectorCode"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCSubSectorCode"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idURCSubSectorCode").setValueState("None");
                //     gCreateObjectDetail.byId("idURCSubSectorCode").setValueStateText("");
                // }
                // if(!oModel.URCDocURL){
                //     gCreateObjectDetail.byId("idURCDocURL").setValueState("Error");
                //     gCreateObjectDetail.byId("idURCDocURL").setValueStateText(oi18n.getText("Error.URCDocURL"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCDocURL"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idURCDocURL").setValueState("None");
                //     gCreateObjectDetail.byId("idURCDocURL").setValueStateText("");
                // }
                // if(!oModel.ODAccountNo){
                //     gCreateObjectDetail.byId("idODAccountNo").setValueState("Error");
                //     gCreateObjectDetail.byId("idODAccountNo").setValueStateText(oi18n.getText("Error.ODAccountNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ODAccountNo"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idODAccountNo").setValueState("None");
                //     gCreateObjectDetail.byId("idODAccountNo").setValueStateText("");
                // }
                // if(!oModel.URCRegistrationDate){
                //     gCreateObjectDetail.byId("DP2").setValueState("Error");
                //     gCreateObjectDetail.byId("DP2").setValueStateText(oi18n.getText("Error.URCRegistrationDate"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.URCRegistrationDate"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("DP2").setValueState("None");
                //     gCreateObjectDetail.byId("DP2").setValueStateText("");
                // }
                // if(!oModel.Source){
                //     gCreateObjectDetail.byId("idSource").setValueState("Error");
                //     gCreateObjectDetail.byId("idSource").setValueStateText(oi18n.getText("Error.Source"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Source"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idSource").setValueState("None");
                //     gCreateObjectDetail.byId("idSource").setValueStateText("");
                // }
                // if(!oModel.SourceReferenceID){
                //     gCreateObjectDetail.byId("idSourceReferenceID").setValueState("Error");
                //     gCreateObjectDetail.byId("idSourceReferenceID").setValueStateText(oi18n.getText("Error.SourceReferenceID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.SourceReferenceID"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idSourceReferenceID").setValueState("None");
                //     gCreateObjectDetail.byId("idSourceReferenceID").setValueStateText("");
                // }
                // var phoneRegex = /^[1-9][0-9]{9}$/
                // if(!phoneRegex.test(oModel.Mobile1)){
                //     gCreateObjectDetail.byId("idMobile1").setValueState("Error");
                //     gCreateObjectDetail.byId("idMobile1").setValueStateText(oi18n.getText("Error.Mobile1"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Mobile1"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idMobile1").setValueState("None");
                //     gCreateObjectDetail.byId("idMobile1").setValueStateText("");
                // }
                // var phoneRegex2 = /^[1-9][0-9]{9}$/
                // if(!phoneRegex2.test(oModel.Mobile2)){
                //     gCreateObjectDetail.byId("idMobile2").setValueState("Error");
                //     gCreateObjectDetail.byId("idMobile2").setValueStateText(oi18n.getText("Error.Mobile2"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Mobile2"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idMobile2").setValueState("None");
                //     gCreateObjectDetail.byId("idMobile2").setValueStateText("");
                // }
                // if(!oModel.LandLine1){
                //     gCreateObjectDetail.byId("idLandLine1").setValueState("Error");
                //     gCreateObjectDetail.byId("idLandLine1").setValueStateText(oi18n.getText("Error.LandLine1"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.LandLine1"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idLandLine1").setValueState("None");
                //     gCreateObjectDetail.byId("idLandLine1").setValueStateText("");
                // }
                // var emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
                // if(!emailRegex.test(oModel.EmailID)){
                //     gCreateObjectDetail.byId("idEmailID").setValueState("Error");
                //     gCreateObjectDetail.byId("idEmailID").setValueStateText(oi18n.getText("Error.EmailID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.EmailID"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idEmailID").setValueState("None");
                //     gCreateObjectDetail.byId("idEmailID").setValueStateText("");
                // }
                
                // var panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/
                // if(!panRegex.test(oModel.PAN)){
                //     gCreateObjectDetail.byId("idPAN").setValueState("Error");
                //     gCreateObjectDetail.byId("idPAN").setValueStateText(oi18n.getText("Error.PAN"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.PAN"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idPAN").setValueState("None");
                //     gCreateObjectDetail.byId("idPAN").setValueStateText("");
                // }
                var gstRegex=/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[A-Z\d]{1}$/
                var getPan = gCreateObjectDetail.byId("idPAN").getValue();
                var getGST = oModel.GSTIN
                if(!oModel.GSTIN){
                    gCreateObjectDetail.byId("idGSTIN").setValueState("Error");
                    gCreateObjectDetail.byId("idGSTIN").setValueStateText(oi18n.getText("Error.GSTIN"));
                    oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.GSTIN"));
                }
                else if(!gstRegex.test(getGST)){
                    gCreateObjectDetail.byId("idGSTIN").setValueState("Error");
                    gCreateObjectDetail.byId("idGSTIN").setValueStateText(oi18n.getText("Error.GSTIN"));
                    oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.GSTIN"));
                }
                else if(getPan && getGST.substr(2,10)!=getPan){
                    gCreateObjectDetail.byId("idGSTIN").setValueState("Error");
                    gCreateObjectDetail.byId("idGSTIN").setValueStateText(oi18n.getText("Error.GSTIN"));
                    oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.GSTIN"));
                }
                else{
                    gCreateObjectDetail.byId("idGSTIN").setValueState("None");
                    gCreateObjectDetail.byId("idGSTIN").setValueStateText("");
                }
                // if(!oModel.StatusID){
                //     gCreateObjectDetail.byId("idStatusID").setValueState("Error");
                //     gCreateObjectDetail.byId("idStatusID").setValueStateText(oi18n.getText("Error.StatusID"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.StatusID"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idStatusID").setValueState("None");
                //     gCreateObjectDetail.byId("idStatusID").setValueStateText("");
                // }
                // if(!oModel.ApproverRemarks){
                //     gCreateObjectDetail.byId("idApproverRemarks").setValueState("Error");
                //     gCreateObjectDetail.byId("idApproverRemarks").setValueStateText(oi18n.getText("Error.ApproverRemarks"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ApproverRemarks"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idApproverRemarks").setValueState("None");
                //     gCreateObjectDetail.byId("idApproverRemarks").setValueStateText("");
                // }
                // if(!oModel.MSME){
                //     gCreateObjectDetail.byId("idMSME").setValueState("Error");
                //     gCreateObjectDetail.byId("idMSME").setValueStateText(oi18n.getText("Error.MSME"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.MSME"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idMSME").setValueState("None");
                //     gCreateObjectDetail.byId("idMSME").setValueStateText("");
                // }
                // if(!oModel.UdyamRegNo){
                //     gCreateObjectDetail.byId("idUdyamRegNo").setValueState("Error");
                //     gCreateObjectDetail.byId("idUdyamRegNo").setValueStateText(oi18n.getText("Error.UdyamRegNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.UdyamRegNo"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idUdyamRegNo").setValueState("None");
                //     gCreateObjectDetail.byId("idUdyamRegNo").setValueStateText("");
                // }
                // if(!oModel.HgdFrgnCurrExposure){
                //     gCreateObjectDetail.byId("idHgdFrgnCurrExposure").setValueState("Error");
                //     gCreateObjectDetail.byId("idHgdFrgnCurrExposure").setValueStateText(oi18n.getText("Error.HgdFrgnCurrExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.HgdFrgnCurrExposure"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idHgdFrgnCurrExposure").setValueState("None");
                //     gCreateObjectDetail.byId("idHgdFrgnCurrExposure").setValueStateText("");
                // }
                // if(!oModel.UnHgdFrgnCurrExposure){
                //     gCreateObjectDetail.byId("idUnHgdFrgnCurrExposure").setValueState("Error");
                //     gCreateObjectDetail.byId("idUnHgdFrgnCurrExposure").setValueStateText(oi18n.getText("Error.UnHgdFrgnCurrExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.UnHgdFrgnCurrExposure"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idUnHgdFrgnCurrExposure").setValueState("None");
                //     gCreateObjectDetail.byId("idUnHgdFrgnCurrExposure").setValueStateText("");
                // }
                // if(!oModel.TotalFrgnCurrExposure){
                //     gCreateObjectDetail.byId("idTotalFrgnCurrExposure").setValueState("Error");
                //     gCreateObjectDetail.byId("idTotalFrgnCurrExposure").setValueStateText(oi18n.getText("Error.TotalFrgnCurrExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.TotalFrgnCurrExposure"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idTotalFrgnCurrExposure").setValueState("None");
                //     gCreateObjectDetail.byId("idTotalFrgnCurrExposure").setValueStateText("");
                // }
                // if(!oModel.FundBasedExposure){
                //     gCreateObjectDetail.byId("idFundBasedExposure").setValueState("Error");
                //     gCreateObjectDetail.byId("idFundBasedExposure").setValueStateText(oi18n.getText("Error.FundBasedExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.FundBasedExposure"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idFundBasedExposure").setValueState("None");
                //     gCreateObjectDetail.byId("idFundBasedExposure").setValueStateText("");
                // }
                // if(!oModel.NonFundBasedExposure){
                //     gCreateObjectDetail.byId("idNonFundBasedExposure").setValueState("Error");
                //     gCreateObjectDetail.byId("idNonFundBasedExposure").setValueStateText(oi18n.getText("Error.NonFundBasedExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.NonFundBasedExposure"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idNonFundBasedExposure").setValueState("None");
                //     gCreateObjectDetail.byId("idNonFundBasedExposure").setValueStateText("");
                // }
                // if(!oModel.TotalBankingExposure){
                //     gCreateObjectDetail.byId("idTotalBankingExposure").setValueState("Error");
                //     gCreateObjectDetail.byId("idTotalBankingExposure").setValueStateText(oi18n.getText("Error.TotalBankingExposure"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.TotalBankingExposure"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idTotalBankingExposure").setValueState("None");
                //     gCreateObjectDetail.byId("idTotalBankingExposure").setValueStateText("");
                // }
                // if(!oModel.CorporateIdentificationNo){
                //     gCreateObjectDetail.byId("idCorporateIdentificationNo").setValueState("Error");
                //     gCreateObjectDetail.byId("idCorporateIdentificationNo").setValueStateText(oi18n.getText("Error.CorporateIdentificationNo"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.CorporateIdentificationNo"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idCorporateIdentificationNo").setValueState("None");
                //     gCreateObjectDetail.byId("idCorporateIdentificationNo").setValueStateText("");
                // }
                // if(!oModel.FacilityType){
                //     gCreateObjectDetail.byId("idFacilityType").setValueState("Error");
                //     gCreateObjectDetail.byId("idFacilityType").setValueStateText(oi18n.getText("Error.FacilityType"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.FacilityType"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idFacilityType").setValueState("None");
                //     gCreateObjectDetail.byId("idFacilityType").setValueStateText("");
                // }
                // if(!oModel.BPRejectionRemarks){
                //     gCreateObjectDetail.byId("idBPRejectionRemarks").setValueState("Error");
                //     gCreateObjectDetail.byId("idBPRejectionRemarks").setValueStateText(oi18n.getText("Error.BPRejectionRemarks"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.BPRejectionRemarks"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idBPRejectionRemarks").setValueState("None");
                //     gCreateObjectDetail.byId("idBPRejectionRemarks").setValueStateText("");
                // }
                // if(!oModel.LEINumber){
                //     gCreateObjectDetail.byId("idLEINumber").setValueState("Error");
                //     gCreateObjectDetail.byId("idLEINumber").setValueStateText(oi18n.getText("Error.LEINumber"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.LEINumber"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idLEINumber").setValueState("None");
                //     gCreateObjectDetail.byId("idLEINumber").setValueStateText("");
                // }
                // if(!oModel.ERP_CPName){
                //     gCreateObjectDetail.byId("idERP_CPName").setValueState("Error");
                //     gCreateObjectDetail.byId("idERP_CPName").setValueStateText(oi18n.getText("Error.ERP_CPName"));
                //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ERP_CPName"));
                // } 
                // else{
                //     gCreateObjectDetail.byId("idERP_CPName").setValueState("None");
                //     gCreateObjectDetail.byId("idERP_CPName").setValueStateText("");
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

            onSavePopup:function(){
                if(!this.oFixedSizeDialog){
                    this.oFixedSizeDialog = new Dialog({
                        title:"Confirmation",
                        content:new sap.m.Text({
                            text:"Do you want to save?",
                        }),
                        beginButton:new Button({
                            text:"OK",
                            press:function(){
                                this.onSave();
                                this.oFixedSizeDialog.close();
     
                            }.bind(this)
                        }),
                        endButton:new Button({
                            text:"Cancel",
                            press:function(){
                                this.oFixedSizeDialog.close();
                            }.bind(this)
                        }),
                     
                    });
                    this.getView().addDependent(this.oFixedSizeDialog);
                }
                this.oFixedSizeDialog.open();
     
            },

            onSave:function(){
                var that = this;
                var oData = this.getView().getModel("CreateModel").getData();
                var oModel = this.getView().getModel("PYGWHANA");
                var ID = oPPCCommon.generateUUID();
                oData.ID = ID;
                delete oData.aggrid;
                delete oData.IncorporationDate;
                delete oData.URCRegistrationDate;
                oModel.create("/BPHeader",oData,{
                    success: function(data,status){
                        if(status.statusCode === "201"){
                            var oSuccessMessageDialog = new Dialog({
                                type:DialogType.Message,
                                title:"Success",
                                state:ValueState.Success,
                                content:new sap.m.Text({
                                    text:"Data added Successfully"
                                }),
                                beginButton:new Button({
                                    text:"OK",
                                    press:function(){
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/CreatePage",true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewbtn",true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewPage",false);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/savebtn",false);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/clearBtn",true);
                                        that.getView().getModel("LocalViewSettingsDetail").setProperty("/messageLength",sap.ui.getCore().getMessageManager().getMessageModel()
                                        .getData().length);
                                        oSuccessMessageDialog.close();
                                    }.bind(that)
                                })
                            });
                            oSuccessMessageDialog.open();
                        }
                        else {
 
                        }   
                    },
                    error:function(data,status){
                        BusyDialog.close();
                    }
                })

            },

            onBack: function () {
                // if (this.getView().getModel("LocalViewSettingsDetail").getProperty("/savebtn")) {
                //     this.getView().getModel("LocalViewSettingsDetail").setProperty("/CreatePage", true);
                //     this.getView().getModel("LocalViewSettingsDetail").setProperty("/ReviewPage", false);
                //     this.getView().getModel("LocalViewSettingsDetail").setProperty("/reviewbtn", true);
                //     this.getView().getModel("LocalViewSettingsDetail").setProperty("/savebtn", false);
                // }else{
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("ListPage", {}, true);
                //}

            },


                // const oHistory = sap.ui.core.routing.History.getInstance();
                // const sPreviousHash = oHistory.getPreviousHash();

                // if (sPreviousHash !== undefined) {
                //     window.history.go(-1);
                // } else {
                //     const oRouter = this.getOwnerComponent().getRouter();
                //     oRouter.navTo("ListPage", {}, true);
                // }

            
        })

    }
)