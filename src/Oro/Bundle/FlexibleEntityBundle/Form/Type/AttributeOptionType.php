<?php
namespace Oro\Bundle\FlexibleEntityBundle\Form\Type;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;

use Symfony\Component\Form\FormBuilderInterface;

use Symfony\Component\Form\AbstractType;

/**
 * Type for option attribute form (independent of persistence)
 *
 * @author    Romain Monceau <romain@akeneo.com>
 * @copyright 2012 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/MIT MIT
 *
 */
class AttributeOptionType extends AbstractType
{

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $this->addFieldId($builder);

        $this->addFieldSortOrder($builder);

        $this->addFieldTranslatable($builder);

        $this->addFieldOptionValues($builder);

        $this->addFieldDefaultValue($builder);
    }

    /**
     * Add field id to form builder
     * @param FormBuilderInterface $builder
     */
    protected function addFieldId(FormBuilderInterface $builder)
    {
        $builder->add('id', 'hidden');
    }

    /**
     * Add field sort_order to form builder
     * @param FormBuilderInterface $builder
     */
    protected function addFieldSortOrder(FormBuilderInterface $builder)
    {
        $builder->add('sort_order', 'integer', array('required' => false));
    }

    /**
     * Add field translatable to form builder
     * @param FormBuilderInterface $builder
     */
    protected function addFieldTranslatable(FormBuilderInterface $builder)
    {
        $builder->add('translatable', null, array('required' => false));
    }

    /**
     * Add options values to form builder
     * @param FormBuilderInterface $builder
     */
    protected function addFieldOptionValues(FormBuilderInterface $builder)
    {
        $builder->add(
            'optionValues',
            'collection',
            array(
                'type'         => new AttributeOptionValueType(),
                'allow_add'    => true,
                'allow_delete' => true,
                'by_reference' => false
            )
        );
    }

    /**
     * Add default value to form builder
     * @param FormBuilderInterface $builder
     */
    protected function addFieldDefaultValue(FormBuilderInterface $builder)
    {
        $builder->add('defaultValue');
    }

    /**
     * {@inheritdoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'Oro\Bundle\FlexibleEntityBundle\Entity\AttributeOption'
            )
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'oro_flexibleentity_attribute_option';
    }
}
