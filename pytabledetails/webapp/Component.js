/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */
var gObjectPageLayoutID;
var gCreateObjectDetail;
var gDetailObjectHeader;
var gDetailBusiness;
var gDetailBasic;
sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "pytabledetails/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("pytabledetails.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                var sAppModulePath = jQuery.sap.getModulePath("pytabledetails")
                jQuery.sap.includeStyleSheet("css/style.css");
                jQuery.sap.registerModulePath("com.arteriatech.ppc.utils",sAppModulePath + "/ppcutil/utils/");
                jQuery.sap.registerModulePath("com.arteriatech.ss.utils",sAppModulePath + "/ssutil/utils/");

                var oPpcutili18n = new sap.ui.model.resource.ResourceModel({
                    bundleUrl: sAppModulePath + "/ppcutil/utils/i18n/i18n.properties",
                    supportedLocales: [""],
                    fallbackLocale: ""
                });

                this.setModel(oPpcutili18n,"ppcutili18n")
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);