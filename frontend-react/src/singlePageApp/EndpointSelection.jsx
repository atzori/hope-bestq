import React, { useState } from "react";

import Form from "react-bootstrap/Form"; //Form
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

export default function EndpointSelection(props) {
	// Stato che contiene l'endpoint inserito dall'utente
	const [inputEndpointUrl, setInputEndpointUrl] = useState(props.endpointUrl);
	// Stato che contiene il messaggio da mostrare all'utente a seguito di una modifica dell'endpoint
	const [message, setMessage] = useState({
		message: "",
		elementId: "",
		show: false,
	});
	// Funzione che mostra un messaggio come feedback all'utente per indicare sa la modifica fatta è valida o meno
	function showMessage(message, elementId, timeToShowInMill) {
		setMessage({ message: message, elementId: elementId, show: true });
		setTimeout(() => {
			setMessage({ message: "", elementId: "", show: false });
		}, timeToShowInMill);
	}

	// Funzione che permette di modificare l'endpoint da cui eseguire la ricerca
	function changeEndpoint(event) {
		setInputEndpointUrl(event.target.value);
	}
	// Fuznione che applica la modifica dell'endpoint
	function applyEndpointChange(event) {
		// Previene il comportamento di default del submit
		event.preventDefault();
		// Se l'endpoint inserito dall'utente è vuoto viene ripristinato l'endpoint precedente e viene mostrato un alert e un messaggio.
		if (inputEndpointUrl === "") {
			alert("Non puoi lasciare questo campo vuoto!");
			setInputEndpointUrl(props.endpointUrl);
			showMessage("Previous endpoint restored.", "reset-msg", 5000);
			return;
		}
		// Se l'endpoint inserito dall'utente è diverso dall'ultimo endpoint inserito TODO: continuare
		if (inputEndpointUrl !== props.endpointUrl) {
			props.setEndpointUrl(inputEndpointUrl);
			showMessage("Enpoint modified successfully!", "success-msg", 5000);
			props.getEndpointTypes(inputEndpointUrl);
			sessionStorage.setItem("endpoint", inputEndpointUrl);
		} else {
			// Se l'endpoint è uguale al precedente viene mostrato un messaggio di errore.
			showMessage(
				"The endpoint you insert is the same of the previous",
				"error-msg",
				5000
			);
		}
	}

	return (
		<Form onSubmit={applyEndpointChange} inline>
			<InputGroup>
				<Form.Label>Endpoint URL:</Form.Label>
				<Form.Control
					type="text"
					name="endpoint"
					placeholder="Enter endpoint url"
					value={inputEndpointUrl}
					onChange={changeEndpoint}
				/>
				<InputGroup.Append>
					<Button
						className="primary-btn"
						variant="outline-primary"
						type="submit"
					>
						Apply
					</Button>
				</InputGroup.Append>
			</InputGroup>
			{message.show && <p id={message.elementId}>{message.message}</p>}
		</Form>
	);
}
