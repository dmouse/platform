<?php

namespace Oro\Bundle\GridBundle\Tests\Unit\Filter\ORM\Flexible;

use Oro\Bundle\FlexibleEntityBundle\Entity\AttributeOption;
use Oro\Bundle\FlexibleEntityBundle\Entity\Mapping\AbstractEntityAttributeOptionValue;

use Oro\Bundle\FilterBundle\Form\Type\Filter\ChoiceFilterType;

use Oro\Bundle\GridBundle\Filter\ORM\ChoiceFilter;
use Oro\Bundle\GridBundle\Filter\ORM\Flexible\FlexibleOptionsFilter;

class FlexibleOptionsFilterTest extends FlexibleFilterTestCase
{

    const TEST_ATTRIBUTE     = 'test_attribute';

    /**
     * {@inheritdoc}
     */
    protected function createTestFilter($flexibleRegistry)
    {
        $parentFilter = new ChoiceFilter($this->getTranslatorMock());
        return new FlexibleOptionsFilter($flexibleRegistry, $parentFilter);
    }

    public function filterDataProvider()
    {
        return array(
            'correct_equals' => array(
                'data' => array('value' => 'test', 'type' => ChoiceFilterType::TYPE_EQUAL),
                'expectRepositoryCalls' => array(
                    array('applyFilterByAttribute', array(self::TEST_FIELD, 'test', '='), null)
                )
            ),
            'incorrect' => array(
                'data' => array(),
                'expectRepositoryCalls' => array()
            )
        );
    }

    public function getRenderSettingsDataProvider()
    {
        return array(
            array(
                array('one' => 'value one', 'two' => 'value two'),
                array(
                    ChoiceFilterType::NAME,
                    array(
                        'field_options' => array(
                            'required' => false,
                            'choices' => array(
                                'one' => 'value one',
                                'two' => 'value two'
                            ),
                            'multiple' => false
                        ),
                        'show_filter' => false
                    )
                )
            )
        );
    }

    /**
     * @dataProvider getRenderSettingsDataProvider
     * @param array $flexibleOptionsData
     * @param array $expectedRenderSettings
     */
    public function testGetRenderSettings(array $flexibleOptionsData, array $expectedRenderSettings)
    {
        $this->initializeFlexibleFilter($this->model);

        $attributeRepository = $this->getMock('Doctrine\Common\Persistence\ObjectRepository');
        $attributeRepository->expects($this->once())->method('findOneBy')
            ->with(array('entityType' => self::TEST_FLEXIBLE_NAME, 'code' => self::TEST_FIELD))
            ->will($this->returnValue(self::TEST_ATTRIBUTE));

        $optionsRepository = $this->getMock('Doctrine\Common\Persistence\ObjectRepository');
        $optionsRepository->expects($this->once())->method('findBy')
            ->with(array('attribute' => self::TEST_ATTRIBUTE))
            ->will($this->returnValue($this->createFlexibleOptions($flexibleOptionsData)));

        $this->flexibleManager->expects($this->once())
            ->method('getAttributeRepository')
            ->will($this->returnValue($attributeRepository));

        $this->flexibleManager->expects($this->once())
            ->method('getAttributeOptionRepository')
            ->will($this->returnValue($optionsRepository));

        $this->assertEquals($expectedRenderSettings, $this->model->getRenderSettings());
    }

    /**
     * @param array $data
     * @return array
     */
    private function createFlexibleOptions(array $data)
    {
        $result = array();
        foreach ($data as $key => $value) {
            /** @var $optionValue AbstractEntityAttributeOptionValue|\PHPUnit_Framework_MockObject_MockObject */
            $optionValue = $this->getMockForAbstractClass(
                'Oro\Bundle\FlexibleEntityBundle\Entity\Mapping\AbstractEntityAttributeOptionValue'
            );
            $optionValue->setValue($value);

            /** @var $option AttributeOption|\PHPUnit_Framework_MockObject_MockObject */
            $option = $this->getMock(
                'Oro\Bundle\FlexibleEntityBundle\Entity\AttributeOption',
                array('getOptionValue')
            );
            $option->setId($key);
            $option->expects($this->any())->method('getOptionValue')->will($this->returnValue($optionValue));

            $result[] = $option;
        }

        return $result;
    }

    /**
     * @expectedException \LogicException
     * @expectedExceptionMessage There is no flexible attribute with name test_field.
     */
    public function testGetRenderSettingsFailsWhenAttributeIsNotFound()
    {
        $this->initializeFlexibleFilter($this->model);

        $attributeRepository = $this->getMock('Doctrine\Common\Persistence\ObjectRepository');
        $attributeRepository->expects($this->once())->method('findOneBy')
            ->with(array('entityType' => self::TEST_FLEXIBLE_NAME, 'code' => self::TEST_FIELD));

        $this->flexibleManager->expects($this->once())
            ->method('getAttributeRepository')
            ->will($this->returnValue($attributeRepository));

        $this->model->getRenderSettings();
    }
}
