'use strict';

var
	UrlUtils = require('%PathToCoreWebclientModule%/js/utils/Url.js'),
			
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	PostPublicLinkPopup = require('modules/%ModuleName%/js/popups/PostPublicLinkPopup.js')
;

/**
 * @constructor
 */
function СShareButtonView()
{
	this.sPublicLink = '';
}

СShareButtonView.prototype.ViewTemplate = '%ModuleName%_ShareButtonView';

СShareButtonView.prototype.shareViaPmsocial = function ()
{
	Popups.showPopup(PostPublicLinkPopup, [this.sPublicLink]);
};

СShareButtonView.prototype.setPublicLink = function (sPublicLink)
{
	var sAppPath = UrlUtils.getAppPath();
	if (sPublicLink.indexOf(sAppPath) !== -1)
	{
		this.sPublicLink = sPublicLink;
	}
	else
	{
		this.sPublicLink = UrlUtils.getAppPath() + sPublicLink;
	}
};

module.exports = new СShareButtonView();
