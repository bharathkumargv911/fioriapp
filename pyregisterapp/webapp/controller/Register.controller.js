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

    return Controller.extend("pyregisterapp.controller.Register",{
        onInit:function(){
            this.onInitialHookUps();
            gRegisterController = this.getView();
        },
        onInitialHookUps:function(){
            fObjectPageLayoutID = this.getView().byId("ObjectPageLayoutID");
            this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
            oi18n = this._oComponent.getModel("i18n").getResourceBundle();
            oPPCUtili18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.onRouteMatched, this);
           
        },
        setDefaultSettings:function(){
            var json = {
                showCountofTable: "",
                messageLength: 0,
                visibleRowCount:0,
                aggrid : "",
                getDate: oPPCCommon.getCurrentDate(),
                proprietor: false,
                partner: false,
                create: true,
                review: false,
                reviewButton: false,
                clearButton: false,
                errormsg: false
            }

            var ojsonmodel = new sap.ui.model.json.JSONModel();
            ojsonmodel.setData(json);
            this.getView().setModel(ojsonmodel,"LocalViewSettings");
            getDefaultData = this.getView().getModel("LocalViewSettings");

            var json1 = {
                
            }
            var ojsonmodel = new sap.ui.model.json.JSONModel();
            ojsonmodel.setData(json1);
            this.getView().setModel(ojsonmodel, "CreateModel");

        },

        onRouteMatched:function(){
            this.setDefaultSettings();
            this.getDetailedData();
            this.onCreateFunction();
        },

        getDetailedData:function(){
            var that = this;
            BusyDialog.open();
            var oModel = that._oComponent.getModel("PYGWHANA");
            var oFilter = [];
            // oFilter.push(new sap.ui.model.Filter("ID","EQ","02d65e08-fd23-457d-a0ef-f3027bdbce62"));
            oModel.read("/UserCustomers",{
                filters: oFilter,
                success:function(response){
                    if(response){
                        response.results.unshift({ CustomerNo: "Select" })
                        var jsonModel = new sap.ui.model.json.JSONModel();
                        jsonModel.setData(response.results);
                        that._oComponent.setModel(jsonModel,"Customers");
                        BusyDialog.close();
                    }
                }
            })
        },

        onCreateFunction:function(){
            var that = this;
            var oModel = that._oComponent.getModel("PCGWHANA");
            var oFilter = [];
            oFilter.push(new sap.ui.model.Filter("Typeset","EQ","LDLGST"))
            oModel.read("/ConfigTypsetTypeValues",{
                filters: oFilter,
                success:function(response){
                    var jsonModel = new sap.ui.model.json.JSONModel();
                    jsonModel.setData(response.results);
                    that._oComponent.setModel(jsonModel,"Test")
                    getModelData = that._oComponent.getModel("Test").getData();
                }
            })
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDateFormat = DateFormat.getDateInstance({ pattern: "MMM d, yyyy" });
            var oDate = new Date(sDate);
            return oDateFormat.format(oDate);
            
        },

        onReview:function(){
            oPPCCommon.removeAllMsgs();
            oPPCCommon.hideMessagePopover();
            if(oPPCCommon.doErrMessageExist()){
            this.getView().getModel("LocalViewSettings").setProperty("/review", true);
            this.getView().getModel("LocalViewSettings").setProperty("/create", false);
            this.getView().getModel("LocalViewSettings").setProperty("/reviewButton",false);
            this.getView().getModel("LocalViewSettings").setProperty("/clearButton",false);
            this.getView().getModel("LocalViewSettings").setProperty("/messageLength",sap.ui.getCore().getMessageManager().getMessageModel()
					.getData().length);
            }
            else{
                this.getView().getModel("LocalViewSettings").setProperty("/messageLength",sap.ui.getCore().getMessageManager().getMessageModel()
                .getData().length);
                this.getView().getModel("LocalViewSettings").setProperty("/errormsg", true);
                //oPPCCommon.showMessagePopover(gCreateObjectDetail);
                this.onshowerrorpopup();
            }
        },

        onshowerrorpopup:function(){
            oPPCCommon.showMessagePopover(fObjectPageLayoutID);
        },

        onClear: function () {
            this.getView().getModel("CreateModel").setData({});
            this.clearValueState([
                "NameInputID",
                "NameInputID2"
            ]);
        },
        clearValueState: function (array) {
            array.forEach(function (getID) {
                gProprietorData.byId(getID).setValueState("None");
                gProprietorData.byId(getID).setValueStateText("");

            })
        },

        // validateData:function(){
        //     var oModel = gRegisterController.getModel("CreateModel").getData();
        //     if(oModel){
        //     var firstName = /^[a-zA-Z]{2,30}$/
        //     if(!oModel.fname){
        //         gProprietorData.byId("NameInputID").setValueState("Error");
        //         gProprietorData.byId("NameInputID").setValueStateText(oi18n.getText("Error.Fname"));
        //         oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Fname"));
        //     }
        //     else if(!firstName.test(oModel.fname)){
        //         gProprietorData.byId("NameInputID").setValueState("Error");
        //         gProprietorData.byId("NameInputID").setValueStateText(oi18n.getText("Error.Fname2"));
        //         oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Fname2"));
        //     }
        //     else{
        //         gProprietorData.byId("NameInputID").setValueState("None");
        //         gProprietorData.byId("NameInputID").setValueStateText("");
        //     }
            // var lastName = /^[a-zA-Z]{2,30}$/
            // if(!oModel.lname){
            //     gProprietorData.byId("NameInputID2").setValueState("Error");
            //     gProprietorData.byId("NameInputID2").setValueStateText(oi18n.getText("Error.Lname"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Lname"));
            // }
            // else if(!lastName.test(oModel.lname)){
            //     gProprietorData.byId("NameInputID2").setValueState("Error");
            //     gProprietorData.byId("NameInputID2").setValueStateText(oi18n.getText("Error.Lname2"));
            //     oPPCCommon.addMsg_MsgMgr(oi18n.getText("Error.Lname2"));
            // }
            // else
            // {
            //     gProprietorData.byId("NameInputID2").setValueState("None");
            //     gProprietorData.byId("NameInputID2").setValueStateText("");
            // }

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
        // }
        // },

        onBack:function(){
            this.getView().getModel("LocalViewSettings").setProperty("/review", false);
            this.getView().getModel("LocalViewSettings").setProperty("/create", true);
            this.getView().getModel("LocalViewSettings").setProperty("/reviewButton",true);
            this.getView().getModel("LocalViewSettings").setProperty("/clearButton",true);
        },
    })
}
)