'use strict';

module.exports = function (oAppData) {
	var
		TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
		Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
				
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		
		Settings = require('modules/%ModuleName%/js/Settings.js')
	;

	Settings.init(oAppData);

	if (App.isUserNormalOrTenant())
	{
		return {
			start: function (ModulesManager) {
				ModulesManager.run('SettingsWebclient', 'registerSettingsTab', [
					function () { return require('modules/%ModuleName%/js/views/MastodonSettingsFormView.js'); },
					Settings.HashModuleName,
					TextUtils.i18n('%MODULENAME%/LABEL_SETTINGS_TAB')
				]);
				App.subscribeEvent('OpenPgpFilesWebclient::OpenSharePopup::after', function (oParams) {
					var oItemProps = oParams && oParams.Item && oParams.Item.oExtendedProps;
					// Show PM.Social button if user has PM.Social account and public link was secured by OpenPgp key (not password)
					if (Types.isNonEmptyString(Settings.AccountEmail) && oItemProps 
							&& (!Types.isNonEmptyString(oItemProps.PasswordForSharing) && !Types.isNonEmptyString(oItemProps.PublicLinkPgpEncryptionMode) 
							|| oItemProps.PublicLinkPgpEncryptionMode === Enums.EncryptionBasedOn.Key))
					{
						var oShareButtonView = require('modules/%ModuleName%/js/views/ShareButtonView.js');
						oShareButtonView.setPublicLink(oItemProps.PublicLink);
						oParams.AddButtons.push(oShareButtonView);
					}
				});
				App.subscribeEvent('OpenPgpFilesWebclient::ShareEncryptedFile::after', function (oParams) {
					// Show PM.Social button if user has PM.Social account and public link was secured by OpenPgp key (not password)
					if (Types.isNonEmptyString(Settings.AccountEmail) && oParams.EncryptionBasedMode === Enums.EncryptionBasedOn.Key)
					{
						var oShareButtonView = require('modules/%ModuleName%/js/views/ShareButtonView.js');
						oShareButtonView.setPublicLink(oParams.EncryptedFileLink);
						oParams.AddButtons.push(oShareButtonView);
					}
				});
			}
		};
	}
	
	return null;
};
