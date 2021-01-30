import React from "react";
import axios from "axios";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import Table from "react-bootstrap/Table";

import Attribute from "./Attribute";

export default function ResourceTable(props) {
	// Viene modificato l'attributo con i nuovi valori
	function changeAttribute(attributeID, newAttribute) {
		const aux = [...props.resource];
		const indexOfProp = aux.findIndex(
			(attribute) => attribute.ID === attributeID
		);
		aux[indexOfProp] = newAttribute;
		props.setResource(aux);
	}

	function onDragEnd(result) {
		const { destination, source } = result;
		// Se destination è null, ovvero se l'utente trascina la riga dove non può essere spostata non viene effettuata nessuna modifca
		if (!destination) {
			return;
		}
		// Se non avviene effettivamente nessuno spostamento, ovvero viene spostata nella posizione di partenza non avviene nessuna modifica
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}
		// Viene rimosso l'elemento trascinato in nuova posizione dall'utente e salvato nella vaiabile droppedElement
		let droppedElement = props.resource.splice(source.index, 1)[0];
		// Viene inserito l'elemento nella nuova posizione
		props.resource.splice(destination.index, 0, droppedElement);
		console.log(droppedElement, destination.index);
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Table striped bordered hover id="resource-table">
				<thead>
					<tr>
						<th className="drag-cell">#</th>
						<th className="property-cell">Property</th>
						<th className="value-cell">Values</th>
						<th className="show-cell">Show</th>
					</tr>
				</thead>
				{
					<Droppable droppableId="droppable">
						{(provided) => (
							<tbody
								ref={provided.innerRef}
								{...provided.droppableProps}
							>
								{props.resource?.map((attribute, index) => (
									<Attribute
										key={attribute.ID}
										index={index}
										attribute={attribute}
										changeAttribute={changeAttribute}
									/>
								))}
								{provided.placeholder}
							</tbody>
						)}
					</Droppable>
				}
			</Table>
		</DragDropContext>
	);
}
