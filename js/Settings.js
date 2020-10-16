'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
;

module.exports = {
	ServerModuleName: 'Mastodon',
	HashModuleName: 'mastodon',
	
	AccountUsername: '',
	AccountEmail: '',
	AccountSuspended: false,
	
	/**
	 * Initializes settings from AppData object sections.
	 * 
	 * @param {Object} oAppData Object contained modules settings.
	 */
	init: function (oAppData)
	{
		var oAppDataSection = oAppData['%ModuleName%'];
		
		if (!_.isEmpty(oAppDataSection))
		{
			this.AccountUsername = Types.pString(oAppDataSection.AccountUsername, this.AccountUsername);
			this.AccountEmail = Types.pString(oAppDataSection.AccountEmail, this.AccountEmail);
			this.AccountSuspended = Types.pBool(oAppDataSection.AccountSuspended, this.AccountSuspended);
		}
	},
	
	setAccountSuspended: function ()
	{
		this.AccountSuspended = true;
	}
};
