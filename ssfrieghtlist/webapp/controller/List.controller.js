sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/arteriatech/ppc/utils/js/Common",
	"com/arteriatech/ss/utils/js/Common",
	"com/arteriatech/ss/utils/js/UserMapping",
	"com/arteriatech/ss/utils/js/CommonValueHelp",
	"sap/ui/model/json/JSONModel"
], function (Controller, oPPCCommon, oSSCommon, oSSUserMapping, oSSCommonValueHelp, JSONModel) {
	"use strict";
	var busyDialog = new sap.m.BusyDialog();
	var obusyDialog = new sap.m.BusyDialog();
	var oi18n = "",
		oUtilsI18n = "";
	var Device = sap.ui.Device;
	var Pusers;

	var taskData = [];
	var count = 0;
	var count1 = 0;
	return Controller.extend("com.arteriatech.ssfrieghtlist.controller.List", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.arteriatech.ssfrieghtlist.view.List
		 */
		onInit: function () {
			this.onInitHookUp();
		},
		onInitHookUp: function () {
			gList = this.getView();
			this._oView = this.getView();
			oPPCCommon.initMsgMangerObjects();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			oi18n = this._oComponent.getModel("i18n").getResourceBundle();
			oUtilsI18n = this._oComponent.getModel("ppcutili18n").getResourceBundle();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);

		},
		onRouteMatched: function (oEvent) {
			var that = this;
			if (oEvent.getParameter("name") !== "List" && oEvent.getParameter("name") !== "ListPage") {
				return;
			}
			this.setDefaultSettings();
			// this.setOnBoardingStatusDD();
			// this.setOnBoardingApprovalStatusDD();
			// this.getCreatedOnDateDDValues();
			// if (oPPCCommon.getFLPTileAction().split("&")[0] === "ApprovalView") {
			if (true) {
				this.getTaskCollections();
				this.getView().getModel("LocalViewSetting").setProperty("/ApprovalView", true);
				this.getView().getModel("LocalViewSetting").setProperty("/ListView", false);
			} else {
				this.getCreatedOnDateDDValues();
				this.getView().getModel("LocalViewSetting").setProperty("/ApprovalView", false);
				this.getView().getModel("LocalViewSetting").setProperty("/ListView", true);
			}

		},
		setDefaultSettings: function () {

			var data = {
				tableCount: 0,
				ApprovalView: false,
				ListView: true,
				ItemsCount: 0,
				StatusID: ""
			};
			var model = new sap.ui.model.json.JSONModel(data);
			this.getView().setModel(model, "LocalViewSetting");
		},
		getTaskCollections: function (callback) {

			// oPPCCommon.removeAllMsgs();
			var that = this;
			busyDialog.open();
			// var aFilters = [];
			taskData = [];
			count = 0;
			count1 = 0;
			// isValidCount = 0; //for approve validation
			// approveFlag = true; //for approve validation
			// instancrArr = []; //for approve validation
			var oDataModel = that._oComponent.getModel("tcm");

			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["Ready"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["RESERVED"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["IN_PROGRESS"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["EXECUTED"], false, false, false);
			// aFilters = oPPCCommon.setODataModelReadFilter(this.getView, "", aFilters, "Status", sap.ui.model.FilterOperator
			// 	.EQ, ["RUNNING"], false, false, false);

			oDataModel.read("/TaskCollection", {
				// filters: aFilters,
				success: function (oData) {
					var VData = oData.results;
					var aData = [];
					for (var z = 0; z < VData.length; z++) {
						if (VData[z].TaskDefinitionName === "Onboarding Frieght Approve") {
							aData.push(VData[z]);
						}
					}
					var oComparisionsModel = new JSONModel();
					if (aData.length > 0) {
						for (var i = 0; i < aData.length; i++) {
							aData[i].CreatedTime = that.Time(aData[i].CreatedOn);
							aData[i].CreatedOnDate = aData[i].CreatedOn.getFullYear() + "-" + (aData[i].CreatedOn.getMonth() + 1) + "-" + aData[i].CreatedOn
								.getDate();
						}
						aData.sort(function (a, b) {
							return new Date(b.CreatedOnDate + " " + b.CreatedTime) - new Date(a.CreatedOnDate + " " + a.CreatedTime);
						});
						oComparisionsModel.setData(aData);
						/** Set Model to the view */

						that.getView().setModel(oComparisionsModel, "TasksModel");
						count = aData.length;
						for (var j = 0; j < aData.length; j++) {
							that.getDescisionTasks(aData[j].InstanceID);
						}

						if (callback) {
							callback();
						}
						that.getView().setBusy(false);

					} else {
						oComparisionsModel.setData([]);
						that.getView().setModel(oComparisionsModel, "TasksModel");
						gList.setModel(oComparisionsModel, "ListItems");
						that.getView().setBusy(false);
						busyDialog.close();
						if (callback) {
							callback();
						}
					}

				},
				error: function (error) {
					// oDialog.close();
					busyDialog.close();
					that.getView().setBusy(false);
					// that.closeBusyDialog();

				}
			});
		},

		getDescisionTasks: function (InstanceID) {
			var taskId;
			var that = this;
			// that.getView().setBusy(true);

			taskId = InstanceID;

			var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context");
			contextModel.attachRequestCompleted(function (oEvent) {
				contextModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
				var oTasksModel = new sap.ui.model.json.JSONModel();
				contextModel.oData.InstanceID = taskId;
				oTasksModel.setData(contextModel.oData);
				count1 = count1 + 1;
				taskData.push(contextModel.oData);
				if (count1 === count) {
					that.setListData();
				}
				// that.setBPReqModel(contextModel.oData.ChannelPartners[0].StateID);

				this.getView().setModel(oTasksModel, "TaskInstances");
				// that.setDeliveryData(contextModel.oData.deliveryDetails);

				// that.getUserProfiles();
				// that.setBPReqsData(contextModel.oData);

				// that.getView().setBusy(false);

			}, this);

		},

		setListData: function () {
			var tempArr = [];
			for (var i = 0; i < taskData.length; i++) {

				var taskTitle = "Approve OnBording for " + taskData[i].header.CPName + " (" + taskData[i].header.CPNo + ")";

				taskData[i].taskTitle = taskTitle;

				// var obj = {
				// 	"taskTitle": taskTitle,
				// 	"EntityType": taskData[i].EntityType,
				// 	"instanceGuid": taskData[i].instanceGuid,
				// 	"EntityTypeDesc": taskData[i].EntityTypeDesc,
				// 	"InstanceID": taskData[i].InstanceID,
				// 	"StatusID": taskData[i].StatusID
				// };
				tempArr.push(taskData[i]);
				contextData.push(taskData[i]);
			}
			var oDataModel = new sap.ui.model.json.JSONModel();
			oDataModel.setData(tempArr);
			gList.setModel(oDataModel, "ListItems");

			busyDialog.close();
			this.getView().getModel("LocalViewSetting").setProperty("/tableCount", tempArr.length);
			// if (tempArr.length < 10) {
			// 	this.getView().getModel("LocalViewSetting").setProperty("/tableCount", tempArr.length);
			// } else {
			// 	this.getView().getModel("LocalViewSetting").setProperty("/tableCount", 10);
			// }

		},
		gotoDetails: function (oEvent) {
			var path = "";
			var oModelContext = oEvent.getSource().getBindingContext("ListItems");
			var path = oEvent.getSource().getBindingContext("ListItems").getPath();
			var idx = parseInt(path.substring(path.lastIndexOf("/") + 1), 10);
			gList.setBusy(true);
			if (oModelContext.getProperty("header/CPGUID")) {
				if (oModelContext.getProperty("header/CPGUID") !== undefined && oModelContext.getProperty("header/CPGUID") !== "" && oModelContext
					.getProperty(
						"header/CPGUID") !== null) {
					path = "ChannelPartners(CP_GUID=guid'" + oModelContext.getProperty("header/CPGUID") + "'),index=" + idx + "";
					this._oRouter.navTo("DetailPage", {
						contextPath: path
					}, false);
				} else {
					var msg = "CP_GUID is Undefined";
					oPPCCommon.displayMsg_MsgBox(this.getView(), msg, "error");
					return;
				}
			} else {
				var msg = "CP_GUID is Undefined";
				oPPCCommon.displayMsg_MsgBox(this.getView(), msg, "error");
				return;
			}

			if (this.gotoDetails_Exit) {
				this.gotoDetails_Exit(oEvent);
			}
		},
		Time: function (fValue) {
			if (fValue) {
				var date = new Date(fValue);
				var timeinmiliseconds = date.getTime();
				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HH:mm:ss"
				});
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timeStr = timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
				return timeStr;
			} else {
				return fValue;
			}
		},
		getCreatedOnDateDDValues: function () {
			var sDateRange = oSSCommon.getProductFeatureValue({
				Types: "DTRNGCHK"
			});
			this.SODateDifference = sDateRange;
			this.PreviousSelectedKeySODate = this.SODateDifference;
			var oneMonthBackDate = oPPCCommon.getCurrentDate();
			oneMonthBackDate.setDate(oneMonthBackDate.getDate() + parseInt(this.SODateDifference));
			this.CreateOn = {
				FromDate: oneMonthBackDate,
				ToDate: oPPCCommon.getCurrentDate()
			};
			/*for SO Date*/
			if (this.getView().getModel("SOCreatedOnDateViewSetting")) {
				this.getView().getModel("SOCreatedOnDateViewSetting").setProperty("/", {});
			}
			var oDataDate = [{
				DateKey: "",
				DateDesc: "Any"
			}, {
				DateKey: "0",
				DateDesc: "Today"
			}, {
				DateKey: "-1",
				DateDesc: "Today and Yesterday"
			}, {
				DateKey: "-7",
				DateDesc: "Last Seven Days"
			}, {
				DateKey: "-30",
				DateDesc: "Last One Month"
			}, {
				DateKey: "MS",
				DateDesc: "Manual Selection"
			}];
			oPPCCommon.getDateDropDownValue(oDataDate, this, "inputCreatedOnDate", "SOCreatedOnDateViewSetting", this.SODateDifference);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.arteriatech.ssfrieghtlist.view.List
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.arteriatech.ssfrieghtlist.view.List
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.arteriatech.ssfrieghtlist.view.List
		 */
		//	onExit: function() {
		//
		//	}

	});

});