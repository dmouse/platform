<?php

namespace Oro\Bundle\ConfigBundle\Twig;

use Oro\Bundle\ConfigBundle\Config\UserConfigManager;

class ConfigExtension extends \Twig_Extension
{
    /**
     * @var UserConfigManager
     */
    protected $userConfigManager;

    public function __construct(UserConfigManager $userConfigManager)
    {
        $this->userConfigManager = $userConfigManager;
    }

    /**
     * Returns a list of functions to add to the existing list.
     *
     * @return array An array of functions
     */
    public function getFunctions()
    {
        return array(
            'get_user_value' => new \Twig_Function_Method($this, 'getUserValue'),
        );
    }

    /**
     * @param  string $name Setting name in "{bundle}.{setting}" format
     * @return mixed
     */
    public function getUserValue($name)
    {
        return $this->userConfigManager->get($name);
    }


    /**
     * Returns the name of the extension.
     *
     * @return string
     */
    public function getName()
    {
        return 'config_extension';
    }
}
