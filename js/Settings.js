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
		}
	},
	
	updateAccount: function (sAccountUsername, sAccountEmail)
	{
		this.AccountUsername = sAccountUsername;
		this.AccountEmail = sAccountEmail;
	},

	/**
	 * Updates settings that is edited by administrator.
	 * 
	 * @param {boolean} bEnableModule New value of EnableModule parameter.
	 * @param {string} sId New value of Id parameter.
	 * @param {string} sSecret New value of Secret parameter.
	 * @param {array} aScopes New value of Scopes parameter.
	 */
	updateAdmin: function (bEnableModule, sId, sSecret, aScopes)
	{
		this.EnableModule = bEnableModule;
		this.Id = sId;
		this.Secret = sSecret;
		this.Scopes = aScopes;
	}
};
