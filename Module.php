<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MastodonIntegrator;

use Aurora\Modules\Core\Models\User;

/**
 * Adds ability to work with Mastodon.
 *
 * @license https://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
 * @license https://afterlogic.com/products/common-licensing Afterlogic Software License
 * @copyright Copyright (c) 2023, Afterlogic Corp.
 *
 * @package Modules
 */
class Module extends \Aurora\System\Module\AbstractModule
{
    /***** private functions *****/
    /**
     * Initializes Mastodon Module.
     *
     * @ignore
     */
    public function init()
    {
        $this->subscribeEvent('CpanelIntegrator::DeleteAliases::after', array($this, 'onAfterDeleteAliases'));
    }

    protected function getClient()
    {
        $oAuth = new \Colorfield\Mastodon\MastodonOAuth(
            $this->getConfig('AppName'),
            $this->getConfig('AppInstance')
        );
        $oAuth->config->setClientId($this->getConfig('ClientKey'));
        $oAuth->config->setClientSecret($this->getConfig('ClientSecret'));
        $oAuth->config->setBearer($this->getConfig('AccessToken'));

        return new \Colorfield\Mastodon\MastodonAPI($oAuth->config);
    }

    protected function getUserWithMastodonAccount($sEmail)
    {
        return User::firstWhere('Properties->'.$this->GetName() . '::Email', $sEmail);
    }

    protected function suspendMastodonAccountByUser($oUser)
    {
        $bResult = false;
        if (isset($oUser->{self::GetName().'::IdAccount'})) {
            $oClient = $this->getClient();
            $aResult = $oClient->getResponse('/admin/accounts/' . $oUser->{self::GetName().'::IdAccount'} . '/action', 'post', [
                'type' => 'suspend'
            ]);

            if (isset($aResult['error'])) {
                throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
            } else {
                $oUser->setExtendedProp(self::GetName().'::Suspended', true);
                $oUser->save();
                $bResult = true;
            }
        }
        return $bResult;
    }

    protected function unsuspendMastodonAccountByUser($oUser)
    {
        $bResult = false;
        if (isset($oUser->{self::GetName().'::IdAccount'})) {
            $oClient = $this->getClient();
            $aResult = $oClient->getResponse('/admin/accounts/' . $oUser->{self::GetName().'::IdAccount'} . '/unsuspend', 'post', []);

            if (isset($aResult['error'])) {
                throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
            } else {
                $oUser->setExtendedProp(self::GetName().'::Suspended', false);
                $oUser->save();
                $bResult = true;
            }
        }
        return $bResult;
    }

    public function onAfterDeleteAliases($aArgs, $mResult)
    {
        if (isset($aArgs['Aliases'])) {
            foreach ($aArgs['Aliases'] as $sAlias) {
                $oUser = $this->getUserWithMastodonAccount($sAlias);
            }
        }
    }

    /***** private functions *****/

    /***** public functions might be called with web API *****/
    /**
     * Obtains list of module settings for authenticated user.
     *
     * @return array
     */
    public function GetSettings()
    {
        $aResult = array();
        \Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::Anonymous);

        $oUser = \Aurora\System\Api::getAuthenticatedUser();
        if ($oUser && $oUser->Role === \Aurora\System\Enums\UserRole::SuperAdmin) {
            $aResult = [
                'ClientKey' => $this->getConfig('ClientKey', ''),
                'ClientSecret' => $this->getConfig('ClientSecret', ''),
                'AccessToken' => $this->getConfig('AccesToken', '')
            ];
        }

        if ($oUser && $oUser->isNormalOrTenant()) {
            if (!empty($oUser->{self::GetName().'::Token'})) {
                $aResult = [
                    'AccountUsername' => $oUser->{self::GetName().'::Username'},
                    'AccountEmail' => $oUser->{self::GetName().'::Email'},
                    'AccountSuspended' => $oUser->{self::GetName().'::Suspended'},
                    'AccountConfirmed' => $this->IsMastodonAccountConfirmed()
                ];
            }
        }

