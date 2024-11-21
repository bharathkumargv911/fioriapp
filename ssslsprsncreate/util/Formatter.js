jQuery.sap.declare("com.arteriatech.ss.slsprsn.create.util.Formatter");
jQuery.sap.require("sap.ca.ui.model.format.AmountFormat");
jQuery.sap.require('sap.m.MessageBox');
jQuery.sap.require("sap.ca.ui.message.message");  
jQuery.sap.require("sap.ui.core.format.NumberFormat");
//date format from Json format
com.arteriatech.ss.slsprsn.create.util.Formatter = {};


com.arteriatech.ss.slsprsn.create.util.Formatter.toInteger=function (stringVal){
	if(stringVal != null)
	{
		return parseInt(stringVal);
	}
};