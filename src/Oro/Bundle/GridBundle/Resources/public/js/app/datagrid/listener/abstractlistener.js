var Oro = Oro || {};
Oro.Datagrid = Oro.Datagrid || {};
Oro.Datagrid.Listener = Oro.Datagrid.Listener || {};

/**
 * Abstarct listener for datagrid
 *
 * @class   Oro.Datagrid.Listener.AbstractListener
 * @extends Backbone.Model
 */
Oro.Datagrid.Listener.AbstractListener = Backbone.Model.extend({

    /** @param {Oro.Datagrid.Grid} */
    datagrid: null,

    /** @param {String} Column name of cells that will be listened for changing their values */
    columnName: 'id',

    /** @param {String} Model field that contains data */
    dataField: 'id',

    /**
     * Initialize listener object
     *
     * @param {Object} options
     */
    initialize: function(options) {
        if (!_.has(options, 'datagridName')) {
            throw new Error('Datagrid name is not specified');
        }

        this.datagrid = Oro.Registry.getElement('datagrid', options.datagridName);
        if (!this.datagrid) {
            throw new Error('Datagrid with name "' + options.datagridName + '" is not exists');
        }

        if (!_.has(options, 'columnName')) {
            throw new Error('Data column name is not specified');
        }
        this.columnName = options.columnName;

        if (options.dataField) {
            this.dataField = options.dataField;
        }

        this.datagrid.on('cellEdited', this._onCellEdited, this);

        Backbone.Model.prototype.initialize.apply(this, arguments);
    },

    /**
     * Process cell editing
     *
     * @param {Oro.Datagrid.Grid} datagrid
     * @param {Oro.Datagrid.Row} row
     * @param {Backgrid.Cell} cell
     * @protected
     */
    _onCellEdited: function (datagrid, row, cell) {
        var columnName = cell.column.get('name');
        if (columnName == this.columnName) {
            var fieldValue = cell.model.get(this.dataField);
            if (fieldValue !== undefined) {
                this._processValue(fieldValue, cell.model);
            }
        }
    },

    /**
     * Process value
     *
     * @param {*} value Value of model property with name of this.dataField
     * @param {Backbone.Model} model
     * @protected
     * @abstract
     */
    _processValue: function(value, model) {
        throw new Error('_processValue method is abstract and must be implemented');
    }
});
