// UI Page Profile #187
//import rcrm_import from "/rcrm_import.js"
Vue.component('inline-edit', {
    name: 'inline-edit',
    props: {
        'value': {
            type: Object,
            required: true
        },
        'update_column': {
            type: Object,
            required: true
        },
        'edetable': {
            type: Boolean,
            default: true
        },
        'toottipclass': {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            visibility: false,
            update_field: null,
            is_loading: false,
            openOnFocus: true,
            keepFirst: true,
            column_selected_options: '',
            asyc_data: [],
            asyc_value: '',
            tooltip_class: 'is-white',
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
        'fileupload': () => rcrm_import('controls/file_upload'),
    },
    methods: {
        getAsyncData: _.debounce(function () {
            if (this.asyc_value.length < 3) {
                this.data = []
                return
            }
            this.getAsyncDataOnLoad(this.update_column.service);
        }, 500),

        getAsyncDataOnLoad(value) {
            var filter = this;
            this.isFetching = true
            axios.post(value, {
                search: this.asyc_value,
            }).then(function (response) {
                console.log(response.data);
                filter.asyc_data = []
                response.data.data.forEach((item) => filter.asyc_data.push(item))
                filter.isFetching = true;
            }).catch(function (error) {
                filter.asyc_data = []
                console.log('Error! Could not reach the API. ' + error);
            }).finally(() => {
                filter.isFetching = false;
            });
        },

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
                                if (component.update_column.type == 'dropdown') {
                                    component.value[component.update_column.display_column] = component.asyc_value;
                                }
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
    },
    template: `
    <div class="field rcrm-inline">
        <p
            v-tooltip.notrigger="{ html: 'popover'+$vnode.key, class: 'is-white'+toottipclass, visible: (visibility && edetable)}">
            <slot name="value_template" v-bind:entity="value">

                <!-------------------------------------------------------------->
                <template v-if="!isempty(value[update_column.field]) && update_column.type == 'date'">
                    {{ getDateTime(value[update_column.field]) }}
                </template>
                <template v-else-if="update_column.type == 'file'">
                    <div class="field-body">
                        <a v-if="value[update_column.field]" @click="viewFile(value[update_column.field])">
                            <span v-tooltip="getFileName(value[update_column.field])"><svg
                                    xmlns="http://www.w3.org/2000/svg" class="resume-icon" style="width:20px;height:20px"
                                    viewBox="0 0 105.728 143.693">
                                    <g id="Group_1" class="fill-icon" data-name="Group 1"
                                        transform="translate(-604 -302.656)">
                                        <path id="Path_2" data-name="Path 2" style="fill: #121ebd;"
                                            d="M1306,385V528.349h105.728V419.731l-32.89-35.075Z"
                                            transform="translate(-702 -82)"></path>
                                        <path id="download-button" data-name="Path 6" class="cls-2"
                                            d="M89.1,23.248H74.572V-13.063H52.779V23.248H38.25L63.675,48.673Z"
                                            transform="translate(592.75 361.063)"></path>
                                    </g>
                                </svg></span>
                        </a>
                        <span v-else class="has-text-light">
                            <span v-tooltip="'File Not Available'">
                                <svg xmlns="http://www.w3.org/2000/svg" class="resume-icon" style="width:20px;height:20px"
                                    viewBox="0 0 105.728 143.693">
                                    <g id="Group_1" class="empty-icon" data-name="Group 1"
                                        transform="translate(-604 -302.656)">
                                        <path id="Path_2" data-name="Path 2"
                                            style="fill: #fff;stroke: #121ebd;stroke-width: 10px;"
                                            d="M1306,385V528.349h105.728V419.731l-32.89-35.075Z"
                                            transform="translate(-702 -82)"></path>
                                    </g>
                                </svg>
                            </span>
                        </span>
                    </div>
                </template>
                <template v-else-if="update_column.type == 'checkbox'">
                    {{ yesno(value[update_column.field]) }}
                </template>
                <template v-else-if="!isempty(update_column.display_column) && !isempty(value[update_column.field])">
                    <span dir="auto"
                        v-tooltip="value[update_column.display_column]">{{ _.truncate(value[update_column.display_column],{'length': 30, 'separator': ' '}) }}</span>
                </template>
                <template v-else-if="!isempty(value[update_column.field])">
                    <span dir="auto" v-tooltip="value[update_column.field]"
                        v-html="linkify(_.truncate(value[update_column.field],{'length': 30, 'separator': ' '}))"></span>
                </template>
                <template v-else>
                    <span class="has-text-light">Not Available</span>
                </template>
                <!-------------------------------------------------------------->
            </slot>
            <a v-if="edetable" @click="visibility = !visibility" class="edit-linline-icon color-black m-l-15"> <i
                    class="mdi mdi-pencil"></i> </a>
        </p>
        <div :id="'popover'+$vnode.key" class="rcrm-inline-content">
            <form style="display: inherit;" v-on:submit.prevent="updateFields()">
                <b-field :type="errors.has(update_column.label) ? 'is-danger': ''"
                    :message="errors.has(update_column.label) ? errors.first(update_column.label) : ''"
                    :label="update_column.label">

                    <b-input v-if="update_column.type == ''" id="sTests-" :name="update_column.label"
                        v-validate="'required|min:3'" type="text" value="" maxlength="40"
                        placeholder="Select Field Name First">
                    </b-input>

                    <b-input v-if="update_column.type == 'text'" v-model="update_field" id="sTest-companyText"
                        v-validate="'required|min:0'" type="text" :name="update_column.label" value="" maxlength="40"
                        placeholder="Enter Text">
                    </b-input>

                    <b-input v-else-if="update_column.type == 'number'" v-model="update_field" id="sTest-companyNuber"
                        type="number" value="" maxlength="40" :name="update_column.label" placeholder="Enter Here"
                        v-validate="'required|min_value:0'">
                    </b-input>

                    <b-autocomplete
                        v-if="update_column.type == 'dropdown' && update_column.data && update_column.field.indexOf('custcolumn') !== -1 "
                        icon="chevron-down" v-model="column_selected_options" placeholder="Select Value"
                        :name="update_column.label" class="is-icon-right" :keep-first="keepFirst"
                        :open-on-focus="openOnFocus" :data="filteredCustomObj(update_column.data)"
                        :field="update_column.dropdown_field" @select="option => update_field = option"
                        v-validate="{ rules: { required: ( update_field != '' ) ? false : true} }">
                    </b-autocomplete>

                    <b-autocomplete
                        v-else-if="update_column.type == 'dropdown' && update_column.data && ( update_column.field == 'industryid' || update_column.field == 'qualificationid' || update_column.field == 'stageid') "
                        icon="chevron-down"
                        :placeholder="update_column.field == 'stageid' ? 'Select Contact stage' : 'Select Value'"
                        :name="update_column.label" v-model="column_selected_options" class="is-icon-right"
                        :keep-first="keepFirst" :open-on-focus="openOnFocus" :data="filteredColumnsObj(update_column.data)"
                        :field="update_column.dropdown_field" @select="option => update_field = option.id"
                        v-validate="{ rules: { required: ( column_selected_options != '' ) ? false : true} }">
                    </b-autocomplete>

                    <b-autocomplete
                        v-else-if="update_column.type == 'dropdown' && update_column.data && update_column.field == 'ownerid' && update_column.label == 'Owner'"
                        icon="chevron-down" placeholder="Select Value" :name="update_column.label" v-model="owner_"
                        class="is-icon-right" :keep-first="keepFirst" :open-on-focus="openOnFocus"
                        :data="filteredOwnerObj(update_column.data)" :field="update_column.dropdown_field"
                        @select="option => update_field = option.id"
                        v-validate="{ rules: { required: ( column_selected_options != '' ) ? false : true} }">
                    </b-autocomplete>

                    <b-autocomplete
                        v-else-if="update_column.type == 'dropdown' && update_column.data && update_column.field.indexOf('custcolumn') === -1 "
                        icon="chevron-down" placeholder="Select Value" class="is-icon-right" :keep-first="keepFirst"
                        :open-on-focus="openOnFocus" :data="update_column.data" :field="update_column.dropdown_field"
                        :name="update_column.label"
                        v-validate="{ rules: { required: ( update_field != '' ) ? false : true} }"
                        @select="option => update_field = option.id">
                    </b-autocomplete>

                    <b-autocomplete v-else-if="update_column.type == 'dropdown' && update_column.service"
                        placeholder="search by service" :open-on-focus="openOnFocus" v-model="asyc_value"
                        :field="update_column.dropdown_field" :name="update_column.label" :loading="is_loading"
                        :data="asyc_data" @keyup.native="getAsyncData" @select="option => update_field = option.id">
                    </b-autocomplete>

                    <fileupload v-else-if="update_column.type == 'file'" v-model="update_field"
                        :accountid="$root.user.accountid" :slug="value.slug" :folder="update_column.entity"
                        :column="update_column.field">
                    </fileupload>

                    <rcrmdatepicker v-if="update_column.type == 'date'" v-model="update_field" id="sTest-companyDate"
                        placeholder="Click to select date..." icon="calendar-today" :name="update_column.label"
                        v-validate="'required|min:0'">
                    </rcrmdatepicker>

                    <b-switch v-if="update_column.type == 'availability'" v-model="update_field" true-value="1"
                        false-value="0" id="sTest-companySwitch">
                        {{ update_field == 1 ? 'Yes' : 'No' }} </b-switch>
                </b-field>
                <div class="inline-actions">
                    <button class="button" :class="{'is-loading' : is_loading}"><i
                            class="mdi mdi-check-circle mdi-18px"></i></button>
                    <button v-if="!is_loading" @click.prevent="visibility = !visibility" class="button"><i
                            class="mdi mdi-close-circle mdi-18px"></i></button>
                </div>
            </form>
        </div>
    </div>
    `,
});
