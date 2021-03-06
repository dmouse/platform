var Oro = Oro || {};
Oro.Filter = Oro.Filter || {};

/**
 * View that represents all grid filters
 *
 * @class   Oro.Filter.List
 * @extends Backbone.View
 *
 * @event updateList    on update of filter list
 * @event updateFilter  on update data of specific filter
 * @event disableFilter on disable specific filter
 */
Oro.Filter.List = Backbone.View.extend({
    /**
     * List of filter objects
     *
     * @property
     */
    filters: {},

    /**
     * Container tag name
     *
     * @property
     */
    tagName: 'div',

    /**
     * Container classes
     *
     * @property
     */
    className: 'filter-box oro-clearfix-width',

    /**
     * Filter list template
     *
     * @property
     */
    addButtonTemplate: _.template(
        '<select id="add-filter-select" multiple>' +
            '<% _.each(filters, function (filter, name) { %>' +
                '<option value="<%= name %>" <% if (filter.enabled) { %>selected<% } %>>' +
                    '<%= filter.label %>' +
                '</option>' +
            '<% }); %>' +
        '</select>'
    ),

    /**
     * Filter list input selector
     *
     * @property
     */
    filterSelector: '#add-filter-select',

    /**
     * Add filter button hint
     *
     * @property
     */
    addButtonHint: 'Manage filters',

    /**
     * Select widget object
     *
     * @property {Oro.Filter.MultiSelectDecorator}
     */
    selectWidget: null,

    /**
     * Widget button selector
     *
     * @property
     */
    buttonSelector: '.ui-multiselect.filter-list',

    /** @property */
    events: {
        'change #add-filter-select': '_onChangeFilterSelect'
    },

    /**
     * Initialize filter list options
     *
     * @param {Object} options
     * @param {Object} [options.filters]
     * @param {String} [options.addButtonHint]
     */
    initialize: function(options)
    {
        if (options.filters) {
            this.filters = options.filters;
        }

        _.each(this.filters, function(filter) {
            this.listenTo(filter, "update", this._onFilterUpdated);
            this.listenTo(filter, "disable", this._onFilterDisabled);
        }, this);

        if (options.addButtonHint) {
            this.addButtonHint = options.addButtonHint;
        }

        Backbone.View.prototype.initialize.apply(this, arguments);
    },

    /**
     * Triggers when filter is updated
     *
     * @param {Oro.Filter.AbstractFilter} filter
     * @protected
     */
    _onFilterUpdated: function(filter) {
        this.trigger('updateFilter', filter);
    },

    /**
     * Triggers when filter is disabled
     *
     * @param {Oro.Filter.AbstractFilter} filter
     * @protected
     */
    _onFilterDisabled: function(filter) {
        this.trigger('disableFilter', filter);
        this.disableFilter(filter);
    },

    /**
     * Returns list of filter values
     */
    getValues: function() {
        var values = {};
        _.each(this.filters, function(filter) {
            if (filter.enabled) {
                values[filter.name] = filter.getValue();
            }
        }, this);

        return values;
    },

    /**
     * Sets values for filters
     */
    setValues: function(values) {
        _.each(values, function(value, name) {
            if (_.has(this.filters, name)) {
                this.filters[name].setValue(value);
            }
        }, this);
    },

    /**
     * Triggers when filter select is changed
     *
     * @protected
     */
    _onChangeFilterSelect: function() {
        this.trigger('updateList', this);
        this._processFilterStatus();
    },

    /**
     * Enable filter
     *
     * @param {Oro.Filter.AbstractFilter} filter
     * @return {*}
     */
    enableFilter: function(filter) {
        filter.enable();
        var optionSelector = this.filterSelector + ' option[value="' + filter.name + '"]';
        this.$(optionSelector).attr('selected', true);
        var checkbox = this.selectWidget.multiselect('widget').find('input[value="' + filter.name + '"]');
        if (!checkbox.is(':checked')) {
            checkbox.click();
        }
        this.selectWidget.multiselect('refresh');
        return this;
    },

    /**
     * Disable filter
     *
     * @param {Oro.Filter.AbstractFilter} filter
     * @return {*}
     */
    disableFilter : function(filter) {
        filter.disable();
        var optionSelector = this.filterSelector + ' option[value="' + filter.name + '"]';
        this.$(optionSelector).removeAttr('selected');
        this.selectWidget.multiselect('refresh');
        return this;
    },

    /**
     * Render filter list
     *
     * @return {*}
     */
    render: function () {
        this.$el.empty();

        _.each(this.filters, function(filter) {
            filter.render();
            if (!filter.enabled) {
                filter.hide();
            }
            this.$el.append(filter.$el);
        }, this);

        this.$el.prepend(this.addButtonTemplate({
            filters: this.filters
        }));

        this._initializeSelectWidget();

        this.trigger("rendered");

        if (_.isEmpty(this.filters)) {
            this.$el.hide();
        }

        return this;
    },

    /**
     * Initialize multiselect widget
     *
     * @protected
     */
    _initializeSelectWidget: function() {
        this.selectWidget = new Oro.Filter.MultiSelectDecorator({
            element: this.$(this.filterSelector),
            parameters: {
                multiple: true,
                selectedList: 0,
                selectedText: this.addButtonHint,
                classes: 'filter-list select-filter-widget',
                open: $.proxy(function() {
                    this.selectWidget.onOpenDropdown();
                    this._setDropdownWidth();
                    this._updateDropdownPosition();
                }, this)
            }
        });

        this.selectWidget.setViewDesign(this);
        this.$('.filter-list span:first').replaceWith(
            '<a id="add-filter-button" href="javascript:void(0);">' + this.addButtonHint +'</a>'
        );
    },

    /**
     * Set design for select dropdown
     *
     * @protected
     */
    _setDropdownWidth: function() {
        var widget = this.selectWidget.getWidget();
        var requiredWidth = this.selectWidget.getMinimumDropdownWidth() + 24;
        widget.width(requiredWidth).css('min-width', requiredWidth + 'px');
        widget.find('input[type="search"]').width(requiredWidth - 22);
    },

    /**
     * Activate/deactivate all filter depends on its status
     *
     * @protected
     */
    _processFilterStatus: function() {
        var activeFilters = this.$(this.filterSelector).val();

        _.each(this.filters, function(filter, name) {
            if (!filter.enabled && _.indexOf(activeFilters, name) != -1) {
                this.enableFilter(filter);
            } else if (filter.enabled && _.indexOf(activeFilters, name) == -1) {
                this.disableFilter(filter);
            }
        }, this);

        this._updateDropdownPosition();
    },

    /**
     * Set dropdown position according to current element
     *
     * @protected
     */
    _updateDropdownPosition: function() {
        var button = this.$(this.buttonSelector);
        var buttonPosition = button.offset();
        var widgetWidth = this.selectWidget.getWidget().outerWidth();
        var windowWidth = $(window).width();
        var widgetLeftOffset = buttonPosition.left;
        if (buttonPosition.left + widgetWidth > windowWidth) {
            widgetLeftOffset = buttonPosition.left + button.outerWidth() - widgetWidth;
        }

        this.selectWidget.getWidget().css({
            top: buttonPosition.top + button.outerHeight(),
            left: widgetLeftOffset
        });
    }
});
