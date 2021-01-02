import React from "react";
import { Draggable } from "react-beautiful-dnd";

import Form from "react-bootstrap/Form";

import grip from "./grip.svg";

import AttributeValue from "./AttributeValue";

export default function Attribute(props) {
	function showChangeHandler() {
		props.attribute.show = !props.attribute.show;

		props.changeAttribute(props.attribute.ID, props.attribute);
	}

	/* Funzione che permette la modifica di un valore dell'attributo attraverso la sostituzione dell'oggetto modificato
	   con il nuovo, nell'oggetto che contiene la risorsa */
	function changeValue(valueID, newValue) {
		const aux = props.attribute;
		const indexOfProp = aux.value.findIndex(
			(value) => value.ID === valueID
		);
		aux.value[indexOfProp] = newValue;
		props.changeAttribute(props.attribute.ID, aux);
	}

	return (
		<Draggable draggableId={props.attribute.ID} index={props.index}>
			{(provided, snapshot) => (
				<tr
					{...provided.draggableProps}
					ref={provided.innerRef}
					style={{
						backgroundColor: snapshot.isDragging && "#abcdef",
						...provided.draggableProps.style,
					}}
					className="attribute-row"
				>
					<td className="drag-cell" {...provided.dragHandleProps}>
						<img src={grip} alt="drag" />
					</td>

					<td className="property-cell">
						{props.attribute.property.label ||
							props.attribute.property.uri}
					</td>

					<td className="value-cell">
						<ul>
							{props.attribute.value.map((value) => (
								<AttributeValue
									key={value.ID}
									value={value}
									changeValue={changeValue}
								/>
							))}
						</ul>
					</td>

					<td className="show-cell">
						<Form.Check
							type="checkbox"
							name={props.attribute.ID}
							checked={props.attribute.show}
							onChange={showChangeHandler}
						/>
					</td>
				</tr>
			)}
		</Draggable>
	);
}
