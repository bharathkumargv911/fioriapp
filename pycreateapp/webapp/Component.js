/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */
var gObjectPageLayoutID;
var gDetailPageBasic;
var gDetailBusiness1;
var gDetailBusiness2;
sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "pycreateapp/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("pycreateapp.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                var sAppModulePath = jQuery.sap.getModulePath("pycreateapp")
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