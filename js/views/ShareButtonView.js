'use strict';

var
	UrlUtils = require('%PathToCoreWebclientModule%/js/utils/Url.js')
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
	console.log('this.sPublicLink', this.sPublicLink);
};

СShareButtonView.prototype.setPublicLink = function (sPublicLink)
{
	this.sPublicLink = UrlUtils.getAppPath() + sPublicLink;
};

module.exports = new СShareButtonView();
