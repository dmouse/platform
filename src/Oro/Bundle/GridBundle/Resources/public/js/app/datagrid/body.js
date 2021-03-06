var Oro = Oro || {};
Oro.Datagrid = Oro.Datagrid || {};

/**
 * Grid body widget
 *
 * Triggers events:
 *  - "cellEdited" when one of cell of body row is edited
 *  - "rowClicked" when row of body is clicked
 *
 * @class   Oro.Datagrid.Body
 * @extends Backgrid.Body
 */
Oro.Datagrid.Body = Backgrid.Body.extend({
    /** @property */
    row: Oro.Datagrid.Row,

    /** @property {String} */
    rowClassName: undefined,

    /**
     * @inheritDoc
     */
    initialize: function(options) {
        options = options || {};

        if (!options.row) {
            options.row = this.row;
        }

        if (options.rowClassName) {
            this.rowClassName = options.rowClassName;
        }

        Backgrid.Body.prototype.initialize.apply(this, arguments);

        this._listenToRowsEvents(this.rows);
    },

    /**
     * @inheritDoc
     */
    refresh: function() {
        Backgrid.Body.prototype.refresh.apply(this, arguments);
        this._listenToRowsEvents(this.rows);
        return this;
    },

    /**
     * @inheritDoc
     */
    insertRow: function(model, collection, options) {
        Backgrid.Body.prototype.insertRow.apply(this, arguments);
        var index = collection.indexOf(model);
        if (index < this.rows.length) {
            this._listenToOneRowEvents(this.rows[index]);
        }
    },

    /**
     * Listen to events of rows list
     *
     * @param {Array} rows
     * @private
     */
    _listenToRowsEvents: function(rows) {
        _.each(rows, function(row) {
            this._listenToOneRowEvents(row);
        }, this);
    },

    /**
     * Listen to events of row, proxies events "cellEdited" and "clicked" to "rowClicked"
     *
     * @param {Backgrid.Row} row
     * @private
     */
    _listenToOneRowEvents: function(row) {
        this.listenTo(row, 'cellEdited', function(row, cell) {
            this.trigger('cellEdited', row, cell);
        });

        this.listenTo(row, 'clicked', function(row, e) {
            this.trigger('rowClicked', row, e);
        });
    },

    /**
     * @inheritDoc
     */
    render: function() {
        Backgrid.Body.prototype.render.apply(this, arguments);
        if (this.rowClassName) {
            this.$('> *').addClass(this.rowClassName);
        }
        return this;
    }
});
