import React from "react";
import { Draggable } from "react-beautiful-dnd";

import Form from "react-bootstrap/Form";

import grip from "./images/grip.svg";

import AttributeValue from "./AttributeValue";

export default function Attribute(props) {
	function showChangeHandler() {
		props.attribute.show = !props.attribute.show;
		/*Se l'utente vuole che un'attributo venga mostrato nella pagina dei risultati e questo non è già un vincolo viene impostato il booleano
		 * che lo identifica come vincolo */
		if (props.attribute.show && !props.attribute.isConstraint) {
			props.attribute.isConstraint = true;
		} else {
			/*Se l'utente toglie il check all'attributo per non effettuarne lo show, e l'attributo non contiene valori modificati
			 *viene impostato a falso il booleano che lo identifica come vincolo */
			if (!props.attribute.show && props.attribute.isConstraint) {
				const modifiedValues = props.attribute.value.filter(
					(value) => value.edited
				);
				props.attribute.isConstraint = modifiedValues.length > 0;
			}
		}
		// Viene applicata la modifica all'attributo
		props.changeAttribute(props.attribute.ID, props.attribute);
	}

	/* Funzione che permette la modifica di un valore dell'attributo attraverso la sostituzione dell'oggetto modificato
	   con il nuovo, nell'oggetto che contiene la risorsa 
	   valueID è l'id del valore modificato, newValue è il valore con le modifiche effettuate, isCostraint indica se il valore modificato è o meno un vincolo
	   ad esempio se viene annullato l'inserimento di un vincolo precedente posto questo sarà false e permettera di non considerarlo come vincolo*/
	function changeValue(valueID, newValue, isConstraint) {
		const aux = props.attribute;
		// Controllo per verificare,in caso l'utente rimuova un valore dai vincoli, se l'attributo è ancora vincolo o meno
		if (isConstraint !== undefined) {
			if (!isConstraint) {
				if (!aux.show) {
					const modifiedValues = aux.value.filter(
						(value) => value.edited
					);
					aux.isConstraint = modifiedValues.length > 0;
				} else {
					aux.isConstraint = true;
				}
			} else {
				aux.isConstraint = isConstraint;
			}
		}
		// Viene cercato l'index del valore modificato attraverso l'id
		const indexOfProp = aux.value.findIndex(
			(value) => value.ID === valueID
		);
		// Viene sostituito il vecchio valore con il nuovo
		aux.value[indexOfProp] = newValue;
		// Viene applicata la modifica all'attributo a cui appartiene il valore
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
