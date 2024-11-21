sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/UserMapping"
], function(Controller, oPPCCommon, oSSCommon, oSSUserMapping) {
	"use strict";
	"use strict";
	var oi18n = "",
		oUtilsI18n = "";
	var busyDialog = new sap.m.BusyDialog();
	return Controller.extend("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate", {
		onInit: function() {

			this.onInitHookup();
			this.setDefaultSettings();
		},
		onInitHookup: function() {
			busyDialog.open();

			var that = this;

			this._oView = this.getView();

			this.clearTokens(["StateID", "CountryID", "CityID", "ZoneID", "DistrictID"]);
			var oViewSettingModel = new sap.ui.model.json.JSONModel({});
			this.getView().setModel(oViewSettingModel, "SalesPersons");
			this.getView().getModel("SalesPersons").setProperty("/", {});
			oPPCCommon.initMsgMangerObjects();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this.getView().setBusy(true);
			this.setValueHelpProperty();
			var oDataModel = this._oComponent.getModel("PUGW");
			oSSCommon.setODataModel(oDataModel);
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);

			oViewSettingModel = new sap.ui.model.json.JSONModel({
				CPTypeDesc: oi18n.getText("SalesPersonCreate.ObjectHeader.title"),
				CPNo: "",
				CPName: ""
			});
			this.getView().setModel(oViewSettingModel, "SalesPersons");

		},
		onRouteMatched: function(oEvent) {
			var that = this;
			var selectedCustomer = "";
			oSSCommon.getCustomerInputType(function(customerInputType) {
				that.sCustomerInputType = customerInputType;
				that.getCustomers(selectedCustomer);
			});
		},
		getCustomers: function(customer) {
			/**
			 * set partner dropdown using utils method getPartners
			 * Paremeters: 1)oDateModel 2)Partner Type 3)User Type 4)busyDialog 5)view 6)callback function
			 */
			var that = this;

			if (this.sCustomerInputType !== "VH") {
				var oCustomerModel = this._oComponent.getModel("SFGW_MST");
				oSSUserMapping.getCustomers(oCustomerModel, "000002", "2", busyDialog, gSalesPersonHeaderCreateView, function(customerNo) {
					if (that.sCustomerInputType === "DD") {
						that.onSelectCustomer();
						that.setGenderDD();
						that.setChannelPartnerTypeDD();
						that.SPCategoryDD();
						that.DesignationDD();
						that.setDefaultValues();
						that.setCustomerInputVisibility();
						/*busyDialog.close();*/
					}
					//that.setDropdowns(customer);
				}, "create");
			} else {
				that.setGenderDD();
				that.setChannelPartnerTypeDD();
				that.SPCategoryDD();
				that.DesignationDD();
				that.setCustomerInputVisibility();
			}
		},
		setGenderDD: function() {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"GNDR"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oStatusFilter, "Types", "TypesName", busyDialog, this.getView(),
				"genderDD",
				"None",
				function() {

				});
		},
		setChannelPartnerTypeDD: function() {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"CPTYPE"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oStatusFilter, "Types", "TypesName", busyDialog, this.getView(),
				"CPTypeDD",
				"None",
				function() {

				});
		},
		SPCategoryDD: function() {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"SPCAT"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oStatusFilter, "Types", "TypesName", busyDialog, this.getView(),
				"SPCategoryDD",
				"None",
				function() {

				});
		},
		DesignationDD: function() {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGW");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"SPDESG"
			], false, false, false);
			oPPCCommon.getDropdown(oModelData, "ConfigTypesetTypes", oStatusFilter, "Types", "TypesName", busyDialog, this.getView(),
				"SPdesgDD",
				"None",
				function() {
					busyDialog.close();
					//	that.getView().setBusy(true);

				});

		},
		setDefaultValues: function() {
			var view = gSalesPersonHeaderCreateView;
			var that = this;

			var oValueHelpModel = this._oComponent.getModel("PCGW");

			var filterArray = new Array();
			filterArray = oPPCCommon.setODataModelReadFilter("", "", filterArray, "LoginID", "", [oSSCommon.getCurrentLoggedUser({
				sServiceName: "ValueHelps",
				sRequestType: "read"
			})], false, false, false);
			filterArray = oPPCCommon.setODataModelReadFilter(view, "", filterArray, "ParentID", sap.ui
				.model.FilterOperator.EQ, ["000003"], true, false, false);
			filterArray = oPPCCommon.setODataModelReadFilter(view, "", filterArray, "ModelID", sap.ui
				.model.FilterOperator.EQ, ["SSGW_MST"], true, false, false);
			filterArray = oPPCCommon.setODataModelReadFilter(view, "", filterArray, "EntityType", sap
				.ui.model.FilterOperator.EQ, ["ChannelPartner"], false, false, false);

			filterArray = oPPCCommon.setODataModelReadFilter(view, "", filterArray, "PartnerNo", sap
				.ui.model.FilterOperator.EQ, [this.getSelectedCustomerCode(view)], false, false, false);
			oValueHelpModel.read("/ValueHelps", {
				filters: filterArray,
				success: function(oData) {
					if (oData.results.length > 0) {
						for (var data = 0; data < oData.results.length; data++) {
							if (oData.results[data].PropName === "Country") {
								that.addTokens(view, oData.results[data].ID, oData.results[data].Description, "CountryID");
								that.getView().getModel("SalesPersons").setProperty("/Currency", oData.results[data].DepPropDefID);
								view.byId("CountryID").setValueState("None");
							} else if (oData.results[data].PropName === "StateID") {
								that.addTokens(view, oData.results[data].ID, oData.results[data].Description, "StateID");
								view.byId("StateID").setValueState("None");

							}
						}
					}
				},
				error: function() {

				}
			});

		},
		onSelectCustomer: function() {
			var that = this;
			if (that.getSelectedCustomerCode(gSalesPersonHeaderCreateView) !== "") {
				//that.getView().getModel("SalesPersons").setProperty("/CPGUID", that.getSelectedCustomerCode(gSalesPersonHeaderCreateView));
				that.getView().getModel("SalesPersons").setProperty("/CPName", that.getCustomerName(gSalesPersonHeaderCreateView));
				that.getView().getModel("SalesPersons").setProperty("/CPNo", that.getSelectedCustomerCode(gSalesPersonHeaderCreateView));
			}
		},
		getSelectedCustomerCode: function(gSalesPersonHeaderCreateView) {
			var CustomerCode = "";
			if (this.sCustomerInputType === "DD") {
				CustomerCode = gSalesPersonHeaderCreateView.byId("customer").getSelectedKey();

			} else if (this.sCustomerInputType === "VH") {
				CustomerCode = oPPCCommon.getKeysFromTokens(gSalesPersonHeaderCreateView, "inputCustomerF4");
			}

			return CustomerCode;
		},
		getCustomerName: function(gSalesPersonHeaderCreateView) {
			/** On selection change update the tooltip for the Customer dropdown */

			if (gSalesPersonHeaderCreateView.byId("customer").getSelectedItem().getText().split("-").length > 1) {
				return gSalesPersonHeaderCreateView.byId("customer").getSelectedItem().getText().split("-")[1].trim();
			} else {
				return gSalesPersonHeaderCreateView.byId("customer").getSelectedItem().getText().split("-")[0].trim();
			}

		},
		addTokens: function(view, key, desc, controlID) {
			//Token for State
			view.byId(controlID).removeAllTokens();
			if (key !== "") {
				var oToken = new sap.m.Token({
					key: key,
					text: desc + " (" + key + ")"
				});
				view.byId(controlID).addToken(oToken);
			}
		},
		clearAllErrors: function() {
			this.clearValueState(["Address1", "Address2", "Address3", "Address4", "CityID", "PostalCode", "StateID", "CountryID", "MobileNo",
				"AltMobileNo",
				"DistrictID", "CityID", "EmailID",
				"FirstName", "LastName", "ZoneID"
			]);

			var oData = sap.ui.getCore().getMessageManager().getMessageModel().getData();
			for (var i = 0; i < oData.length; i++) {
				var msgObj = oData[i];
				if (msgObj.id.indexOf("/UI/") > -1) {
					oPPCCommon.removeMsgsInMsgMgrById(msgObj.id);
				}
			}
		},
		clearValueState: function(aFieldId) {
			for (var i = 0; i < aFieldId.length; i++) {
				gSalesPersonHeaderCreateView.byId(aFieldId[i]).setValueState("None");
				gSalesPersonHeaderCreateView.byId(aFieldId[i]).setValueStateText("");
			}
		},
		clearTokens: function(aFieldId) {

			for (var i = 0; i < aFieldId.length; i++) {
				gSalesPersonHeaderCreateView.byId(aFieldId[i]).removeAllTokens();

			}
		},
		setDefaultSettings: function() {
			/**
			 * All view related local settings should be mapped in a Model and is called LocalViewSetting
			 */

			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				VendorColumnVisibleInF4: true,
				CustomerDD: false,
				CustomerVH: false,
				CreateVisibility: true,
				ReviewVisibility: false,
				CancelVisibility: true,
				messageLength: 0,
				DateFormat: oSSCommon.getDateFormat()

			};
			oViewSettingModel.setData(this.viewSettingData);
			this.getView().setModel(oViewSettingModel, "LocalViewSetting");

		},
		setValueHelpProperty: function() {
			this.countryTokenInput = this.getView().byId("CountryID");
			this.aCountryKeys = ["ID", "Description"];
			this.cityTokenInput = this.getView().byId("CityID");
			this.aCityKeys = ["ID", "Description"];
			this.stateTokenInput = this.getView().byId("StateID");
			this.aStateKeys = ["ID", "Description"];
			this.zoneTokenInput = this.getView().byId("DistrictID");
			this.aZoneKeys = ["ID", "Description"];
			this.SPTokenInput = this.getView().byId("ManagerSPNo");
			this.aSPKeys = ["SPGUID", "SPNo"];
		},
		setCustomerInputVisibility: function() {
			if (this.sCustomerInputType === "DD") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerDD", true);
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerVH", false);
			} else if (this.sCustomerInputType === "VH") {
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerDD", false);
				this.getView().getModel("LocalViewSetting").setProperty("/CustomerVH", true);
			}
			this.getView().setBusy(false);
		},
		addErrorMessages: function(view, controlID, msg) {
			view.byId(controlID).setValueState("Error");
			view.byId(controlID).setValueStateText(msg);
			oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/" + controlID);
		},
		onReview: function() {
			var view = gSalesPersonHeaderCreateView;
			var that = this;
			oPPCCommon.removeAllMsgs();
			this.validateForm(view);
			if (oPPCCommon.doErrMessageExist()) {
				var SalesPersonModel = this.getView().getModel("SalesPersons");
				SalesPersonModel.setProperty("/Gender", this.getDDKey("Gender", view));
				SalesPersonModel.setProperty("/CPTypeID", this.getDDKey("CPTypeID", view));
				SalesPersonModel.setProperty("/CPTypeID", this.getDDKey("CPTypeID", view));
				SalesPersonModel.setProperty("/CPTypeDesc", this.getDDDescrption("CPTypeID", view));
				SalesPersonModel.setProperty("/SPCategoryID", this.getDDKey("SPCategoryID", view));
				SalesPersonModel.setProperty("/SPCategoryDesc", this.getDDDescrption("SPCategoryID", view));
				SalesPersonModel.setProperty("/DesignationID", this.getDDKey("DesignationID", view));
				SalesPersonModel.setProperty("/DesignationDesc", this.getDDDescrption("DesignationID", view));
				SalesPersonModel.setProperty("/ManagerSPFirstName", this.getTokenDesc("ManagerSPNo", view));
				SalesPersonModel.setProperty("/DistrictID", this.getTokenKey("DistrictID", view));

				var appntDate = oPPCCommon.addHoursAndMinutesToDate({
					dDate: SalesPersonModel.getProperty("/DOB")
				});
				var dateOfBirth = oPPCCommon.addHoursAndMinutesToDate({
					dDate: SalesPersonModel.getProperty("/AppointmentDate")
				});

				SalesPersonModel.setProperty("/DOB", dateOfBirth);
				SalesPersonModel.setProperty("/AppointmentDate", appntDate);
				if (this.getTokenKey("ManagerSPNo", view) !== "" && this.getTokenKey("ManagerSPNo", view) !== undefined) {
					SalesPersonModel.setProperty("/ManagerSPGUID", this.getTokenKey("ManagerSPNo", view));
					var SPNo = view.byId("ManagerSPNo").getTokens()[0].getProperty("text").split("(")[1].split(")")[0];
					SalesPersonModel.setProperty("/ManagerSPNo", SPNo);
				} else {
					SalesPersonModel.setProperty("/ManagerSPNo", "");
				}
				var cpNodd = view.byId("customer").getSelectedKey();

				if (cpNodd !== "") {
					SalesPersonModel.setProperty("/CPGUID", this.getDDKey("customer", view));
					SalesPersonModel.setProperty("/CPName", this.getDDDescrption("customer", view));
				} else {
					SalesPersonModel.setProperty("/CPGUID", this.getTokenKey("inputCustomerF4", view));
					SalesPersonModel.setProperty("/CPName", this.getTokenDesc("inputCustomerF4", view));
				}
				SalesPersonModel.setProperty("/DistrictDesc", this.getTokenDesc("DistrictID", view));
				SalesPersonModel.setProperty("/CityID", this.getTokenKey("CityID", view));
				SalesPersonModel.setProperty("/CityDesc", this.getTokenDesc("CityID", view));
				SalesPersonModel.setProperty("/StateID", this.getTokenKey("StateID", view));
				SalesPersonModel.setProperty("/StateDesc", this.getTokenDesc("StateID", view));
				SalesPersonModel.setProperty("/CountryID", this.getTokenKey("CountryID", view));
				SalesPersonModel.setProperty("/CountryDesc", this.getTokenDesc("CountryID", view));
				SalesPersonModel.setProperty("/ZoneID", this.getTokenKey("ZoneID", view));
				SalesPersonModel.setProperty("/ZoneDesc", this.getTokenDesc("ZoneID", view));
				SalesPersonModel.setProperty("/TestRun", "X");
				var spGuid = oPPCCommon.generateUUID();
				SalesPersonModel.setProperty("/SPGUID", spGuid);
				this.create(function(msgFrom) {
					if (msgFrom === "success") {
						SalesPersonModel.setProperty("/Gender", that.getDDDescrption("Gender", view));
						that.getView().getModel("LocalViewSetting").setProperty("/ReviewVisibility", true);
						that.getView().getModel("LocalViewSetting").setProperty("/CreateVisibility", false);
						that.getView().getModel("LocalViewSetting").setProperty("/CancelVisibility", false);
					} else if (msgFrom === "error") {
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						// oPPCCommon.removeServerMsgsInMsgMgrByTarget(target);
						that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
							.getData()
							.length);
						if (that.getView().getModel("LocalViewSetting").getProperty("/messageLength") > 0) {
							oPPCCommon.showMessagePopover(gSalesPersonHeaderCreateView);
						}

					}

				});

			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(view);
			}

		},

		create: function(callBack) {

			//	Method to call update function

			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gSalesPersonHeaderCreateView);
			var that = this;
			busyDialog.open();

			/*	var oModelUpdate = new sap.ui.model.odata.v2.ODataModel(this.getView().getModel("PSGW_SHP").sServiceUrl, {
				json: false,
				defaultUpdateMethod: "PUT"
			});*/
			var oModelCreate = this._oComponent.getModel("SSGW_MST");
			oModelCreate.setUseBatch(true);
			this.getView().getModel("SalesPersons").setProperty("/LoginID", this.getCurrentUsers("SalesPersons", "create"));
			var SalesPersonData = this.getView().getModel("SalesPersons").getProperty("/");
			oModelCreate.create('/SalesPersons', SalesPersonData, {
				success: function() {

					busyDialog.close();
					callBack("success");
				},
				error: function() {
					callBack("error");
					busyDialog.close();
				}

			});
		},
		onCancel: function() {
			this.confirmDialog();
		},
		confirmDialog: function() {
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: oi18n.getText("SalesPersonCreate.Popup.confirmation")
				}),
				beginButton: new sap.m.Button({
					text: 'Yes',
					press: function() {
						var view = gSalesPersonHeaderCreateView;
						view.getModel("SalesPersons").setProperty("/", {});
						view.byId("Gender").setSelectedKey("");
						view.byId("SPCategoryID").setSelectedKey("");
						view.byId("CPTypeID").setSelectedKey("");
						view.byId("DesignationID").setSelectedKey("");
						view.byId("CountryID").removeAllTokens();
						view.byId("StateID").removeAllTokens();
						view.byId("DistrictID").removeAllTokens();
						view.byId("CityID").removeAllTokens();
						view.byId("ZoneID").removeAllTokens();
						view.byId("ManagerSPNo").removeAllTokens();
						this.setDefaultSettings();
						this.onInit();

						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		getCurrentUsers: function(sServiceName, sRequestType) {
			var sLoginID = oSSCommon.getCurrentLoggedUser({
				sServiceName: sServiceName,
				sRequestType: sRequestType
			});
			return sLoginID;
		},
		getDDKey: function(controlID, view) {
			var key = view.byId(controlID).getSelectedKey();

			return key;
		},
		getDDDescrption: function(controlID, view) {
			var desc = "";
			if (view.byId(controlID).getSelectedKey() !== "") {
				if (view.byId(controlID).getSelectedItem().getText().split("-").length > 1) {
					desc = view.byId(controlID).getSelectedItem().getText().split("-")[1].trim();
				} else {
					desc = view.byId(controlID).getSelectedItem().getText().split("-")[0].trim();
				}
			}
			return desc;
		},
		onBack: function() {
			oPPCCommon.removeAllMsgs();
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			this.getView().getModel("LocalViewSetting").setProperty("/ReviewVisibility", false);
			this.getView().getModel("LocalViewSetting").setProperty("/CreateVisibility", true);
			this.getView().getModel("LocalViewSetting").setProperty("/CancelVisibility", true);
		},
		getTokenKey: function(controlID, view) {
			var key = "";
			if (view.byId(controlID).getTokens() !== undefined) {
				if (view.byId(controlID).getTokens().length !== 0) {

					key = view.byId(controlID).getTokens()[0].getProperty("key");

				}
			}

			return key;
		},
		getTokenDesc: function(controlID, view) {
			var desc = "";
			if (view.byId(controlID).getTokens().length !== 0) {

				desc = view.byId(controlID).getTokens()[0].getProperty("text").split("(")[0];

			}
			return desc;
		},
		validateForm: function(view) {
			this.clearAllErrors();
			this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			var SalesPersonsModel = this.getView().getModel("SalesPersons");
			var msg = "";
			var control = "";
			if (this.sCustomerInputType === "DD") {
				if (view.byId("customer").getSelectedKey() === "" || view.byId("customer").getSelectedKey() === undefined) {
					msg = oi18n.getText("common.message.pleaseSelect", view.byId("fiCPNo").getText());
					oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/customer");
				}
			}
			var postalcodeValidate = parseInt(view.byId("PostalCode").getValue());
			if (postalcodeValidate <= 0) {
				var msg = oi18n.getText("common.message.pleaseEnterValid", view.byId("fePostalCode").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/PostalCode");
			}
			if (SalesPersonsModel.getProperty("/FirstName") === "" || SalesPersonsModel.getProperty("/FirstName") === undefined) {

				this.addErrorMessages(view, "FirstName", oi18n.getText("common.message.pleaseEnter", view.byId("feFirstName").getText()));
			}
			if (SalesPersonsModel.getProperty("/FirstName") !== "" && SalesPersonsModel.getProperty("/FirstName") !== undefined) {
				if (!isNaN(SalesPersonsModel.getProperty("/FirstName"))) {
					this.addErrorMessages(view, "FirstName", oi18n.getText("common.message.pleaseEnterValid", view.byId("feFirstName").getText()));
				}
			}
			if (SalesPersonsModel.getProperty("/LastName") !== "" && SalesPersonsModel.getProperty("/LastName") !== undefined) {
				if (!isNaN(SalesPersonsModel.getProperty("/LastName"))) {
					this.addErrorMessages(view, "LastName", oi18n.getText("common.message.pleaseEnterValid", view.byId("feLastName").getText()));
				}
			}
			if (view.byId("Gender").getSelectedKey() === "") {
				var msg = oi18n.getText("common.message.pleaseSelect", view.byId("fiGender").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/Gender");

			}
			if (view.byId("SPCategoryID").getSelectedKey() === "") {
				var msg = oi18n.getText("common.message.pleaseSelect", view.byId("fiSPCategoryID").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/SPCategoryID");
			}
			if (view.byId("CPTypeID").getSelectedKey() === "") {
				var msg = oi18n.getText("common.message.pleaseSelect", view.byId("fiCPTypeID").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/CPTypeID");
			}
			if (view.byId("DesignationID").getSelectedKey() === "") {
				var msg = oi18n.getText("common.message.pleaseSelect", view.byId("fiDesignationID").getText());
				oPPCCommon.addMsg_MsgMgr(msg, "error", "/UI/DesignationID");
			}

			if (view.byId("DistrictID").getTokens().length === 0) {
				this.addErrorMessages(view, "DistrictID", oi18n.getText("common.message.pleaseEnterValid", view.byId("feDistrictID").getText()));
			}

			if (view.byId("CityID").getTokens().length === 0) {

				this.addErrorMessages(view, "CityID", oi18n.getText("common.message.pleaseEnterValid", view.byId("feCityID").getText()));
			}

			if (SalesPersonsModel.getProperty("/PostalCode") === "" || SalesPersonsModel.getProperty("/PostalCode") === undefined) {

				this.addErrorMessages(view, "PostalCode", oi18n.getText("common.message.pleaseEnter", view.byId("fePostalCode").getText()));
			}
			if (view.byId("StateID").getTokens().length === 0) {

				this.addErrorMessages(view, "StateID", oi18n.getText("common.message.pleaseEnterValid", view.byId("feStateID").getText()));
			}
			if (view.byId("CountryID").getTokens().length === 0) {

				this.addErrorMessages(view, "CountryID", oi18n.getText("common.message.pleaseEnterValid", view.byId("feCountryID").getText()));
			}
			control = view.byId("MobileNo");
			var isValidMobile = oPPCCommon.isValidPhone(control.getValue());
			if (!isValidMobile || control.getValue() === "") {
				this.addErrorMessages(view, "MobileNo", oi18n.getText("common.message.pleaseEnterValid", view.byId("feMobileNo").getText()));
			}
			if (SalesPersonsModel.getProperty("/PostalCode") !== "" && SalesPersonsModel.getProperty("/PostalCode") !== undefined) {
				control = view.byId("PostalCode");
				var isCorrect = oPPCCommon.isValidPostalCode(control.getValue());
				if (!isCorrect) {
					this.addErrorMessages(view, "PostalCode", oi18n.getText("common.message.pleaseEnterValid", view.byId("fePostalCode").getText()));
				}
			}
			if (SalesPersonsModel.getProperty("/Address1") === "" || SalesPersonsModel.getProperty("/Address1") === undefined) {

				msg = oi18n.getText("common.message.pleaseEnter", view.byId("feAddress1").getText());
				this.addErrorMessages(view, "Address1", oi18n.getText("common.message.pleaseEnter", view.byId("feAddress1").getText()));
			}
			if (SalesPersonsModel.getProperty("/EmailID") !== "" && SalesPersonsModel.getProperty("/EmailID") !== undefined) {
				control = view.byId("EmailID");
				var isValidEmail = oPPCCommon.isValidEmail(control.getValue());
				if (!isValidEmail) {
					this.addErrorMessages(view, "EmailID", oi18n.getText("common.message.pleaseEnterValid", view.byId("feEmailID").getText()));
				}
			}
		},
		onSave: function() {
			var that = this;
			var view = gSalesPersonHeaderCreateView;
			this.getView().getModel("SalesPersons").setProperty("/TestRun", "");
			this.getView().getModel("SalesPersons").setProperty("/Gender", that.getDDKey("Gender", view));
			this.create1();
		},
		create1: function() {
			/*Method to call update function*/
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gSalesPersonHeaderCreateView);
			var that = this;
			gSalesPersonHeaderCreateView.setBusy(true);

			// var oModelUpdate=new sap.ui.model.odata.v2.ODataModel(this.getView().getModel("PSGW_SHP").sServiceUrl,{json:false,defaultUpdateMethod:"PUT"});
			var oModelCreate = this._oComponent.getModel("SSGW_MST");
			oModelCreate.setUseBatch(true);
			this.getView().getModel("SalesPersons").setProperty("/LoginID", this.getCurrentUsers("SalesPersons", "create"));
			var SalesPersonData = this.getView().getModel("SalesPersons").getProperty("/");
			oModelCreate.create('/SalesPersons', SalesPersonData, {
				success: function(oData) {
					var message = oPPCCommon.getMsgsFromMsgMgr();
					oPPCCommon.removeAllMsgs();
					oPPCCommon.hideMessagePopover(gSalesPersonHeaderCreateView);
					that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					that.onCreateSuccess(message, oData.SPGUID);
					gSalesPersonHeaderCreateView.setBusy(false);
				},
				error: function(response) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();
					that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel()
						.getData()
						.length);
					oPPCCommon.showMessagePopover(gSalesPersonHeaderCreateView);
					gSalesPersonHeaderCreateView.setBusy(false);
				}
			});
		},
		onCreateSuccess: function(message, SPGUID) {
			var that = this;
			var dialog = new sap.m.Dialog({
				title: 'Success',
				type: 'Message',
				state: 'Success',
				content: new sap.m.Text({
					text: message
				}),
				beginButton: new sap.m.Button({
					text: oi18n.getText("SalesPersonCreate.Dialog.Button.ViewSalesPerson"),
					press: function() {
						that.goToSPDetail(SPGUID);
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: oi18n.getText("SalesPersonCreate.Dialog.Button.CreateNewSalesPerson"),
					press: function() {
						//	that.clearAll();
						that.gotoEdit();
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},

		goToSPDetail: function(SPGUID) {
			var path = "SalesPersons(SPGUID=guid'" + SPGUID + "')";
			oPPCCommon.crossAppNavigation("ssslsprsncreate", "ssslsprsn", "Display", "", "", "/View/" + path);
		},
		gotoEdit: function() {
			var that = this;
			var view = gSalesPersonHeaderCreateView;
			that.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
				.length);
			var message = oPPCCommon.getMsgsFromMsgMgr();
			oPPCCommon.removeAllMsgs();
			oPPCCommon.hideMessagePopover(gSalesPersonHeaderCreateView);
			that.getView().getModel("LocalViewSetting").setProperty("/ReviewVisibility", false);
			that.getView().getModel("LocalViewSetting").setProperty("/CreateVisibility", true);
			view.byId("CPTypeID").setSelectedKey("");
			view.byId("SPCategoryID").setSelectedKey("");
			view.byId("Gender").setSelectedKey("");
			view.byId("DesignationID").setSelectedKey("");
			view.byId("ManagerSPNo").removeAllTokens();
			view.byId("CountryID").removeAllTokens();
			view.byId("StateID").removeAllTokens();
			that.onInitHookup();

		},
		showPopUp: function() {
			oPPCCommon.showMessagePopover(gSalesPersonHeaderCreateView);
		}

	});

});