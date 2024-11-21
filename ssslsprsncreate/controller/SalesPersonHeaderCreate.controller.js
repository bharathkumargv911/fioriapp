sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ss/slsprsn/create/util/Formatter",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/CommonValueHelp"
], function(Controller, Formatter, oPPCCommon, oSSCommon, oSSCommonValueHelp) {
	"use strict";
	var oi18n = "",
		oUtilsI18n = "";
	return Controller.extend("com.arteriatech.ss.slsprsn.create.controller.SalesPersonHeaderCreate", {

		onInit: function() {
			this.onInitHookup();
		},
		onInitHookup: function() {
			this._oView = this.getView();
			oPPCCommon.initMsgMangerObjects();
			/**
			 * Get reference of the Parent component i.e Component.js
			 */
			gSalesPersonHeaderCreateView = this._oView;
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this.setValueHelpProperty();
			//this.setDefaultValues();
			if(this.onInitialHookUpsExit)
			{
				this.onInitialHookUpsExit();
			}

		},

		setValueHelpProperty: function() {
			this.countryTokenInput = this.getView().byId("CountryID");
			this.aCountryKeys = ["ID", "Description"];
			this.cityTokenInput = this.getView().byId("CityID");
			this.aCityKeys = ["ID", "Description"];
			this.stateTokenInput = this.getView().byId("StateID");
			this.aStateKeys = ["ID", "Description"];
			this.zoneTokenInput = this.getView().byId("ZoneID");
			this.aZoneKeys = ["ID", "Description"];
			this.districtTokenInput = this.getView().byId("DistrictID");
			this.aDistricteKeys = ["ID", "Description"];
			this.SPTokenInput = this.getView().byId("ManagerSPNo");
			this.aSPKeys = ["SPGUID", "SPNo"];
			this.CustomerTokenInput = this.getView().byId("inputCustomerF4");
			this.aCustomerKeys = ["CustomerNo", "Name"];
		},
		SPF4: function() {
			var that = this;
			oSSCommonValueHelp.SalesPersonF4({
				oController: that,
				SPNoLabel: oi18n.getText("List.ValueHelp.SalesPerson.spno"),
				firstNameLabel: oi18n.getText("List.ValueHelp.SalesPerson.fname"),
				lastNameLabel: oi18n.getText("List.ValueHelp.SalesPerson.lname"),
				title: oi18n.getText("List.ValueHelp.SalesPerson.title"),
				oi18n: oi18n,
				bMultiSelect: false,
				oUtilsI18n: oUtilsI18n,
				controlID: "ManagerSPNo",
				tokenInput: this.SPTokenInput,
				bSPGUIDKey : true
			}
		);
		},

		onSelectCustomer: function() {
			var that = this;
			var view = this.getView();
			if (that.getSelectedCustomerCode(view) !== "") {
				that.getView().getModel("SalesPersons").setProperty("/CPNo", that.getSelectedCustomerCode(view));
				that.getView().getModel("SalesPersons").setProperty("/CPName", that.getCustomerName(view));
				that.setDefaultValues();
			} else {
				that.getView().getModel("SalesPersons").setProperty("/CPNo", "");
				that.getView().getModel("SalesPersons").setProperty("/CPName", "");
				that.getView().getModel("SalesPersons").setProperty("/Currency", "");
				view.byId("CountryID").removeAllTokens();
				view.byId("StateID").removeAllTokens();
			}
		},
		onCPTypeDDChanged: function() {
			var desc = this.getView().byId("CPTypeID").getSelectedItem().getText().split("-")[1].trim();
			this.getView().getModel("SalesPersons").setProperty("/CPTypeID", desc);
		},
		getSelectedCustomerCode: function(view) {
			var CustomerCode = "";
			if (this.getView().getModel("LocalViewSetting").getProperty("/CustomerDD")) {
				CustomerCode = view.byId("customer").getSelectedKey();

			} else if (this.getView().getModel("LocalViewSetting").getProperty("/CustomerVH")) {
				CustomerCode = oPPCCommon.getKeysFromTokens(view, "inputCustomerF4");
			}

			return CustomerCode;
		},
		getCustomerName: function(view) {
			/** On selection change update the tooltip for the Customer dropdown */
			if (this.getView().getModel("LocalViewSetting").getProperty("/CustomerDD")) {
				if (view.byId("customer").getSelectedItem().getText().split("-").length > 1) {
					return view.byId("customer").getSelectedItem().getText().split("-")[1].trim();
				} else {
					return view.byId("customer").getSelectedItem().getText().split("-")[0].trim();
				}
			} else {
				if (view.byId("inputCustomerF4").getTokens()[0].getProperty("text").lenght > 1) {
					return view.byId("inputCustomerF4").getTokens()[0].getProperty("text").split("(")[0];
				} else {
					return view.byId("inputCustomerF4").getTokens()[0].getProperty("text").split("(")[0];
				}
			}

		},
		setDefaultValues: function() {
			var view = this.getView();
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

			if (this.getSelectedCustomerCode(view) !== "") {
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
									that.geView().byId("CountryID").setValueState("None");
								} else if (oData.results[data].PropName === "StateID") {
									that.addTokens(view, oData.results[data].ID, oData.results[data].Description, "StateID");
									that.geView().byId("StateID").setValueState("None");

								}
							}
						}
					},
					error: function() {

					}
				});
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
		CustomerF4: function() {
			oSSCommonValueHelp.CustomerF4({
				oController: this,
				oi18n: oi18n,
				oUtilsI18n: oUtilsI18n,
				controlID: "inputCustomerF4",
				title: oi18n.getText("List.ValueHelp.Parent.header"),
				customerIDLabel: oi18n.getText("List.ValueHelp.Parent.parentNo"),
				customerNameLabel: oi18n.getText("List.ValueHelp.Parent.name")
			});
		},

		CountryF4: function() {
			var view = this.getView();
			oSSCommonValueHelp.setValueHelp({
				title: "Country",
				oController: this,
				controlID: "CountryID",
				idLabel: oi18n.getText("SalesPersonCreate.ValueHelp.country"),
				descriptionLabel: oi18n.getText("SalesPersonCreate.ValueHelp.countryName"),
				oUtilsI18n: oUtilsI18n,
				modelID: "SSGW_MST",
				entityType: "ChannelPartner",
				propName: "Country",
				tokenInput: this.countryTokenInput,
				aKeys: this.aCountryKeys,
				defaultVisible: false
			}, function(oControlEvent) {
				var currency = oControlEvent.getParameter("tokens")[0].getCustomData()[0].getValue().DepPropDefID;
				view.getModel("SalesPersons").setProperty("/Currency", currency);
			});
		},
		StateF4: function() {
			var view = this.getView();
			oPPCCommon.removeAllMsgs();
			sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").clearAllErrors();
			if (view.byId("CountryID").getTokens().length === 0) {

				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "CountryID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feCountryID").getText()));
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(view);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oSSCommonValueHelp.setValueHelp({
					title: "State",
					parentID: "000003" + oPPCCommon.getKeysFromTokens(this.getView(), "CountryID"),
					oController: this,
					controlID: "StateID",
					idLabel: oi18n.getText("SalesPersonCreate.ValueHelp.stateID"),
					descriptionLabel: oi18n.getText("SalesPersonCreate.ValueHelp.stateDesc"),
					oUtilsI18n: oUtilsI18n,
					modelID: "SSGW_MST",
					entityType: "ChannelPartner",
					propName: "StateID",
					tokenInput: this.stateTokenInput,
					aKeys: this.aStateKeys,
					defaultVisible: true,
					defaultLabel: "Country",
					defaultText: oPPCCommon.getTextFromTokens(this.getView(), "CountryID"),
					idVisible: false,
					groupTitle: "State",
					fireOnLoad: true

				});

			}

		},
		DitrictF4: function() {
			var view = this.getView();
			oPPCCommon.removeAllMsgs();
			sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").clearAllErrors();
			if (view.byId("CountryID").getTokens().length === 0) {

				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "CountryID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feCountryID").getText()));
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(view);
			}
			if (view.byId("StateID").getTokens().length === 0) {

				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "StateID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feStateID").getText()));
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(view);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oSSCommonValueHelp.setValueHelp({
					title: "District",
					parentID: oPPCCommon.getKeysFromTokens(this.getView(), "CountryID") + "/" + oPPCCommon.getKeysFromTokens(this.getView(),
						"StateID"),
					oController: this,
					controlID: "DistrictID",
					idLabel: oi18n.getText("SalesPersonCreate.ValueHelp.districtID"),
					descriptionLabel: oi18n.getText("SalesPersonCreate.ValueHelp.districtDesc"),
					oUtilsI18n: oUtilsI18n,
					modelID: "SSGW_MST",
					entityType: "ChannelPartner",
					propName: "DistrictID",
					tokenInput: this.districtTokenInput,
					aKeys: this.aDistricteKeys,
					defaultVisible: true,
					defaultLabel: "State",
					defaultText: oPPCCommon.getTextFromTokens(this.getView(), "StateID"),
					idVisible: false,
					groupTitle: "District",
					fireOnLoad: true

				});
			}

		},

		CityF4: function() {

			var view = this.getView();
			oPPCCommon.removeAllMsgs();
			var errorCount = 0;
			sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").clearAllErrors();
			if (view.byId("CountryID").getTokens().length === 0) {

				/*	sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(this.getView(), "CountryID");*/
				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "CountryID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feCountryID").getText()));
				errorCount++;
			}
			if (view.byId("StateID").getTokens().length === 0) {

				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "StateID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feStateID").getText()));
				errorCount++;
			}
			if (view.byId("DistrictID").getTokens().length === 0) {

				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "DistrictID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feDistrictID").getText()));
				errorCount++;
			}

			if (errorCount !== 0) {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(view);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oSSCommonValueHelp.setValueHelp({
					title: "City",
					oController: this,
					controlID: "CityID",
					parentID: oPPCCommon.getKeysFromTokens(this.getView(), "CountryID") + "/" + oPPCCommon.getKeysFromTokens(this.getView(),
							"StateID") +
						"/" + oPPCCommon.getKeysFromTokens(this.getView(), "DistrictID"),
					idLabel: oi18n.getText("SalesPersonCreate.ValueHelp.cityID"),
					descriptionLabel: oi18n.getText("SalesPersonCreate.ValueHelp.cityDesc"),
					oUtilsI18n: oUtilsI18n,
					modelID: "SSGW_MST",
					entityType: "ChannelPartner",
					propName: "CityID",
					tokenInput: this.cityTokenInput,
					aKeys: this.aCityKeys,
					defaultVisible: true,
					defaultLabel: "City",
					defaultText: oPPCCommon.getTextFromTokens(this.getView(), "DistrictID"),
					idVisible: false,
					groupTitle: "Town",
					fireOnLoad: true

				});
			}
		},
		ZoneF4: function() {

			var view = this.getView();
			oPPCCommon.removeAllMsgs();

			var errorCount = 0;
			if (view.byId("CountryID").getTokens().length === 0) {

				//sap.ui.controller("com.arteriatech.ss.slsprsn.controller.SPDetail").addErrorMessages(this.getView(), "CountryID");
				sap.ui.controller("com.arteriatech.ss.slsprsn.create.controller.SalesPersonCreate").addErrorMessages(view, "CountryID", oi18n.getText(
					"common.message.pleaseEnterValid", view.byId("feCountryID").getText()));
				errorCount++;
			}
			if (errorCount !== 0) {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oPPCCommon.showMessagePopover(view);
			} else {
				this.getView().getModel("LocalViewSetting").setProperty("/messageLength", sap.ui.getCore().getMessageManager().getMessageModel().getData()
					.length);
				oSSCommonValueHelp.setValueHelp({
					title: "Zone",
					oController: this,
					controlID: "ZoneID",
					parentID: oPPCCommon.getKeysFromTokens(this.getView(), "CountryID"),
					idLabel: oi18n.getText("SalesPersonCreate.ValueHelp.zoneID"),
					descriptionLabel: oi18n.getText("SalesPersonCreate.ValueHelp.zoneDesc"),
					oUtilsI18n: oUtilsI18n,
					modelID: "SSGW_MST",
					entityType: "ChannelPartner",
					propName: "ZoneID",
					tokenInput: this.zoneTokenInput,
					aKeys: this.aZoneKeys,
					defaultVisible: true,
					defaultLabel: "Country",
					defaultText: oPPCCommon.getTextFromTokens(this.getView(), "CountryID"),
					idVisible: false,
					groupTitle: "Zone",
					fireOnLoad: true
				});
			}
		},
		onSPNo : function(oEvent)
		{
			var that = this;
			var msg = "";
			if (oEvent.getSource().getValue() !== "") {

				var SSGW_MSTModel = this._oComponent.getModel("SSGW_MST");
				var customer = that.getView().byId("customer").getSelectedKey();
				var F4Filters = new Array();
				if (customer !== null && customer !== undefined && customer.trim() !== "") {
					var fCustomerNo = new sap.ui.model.Filter("CPGUID", sap.ui.model.FilterOperator.EQ, customer);
					F4Filters.push(fCustomerNo);
				}
				var fSPNo = new sap.ui.model.Filter("SPNo", sap.ui.model.FilterOperator.EQ, oEvent.getSource().getValue());
				F4Filters.push(fSPNo);
				SSGW_MSTModel.attachRequestSent(function() {
					that.getView().setBusy(true);
				});
				SSGW_MSTModel.attachRequestCompleted(function() {
					that.getView().setBusy(false);
				});
				SSGW_MSTModel.read("/SalesPersons", {
					filters: F4Filters,
					success: function(oData) {
						if (oData.results.length !== 0) {
							that.getView().byId("ManagerSPNo").setValue("");
							that.getView().byId("ManagerSPNo").removeAllTokens();
							that.getView().byId("ManagerSPNo").addToken(new sap.m.Token({
								key: oData.results[0].SPGUID,
								text: oData.results[0].FirstName + " (" + oData.results[0].SPNo + ")"
							}));
							that.getView().byId("ManagerSPNo").setValue("");
						} else {
							msg = oi18n.getText("List.Filterbar.MultiInput.spNoError", [that.getView().byId("feManagerSPNo").getLabel()]);
							that.getView().byId("ManagerSPNo").setValueState("Error");
							that.getView().byId("ManagerSPNo").setValueStateText(msg);
							oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
						}

					},
					error: function(error) {
						msg = oi18n.getText("List.Filterbar.MultiInput.spNoError", [that.getView().byId("feManagerSPNo").getLabel()]);
						that.getView().byId("ManagerSPNo").setValueState("Error");
						that.getView().byId("ManagerSPNo").setValueStateText(msg);
						oPPCCommon.dialogErrorMessage(error, "No Data Found");

					}
				});
			}
		
		}

	});

});