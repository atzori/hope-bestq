import React, { useState } from "react";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function AttributeValue(props) {
	// Stato che contiene il label o il value del valore.
	const [valueString, setValueString] = useState(
		props.value.label || props.value.value
	);
	// Costante che contiene l'rdf:type del valore, attraverso la funzione getType()
	const type = getType();
	// Funzione che restituisce l'rdf:type di un valore
	function getType() {
		/**  Se il valore ha un label viene restituito come tipo "literal"
		 *    altrimenti viene restituito come tipo il datatype se presente, se non presente viene restituito il type */
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

	// Funzione che si occupa della modifica del valore da parte dell'utente
	function changeValueHandler(event) {
		const newValue = event.target.value;
		setValueString(newValue);
	}
	// Funzione che resituisce i possibili confronti in base al tipo del valore
	function possibleComparison() {
		// Se il tipo è literal è possibile effettuare un contronto su stringa esatta o su substring
		if (type === "literal") {
			return [
				<option key="exact-string" value="exact-string">
					Exact String
				</option>,
				<option key="substring" value="substring">
					Substring
				</option>,
			];
		}
		// Se il tipo è uri è possibile effettuare solo il confronto uri
		if (type === "uri") {
			return [
				<option key="uri" value="uri">
					URI
				</option>,
			];
		}
		/**  Per qualsiasi altro tipo è possibile fare un confronto basato sul tipo del valore, che verra gestito in backend
		 *	In futuro si potrebbe implementare la funzione regex*/
		return [
			<option key="type-based" value="type-based">
				Type based comparison (default equal)
			</option>,
			<option disabled key="regex" value="regex">
				Regex
			</option>,
		];
	}

	// Funzione che rende modificabile il valore dell'attributo scelto dall'utente
	function editButtonHandler() {
		// Viene modificato il valore all'interno dell'oggetto che indica se si sta modificando il valore
		props.value.editing = true;
		// Viene utilizzata la funzione del parent che permette di applicare le modifiche
		props.changeValue(props.value.ID, props.value, undefined);
		console.log(props.value); //!Log di debug
	}
	// Funzione che si occupa della modifica del tipo di confronto del valore scelto dall'utente
	function changeComparison(event) {
		props.value.comparison = event.target.value;
		props.changeValue(props.value.ID, props.value, undefined);
	}
	// Funzione che applica le modifiche effettuate al valore (dopo aver premuto Apply)
	function applyEdit() {
		// Controllo sulla lunghezza della stringa inserita dall'utente, non può essere lasciato vuoto e viene mostrato un alert se questo avviene
		if (valueString.length === 0) {
			alert("non può essere vuoto");
		} else {
			// Se la modifica effettuata è valida viene posto a true il booleano che indica che il valore è stato modificato
			props.value.edited = true;
			// Viene posto a false il booleano che indica che il valore sia in fase di modifica
			props.value.editing = false;
			// Viene modificato il valore con il valore inserito dall'utente
			if (props.value.label !== null) {
				props.value.label = valueString;
			} else {
				props.value.value = valueString;
			}
			// Viene applicata la modifica all'attributo contenente il valore e viene passato true in quando è un vincolo
			props.changeValue(props.value.ID, props.value, true);
		}
	}
	// Funzione che annulla la modifica che si stava effettuando
	function undoEdit() {
		props.value.editing = false;
		props.changeValue(props.value.ID, props.value, undefined);
	}
	// Funzione che rimuove un vincolo precedentemente imposto
	function removeConstraint() {
		props.value.edited = false;
		props.changeValue(props.value.ID, props.value, false);
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
			<span className="editButtonSpan">
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
			{props.value.edited && (
				<span className="editButtonSpan">
					[
					<button
						id="annulla"
						className="editButton"
						onClick={removeConstraint}
					>
						Remove
					</button>
					]
				</span>
			)}
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
