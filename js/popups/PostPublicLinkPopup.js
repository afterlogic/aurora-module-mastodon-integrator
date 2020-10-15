'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),

	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),

	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js')
;

/**
 * @constructor
 */
function CPostPublicLinkPopup()
{
	CAbstractPopup.call(this);

	this.private = ko.observable(false);
	this.message = ko.observable('');
}

_.extendOwn(CPostPublicLinkPopup.prototype, CAbstractPopup.prototype);

CPostPublicLinkPopup.prototype.PopupTemplate = '%ModuleName%_PostPublicLinkPopup';

CPostPublicLinkPopup.prototype.onOpen = function (sPublicLink)
{
	this.private(false);
	this.message('Hi! Look at my file from the link: \n\n' + sPublicLink);
};

CPostPublicLinkPopup.prototype.publishPost = function ()
{
	Ajax.send(
		'%ModuleName%',
		'SendPostMessage',
		{
			'Message': this.message(),
			'Direct': this.private()
		},
		function (oResponse, oRequest) {
			if (oResponse.Result)
			{
				Screens.showReport(TextUtils.i18n('%MODULENAME%/REPORT_PUBLISH_POST'));
			}
			else
			{
				Api.showErrorByCode(oResponse, TextUtils.i18n('%MODULENAME%/ERROR_PUBLISH_POST'));
			}
		},
		this
	);
	this.closePopup();
};

module.exports = new CPostPublicLinkPopup();