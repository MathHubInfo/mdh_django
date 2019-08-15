import React, { Component, ChangeEvent } from 'react';
import { Col, Button, ButtonGroup } from 'reactstrap';
import { ParsedMDHCollection, MDHFilterSchema, MDHFilter } from "../../client/derived";

interface MDHFilterSelectorProps {
    /** the current collection */
    collection: ParsedMDHCollection;

    /** callback when filters are applied  */
    onFilterUpdate: (filters: MDHFilter[]) => void;
}

interface MDHFilterSelectorState {
    selected: TFilter[];
}

interface TFilter {
    value: TFilterValue;
    slug: string;
}


/* * * * * * * * * * * * * * * * * * * * * * * * *
    Filter values
    - - - - - - - - - - - - - - - -
    null: filter selected, no valid value
    true/false: boolean values (default = true)
    /^(=|==|<=|>=|<|>|<>|!=)(\d+\.?\d*)$/
 * * * * * * * * * * * * * * * * * * * * * * * * */
type TFilterValue = string | boolean | null;

type TFilterAction = {
    action: "add",
    slug: string;
} | {
    action: "remove",
    i: number;
} | {
    action: "update",
    i: number,
    value: TFilterValue,
}

/**
 * Allows the user to select and edit filters. 
 * Notifies the parent via onFilterUpdate every time any change occurs. 
 */
 export default class MDHFilterSelector extends Component<MDHFilterSelectorProps, MDHFilterSelectorState> {

    state: MDHFilterSelectorState = {
        selected: [],
    }

    availableFilters: MDHFilterSchema[] = this.props.collection.propertyArray;
    
    /** updates the state of filters */
    updateFilters = (par: TFilterAction) => {
        // fetch a copy of the new filters
        const newSelected = this.state.selected.slice(0);
        
        if (par.action === "add") {
            // add a new element at the end
            newSelected.push({slug: par.slug, value: null});
        } else {
            // create a new filter with the old slug, then remove the old one
            const newFilter: TFilter = { slug: newSelected[par.i].slug, value: null }
            newSelected.splice(par.i, 1);

            // if we had an update, insert the one with the new value
            // TODO: Why is this added at the end (via .push)
            if (par.action === "update") {
                newFilter.value = par.value;
                newSelected.push(newFilter);
            }
        }
        
        // update the state and notify the parent
        this.setState({selected: newSelected});
        this.props.onFilterUpdate(newSelected);
    }
    
    /** renders the available filters */
    renderAvailable(filters: MDHFilterSchema[]) {
        return(
            <div className="zoo-search-filter">
                <div className="zoo-filter-box">
                    <ul className="fa-ul">
                        {filters.map((f) => 
                            <li key={f.slug}
                                onClick={() => this.updateFilters({action: "add", slug: f.slug})}>
                                <span className="fa-li"><i className="fas fa-plus"></i></span>
                                {f.display} <ZooInfoButton value="filter" />
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }
    
    /** renders the selected filters */
    renderSelected(filters: TFilter[], filterDictionary: ParsedMDHCollection["propertyDictionary"]) {
        return(
            <div className="zoo-search-filter">
                <div className="zoo-filter-box">
                    {filters.length === 0 && <p className="text-center my-3">Select filters</p>}
                    <ul className="fa-ul">
                        {filters.map((f, index) => (
                            <SelectedFilter key={index}
                                info={filterDictionary[f.slug]}
                                value={f.value}
//                                type={collection.columns[f.name].type}
                                onDoneEditing={(v) => this.updateFilters({action: "update", i: index, value: v})}
                                onRemoveFilter={() => this.updateFilters({action: "remove", i: index})}/>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
    
    render() {
        return(
            <React.Fragment>
                <Col id="zoo-selected-filters" md="5" sm="7" className="mx-auto my-4">
                    {this.renderSelected(this.state.selected, this.props.collection.propertyDictionary)}
                </Col>
                <Col id="zoo-choose-filters" md="4" sm="5" className="mx-auto my-4">
                    {this.renderAvailable(this.availableFilters)}
                </Col>
            </React.Fragment>
        );
    }
}

interface TSelectedFilterProps {
    /** the text of the selected filter */
    info: MDHFilterSchema;

    /** the value of the selected filter */
    value: TFilterValue;

    /** callback when a value has been updated */
    onDoneEditing: (value: TFilterValue) => void;

    /** called when a filter is removed */
    onRemoveFilter: () => void;
}

interface TSelectedFilterState {
    /** are we in edit mode? */
    edit: boolean;

    /** the value of a filter */
    value: string;
}


class SelectedFilter extends Component<TSelectedFilterProps, TSelectedFilterState> {

    state: TSelectedFilterState = {
        edit: true,
        value: '',
    }
    
    editFilter = () => {
        this.setState({ edit: true });
    }
    
    onUpdateValue = (value: string) => {
        this.setState({ value });
    }
    
    validateAndUpdate = () => {
        let valueValid = false;
        let actualValue = null;
        
        function standardizer(match: string, operator: string, value: string, offset: number) {
            let actualOperator: string = '';
            if (typeof operator === 'undefined' || operator === "=" || operator === "==") actualOperator = "=";
            else if (operator === "<>" || operator === "!=") actualOperator = "!=";
            else actualOperator = operator;
            return actualOperator + value;
        }

        if (this.props.info.type === "StandardBool") {
            valueValid = (this.state.value === "true" || this.state.value === "false" )
            if (valueValid) actualValue = this.state.value;
        }
        if (this.props.info.type === "StandardInt") {
            const v = (this.state.value as string).replace(/ /g, '');
            const r = /^(=|==|<=|>=|<|>|<>|!=)?(\d+\.?\d*)$/;
            valueValid = r.test(v)
            if (valueValid) actualValue = v.replace(r, standardizer);
        }
        if (valueValid) {
            this.setState({ edit: false });
            this.props.onDoneEditing(actualValue);
        }
    }
    
    render() {

        const { edit, value } = this.state;
        const { info } = this.props;

        return(
            <li className={(edit ? "edit" : "")}>
                {
                    edit ?
                        <EditFilterValue info={info} value={value} onChange={this.onUpdateValue}>
                            { info.display } <ZooInfoButton value="filter" />
                        </EditFilterValue>
                        :
                        <SelectedFilterValue info={info} value={value}>
                            { info.display } <ZooInfoButton value="filter" />
                        </SelectedFilterValue>
                }
                
                <span className="text-muted small">
                    <span className="remove-button" onClick={this.props.onRemoveFilter}><i className="fas fa-minus"></i></span>
                    <span className="done-button" onClick={this.validateAndUpdate}><i className="fas fa-check"></i></span>
                    <span className="edit-button" onClick={this.editFilter}><i className="fas fa-pen"></i></span>
                </span>
            </li>
        );
    }
}

interface SelectedFilterValueProps {
    /** info about the filter */
    info: MDHFilterSchema;

    /** the (validated) value of this filter */
    value: string;

    /** children representing the info about this element */
    children: React.ReactNode | React.ReactNode[];
}

/** renders a selected filter value */
class SelectedFilterValue extends React.Component<SelectedFilterValueProps> {
    render() {
    
        const { info: { type }, value, children } = this.props;

        return (
            <>
                {
                    type === "StandardBool" && value === "false" && 
                    <i>not </i>
                }
                { children }
                {
                    type !== "StandardBool" &&
                    <i className="zoo-numeric-condition-display">{ value } </i>
                }
            </>
        );
    }
}

interface EditFilterValueProps {
    /** info about the filter */
    info: MDHFilterSchema;

    /** the (possibly invalid) value of this filter */
    value: string;

    /** will be called with a new value when changed */
    onChange: (value: string) => void

    /** children representing the info about this element */
    children: React.ReactNode | React.ReactNode[];
}

/** A component that allows to edit a value */
class EditFilterValue extends React.Component<EditFilterValueProps> {

    setValueTrue = () => {
        this.props.onChange("true");
    }

    setValueFalse = () => {
        this.props.onChange("false");
    }

    handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(event.target.value);
    }

    renderActual() {
        const { info: { type }, value } = this.props;

        if (type === "StandardBool") {
            return (
                <ButtonGroup id="zoo-choose-objects" className="zoo-bool-filter btn-group-sm">
                    <Button
                        disabled={value==="true"}
                        onClick={this.setValueTrue}>True</Button>
                    <Button
                        disabled={value==="false"}
                        onClick={this.setValueFalse}>False</Button>
                </ButtonGroup>
            );
        }
        else {
            return (
                <input className="zoo-numeric-filter" type="text"
                    onChange={this.handleValueChange}
                    value={value} />
            );
        }
        
    }

    render() {
        return (
            <>
                { this.props.children }
                { this.renderActual() }
            </>
        );
    }
}

/**
 * A simple informational button
 */
export function ZooInfoButton(props: {value: string}) {
    return(
        <a href="#!" className={"info-" + props.value}>
            <i className="far fa-question-circle" data-fa-transform="shrink-4 up-3"></i>
        </a>
    );
}