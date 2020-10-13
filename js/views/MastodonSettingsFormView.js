'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),
	ko = require('knockout'),
	
	AddressUtils = require('%PathToCoreWebclientModule%/js/utils/Address.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	UrlUtils = require('%PathToCoreWebclientModule%/js/utils/Url.js'),
	
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	WindowOpener = require('%PathToCoreWebclientModule%/js/WindowOpener.js'),
	UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js'),

	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	ConfirmPopup = require('%PathToCoreWebclientModule%/js/popups/ConfirmPopup.js'),

	CAbstractSettingsFormView = ModulesManager.run('SettingsWebclient', 'getAbstractSettingsFormViewClass'),
	
	Settings = require('modules/%ModuleName%/js/Settings.js')
;

/**
* @constructor
*/
function CMastodonSettingsFormView()
{
	CAbstractSettingsFormView.call(this, Settings.ServerModuleName);
	
	this.accountExist = ko.observable(false);
	this.emails = ko.observableArray([]);
	this.selectedEmail = ko.observable('');
	this.password = ko.observable('');
}

_.extendOwn(CMastodonSettingsFormView.prototype, CAbstractSettingsFormView.prototype);

CMastodonSettingsFormView.prototype.ViewTemplate = '%ModuleName%_MastodonSettingsFormView';

CMastodonSettingsFormView.prototype.onShow = function ()
{
	this.accountExist(false);
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
				this.accountExist(true);
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
	console.log('changeMastodonAccountPassword');
};

CMastodonSettingsFormView.prototype.removeMastodonAccount = function ()
{
	Popups.showPopup(ConfirmPopup, [TextUtils.i18n('%MODULENAME%/CONFIRM_REMOVE_ACCOUNT'), 
		_.bind(function (bOk) {
			if (bOk)
			{
				this.closeComposesWithDraftUids(aUids);
				fMoveMessages();
			}
			this.disableComposeAutosave(false);
		}, this), 
		'', TextUtils.i18n('%MODULENAME%/ACTION_CLOSE_DELETE_DRAFT')
	]);
};

module.exports = new CMastodonSettingsFormView();
