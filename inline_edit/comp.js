// UI Page Profile #187
import rcrm_import from "/rcrm_import.js"
export default {
    name: 'inline_edit',
    props: ['value', 'update_column'],
    data() {
        return {
            visibility: false,
            update_field: null,
            is_loading: false,
            openOnFocus : true,
            keepFirst: true,
            column_selected_options:'',
            asyc_data: [],
        }
    },
    watch: {
        // whenever question changes, this function will run
        value: function (newValue, oldValue) {
            if (newValue != oldValue) {
                debugger;
                this.update_field = newValue[this.update_column.field];
            }
        },
    },
    components: {
        'rcrmdatepicker': () => rcrm_import('controls/rcrm_datepicker'),
    },
    methods: {
        filteredIndustryObj(columns) {
            return columns.filter((option) => {
                return option
                    .toString()
                    .toLowerCase()
                    .indexOf(this.name_.toLowerCase()) >= 0
            })
        },

        filteredOwnerObj(columns) {
            return columns.filter((option) => {
                return option.name
                    .toString()
                    .toLowerCase()
                    .indexOf(this.owner_.toLowerCase()) >= 0
            })
        },

        filteredColumnsObj(columns) {
            return columns.filter((option) => {
                return option.label
                    .toString()
                    .toLowerCase()
                    .indexOf(this.column_selected_options.toLowerCase()) >= 0
            })
        },

        filteredCustomObj(columns) {
            debugger;
            return columns.filter((option) => {
                return option.label
                    .toString()
                    .toLowerCase()
                    .indexOf(this.column_selected_options.toLowerCase()) >= 0
            })
        },

        updateFields() {
            if (!this.isempty(this.update_column)) {
                var component = this;
                var id = this.value.id;
                this.$validator.validateAll().then((result) => {
                    if (result && !component.isempty(component.update_field)) {

                        if (this.update_column.type == 'availability') {
                            component.update_field = component.update_field == "1" ? component.update_field : 0;
                        }

                        if (this.update_column.type == 'dropdown' && this.update_column.field.indexOf('custcolumn') !== -1) {
                            component.update_field = component.update_field.label;
                        }
                        axios.post('/actions/updateFields.php', {
                            key: this.update_column.field,
                            value: component.update_field,
                            tableFlag: this.update_column.entity,
                            id: id
                        }).then(function (response) {
                            console.log(response.data);
                            if (response.data.status == 'success') {
                                component.value[component.update_column.field] = component.update_field;
                                component.visibility = false;
                            }
                        }).catch(function (error) {
                            console.log('Error! Could not reach the API. ' + error);
                        }).then(function () {
                            component.is_loading = false;
                        });
                        component.is_loading = true;
                    } else {
                        if (component.$validator.errors.items.length != 0) {
                            component.$el.querySelector('[name="' + component.$validator.errors.items[0].field + '"]');
                        } else {
                            component.$el.querySelector('[name="' + this.update_column.label + '"]');
                        }
                    }
                });
            }
        }
    },
    mounted() {
        this.update_field = this.value[this.update_column.field];
        /*
        for (var item in this.$modal.columns) {
            if (!this.$modal.columns[item].lock_bulk_editable) {
                this.columns.push(this.$modal.columns[item]);
            }
        }
        this.entity = this.$modal.receivers;
        this.tableFlag = this.$modal.tableFlag;
        this.list_page = this.$modal.list_page;
        this.$modal.list_page = undefined;
        */
    },
    computed: {
        filteredDataObj() {
            return this.columns.filter((option) => {
                return option.label
                    .toString()
                    .toLowerCase()
                    .indexOf(this.column.toLowerCase()) >= 0
            })
        }
    }
}


