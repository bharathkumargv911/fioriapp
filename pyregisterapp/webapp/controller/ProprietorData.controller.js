sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ppc/utils/js/Common",
    "sap/ui/core/format/DateFormat"
],
function(Controller,oSSCommon,oPPCCommon,DateFormat){
    "use strict";
    var oi18n="",
    oPPCUtili18n ="";

    var oDevice = sap.ui.Device;
    var BusyDialog = new sap.m.BusyDialog();

    return Controller.extend("pyregisterapp.controller.ProprietorData",{
        onInit:function(){
            gProprietorData = this.getView();
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
            this.getGenderValues();
        },

        getGenderValues:function(){
           var selectOption = {
            options : [{
                genderKey: "Default",
                genderText: "Select"
            }]
           }
           
            var gender = [
                {
                genderKey:"M",
                genderText:"Male"
            },
            {
                genderKey:"F",
                genderText:"Female"
            },
            {
                genderKey: "O",
                genderText: "Others"
            }
        ]
        gender.forEach(function(option){
            selectOption.options.push(option)
        })

        var jsonModel = new sap.ui.model.json.JSONModel();
        jsonModel.setData(selectOption.options);
        this.getView().setModel(jsonModel,"genderData")
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
            var oDate = new Date(sDate);
            return oDateFormat.format(oDate);
        },


        onFirstNameChange:function(){
            var oModel = gRegisterController.getModel("CreateModel").getData();
            var firstName = /^[a-zA-Z]{2,30}$/
            if(!oModel.fname){
                gProprietorData.byId("NameInputID").setValueState("Error");
                gProprietorData.byId("NameInputID").setValueStateText(oi18n.getText("Error.Fname"));
                oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Fname"));
            }
            else if(!firstName.test(oModel.fname)){
                gProprietorData.byId("NameInputID").setValueState("Error");
                gProprietorData.byId("NameInputID").setValueStateText(oi18n.getText("Error.Fname2"));
                oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Fname2"));
            }
            else{
                gProprietorData.byId("NameInputID").setValueState("None");
                gProprietorData.byId("NameInputID").setValueStateText("");
            }
            var lastName = /^[a-zA-Z]{2,30}$/
            if(!oModel.lname){
                gProprietorData.byId("NameInputID2").setValueState("Error");
                gProprietorData.byId("NameInputID2").setValueStateText(oi18n.getText("Error.Lname"));
                oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Lname"));
            }
            else if(!lastName.test(oModel.lname)){
                gProprietorData.byId("NameInputID2").setValueState("Error");
                gProprietorData.byId("NameInputID2").setValueStateText(oi18n.getText("Error.Lname2"));
                oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Lname2"));
            }
            else
            {
                gProprietorData.byId("NameInputID2").setValueState("None");
                gProprietorData.byId("NameInputID2").setValueStateText("");
            }

            // if(!oModel.DateofBirth){
            //     gProprietorData.byId("DP2").setValueState("Error");
            //     gProprietorData.byId("DP2").setValueStateText(oi18n.getText("Error.DateofBirth"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.DateofBirth"));
            // }

            // else if(oModel.DateofBirth){
            //     var dob = new Date(oModel.DateofBirth);
            //     var today = new Date();
            //     var age = today.getFullYear()-dob.getFullYear();
            //     var monthDifference = today.getMonth()-dob.getMonth();

            //     if(monthDifference<0||(monthDifference===0&&today.getDate()<dob.getDate())){
            //         age--;
            //     }
 
            //     if(age<18){
            //         gProprietorData.byId("DP2").setValueState("Error");
            //         gProprietorData.byId("DP2").setValueStateText(oi18n.getText("Error.AgeMinor"));
            //         oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.AgeMinor"));    
            //     }
            //     else{
            //         gProprietorData.byId("DP2").setValueState("None");
            //         gProprietorData.byId("DP2").setValueStateText("");
            //     }
            // }
            // else{
            //     gProprietorData.byId("DP2").setValueState("None");
            //     gProprietorData.byId("DP2").setValueStateText("");
            // }

            // if(!gProprietorData.byId("GenderDD").getSelectedItem().mProperties.text){
            //     gProprietorData.byId("GenderDD").setValueState("Error");
            //     gProprietorData.byId("GenderDD").setValueStateText(oi18n.getText("Error.Fname"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Fname"));
            // }
            // else{
            //     this.getView().getModel("CreateModel").setProperty("/Gender",
            //         gProprietorData.byId("GenderDD").getSelectedItem().mProperties.text);
            //         gProprietorData.byId("GenderDD").setValueState("None");
            //         gProprietorData.byId("GenderDD").setValueStateText("");
                
            // }

            // var MobileNumber = /^[1-9][0-9]{9}$/;
            // if(!oModel.Mobile){
            //     gProprietorData.byId("MobileInputID").setValueState("Error");
            //     gProprietorData.byId("MobileInputID").setValueStateText(oi18n.getText("Error.Mobile"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Mobile"));
            // }
            // else if(!MobileNumber.test(oModel.Mobile)){
            //     gProprietorData.byId("MobileInputID").setValueState("Error");
            //     gProprietorData.byId("MobileInputID").setValueStateText(oi18n.getText("Error.ValidMobile"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ValidMobile"));
            // }
            // else{
            //     gProprietorData.byId("MobileInputID").setValueState("None");
            //     gProprietorData.byId("MobileInputID").setValueStateText("");
            // }

            // var OriginalMobile = oModel.Mobile;
            // if(!oModel.Mobile2){
            //     gProprietorData.byId("MobileInputID2").setValueState("Error");
            //     gProprietorData.byId("MobileInputID2").setValueStateText(oi18n.getText("Error.Mobile2"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Mobile2"));
            // }
            // else if(!MobileNumber.test(oModel.Mobile2)&&oModel.Mobile2!= OriginalMobile){
            //     gProprietorData.byId("MobileInputID2").setValueState("Error");
            //     gProprietorData.byId("MobileInputID2").setValueStateText(oi18n.getText("Error.ValueMisMatchMobile"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ValueMisMatchMobile"));
            // }
            
            // else{
            //     gProprietorData.byId("MobileInputID2").setValueState("None");
            //     gProprietorData.byId("MobileInputID2").setValueStateText("");
            // }

            // var emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
            // if(!oModel.email){
            //     gProprietorData.byId("emailInputID3").setValueState("Error");
            //     gProprietorData.byId("emailInputID3").setValueStateText(oi18n.getText("Error.email"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.email"));
            // }
            // else if(!emailRegex.test(oModel.email)){
            //     gProprietorData.byId("emailInputID3").setValueState("Error");
            //     gProprietorData.byId("emailInputID3").setValueStateText(oi18n.getText("Error.email2"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.email2"));
            // }
            // else{
            //     gProprietorData.byId("emailInputID3").setValueState("None");
            //     gProprietorData.byId("emailInputID3").setValueStateText("");
            // }

            // var OriginalEmail = oModel.email;
            // if(!oModel.email2){
            //     gProprietorData.byId("emailInputID4").setValueState("Error");
            //     gProprietorData.byId("emailInputID4").setValueStateText(oi18n.getText("Error.retypeemail"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.retypeemail"));
            // }
            // else if(!emailRegex.test(oModel.email2)&&oModel.email2!=OriginalEmail){
            //     gProprietorData.byId("emailInputID4").setValueState("Error");
            //     gProprietorData.byId("emailInputID4").setValueStateText(oi18n.getText("Error.ValueMisMatchEmail"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.ValueMisMatchEmail"));
            // }
            // else{
            //     gProprietorData.byId("emailInputID4").setValueState("None");
            //     gProprietorData.byId("emailInputID4").setValueStateText("");
            // }

            // var postalRegex = /^[1-9][0-9]{5}$/;
            // if(!oModel.PostalCode){
            //     gProprietorData.byId("PostalInputID5").setValueState("Error");
            //     gProprietorData.byId("PostalInputID5").setValueStateText(oi18n.getText("Error.postalCode"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.postalCode"));
            // }
            // else if(!postalRegex.test(oModel.PostalCode)){
            //     gProprietorData.byId("PostalInputID5").setValueState("Error");
            //     gProprietorData.byId("PostalInputID5").setValueStateText(oi18n.getText("Error.postalCode2"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.postalCode2"));
            // }
            // else{
            //     gProprietorData.byId("PostalInputID5").setValueState("None");
            //     gProprietorData.byId("PostalInputID5").setValueStateText("");
            // }
        
        },
}
)}
)