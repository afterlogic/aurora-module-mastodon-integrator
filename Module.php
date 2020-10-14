<?php
/**
 * This code is licensed under AGPLv3 license or Afterlogic Software License
 * if commercial version of the product was purchased.
 * For full statements of the licenses see LICENSE-AFTERLOGIC and LICENSE-AGPL3 files.
 */

namespace Aurora\Modules\MastodonIntegrator;

/**
 * Adds ability to work with Mastodon.
 *
 * @license https://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
 * @license https://afterlogic.com/products/common-licensing Afterlogic Software License
 * @copyright Copyright (c) 2020, Afterlogic Corp.
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

	}

	protected function getClient()
	{
		$name = 'PM.Social.Dev.App';
		$instance = 'privatemail.social';
		$oAuth = new \Colorfield\Mastodon\MastodonOAuth($name, $instance);
		$oAuth->config->setClientId($this->getConfig('ClientKey'));
		$oAuth->config->setClientSecret($this->getConfig('ClientSecret'));
		$oAuth->config->setBearer($this->getConfig('AccessToken'));
		return new \Colorfield\Mastodon\MastodonAPI($oAuth->config);
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
		if (!empty($oUser) && $oUser->Role === \Aurora\System\Enums\UserRole::SuperAdmin)
		{
			$aResult = [
				'ClientKey' => $this->getConfig('ClientKey', ''),
				'ClientSecret' => $this->getConfig('ClientSecret', ''),
				'AccessToken' => $this->getConfig('AccesToken', '')
			];
		}

		if (!empty($oUser) && $oUser->isNormalOrTenant())
		{
		}

		return $aResult;
	}

	/**
	 * Updates settings.
	 *
	 * @throws \Aurora\System\Exceptions\ApiException
	 */
	public function UpdateSettings()
	{
		\Aurora\System\Api::checkUserRoleIsAtLeast(\Aurora\System\Enums\UserRole::TenantAdmin);

		try
		{
			$this->setConfig('ClientKey', $ClientKey);
			$this->setConfig('ClientSecret', $ClientSecret);
			$this->setConfig('AccesToken', $AccesToken);
			$this->saveModuleConfig();
		}
		catch (\Exception $ex)
		{
			throw new \Aurora\System\Exceptions\ApiException(\Aurora\System\Notifications::CanNotSaveSettings);
		}

		return true;
	}

	public function RegisterMastodonAccount($Username, $Email, $Password, $Agreement = true, $Locale = 'en')
	{
		$oClient = $this->getClient();
		$aResult = $oClient->post('/accounts', [
			'username' => $Username,
			'email' => $Email,
			'password' => $Password,
			'agreement' => $Agreement,
			'locale' => $Locale
		]);

		if (isset($aResult['error']))
		{
			throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
		}
		else
		{
			return true;
		}
	}

	public function RemoveMastodonAccount()
	{
		$oClient = $this->getClient();
		$aResult = $oClient->post('/accounts', [
			'username' => $Username,
			'email' => $Email,
			'password' => $Password,
			'agreement' => $Agreement,
			'locale' => $Locale
		]);

		if (isset($aResult['error']))
		{
			throw new \Aurora\System\Exceptions\ApiException(0, null, $aResult['error']);
		}
		else
		{
			return true;
		}
	}

	public function ChangeMastodonAccountPassword($NewPassword)
	{

	}
	/***** public functions might be called with web API *****/
}