        return $aResult;
    }

    /**
     * Updates settings.
     *
     * @throws \Aurora\System\Exceptions\ApiException
     */
    public function UpdateSettings($ClientKey, $ClientSecret, $AccesToken)
    {
        \Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);

        try {
            $this->setConfig('ClientKey', $ClientKey);
            $this->setConfig('ClientSecret', $ClientSecret);
            $this->setConfig('AccesToken', $AccesToken);
            $this->saveModuleConfig();
        } catch (\Exception $ex) {
            throw new \Aurora\System\Exceptions\ApiException(\Aurora\System\Notifications::CanNotSaveSettings);
        }

        return true;
    }

    public function RegisterMastodonAccount($Username, $Email, $Password, $Agreement = true, $Locale = 'en')
    {
        $mResult = false;
        $oClient = $this->getClient();
        $aResult = $oClient->getResponse('/accounts', 'post', [
            'username' => $Username,
            'email' => $Email,
            'password' => $Password,
            'agreement' => $Agreement,
            'locale' => $Locale
        ]);

        if (isset($aResult['error'])) {
            throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
        } else {
            $aAccountsInfo = $oClient->getResponse(
                '/admin/accounts',
                'get',
                [
                    'username' => $Username,
                    'email' => $Email
                ]
            );
            if (isset($aAccountsInfo[0])) {
                $oUser = \Aurora\System\Api::getAuthenticatedUser();
                $oUser->setExtendedProp(self::GetName().'::Username', $Username);
                $oUser->setExtendedProp(self::GetName().'::Email', $Email);
                $oUser->setExtendedProp(self::GetName().'::Token', $aResult['access_token']);
                $oUser->setExtendedProp(self::GetName().'::IdAccount', (int) $aAccountsInfo[0]['id']);
                $oUser->save();

                $mResult = true;
            }
        }

        return $mResult;
    }

    public function SuspendMastodonAccount()
    {
        return $this->suspendMastodonAccountByUser(
            \Aurora\System\Api::getAuthenticatedUser()
        );
    }

    public function UnsuspendMastodonAccount()
    {
        return $this->unsuspendMastodonAccountByUser(
            \Aurora\System\Api::getAuthenticatedUser()
        );
    }

    public function IsMastodonAccountConfirmed()
    {
        $mResult = false;
        $oClient = $this->getClient();
        $oUser = \Aurora\System\Api::getAuthenticatedUser();
        $aResult = $oClient->getResponse('/admin/accounts/' . $oUser->{self::GetName().'::IdAccount'}, 'get', []);

        if (isset($aResult['error'])) {
            throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
        } else {
            $mResult = isset($aResult['confirmed']) ? $aResult['confirmed'] : false;
        }

        return $mResult;
    }

    public function LoginToMastodonAccount($Username, $Password)
    {
        $oAuth = new \Colorfield\Mastodon\MastodonOAuth(
            $this->getConfig('AppName'),
            $this->getConfig('AppInstance')
        );
        $oAuth->config->setClientId($this->getConfig('ClientKey'));
        $oAuth->config->setClientSecret($this->getConfig('ClientSecret'));
        $oAuth->config->setBearer($this->getConfig('AccessToken'));
        $oAuth->config->setScopes(['read', 'write', 'follow']);

        return $oAuth->getAuthorizationUrl();
    }

    public function ChangeMastodonAccountPassword($NewPassword)
    {
        $oUser = \Aurora\System\Api::getAuthenticatedUser();
        if (isset($oUser->{self::GetName().'::IdAccount'})) {
            return $this->LoginToMastodonAccount($oUser->{self::GetName().'::Username'}, $NewPassword);
        }
    }

    public function SendPostMessage($Message, $Direct = false)
    {
        $mResult = false;
        $oUser = \Aurora\System\Api::getAuthenticatedUser();
        if (isset($oUser->{self::GetName().'::IdAccount'})) {
            $oClient = $this->getClient();
            $options = [
                'status' => $Message,
            ];
            if ($Direct) {
                $options['visibility'] = 'direct';
            }
            $aResult = $oClient->getResponse('/statuses', 'post', $options, $oUser->{self::GetName().'::Token'});
            if (isset($aResult['error'])) {
                throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
            } else {
                $mResult = true;
            }
        }

        return $mResult;
    }
    /***** public functions might be called with web API *****/
}
