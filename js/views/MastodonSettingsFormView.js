'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	AddressUtils = require('%PathToCoreWebclientModule%/js/utils/Address.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),
	UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js'),

	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	ConfirmPopup = require('%PathToCoreWebclientModule%/js/popups/ConfirmPopup.js'),
	EnterPasswordPopup = require('modules/%ModuleName%/js/popups/EnterPasswordPopup.js'),

	CAbstractSettingsFormView = ModulesManager.run('SettingsWebclient', 'getAbstractSettingsFormViewClass'),
	
	Settings = require('modules/%ModuleName%/js/Settings.js')
;

/**
* @constructor
*/
function CMastodonSettingsFormView()
{
	CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
	
	this.accountFullname = ko.observable(AddressUtils.getFullEmail(Settings.AccountUsername, Settings.AccountEmail));
	this.accountExists = ko.computed(function () {
		return Types.isNonEmptyString(this.accountFullname());
	}, this);
	this.hint = ko.computed(function () {
		if (this.accountExists())
		{
			return TextUtils.i18n('%MODULENAME%/HINT_YOUR_ACCOUNT', {
				'FULLEMAIL': this.accountFullname()
			});
		}
		return TextUtils.i18n('%MODULENAME%/HINT_NO_ACCOUNT');
	}, this);
	console.log('this.hint', this.hint());
	this.hint.subscribe(function () {
		console.log('this.hint', this.hint());
	}, this);
	this.emails = ko.observableArray([]);
	this.selectedEmail = ko.observable('');
	this.password = ko.observable('');
}

_.extendOwn(CMastodonSettingsFormView.prototype, CAbstractSettingsFormView.prototype);

CMastodonSettingsFormView.prototype.ViewTemplate = '%ModuleName%_MastodonSettingsFormView';

CMastodonSettingsFormView.prototype.onShow = function ()
{
	this.accountFullname(AddressUtils.getFullEmail(Settings.AccountUsername, Settings.AccountEmail));
	this.emails(ModulesManager.run('MailWebclient', 'getAllAccountsFullEmails'));
	this.selectedEmail('');
	this.password('');
};

CMastodonSettingsFormView.prototype.createMastodonAccount = function ()
{
	var
		oEmailParts = AddressUtils.getEmailParts(this.selectedEmail()),
		sUsername = oEmailParts.name
	;
	if (!Types.isNonEmptyString(sUsername))
	{
		sUsername = oEmailParts.email.split('@')[0];
	}
	if (!Types.isNonEmptyString(this.password()))
	{
		Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_PASSWORD_EMPTY'));
		return;
	}
	Ajax.send(
		'%ModuleName%',
		'RegisterMastodonAccount',
		{
			'Username': sUsername,
			'Email': oEmailParts.email,
			'Password': this.password(),
			'Agreement': true,
			'Locale': UserSettings.ShortLanguage
		},
		function (oResponse, oRequest) {
			if (oResponse.Result)
			{
				Settings.updateAccount(oRequest.Parameters.Username, oRequest.Parameters.Email);
				this.accountFullname(AddressUtils.getFullEmail(Settings.AccountUsername, Settings.AccountEmail));
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_REGISTER_ACCOUNT'));
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_REGISTER_ACCOUNT'));
			}
		},
		this
	);
};

CMastodonSettingsFormView.prototype.changeMastodonAccountPassword = function ()
{
	Popups.showPopup(EnterPasswordPopup, [
		_.bind(function (sNewPassword) {
			if (Types.isNonEmptyString(sNewPassword))
			{
				Ajax.send(
					'%ModuleName%',
					'ChangeMastodonAccountPassword',
					{
						'NewPassword': sNewPassword
					},
					function (oResponse, oRequest) {
						if (oResponse.Result)
						{
							Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_CHANGE_PASSWORD_ACCOUNT'));
						}
						else
						{
							Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_CHANGE_PASSWORD_ACCOUNT'));
						}
					},
					this
				);
			}
		}, this)
	]);
};

CMastodonSettingsFormView.prototype.removeMastodonAccount = function ()
{
	Popups.showPopup(ConfirmPopup, [TextUtils.i18n('%MODULENAME%/CONFIRM_REMOVE_ACCOUNT'), 
		_.bind(function (bOk) {
			if (bOk)
			{
				Ajax.send(
					'%ModuleName%',
					'RemoveMastodonAccount',
					{},
					function (oResponse, oRequest) {
						if (oResponse.Result)
						{
							Settings.updateAccount('', '');
							this.accountFullname(AddressUtils.getFullEmail(Settings.AccountUsername, Settings.AccountEmail));
							Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_REMOVE_ACCOUNT'));
						}
						else
						{
							Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_REMOVE_ACCOUNT'));
						}
					},
					this
				);
			}
		}, this), 
		'', TextUtils.i18n('%MODULENAME%/ACTION_REMOVE_MASTODON_ACCOUNT')
	]);
};

module.exports = new CMastodonSettingsFormView();
