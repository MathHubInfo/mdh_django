import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component, CSSProperties } from 'react';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from "react-beautiful-dnd";
import { Button, Card, CardText, Col, Collapse, Row } from 'reactstrap';
import { ParsedMDHCollection } from '../../../../../client/derived';

import styles from './ColumnEditor.module.css'; // Import css modules stylesheet as styles

interface ColumnEditorProps {
    /** the current collection */
    collection: ParsedMDHCollection;

    /** the initially selected columns */
    columns: string[];

    /** called when the columns are applied by the user */
    onColumnsApply: (newColumns: string[]) => void;
}

interface ColumnEditorState {
    /** is the editor currently expanded */
    expanded: boolean;

    /** columns that have been selected */
    selected: string[];

    /** have the changed been applied */
    applied: boolean;
}

/**
 * An editor where users can drag and drop columns between being selected and not selected. 
 * Notifies the caller via onColumnsApply() every time the columns are changed. 
 * Also notifies on mount. 
 */
export default class ColumnEditor extends Component<ColumnEditorProps, ColumnEditorState> {

    state: ColumnEditorState = {
        expanded: false,
        selected: this.props.columns.slice(),
        applied: false
    };

    /** toggles the expansion of this editor */
    private toggleExpansionState = () => {
        this.setState(({expanded}) => ({ expanded: !expanded}));
    }

    /** resets the editor to the 'lastSelected' state and collapses it */
    private resetToLastSelected = () => {
        this.setState({
            selected: this.props.columns.slice(0),
            applied: true,
        })
    }

    private resetToDefaults = () => {
        this.setState({
            selected: this.props.collection.propertyNames.slice(),
            applied: false,
        })
    }

    /** applies all column to the parent  */
    private applyColumns = () => {
        const { selected } = this.state;
        this.props.onColumnsApply(selected);
        this.setState({ applied: true });
    }

    /** gets the list of available columns */
    private getAvailable = () => {
        return this.props.collection.propertyNames.filter(n => !this.state.selected.includes(n));
    }

    /** handles dragging ending */
    private handleDragEnd = (result: DropResult) => {
        // there was no destination => nothing to be dropped
        if (!result.destination) { return; }

        // if we dropped it exactly where we were, we don't have to do anything
        if (result.source.droppableId === result.destination.droppableId && 
            result.source.index === result.destination.index) { 
            return; 
        }

        const newSelected = Array.from(this.state.selected);
        if (result.source.droppableId === "selected") {
            newSelected.splice(result.source.index, 1);
        }
        if (result.destination.droppableId === "selected") {
            newSelected.splice(result.destination.index, 0, result.draggableId);
        }
        this.setState({ selected: newSelected, applied: false });
    }

    componentDidMount() {
        this.applyColumns();
    }

    render() {
        const { expanded, selected, applied } = this.state;
        const available = this.getAvailable();
        return (
            <Row>
                <Col>
                    <Button color="link" onClick={this.toggleExpansionState}>
                        <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} />
                        <span>Choose columns</span>
                    </Button>
                    <Collapse isOpen={expanded}>
                        <Card body>
                            <CardText>
                                <DragDropContext onDragEnd={this.handleDragEnd}>
                                    <DroppableArea id="selected" caption="Selected columns" items={selected} />
                                    <DroppableArea id="available" caption="Available columns" items={available} />
                                </DragDropContext>
                            </CardText>
                            
                            <CardText>
                                <Button color="secondary" onClick={this.resetToLastSelected}>Reset</Button>
                                &nbsp;
                                <Button color="secondary" onClick={this.resetToDefaults}>Defaults</Button>
                                &nbsp;
                                <Button color="primary" onClick={this.applyColumns} disabled={applied}>Apply</Button>
                            </CardText>
                            

                            
                        </Card>
                    </Collapse>
                </Col>
            </Row>
        );
    }
}

interface DroppableAreaProps {
    /** id of the area */
    id: string;

    /** displayed title of the area */
    caption: string;

    /** items contained in the area */
    items: string[];
}

/** Represents an area where items can be dragged and dropped to */
class DroppableArea extends Component<DroppableAreaProps> {
    render() {
        return (
            <Droppable droppableId={this.props.id} direction="horizontal">
                {(provided, snapshot) => (
                    <div>
                        <p className={styles.droppableCaption}>{this.props.caption}</p>
                        <div
                            className={styles.droppableArea}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            {this.props.items.map((item, index) => (
                                <DraggableColumn key={item} index={index} item={item} />
                            ))}
                            {provided.placeholder}
                        </div>
                    </div>
                )}
            </Droppable>
        );
    }
}

function getListStyle(isDraggingOver: boolean): CSSProperties {
    return {
        background: isDraggingOver ? "rgba(25, 113, 127, 0.15)" : "rgba(25, 113, 127, 0.05)",
        display: "flex",
        overflow: "auto"
    }
}

interface DraggableColumnProps {
    /** the index of the column */
    index: number;
    
    /** item this column represents */
    item: string;
}

/**
 * A single draggable column element
 */
class DraggableColumn extends Component<DraggableColumnProps> {
    render() {
        return(
            <Draggable draggableId={this.props.item} index={this.props.index}>
                {(provided, snapshot) => (
                    <div
                        className={`btn btn-outline-secondary btn-sm ${styles.draggableItem}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style!
                        )}
                    >
                        {this.props.item}
                    </div>
                )}
            </Draggable>
        );
    }
}

function getItemStyle(isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle): CSSProperties {
    return {
        userSelect: "none",
        ...draggableStyle // styles we need to apply on draggables
    }
}