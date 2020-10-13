'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),

	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),

	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js')
;

/**
 * @constructor
 */
function CEnterPasswordPopup()
{
	CAbstractPopup.call(this);

	this.newPassword = ko.observable('');
	this.fCallback = null;
}

_.extendOwn(CEnterPasswordPopup.prototype, CAbstractPopup.prototype);

CEnterPasswordPopup.prototype.PopupTemplate = '%ModuleName%_EnterPasswordPopup';

CEnterPasswordPopup.prototype.onOpen = function (fCallback)
{
	this.newPassword('');
	this.fCallback = fCallback;
};

CEnterPasswordPopup.prototype.enterPassword = function ()
{
	if (!Types.isNonEmptyString(this.newPassword()))
	{
		Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_PASSWORD_EMPTY'));
		return;
	}
	if (_.isFunction(this.fCallback))
	{
		this.fCallback(this.newPassword());
	}
	this.closePopup();
};

module.exports = new CEnterPasswordPopup();
