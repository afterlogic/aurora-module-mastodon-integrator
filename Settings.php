<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MastodonIntegrator;

use Aurora\System\SettingsProperty;

/**
 * @property bool $Disabled
 * @property string $AppName
 * @property string $AppInstance
 * @property string $ClientKey
 * @property string $ClientSecret
 * @property string $AccessToken
 */

class Settings extends \Aurora\System\Module\Settings
{
    protected function initDefaults()
    {
        $this->aContainer = [
            "Disabled" => new SettingsProperty(
                false,
                "bool",
                null,
                "",
            ),
            "AppName" => new SettingsProperty(
                "",
                "string",
                null,
                "",
            ),
            "AppInstance" => new SettingsProperty(
                "",
                "string",
                null,
                "",
            ),
            "ClientKey" => new SettingsProperty(
                "",
                "string",
                null,
                "",
            ),
            "ClientSecret" => new SettingsProperty(
                "",
                "string",
                null,
                "",
            ),
            "AccessToken" => new SettingsProperty(
                "",
                "string",
                null,
                "",
            ),
        ];
    }
}
