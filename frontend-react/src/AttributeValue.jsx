import React, { useState } from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function AttributeValue(props) {
	// Contiene il label o il value del valore.
	const [valueString, setValueString] = useState(
		props.value.label || props.value.value
	);
	const type = getType();

	function getType() {
		if (props.value.label === null) {
			if (props.value.datatype === null) {
				return props.value.type;
			} else {
				return props.value.datatype;
			}
		} else {
			return "literal";
		}
	}
	// Funzione che rende modificabile il valore dell'attributo scelto dall'utente
	function editButtonHandler() {
		// Viene modificato il valore all'interno dell'oggetto che indica se si sta modificando il valore
		props.value.editing = true;
		// Viene utilizzata la funzione del parent che permette di applicare le modifiche
		props.changeValue(props.value.ID, props.value);
		console.log(props.value);
	}

	// Funzione che si occupa della modifica dei valori delle propietà da parte dell'utente
	function changeValueHandler(event) {
		const newValue = event.target.value;

		/*
		const comparison = props.value.comparison;

		if (
			(newValue.includes("<") || newValue.includes(">")) &&
			comparison !== "numeric"
		) {
			alert(
				"Puoi inserire '>' o '<' solo se effettui un confronto di tipo numerico"
			);
			return false;
		}
		
		if (props.value.label !== null) {
			props.value.label = newValue;
		} else {
			props.value.value = newValue;
		}
		*/
		//props.changeValue(props.value.ID, props.value);
		setValueString(newValue);
	}

	function possibleComparison() {
		if (type === "literal") {
			return [
				<option value="exactstring">Exact String</option>,
				<option value="substring">Substring</option>,
			];
		}
		if (type === "uri") {
			return [<option value="uri">URI</option>];
		}
		return [
			<option value="type-based">
				Type based comparison (default equal)
			</option>,
			<option value="regex">Regex</option>,
		];
	}

	function changeComparison(event) {
		props.value.comparison = event.target.value;
		props.changeValue(props.value.ID, props.value);
	}

	function applyEdit() {
		if (valueString.length === 0) {
			alert("non può essere vuoto");
		} else {
			props.value.edited = true;
			props.value.editing = false;
			if (props.value.label !== null) {
				props.value.label = valueString;
			} else {
				props.value.value = valueString;
			}
			props.changeValue(props.value.ID, props.value);
		}
	}

	function undoEdit() {
		props.value.editing = false;
		props.changeValue(props.value.ID, props.value);
	}
	/* Se l'utente sta modificando il valore viene mostrato un form che permette la modifica e la selezione del tipo
	   di confronto che vuole effettuare per la nuova query */
	return props.value.editing ? (
		<li>
			<Container fluid className="value-container">
				<Row>
					<Col>
						<Form.Control
							type="text"
							name="propertyValue"
							className="value"
							value={valueString}
							onChange={changeValueHandler}
						/>

						<Form.Text muted>
							This value is type: "{type}"
						</Form.Text>
					</Col>
					<Col>
						<Form inline>
							<Form.Label className="my-1 mr-sm-2 float-sx">
								Choose the type of comparison:
							</Form.Label>

							<Form.Control
								as="select"
								className="my-1 mr-sm-2 float-dx"
								id="inlineFormCustomSelectPref"
								custom
								size="sm"
								value={props.value.comparison}
								onChange={changeComparison}
							>
								{possibleComparison()}
							</Form.Control>
						</Form>
					</Col>
					<Col className="btn-span" md="auto">
						<span>
							[
							<button
								id="applica"
								className="editButton"
								onClick={applyEdit}
							>
								Applica
							</button>
							|
							<button
								id="annulla"
								className="editButton"
								onClick={undoEdit}
							>
								Annulla
							</button>
							]
						</span>
					</Col>
				</Row>
			</Container>
		</li>
	) : (
		<li className={props.value.edited ? "modified" : "non-modified"}>
			{props.value.label ? props.value.label : props.value.value}
			<span id="editButtonSpan">
				[
				<button
					className="editButton"
					id="modifica"
					onClick={editButtonHandler}
				>
					Edit
				</button>
				]
			</span>
		</li>
	);
}
/**
 * 
				<Row>
					<Col>
						<span id="editButtonSpan">[ Apply | Undo]</span>
					</Col>
				</Row>
				
								<option value="default">
									Default (exactString or equal)
								</option>
								<option value="substring">Substring</option>
								<option value="numeric">Numeric</option>
								<option value="regex">
									Regular Expression
								</option>
*/
