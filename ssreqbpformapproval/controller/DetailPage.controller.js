sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common"
], function (Controller, JSONModel, History, oPPCCommon, oSSCommon) {
	"use strict";
	var oi18n, oUtilsI18n;
	var oSSCommon = com.arteriatech.ss.utils.js.Common;
	var Device = sap.ui.Device;
	var oProductCommon, oCommonValueHelp;
	var oProductUserMapping;
	var contextPath = "";
	var busyDialog = new sap.m.BusyDialog();
	var gPath = "";
	var itemindex;
	return Controller.extend("com.arteriatech.ssreqbpformapproval.controller.DetailPage", {

		onInit: function () {
			gDetailPageView = this.getView();
			gObjectPageLayout = this.getView().byId("ObjectPageLayout");
			this.DynamicSideContent = this.getView().byId("ObjectPageLayout");
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(gDetailPageView));

			oProductCommon = com.arteriatech.ss.utils.js.Common;
			oCommonValueHelp = com.arteriatech.ss.utils.js.CommonValueHelp;

			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			oPPCCommon.initMsgMangerObjects();

			if (this.onInitHookUp_Exit) {
				this.onInitHookUp_Exit();
			}
		},
		onRouteMatched: function (oEvent) {
			var that = this;
			gList.setBusy(false);
			if (oEvent.getParameter("name") !== "DetailPage") {
				return;
			}
			this.setDefaultSettings();
			this.setDropDowns();
			var path = oEvent.getParameter("arguments").contextPath;
			itemindex = oPPCCommon.getPropertyValueFromContextPath(path, "index");
			itemindex = parseFloat(itemindex);
			contextPath = oEvent.getParameter("arguments").contextPath.split(",")[0];
			var oHistory = sap.ui.core.routing.History.getInstance();
			gPartnerGuid = contextPath.split("'")[1];
			this.getEntityAttributesLogs();
			if (oPPCCommon.getFLPTileAction().split("&")[0] === "ApprovalView") {
				// if (true) {
				// this.getTaskCollections();
				var workflowdata = gList.getModel("ListItems").getProperty("/");
				var appuserName = workflowdata[itemindex].CurrentApprover[0].apprUsrname;

				if (appuserName == 'SOM1' || appuserName == 'BDM1' || appuserName == 'NSM1') {
					this.getView().getModel("LocalViewSettingDt").setProperty("/ReqBtn", true);
				}
				// this.getView().getModel("LocalViewSettingDt").setProperty("/ReqBtn", true);

				this.getView().getModel("LocalViewSettingDt").setProperty("/ApprovalView", true);

				this.getView().getModel("LocalViewSettingDt").setProperty("/ListView", false);
			} else {
				this.getView().getModel("LocalViewSettingDt").setProperty("/ApprovalView", false);
				this.getView().getModel("LocalViewSettingDt").setProperty("/ReqCorrection", false);
				this.getView().getModel("LocalViewSettingDt").setProperty("/ListView", true);
			}
			if (oHistory.getDirection() !== "Backwards") {

				if (oEvent.getParameter("name") === "DetailPage") {
					setTimeout(function () {
						that.getCPDetails();
					}, 2000);
				} else if (oEvent.getParameter("name") === "ApproveDetailPage") {
					//examples
				} else if (oHistory.getDirection() === "Unknown" && oEvent.getParameter("name") === "changePage") {
					contextPath = oEvent.getParameter("arguments").contextPath;
					this._oRouter.navTo("DetailPage", {
						contextPath: contextPath
					}, true);
				} else if (oEvent.getParameter("name") === "changePage") {
					contextPath = oEvent.getParameter("arguments").contextPath;
					// this.gotoEdit();
				} else if (oEvent.getParameter("name") === "changePage") {

				}
			} else {
				if (oEvent.getParameter("name") === "DetailPage") {
					// this.getCPDetails();
				}
			}
		},
		getEntityAttributesLogs: function () {
			debugger;
			var that = this;
			var oModelData = this._oComponent.getModel("PCGWHANA");
			var oStatusFilter = new Array();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "EntityKey", sap.ui.model.FilterOperator
				.EQ, ["APPLOG"], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Attribute2", sap.ui.model.FilterOperator
				.EQ, [gPartnerGuid], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, ["AGGRBIL"], false, false, false);
			oModelData.read("/EntityAttributes", {
				filters: oStatusFilter,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var oAH = [];
					if (oData.length > 0) {
						gEntityGuid = oData[0].EntityAttrGUID;

						var arr = JSON.parse(oData[0].Value);
						for (var i = 0; i < arr.length; i++) {
							oAH.push(arr[i]);
						}
					}
					if (oAH.length === 1) {
						var ojsonmodel = new sap.ui.model.json.JSONModel(oAH);
					} else {
						var ojsonmodel = new sap.ui.model.json.JSONModel(oAH);
					}

					that.getView().setModel(ojsonmodel, "ApprovalHistoryModel");
					that.getView().oModels.LocalViewSettingDt.setProperty("/ApprovalHistoryCount", oAH.length)

				},
				error: function (error) {
					if (callBack) {
						callBack([]);
					}
				}
			});

		},
		setDefaultSettings: function () {
			/**
			 * All view related local settings should be mapped in a Model and is called LocalViewSetting
			 */
			var that = this;
			var oViewSettingModel = new sap.ui.model.json.JSONModel();
			this.viewSettingData = {
				editMode: true,
				reviewMode: true,
				SaveBtnvis: false,
				detailMode: false,
				editbtn: true,
				DateFormat: oSSCommon.getDateFormat(),
				messageLength: 0,
				VisitCount: 0,
				ToDay: new Date(),
				required: false,
				CPRefItemCount: 0,
				AddInfoCount: 0,
				visibleODAmount: false,
				visibleTDSGreater: false,
				visibleTDSLess: false,
				ReqCorrection: true,
				CPInfraQuestionCount: 0,
				FSSAIDocumentsCount: 0,
				AttachmentTableCount: 0,
				PANDocumentsCount: 0,
				TDSDocConut: 0,
				TanVisble: false,
				ITRDocumentsCount: 0,
				BankDocumentsCount: 0,
				ApprovalView: false,
				ListView: true,
				showStatus: true,
				PendingVisible: false,
				RemarkVisible: false,
				ReqBtn: false
			};
			oViewSettingModel.setData(this.viewSettingData);
			gDetailPageView.setModel(oViewSettingModel, "LocalViewSettingDt");
			this.getCurrentServerDate(this, function (Today) {
				that.getView().getModel("LocalViewSettingDt").setProperty("/TodayDate", Today);
			});
			// this.setTableTitle(0);
			if (this.setDefaultSettings_Exit) {
				this.setDefaultSettings_Exit();
			}
		},

		setOnBoardingStatusDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONSTAS"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								Key: oData[i].TypeValue,
								Text: oData[i].Typesname,
								Seperator: " - "
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "StatusDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		setOnBoardingApprovalStatusDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONAPST"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								Key: oData[i].TypeValue,
								Text: oData[i].Typesname,
								Seperator: " - "
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "ApprovalStatusDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},

		//Get CP Details
		getCPDetails: function () {
			var that = this;
			busyDialog.open();
			var view = that.getView();
			var oSSGW_MSTModel = that._oComponent.getModel("SSGWHANA");
			var guid = oPPCCommon.getPropertyValueFromContextPath(contextPath, "CP_GUID");
			guid = guid.split("guid")[1];
			// oSSGW_MSTModel.setHeaders({
			// 	"x-arteria-loginid": loginID
			// });
			oSSGW_MSTModel.read("/ChannelPartners(ChannelPartnerGUID='" + guid + "')", {
				urlParameters: {
					"$expand": "ChannelPartnerCPAddInfos,ChannelPartnerCPReferences,ChannelPartnerCPDMSDivisions"
				},
				success: function (oData) {

					that.setChannelPartnersModel(oData);
				},
				error: function (error) {
					busyDialog.close();
					that.handleoDataError(error);
				}
			});

			if (this.getCPDetails_Exit) {
				this.getCPDetails_Exit();
			}
		},
		setChannelPartnersModel: function (oData) {
			var that = this;
			//Header Model
			var OnBoardingType = that.getView().getModel("OnBoardingTypeDD").getData();
			var StatusModel = that.getView().getModel("DistributorStatusDD").getData();

			var FromStatus = that.getView().getModel("StatusDD").getData();
			var ApprovalStatusDD = that.getView().getModel("ApprovalStatusDD").getData();

			if (oData.IdentityNo1) {
				that.getView().getModel("LocalViewSettingDt").setProperty("/PendingVisible", true);
			}
			if (oData.URL1) {
				that.getView().getModel("LocalViewSettingDt").setProperty("/RemarkVisible", true);
			}
			debugger;
			if (oData.ChannelPartnerCPAddInfos.results[0].AccountType === "000001") {
				that.getView().getModel("LocalViewSettingDt").setProperty("/visibleODAmount", true);
			}

			for (var i = 0; i < FromStatus.length; i++) {
				if (FromStatus[i].Key == oData.Status) {
					oData.StatusDesc = FromStatus[i].Text;
				}
			}

			for (var i = 0; i < ApprovalStatusDD.length; i++) {
				if (ApprovalStatusDD[i].Key === oData.ApprovalStatus) {
					oData.ApprovalStatusDesc = ApprovalStatusDD[i].Text;
				}
			}

			for (var j = 0; j < StatusModel.length; j++) {
				if (StatusModel[j].key == oData.ProspectStatusID) {
					oData.ProspectStatusDes = StatusModel[j].Text;
				}
			}
			for (var i = 0; i < OnBoardingType.length; i++) {
				if (oData.CPTypeID === OnBoardingType[i].key) {
					oData.CPTypeDesc = OnBoardingType[i].Text;
				}
				if (oData.CPTypeID === "01") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", false);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", false);
				} else if (oData.CPTypeID === "02") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", true);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", true);
				} else if (oData.CPTypeID === "03") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", false);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", false);
				} else if (oData.CPTypeID === "04") {
					that.getView().getModel("LocalViewSettingDt").setProperty("/reasonVisibility", true);
					that.getView().getModel("LocalViewSettingDt").setProperty("/awCodeAndBusinessTurnoverVisibility", false);
				}
			}
			// StateDesc
			var State = that.getView().getModel("StateModel").getData();
			for (var i = 0; i < State.length; i++) {
				if (oData.StateID === State[i].key) {
					oData.StateDesc = State[i].Text;
				}
			}

			oData.DOB = this.formatDate(oData.DateOfBirth);
			oData.OpeningTime = this.formateTime(oData.OpeningTime);
			oData.ClosingTime = this.formateTime(oData.ClosingTime);

			var CPHeaderModel = new sap.ui.model.json.JSONModel();
			CPHeaderModel.setData(oData);
			gBasicinfo.setModel(CPHeaderModel, "CPHeaderModel");
			this.getView().setModel(CPHeaderModel, "CPHeaderModel");

			//CPAddInfos Model
			if (oData.ChannelPartnerCPAddInfos.results.length !== 0) {
				var CPAddInfos = new sap.ui.model.json.JSONModel();
				CPAddInfos.setData(oData.ChannelPartnerCPAddInfos.results[0]);
				that.getView().setModel(CPAddInfos, "CPAddInfos");
				gExpensesView.setModel(CPAddInfos, "CPAddInfos");
				gDocumentsview.setModel(CPAddInfos, "CPAddInfos");
			}

			//CPReferences Model
			if (oData.ChannelPartnerCPReferences.results.length !== 0) {
				for (var j = 0; j < oData.ChannelPartnerCPReferences.results.length; j++) {
					if (oData.ChannelPartnerCPReferences.results[j].IsPrimary === "X") {
						oData.ChannelPartnerCPReferences.results[j].SelectedPrimay = true;
					}
				}
				var CPReferences = new sap.ui.model.json.JSONModel();
				CPReferences.setData(oData.ChannelPartnerCPReferences.results);
				that.getView().setModel(CPReferences, "CPReferences");
				gCPReferenceView.setModel(CPReferences, "CPReferences");

				that.getView().getModel("LocalViewSettingDt").setProperty("/CPRefItemCount", oData.ChannelPartnerCPReferences.results.length);
			}
			if (oData.ChannelPartnerCPDMSDivisions.results.length !== 0) {
				var ChannelPartnerCPDMSDivisions = new sap.ui.model.json.JSONModel();
				var WeekDaysDD = that.getView().getModel("WeekDaysDD").getData();
				var finalWeekText = "";
				for (var i = 0; i < WeekDaysDD.length; i++) {
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day1) {
						finalWeekText = finalWeekText + WeekDaysDD[i].Text;
					}
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day2) {
						finalWeekText = finalWeekText + ", " + WeekDaysDD[i].Text;
					}
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day3) {
						finalWeekText = finalWeekText + ", " + WeekDaysDD[i].Text;
					}
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day4) {
						finalWeekText = finalWeekText + ", " + WeekDaysDD[i].Text;
					}
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day5) {
						finalWeekText = finalWeekText + ", " + WeekDaysDD[i].Text;
					}
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day6) {
						finalWeekText = finalWeekText + ", " + WeekDaysDD[i].Text;
					}
					if (WeekDaysDD[i].key === oData.ChannelPartnerCPDMSDivisions.results[0].Day7) {
						finalWeekText = finalWeekText + "" + WeekDaysDD[i].Text;
					}
				}
				oData.ChannelPartnerCPDMSDivisions.results[0].finalWeekText = finalWeekText;
				ChannelPartnerCPDMSDivisions.setData(oData.ChannelPartnerCPDMSDivisions.results[0]);
				that.getView().setModel(ChannelPartnerCPDMSDivisions, "ChannelPartnerCPDMSDivisions");
			}
			that.getCPInfra(); //oprting Cost
			that.getAddtionalinfo();

			busyDialog.close();

			that.getTDSBILDD(function (oData) {
				that.getPANTurnOverDD(function (oData) {
					// that.getCPDetails();
					that.setBindTableData();
				});
			});

			that.getCertificates(); //Attachements

		},
		setBindTableData: function () {
			var that = this;
			var Data = this.getView().getModel("PANTurnDD").getData();
			var BankData = this.getView().getModel("AccountTypeDD").getData();
			var CPAddInfos1 = this.getView().getModel("CPAddInfos").getData();
			var CPAddInfos = [];
			CPAddInfos.push(CPAddInfos1);
			for (var i = 0; i < CPAddInfos.length; i++) {
				for (var j = 0; j < BankData.length; j++) {
					if (CPAddInfos[i].AccountType === BankData[j].key) {
						CPAddInfos[i].AccountTypeText = BankData[j].Text;
					}
				}
			}
			for (var i = 0; i < CPAddInfos.length; i++) {
				for (var j = 0; j < Data.length; j++) {
					if (CPAddInfos[i].PANTurnover === Data[j].key) {
						CPAddInfos[i].PANTurnoverText = Data[j].Text;
					}
				}
			}
			if (CPAddInfos[0].TDS === "000001") {
				var Data1 = this.getView().getModel("TDSBILDD1").getData();
			} else {
				var Data1 = this.getView().getModel("TDSBILDD2").getData();
			}
			for (var i = 0; i < CPAddInfos.length; i++) {
				for (var j = 0; j < Data1.length; j++) {
					if (CPAddInfos[i].TDS === Data1[j].key) {
						CPAddInfos[i].TDSText = Data1[j].Text;
					}
				}
			}
			if (CPAddInfos[0].PANTurnover === "000001" && CPAddInfos[0].TDS === "000001" && CPAddInfos[0].TAN) {
				that.getView().getModel("LocalViewSettingDt").setProperty("/TanVisble", true);
			}
			that.getView().getModel("CPAddInfos").setData(CPAddInfos[0]);
		},
		getCertificates: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONBCRT"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var oItemsModel = new JSONModel();
					oItemsModel.setData(oData);
					that._oComponent.setModel(oItemsModel, "onboardingCertificates");

					that.getOnboardingDoc(oData);

				},
				error: function (error) {
					busyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},
		getAddtionalinfo: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var CPHeaderModel = that.getView().getModel("CPHeaderModel").getData();
			var oSurveyGuid = "";
			if (that.getView().getModel("Surveys")) {
				oSurveyGuid = that.getView().getModel("Surveys").getProperty("/0/SurveyGUID");
			}
			if (oSurveyGuid !== "" && oSurveyGuid !== undefined) {
				ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "SurveyGUID", sap.ui.model.FilterOperator
					.EQ, [oSurveyGuid], false, false, false);
			}
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "ObjectID", sap.ui.model.FilterOperator
				.EQ, [CPHeaderModel.ChannelPartnerGUID], false, false, false);

			oModel.read("/SurveyRsltHdr", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					that.SurveyRsltItems(oData);

				},
				error: function (error) {
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},
		SurveyRsltItems: function (oData) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			// var CPHeaderModel = that.getView().getModel("CPHeaderModel").getData();
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "SurveyResultGUID", sap.ui.model.FilterOperator
				.EQ, [oData[0].SurveyResultGUID], false, false, false);

			oModel.read("/SurveyResults", {
				filters: ListFilters,
				// urlParameters: {
				// 	"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var Attachments = [];
					for (var i = 0; i < oData.length; i++) {
						oData[i].Sequence = i + 1;
						if (oData[i].QuestionCategory === "000004") {
							oData[i].Answwer = oData[i].OptionID;
						} else if (oData[i].QuestionCategory === "000001") {
							oData[i].Answwer = oData[i].OptionText;
						} else if (oData[i].QuestionCategory === "000005") {
							Attachments.push(oData[i]);
						}
					}

					var oItemsModel = new JSONModel();
					oItemsModel.setData(oData);
					that._oComponent.setModel(oItemsModel, "SurveyRslt");
					that.getView().getModel("LocalViewSettingDt").setProperty("/AddInfoCount", oData.length);
					that.getTermsandCondtions(); // for terms and condtions
				},
				error: function (error) {
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},
		getTermsandCondtions: function () {
			var that = this;
			var gTxtArea = "";
			var Infraqn = that._oComponent.getModel("SurveyQuestions").getData();
			var count = 0;
			for (var i = 0; i < Infraqn.length; i++) {
				if (Infraqn[i].QuestionCategory === "000003") {
					count = count + 1;
					Infraqn[i].SNo = count;
					gTxtArea = gTxtArea + Infraqn[i].SNo + ". " + Infraqn[i].Question + "\n";
				}
			}
			that.getView().getModel("LocalViewSettingDt").setProperty("/TermsAndCondtions", gTxtArea);
		},
		getCPInfra: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGWHANA");
			var oFilter = [];
			oFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilter, "AggregatorID", sap.ui.model.FilterOperator.EQ, [
				"AGGRBIL"
			], false, false, false);
			oFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilter, "Typeset", sap.ui.model.FilterOperator.EQ, [
				"CPINFR"
			], false, false, false);
			oModelData.read("/ConfigTypsetTypeValues", {
				filters: oFilter,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								SNO: i + 1,
								key: oData[i].Types,
								InputAnswerModel: "",
								InputAnswerState: "None",
								Text: oData[i].Typesname,
								ValueType: oData[i].TypeValue
							});
						}
						// var json = new JSONModel(json);
						// that.getView().setModel(json, "CPInfraModel");

						that.getCPInfraModel(json);

					}
				},
				error: function () {
					BusyDialog.close();
					var json = new JSONModel([]);
					that.getView().setModel(json, "CPInfraModel");
				}
			});

		},

		getCPInfraModel: function (Data) {
			var that = this;
			var view = that.getView();
			var oSSGW_MSTModel = that._oComponent.getModel("SSGWHANA");
			var cpModel = that.getView().getModel("CPHeaderModel").getData();
			var oFilter = [];
			oFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilter, "CPGuid", sap.ui.model.FilterOperator.EQ, [
				cpModel.ChannelPartnerGUID
			], false, false, false);
			oSSGW_MSTModel.read("/CPInfras", {
				filters: oFilter,
				success: function (oData) {
					var CPInfras = new sap.ui.model.json.JSONModel();
					CPInfras.setData(oData);
					if (oData.results.length !== 0) {
						for (var i = 0; i < Data.length; i++) {
							for (var j = 0; j < oData.results.length; j++) {
								if (Data[i].key === oData.results[j].InfraCode) {
									Data[i].UpdateFlag = true;
									Data[i].InputAnswerModel = oData.results[j].InfraValue;
									Data[i].ChannelPartner2GUID = oData.results[j].ChannelPartner2GUID;
								}
							}
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(Data);
						that.getView().getModel("LocalViewSettingDt").setProperty("/CPInfraQuestionCount", Data.length);
						gOperatingCostView.setModel(ojsonmodel, "CPInfraModel");
					} else {
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(Data);
						that.getView().getModel("LocalViewSettingDt").setProperty("/CPInfraQuestionCount", Data.length);
						gOperatingCostView.setModel(ojsonmodel, "CPInfraModel");
					}

					// that.getCertificateData();
				},
				error: function (error) {
					BusyDialog.close();
					that.handleoDataError(error);
				}
			});

			if (this.getCPDetails_Exit) {
				this.getCPDetails_Exit();
			}

		},
		formatDate: function (date) {
			if (date) {
				let day = date.getDate();
				let month = date.getMonth() + 1; // Months are zero-based
				let year = date.getFullYear();
				// Add leading zeros to day and month if needed
				if (day < 10) {
					day = '0' + day;
				}
				if (month < 10) {
					month = '0' + month;
				}
				return `${day}/${month}/${year}`;
			} else {
				return null;
			}
		},
		formateTime: function (val) {
			if (val) {
				// Calculate total seconds
				var milliseconds = val.ms;
				var totalSeconds = Math.floor(milliseconds / 1000);

				// Calculate hours, minutes, and seconds
				var hours = Math.floor(totalSeconds / 3600);
				var minutes = Math.floor((totalSeconds % 3600) / 60);
				var seconds = totalSeconds % 60;

				// Format to hh:mm:ss
				var formattedTime =
					String(hours).padStart(2, '0') + ':' +
					String(minutes).padStart(2, '0') + ':' +
					String(seconds).padStart(2, '0');

				return formattedTime;
			} else {
				return null;
			}
		},
		setDropDowns: function () {

			this.setOnBoardingStatusDD();
			this.setOnBoardingApprovalStatusDD();

			this.getAggregatorsID();
			this.getDocumentTypeDD1();
			this.getDistributorTypes();
			this.getDistributorStatusDD();
			this.getStateID();
			this.getWeekDays();
			this.getSurveys();
			this.getFSSAITypeDD();
			this.getAccountTypeDD();
		},
		getSurveys: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "Surveys");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "ApplicationCategory", sap.ui.model.FilterOperator
				.EQ, ["000007"], false, false, false);
			oModel.read("/Survey", {
				filters: ListFilters,
				urlParameters: {
					"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				},
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					if (oData.length > 0) {
						that.getSurveyHdrs(oData);
						var oItemsModel = new JSONModel();
						oItemsModel.setData(oData);
						that._oComponent.setModel(oItemsModel, "Surveys");
					}
				},
				error: function (error) {
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},
		getSurveyHdrs: function (Surveys) {
			var that = this;
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "SurveyQuestions");
			// that.getView().getModel("LocalViewSettingDt").setProperty("/AddInfoCount", 0);
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			for (var k = 0; k < Surveys.length; k++) {
				ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "SurveyGUID", sap.ui.model.FilterOperator.EQ, [
					Surveys[k].SurveyGUID
				], false, false, false);
			}
			oModel.read("/SurveyHdr", {
				filters: ListFilters,
				urlParameters: {
					"$select": "QuinSrvGUID,SurveyGUID,Sequence,Question,QuestionLabel,EntryLabel,QuestionCategory,IsMandatory,EntryCategory"
				},
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					oData.sort((a, b) => {
						return a.Sequence - b.Sequence;
					});
					var oItemsModel = new JSONModel();
					oItemsModel.setData(oData);
					that._oComponent.setModel(oItemsModel, "SurveyQuestions");
				},
				error: function (error) {
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},
		getDocumentURL: function () {
			var that = this;
			var Attachments = that._oComponent.getModel("Attachments").getData();
			var RepositoryID = Attachments[0].ImageURL.split("&")[0].split("=")[1];
			var Source = Attachments[0].ImageURL.split("&")[1].split("=")[1];
			var DocumentID = Attachments[0].ImageURL.split("&")[2].split("=")[1]

			var methodType = "GET";
			var data = "RepositoryID=" + RepositoryID + "&" + "Source=" + Source + "&" + "DocumentID=" +
				DocumentID;
			$.ajax({
				url: "/sap/opu/odata/ARTEC/ProcessDocument/ProcessDocument?" + data,
				type: "GET",
				dataType: "JSON",
				async: false,
				jsonpCallback: "getJSON",
				contentType: "application/json; charset=utf-8",
				success: function (data, textStatus, jqXHR) {
					var base64ConversionRes = data.FileContent;
					if (base64ConversionRes) {
						const byteString = window.atob(base64ConversionRes);
						const arrayBuffer = new ArrayBuffer(byteString.length);
						const int8Array = new Uint8Array(arrayBuffer);
						for (let i = 0; i < byteString.length; i++) {
							int8Array[i] = byteString.charCodeAt(i);
						}
						const blob = new Blob([int8Array], {
							// type: CertificateDocuments[index].MimeType
						});
						const url = URL.createObjectURL(blob);
						Attachments[0].DocumentUrl = url;
						that.getView().getModel("Attachments").setProperty("/", Attachments);
					}
				},
				error: function (xhr, status, e) {
					oPPCCommon.removeDuplicateMsgsInMsgMgr();

				}
			});
		},

		InfraModel: function (oData) {
			var that = this;
			var gTxtArea = "";
			var Infraqn = this.getView().getModel("SurveyIfraQuestions").getData();

			for (var i = 0; i < Infraqn.length; i++) {
				if (oData[i].QuestionCategory === "000003") {
					Infraqn[i].SNo = i + 0;
					gTxtArea = gTxtArea + Infraqn[i].SNo + ". " + Infraqn[i].Question + "\n";
				}
			}
			that.getView().getModel("LocalViewSettingDt").setProperty("/Question", gTxtArea);
		},
		getDistributorStatusDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["ONDBST"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].Types,
								Text: oData[i].TypeValue
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "DistributorStatusDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getDistributorTypes: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["OBTYPE"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						Key: "",
						Text: "(Select)"

					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "OnBoardingTypeDD");

					}
				},
				error: function (error) {
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},

		handleoDataError: function (error) {
			var message = oPPCCommon.parseoDataErrorMessage(error);
			if (message.trim() === "Not Found") {
				// this._oRouter.navTo("NoMatching");
			} else {
				var that = this;
				oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"), function () {
					that.backToList();
				});
			}
		},
		onBack: function () {
			window.history.go(-1);
			if (this.backToList_Exit) {
				this.backToList_Exit();
			}
		},
		getCurrentServerDate: function (oController, callback) {
			var oModelData = oController._oComponent.getModel("PCGW");
			oModelData.read("/Today", {
				dataType: "json",
				success: function (data) {
					if (callback) {
						callback(data.Today.Today);
					}
				},
				error: function (error) {
					if (callback) {
						MessageBox.error(oi18n.getText("SOCreate.ServerDate.CanNot.Load"), {
							styleClass: "sapUiSizeCompact"
						});
					}
				}
			});
		},

		// AKII
		getFSSAITypeDD: function (certificates) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, [gAggregatorID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["FSSAIT"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				// urlParameters: {
				// 	"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						key: "",
						Text: "(Select)"
					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						gBusinessView.setModel(ojsonmodel, "FSSAITypeDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},

		getOnboardingDoc: function (Certificate) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			// ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "AggregatorID", sap.ui.model.FilterOperator
			// 	.EQ, [gAggregatorID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["CPONDC"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					that.getGSTMonths(Certificate, oData);
				},
				error: function (error) {
					busyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getGSTMonths: function (Certificate, NocDocs) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			// ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "AggregatorID", sap.ui.model.FilterOperator
			// 	.EQ, [gAggregatorID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["CPGSTM"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var Attachements = Certificate.concat(NocDocs, oData);
					that.getCertificateData(Attachements);
				},
				error: function (error) {
					busyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},

		getCertificateData: function (Attachements) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			// var CPModel = that.getView().getModel("ContextModel").getData();
			var CPHeaderModel = that.getView().getModel("CPHeaderModel").getData();
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "PartnerID", sap.ui.model.FilterOperator
				.EQ, [CPHeaderModel.ChannelPartnerGUID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "PartnerType", sap.ui.model.FilterOperator
				.EQ, [CPHeaderModel.CPTypeID], false, false, false);
			oModel.read("/Certificates", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var FSSAITypeDD = gBusinessView.getModel("FSSAITypeDD").getData();
					var OnBoardCertf = that._oComponent.getModel("onboardingCertificates").getData();
					var FSSAIModel = [];
					var PANModel = [];
					var TANandTDSModel = [];
					var BankModel = [];
					var GSTMonth = [];
					var Attachement = [];
					var ITRModel = [];
					var OnBoardCertfArr = [];
					for (var j = 0; j < oData.length; j++) {
						for (var i = 0; i < Attachements.length; i++) {
							if (oData[j].CertificateType === Attachements[i].TypeValue) {
								oData[j].CertificateTypeDesc = Attachements[i].Typesname;
								oData[j].UpdateFlag = true;
								oData[j].New = false;
								oData[j].ImageFlag = true;
								oData[j].JpgVisible = false;
								oData[j].PDFVisible = false;
								if (oData[j].CertificateType !== "PAN" && oData[j].CertificateType !==
									"PANH" && oData[j].CertificateType !== "BANKST" && oData[j].CertificateType !== "TDS" && oData[j].CertificateType !==
									"TAN") {
									Attachement.push(oData[j]);
								}
							}
							if (oData[j].CertificateType === Attachements[i].TypeValue) {
								if (oData[j].CertificateType === "PAN" || oData[j].CertificateType ===
									"PANH") {
									oData[j].CertificateTypeDesc = Attachements[i].Typesname;
									oData[j].Certificates = Attachements[i].Typesname;
									oData[j].UpdateFlag = true;
									oData[j].New = false;
									oData[j].ImageFlag = true;
									PANModel.push(oData[j]);
								} else {
									if (oData[j].CertificateType === "TDS" || oData[j].CertificateType === "TAN") {
										oData[j].CertificateTypeDesc = Attachements[i].Typesname;
										oData[j].Certificates = Attachements[i].Typesname;
										oData[j].UpdateFlag = true;
										oData[j].New = false;
										oData[j].ImageFlag = true;
										TANandTDSModel.push(oData[j]);
									} else if (oData[j].CertificateType === "BANKST") {
										oData[j].CertificateTypeDesc = Attachements[i].Typesname;
										oData[j].Certificates = Attachements[i].Typesname;
										oData[j].UpdateFlag = true;
										oData[j].New = false;
										oData[j].ImageFlag = true;
										BankModel.push(oData[j]);
									} else if (oData[j].CertificateType === "ITR1" || oData[j].CertificateType === "ITR2") {
										oData[j].CertificateTypeDesc = Attachements[i].Typesname;
										oData[j].Certificates = Attachements[i].Typesname;
										oData[j].UpdateFlag = true;
										oData[j].New = false;
										oData[j].ImageFlag = true;
										ITRModel.push(oData[j]);
									} else if (oData[j].CertificateType === "GST1" || oData[j].CertificateType === "GST2" || oData[j].CertificateType ===
										"GST3" || oData[j].CertificateType === "GST4" || oData[j].CertificateType === "GST5" || oData[j].CertificateType ===
										"GST6" || oData[j].CertificateType === "GST7" || oData[j].CertificateType === "GST8" || oData[j].CertificateType ===
										"GST9" || oData[j].CertificateType === "GST10" || oData[j].CertificateType === "GST11" || oData[j].CertificateType ===
										"GST12") {
										oData[j].CertificateTypeDesc = Attachements[i].Typesname;
										oData[j].Certificates = Attachements[i].Typesname;
										oData[j].UpdateFlag = true;
										oData[j].New = false;
										oData[j].ImageFlag = true;
										GSTMonth.push(oData[j]);
									}
								}
							}
						}
						for (var k = 0; k < FSSAITypeDD.length; k++) {
							if (FSSAITypeDD[k].key === oData[j].SourceReferenceID) {
								oData[j].Certificates = FSSAITypeDD[k].Text;
								FSSAIModel.push(oData[j]);
							}
						}
						for (var a = 0; a < OnBoardCertf.length; a++) {
							if (OnBoardCertf[a].TypeValue === oData[j].CertificateType) {
								oData[j].CertificateTypeDesc = OnBoardCertf[a].Typesname;
								oData[j].Certificates = OnBoardCertf[a].Typesname;
								oData[j].UpdateFlag = true;
								oData[j].New = false;
								oData[j].ImageFlag = true;
								OnBoardCertfArr.push(oData[j]);
							}
						}
					}
					if (OnBoardCertfArr.length !== 0) {
						var json = new JSONModel(OnBoardCertfArr);
						that.getView().setModel(json, "Attachments");
						gAttachment.setModel(json, "Attachments");
						that.getView().getModel("LocalViewSettingDt").setProperty("/AttachmentTableCount", OnBoardCertfArr.length);
					}
					if (FSSAIModel.length !== 0) {
						var json = new JSONModel(FSSAIModel);
						gBusinessView.setModel(json, "FSSAICertificates");
						that.getView().getModel("LocalViewSettingDt").setProperty("/FSSAIDocumentsCount", FSSAIModel.length);
						that.getEntityAttributes();
					}

					if (PANModel.length !== 0) {
						var json = new JSONModel(PANModel);
						gBusinessView.setModel(json, "PANCertificates");
						that.getView().getModel("LocalViewSettingDt").setProperty("/PANDocumentsCount", PANModel.length);
					}
					if (TANandTDSModel.length !== 0) {
						var json = new JSONModel(TANandTDSModel);
						gDocumentsview.setModel(json, "TDSCertificates");
						that.getView().getModel("LocalViewSettingDt").setProperty("/TDSDocConut", TANandTDSModel.length);
					}
					if (BankModel.length !== 0) {
						var json = new JSONModel(BankModel);
						gBankDataview.setModel(json, "BankCertificates");
						that.getView().getModel("LocalViewSettingDt").setProperty("/BankDocumentsCount", BankModel.length);
					}
					if (ITRModel.length !== 0) {
						var json = new JSONModel(ITRModel);
						gITRDocview.setModel(json, "ITRCertificates");
						that.getView().getModel("LocalViewSettingDt").setProperty("/ITRDocumentsCount", ITRModel.length);
					}
					if (GSTMonth.length !== 0) {
						var json = new JSONModel(GSTMonth);
						gGSTView.setModel(json, "GSTCertificates");
						that.getView().getModel("LocalViewSettingDt").setProperty("/GSTDocumentsCount", GSTMonth.length);
					}

					// DocTypes[i].DocumentType === "PAN" || DocTypes[i].DocumentType === "PANH"

					// that.getDocuments(0);
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},

		formatDate: function (date) {
			if (date) {
				let day = date.getDate();
				let month = date.getMonth() + 1; // Months are zero-based
				let year = date.getFullYear();
				// Add leading zeros to day and month if needed
				if (day < 10) {
					day = '0' + day;
				}
				if (month < 10) {
					month = '0' + month;
				}
				return `${day}/${month}/${year}`;
			} else {
				return null;
			}
		},
		getCertificatesPAN: function () {
			var that = this;
			var PANCertificates = [];
			var DocTypes = this.getView().getModel("PANDocuments").getData();
			for (var i = 0; i < DocTypes.length; i++) {
				if (DocTypes[i].DocumentType === "PAN" || DocTypes[i].DocumentType === "PANH") {
					PANCertificates.push({
						CertificateGUID: "",
						AggregatorID: gAggregatorID,
						PartnerID: "",
						PartnerType: "",
						CertificateType: DocTypes[i].DocumentType,
						CertificateTypeDesc: DocTypes[i].DocumentTypes,
						CertificateNo: "",
						IssueDate: null,
						CreatedAt: null,
						CreatedOn: null,
						ChangedBy: "",
						ChangedAt: null,
						ChangedOn: null,
						Source: "PORTAL",
						SourceReferenceID: null,
						UpdateFlag: false,
						New: true,
						ImageFlag: false
					});
				}
			}
			// if (gEditView) 
			if (true) { //upDate Case
				that.getCertificateDataPAN(PANCertificates);
				// that.getCertificate();
			} else {
				var json = new JSONModel(PANCertificates);
				gBusinessView.setModel(json, "PANCertificates");
				that.getView().getModel("LocalViewSettingDt").setProperty("/PANDocumentsCount", PANCertificates.length);
			}

		},
		getCertificateDataPAN: function (PANCertificates) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			var guid = oPPCCommon.getPropertyValueFromContextPath(contextPath, "CP_GUID");
			guid = guid.split("guid")[1];
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "PartnerID", sap.ui.model.FilterOperator
				.EQ, [guid.toUpperCase()], false, false, false);
			// ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "PartnerID", sap.ui.model.FilterOperator
			// 	.EQ, [guid.toLowerCase()], false, false, false);
			// ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "PartnerType", sap.ui.model.FilterOperator
			// 	.EQ, [CPModel.CPTypeID], false, false, false);
			oModel.read("/Certificates", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					for (var j = 0; j < oData.length; j++) {
						for (var i = 0; i < PANCertificates.length; i++) {
							if (PANCertificates[i].CertificateType === oData[j].CertificateType) {
								PANCertificates[i].CertificateGUID = oData[j].CertificateGUID;
								PANCertificates[i].AggregatorID = oData[j].AggregatorID;
								PANCertificates[i].PartnerID = oData[j].PartnerID;
								PANCertificates[i].PartnerType = oData[j].PartnerType;
								PANCertificates[i].Source = oData[j].Source;
								PANCertificates[i].UpdateFlag = true;
								PANCertificates[i].New = false;
								PANCertificates[i].ImageFlag = true;
							}
						}
					}

					var json = new JSONModel(PANCertificates);
					gBusinessView.setModel(json, "PANCertificates");
					that.getView().getModel("LocalViewSettingDt").setProperty("/PANDocumentsCount", PANCertificates.length);
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},

		getAggregatorsID: function () {
			var that = this;
			var sUrl = "/sap/opu/odata/ARTEC/PCGW_UTILS/CPDestination";
			var mRequestData = [{}];
			mRequestData[0].destinationName = "PCGWHANA";
			mRequestData[0].Application = "PD";
			mRequestData[0].Method = "read";
			mRequestData[0].IsTestRun = "";
			mRequestData[0].FmName = "";
			$.ajax({
				url: sUrl,
				type: "POST",
				dataType: "JSON",
				async: true,
				data: {
					destination: JSON.stringify(mRequestData)
				},
				success: function (data, textStatus, jqXHR) {
					gAggregatorID = data.destination[0].PCGWHANA.AggregatorID;
					that.getView().getModel("LocalViewSettingDt").setProperty("/AggregatorID", data.destination[0].PCGWHANA.AggregatorID);
				}
			});
		},
		getStateID: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "States");
			oModel.read("/States", {
				filters: ListFilters,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						Key: "",
						Separator: "",
						Text: "(Select)"

					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].StateID,
								Separator: " - ",
								Text: oData[i].State
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "StateModel");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getEntityAttributes: function () {
			var that = this;
			var oModelData = this._oComponent.getModel("PCGWHANA");
			var oStatusFilter = new Array();
			var CPHeaderModel = that.getView().getModel("CPHeaderModel").getData();
			var FSSAICertificates = gBusinessView.getModel("FSSAICertificates").getData();
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "Attribute2", sap.ui.model.FilterOperator
				.EQ, [CPHeaderModel.ChannelPartnerGUID], false, false, false);
			oStatusFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oStatusFilter, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, [CPHeaderModel.AggregatorID], false, false, false);
			oModelData.read("/EntityAttributes", {
				filters: oStatusFilter,
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var ojsonmodel = new sap.ui.model.json.JSONModel({});
					gBusinessView.setModel(ojsonmodel, "EntityAttributesModel");
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							if (oData[i].EntityKey === "FSSAI") {
								gFssaiGuid = oData[i].EntityAttrGUID;
								gBusinessView.getModel("EntityAttributesModel").setProperty("/entityName", JSON.parse(oData[i].Value).result.result.entityName);
								gBusinessView.getModel("EntityAttributesModel").setProperty("/status", JSON.parse(oData[i].Value).result.result.status);
								gBusinessView.getModel("EntityAttributesModel").setProperty("/licenseType", JSON.parse(oData[i].Value).result.result.licenseType);
								gBusinessView.getModel("EntityAttributesModel").setProperty("/district", JSON.parse(oData[i].Value).result.result.premissesAddress
									.district);
								gBusinessView.getModel("EntityAttributesModel").setProperty("/address", JSON.parse(oData[i].Value).result.result.premissesAddress
									.address);
								gBusinessView.getModel("EntityAttributesModel").setProperty("/state", JSON.parse(oData[i].Value).result.result.premissesAddress
									.state);
								gBusinessView.getModel("EntityAttributesModel").setProperty("/pincode", JSON.parse(oData[i].Value).result.result.premissesAddress
									.pincode);
								that.getView().getModel("LocalViewSettingDt").setProperty("/FssaiDetail", true);
							} else if (oData[i].EntityKey === "GST") {
								// gGstGuid = oData[i].EntityAttrGUID;
							} else if (oData[i].EntityKey === "PAN") {
								gPanGuid = oData[i].EntityAttrGUID;
								gBusinessView.getModel("EntityAttributesModel").setProperty("/statusPan", JSON.parse(oData[i].Value).Validation.status);
								gBusinessView.getModel(
									"EntityAttributesModel").setProperty("/registered_name", JSON.parse(oData[i].Value).Validation.registered_name);
								gBusinessView.getModel(
									"EntityAttributesModel").setProperty("/type", JSON.parse(oData[i].Value).Validation.type);
								gBusinessView.getModel("LocalViewSettingDt").setProperty("/PanDetail", true);
							} else if (oData[i].EntityKey === "BANK") {
								gBankGuid = oData[i].EntityAttrGUID;
								gBankDataview.getModel("CPAddInfos").setProperty("/beneName", JSON.parse(oData[i].Value).beneName);
								gBankDataview.getModel("CPAddInfos").setProperty("/active", JSON.parse(oData[i].Value).active);
								that.getView().getModel("LocalViewSettingDt").setProperty("/BankDetail", true);
							}
						}
					}

				},
				error: function (error) {
					if (callBack) {
						callBack([]);
					}
				}
			});
		},
		getWeekDays: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["CPDAYS"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				// urlParameters: {
				// 	"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}

						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "WeekDaysDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});
		},

		// *********************************Approve**********************************
		ReqCorrection: function () {

			var that = this;
			var oItem = gList.getModel("ListItems").getProperty("/");
			oItem = oItem[itemindex];
			var Approvers = oItem.Approvers;
			var dialog = new sap.m.Dialog({

				title: 'Request for Correction',
				type: 'Message',
				contentWidth: "60%",
				content: [
					new sap.m.Label({
						text: 'Request for : ',
						labelFor: 'IdApprovers'
					}),
					new sap.m.Select('IdApprovers', {
						items: {
							path: "/arr",
							template: new sap.ui.core.Item({
								key: "{apprRoleid}",
								text: "{apprRoleid} - {mailid}"
							})
						}
					}),
					// new sap.m.Label({
					// 	text: 'Comments',
					// 	labelFor: 'submitDialogTextarea'
					// }),
					new sap.m.TextArea('submitDialogTextarea', {
						width: '100%',
						placeholder: 'Add comment (required)',
						maxLength: 250
					})
				],

				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {

						var sComments = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						var apprRoleid = sap.ui.getCore().byId('IdApprovers').getSelectedKey();

						if (sComments) {
							that._completeTask("05", sComments, apprRoleid);
							dialog.close();
						} else {
							sap.m.MessageBox.error(
								"Please Enter User Command", {
									styleClass: "sapUiSizeCompact"
								}
							);
						}

					}
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			// if (apprUsrname == 'SOM1' || apprUsrname == 'BDM1' || apprUsrname == 'NSM1') {
			// 	this.getView().getModel("LocalViewSettingDt").setProperty("/ReqBtn", true);
			// }

			var arr = [];
			arr.push({
				"apprRoleid": oItem.header.appRoleId,
				"mailid": oItem.header.EmailID
			});
			for (var i = 0; i < Approvers.length; i++) {
				if (Approvers[i].relLevel <= oItem.CurrentApprover[0].relLevel) {
					if (Approvers[i].apprUsrname == "BDM1") {
						for (var j = 0; j < Approvers.length; j++) {
							if (Approvers[j].apprUsrname == "SOM1") {
								arr.push(Approvers[j]);
								break;
							}
						}
					} else if (Approvers[i].apprUsrname == "NSM1") {
						for (var k = 0; k < Approvers.length; k++) {
							if (Approvers[k].apprUsrname == "BDM1") {
								arr.push(Approvers[k]);
								break;
							}
						}
					}

				}
			}
			var oModel = new sap.ui.model.json.JSONModel({
				arr
			});
			sap.ui.getCore().byId("IdApprovers").setModel(oModel)
			dialog.open();
		},
		onApprove: function () {

			var that = this;
			// var oItem;
			// var oItem = that.getModel("CustomerItemData").getProperty("/");

			var dialog = new sap.m.Dialog({

				title: 'Approve',
				type: 'Message',
				contentWidth: "40%",
				content: [
					new sap.m.Label({
						text: 'Comments',
						labelFor: 'submitDialogTextarea'

					}),
					new sap.m.TextArea('submitDialogTextarea', {
						width: '100%',
						placeholder: 'Add comment (required)',
						maxLength: 250
					})
				],

				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {

						var sComments = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						if (sComments) {

							that._completeTask("01", sComments);
							dialog.close();
						} else {
							sap.m.MessageBox.error(
								"Please Enter UserCommand", {
									styleClass: "sapUiSizeCompact"
								}
							);
						}

					}
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onReject: function () {
			var that = this;
			// var LoginID = sap.ushell.Container.getService("UserInfo");
			// var rLoginID = LoginID.getId();
			// var sLoginID = rLoginID.toUpperCase();
			// oItem = that.getModel("CustomerItemData").getProperty("/");

			var dialog = new sap.m.Dialog({
				title: 'Reject',
				type: 'Message',
				contentWidth: "40%",
				content: [
					new sap.m.Label({
						text: 'Comments',
						labelFor: 'submitDialogTextarea1'
					}),
					new sap.m.TextArea('submitDialogTextarea1', {
						width: '100%',
						placeholder: 'Add comment (required)',
						maxLength: 250
					})
				],
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						// input comment
						var sComments = sap.ui.getCore().byId('submitDialogTextarea1').getValue();
						// oItem.COMMENTS = {};
						// oItem.COMMENTS.USERCOMMENTS = sComments;
						// that.getModel("CustomerItemData").setProperty("/Usercomments/Comments", sComments);
						if (sComments) {
							that._completeTask("02", sComments);
							dialog.close();
						} else {
							sap.m.MessageBox.error(
								"Please Enter UserCommand", {
									styleClass: "sapUiSizeCompact"
								}
							);
						}
					}
				}),
				endButton: new sap.m.Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		_completeTask: function (DecisionKey, sComments, apprRoleid) {
			var items = gList.getModel("ListItems").getProperty("/");
			// for (var i = 0; i < items.length; i++) {
			// 	if (items[i].selectedItem) {
			this.confirmTask(items[itemindex], DecisionKey, sComments, apprRoleid);
			// }
			// }
		},
		confirmTask: function (iItem, DecisionKeys, sComments, apprRoleid1) {
			var that = this;
			// var LoginID = sap.ushell.Container.getService("UserInfo");
			// var rLoginID = LoginID.getId();
			// var sLoginID = rLoginID.toUpperCase();
			var sLoginID = "P016354";
			var token = this._fetchToken();
			var DecisionKey = "";
			var StatusID = "";
			var apprUserid = "";
			var apprRoleid = "";
			var IdentityNo1 = "";
			var IdentityNo2 = "";
			var ApprovalStatus = "";
			var StatusID = "";
			IdentityNo1 = iItem.CurrentApprover[0].apprUserid;
			IdentityNo2 = iItem.CurrentApprover[0].apprRoleid;
			var userComment = sComments
				// var INSTANCE_NO = gList.getModel("TasksModel").getProperty("/" + itemindex + "/InstanceID");
				// var InstanceID = gList.getModel("TasksModel").getProperty("/" + itemindex + "/InstanceID");

			var INSTANCE_NO = iItem.InstanceID;
			var InstanceID = iItem.InstanceID;

			var application = iItem.Application;
			var ENTITYTYPE = iItem.EntityType;
			var ENTITY_TYPE_DESC = iItem.EntityTypeDesc;
			var STRATEGY = iItem.Strategy;
			var TESTRUN = "";
			var REMARKS = "";
			var ENTITYKEY = INSTANCE_NO;
			var login = iItem.CurrentApprover[0].apprUserid;

			if (DecisionKeys === "01") {
				DecisionKey = "01";
				// StatusID = "03";
				StatusID = "30";
				ApprovalStatus = "03";
			} else if (DecisionKeys === "02") {
				DecisionKey = "02";
				// StatusID = "04";
				StatusID = "10";
				ApprovalStatus = "02";

			} else if (DecisionKeys === "05") {
				DecisionKey = "05";
				// StatusID = "04";
				StatusID = "20";
				ApprovalStatus = "01"
				apprRoleid = apprRoleid1;
				apprUserid = iItem.CurrentApprover[0].apprUserid;
			}
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + InstanceID,
				method: "PATCH",
				contentType: "application/json",
				data: "{\"status\": \"COMPLETED\",\"context\": 	{\"Usercomments\": {\"LoginID\":\"" + login +
					"\",\"Comments\":\"" + userComment +
					"\",\"InstanceID\":\"" + INSTANCE_NO +
					"\",\"EntityType\":\"" + ENTITYTYPE +
					"\",\"StatusID\":\"" + StatusID +
					"\",\"DecisionKey\":\"" + DecisionKey +
					"\",\"apprRoleid\":\"" + apprRoleid +
					"\",\"apprUserid\":\"" + apprUserid +
					"\",\"IdentityNo1\":\"" + IdentityNo1 +
					"\",\"IdentityNo2\":\"" + IdentityNo2 +
					"\",\"ApprovalStatus\":\"" + ApprovalStatus +
					"\",\"URL1\":\"" + userComment +
					"\"}}}",
				headers: {
					"X-CSRF-Token": token
				},
				success: function (result, xhr, data) {
					that.postApiData(userComment);

				}

			});

		},
		_refreshTask: function () {
			// setTimeout(function () {
			sap.m.MessageToast.show("Updated");
			window.history.go(-1);
			// }, 4000);
		},
		postApiData: function (userComment) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			// var EntityAttrGUID = "";

			var oHeader = that.PrepareEntityAttributesFilters(userComment);
			if (!gEntityGuid) {
				oModel.create("/EntityAttributes", oHeader, {
					success: function (oData) {
						// busyDialog.close();
						that._refreshTask();
					},
					error: function (error) {
						// busyDialog.close();
						var msg = oPPCCommon.getMsgsFromMsgMgr();
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
					}
				});
			} else {
				oModel.update("/EntityAttributes('" + gEntityGuid + "')", oHeader, {
					success: function (oData) {
						// busyDialog.close();
						that._refreshTask();
					},
					error: function (error) {
						busyDialog.close();
						oPPCCommon.removeDuplicateMsgsInMsgMgr();
						oPPCCommon.displayMsg_MsgBox(that.getView(), msg, "error");
					}
				});
			}
		},
		PrepareEntityAttributesFilters: function (userComment) {
			var that = this;
			var CreatedOn = new Date();
			var today = CreatedOn;
			var CreatedAt = "PT" + today.getHours() + "H" + today.getMinutes() + "M" + today.getSeconds() + "S";
			// var CPModel = that.getView().getModel("CPModel").getProperty("/");
			var Item = gList.getModel("ListItems").getProperty("/")[itemindex];
			var ApprovedBy = Item.CurrentApprover[0].apprUsrname;
			var Email = Item.CurrentApprover[0].mailid;
			var ApprovedUser = Item.CurrentApprover[0].apprUserid;
			var Guid = "";
			if (gEntityGuid) {
				var ApprovalHistory = that.getView().getModel("ApprovalHistoryModel").getData();
				Guid = gEntityGuid;
				var JsonValue = {
					Seq: (ApprovalHistory.length + 1).toString(),
					UserComments: userComment,
					ApprovedBy: ApprovedBy,
					ApprovedUser: ApprovedUser,
					ApprovedEmail: Email,
					CreatedOn: CreatedOn,
					CreatedAt: CreatedAt
				};
				ApprovalHistory.push(JsonValue);
			} else {
				Guid = oPPCCommon.generateUUID().toUpperCase();
				var ApprovalHistory = [{
					Seq: "1",
					UserComments: userComment,
					ApprovedBy: ApprovedBy,
					ApprovedUser: ApprovedUser,
					ApprovedEmail: Email,
					CreatedOn: CreatedOn,
					CreatedAt: CreatedAt
				}];
			}
			var oHeader = {
				EntityAttrGUID: Guid,
				EntityKey: "APPLOG",
				Attribute2: gPartnerGuid,
				Attribute3: "",
				Attribute4: "",
				Value: JSON.stringify(ApprovalHistory),
				Source: "Portal",
				AggregatorID: "AGGRBIL",
				CreatedBy: "",
				// CreatedOn: CreatedOn,
				// CreatedAt: CreatedAt,
				SourceReferenceID: ""
			};
			return oHeader;
		},

		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},
		getPANTurnOverDD: function (callback) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, [gAggregatorID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["TURPAN"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				// urlParameters: {
				// 	"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						key: "",
						Text: "(Select)"
					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "PANTurnDD");
					}
					if (callback) {

						callback(true);
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getTDSBILDD: function (callback) {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, [gAggregatorID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["TDSBIL"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				// urlParameters: {
				// 	"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						key: "",
						Text: "(Select)"
					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}

						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "TDSBILDD1");
						// if (that.getView().getModel("CPAddInfos")) {
						// 	var CPData = that.getView().getModel("CPAddInfos").getData();
						// 	for (var j = 0; j < json.length; j++) {
						// 		if (CPData.TDS === json[j].key) {
						// 			that.getModel("LocalViewSettingDt").setProperty("/TDSText", json[j].Text)
						// 		}
						// 	}
						// 	that.getView().getModel("CPAddInfos").setData(CPData);
						// }
					}
					var json1 = [];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							if (oData[i].TypeValue === "000002") {
								json1.push({
									key: oData[i].TypeValue,
									Text: oData[i].Typesname
								});
							}
						}

						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json1);
						that.getView().setModel(ojsonmodel, "TDSBILDD2");
						// if (that.getView().getModel("CPAddInfos")) {
						// 	var CPData = that.getView().getModel("CPAddInfos").getData();
						// 	for (var j = 0; j < json1.length; j++) {
						// 		if (CPData.TDS === json1[j].key) {
						// 			that.getModel("LocalViewSettingDt").setProperty("/TDSText", json1[j].Text)
						// 		}
						// 	}
						// 	that.getView().getModel("CPAddInfos").setData(CPData);
						// }
					}

					if (callback) {

						callback(true);
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		getAccountTypeDD: function () {
			var that = this;
			var oModel = this._oComponent.getModel("PCGWHANA");
			var ListFilters = [];
			var oItemsModel = new JSONModel();
			oItemsModel.setData([]);
			that._oComponent.setModel(oItemsModel, "ConfigTypsetTypeValues");
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "AggregatorID", sap.ui.model.FilterOperator
				.EQ, [gAggregatorID], false, false, false);
			ListFilters = oPPCCommon.setODataModelReadFilter(this.getView(), "", ListFilters, "Typeset", sap.ui.model.FilterOperator
				.EQ, ["CPACTP"], false, false, false);
			oModel.read("/ConfigTypsetTypeValues", {
				filters: ListFilters,
				// urlParameters: {
				// 	"$select": "SurveyGUID,SurveyCategory,ApplicationCategory"
				// },
				success: function (oData) {
					oData = oPPCCommon.formatItemsOData({
						oData: oData
					});
					var json = [{
						key: "",
						Text: "(Select)"
					}];
					if (oData.length > 0) {
						for (var i = 0; i < oData.length; i++) {
							json.push({
								key: oData[i].TypeValue,
								Text: oData[i].Typesname
							});
						}
						var ojsonmodel = new sap.ui.model.json.JSONModel();
						ojsonmodel.setData(json);
						that.getView().setModel(ojsonmodel, "AccountTypeDD");
					}
				},
				error: function (error) {
					BusyDialog.close();
					oPPCCommon.dialogErrorMessage(error, oUtilsI18n.getText("common.Dialog.Error.ServiceError.Header"));
				}
			});

		},
		formatImageStatusState: function (fValue) {
			var state;
			if (fValue == '01') // Pending
			{
				state = "Warning";
				return state;
			}
			if (fValue == '20') // Pending
			{
				state = "Warning";
				return state;
			}
			if (fValue == '10') // Pending
			{
				state = "Error";
				return state;
			}
			if (fValue == '02') //Rejected
			{
				state = "Error";
				return state;
			}
			if (fValue == "03" || fValue == "30") // Approved
			{
				state = "Success";
				return state;
			}

		},
		getDocumentTypeDD1: function () {
			var that = this;
			var oModelData = this.getView().getModel("PCGWHANA");
			var oFilter = [];
			oFilter = oPPCCommon.setODataModelReadFilter(this.getView(), "", oFilter, "AggregatorID", sap.ui.model.FilterOperator.EQ, [
				"AGGRBIL"
			], false, false, false);
			oModelData.read("/DocumentTypes", {
				filters: oFilter,
				success: function (oData) {
					var json = new sap.ui.model.json.JSONModel(oData.results);
					that.getView().setModel(json, "DoumentTypesDD");
				},
				error: function () {
					var json = new sap.ui.model.json.JSONModel([]);
					that.getView().setModel(json, "DoumentTypesDD");
				}
			});
		},
	});
});