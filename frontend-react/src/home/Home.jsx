import React, { useState, useEffect } from "react";
import axios from "axios";
// Import del file per lo style Sass
import "./Home.scss";
// Import vari per i component bootstrap usati
import Container from "react-bootstrap/Container"; //Container
import Row from "react-bootstrap/Row"; //Row
//Import dei component
import Header from "./Header";
import EndpointSelection from "./EndpointSelection";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";

function App() {
	// Stato che conterrà il lingua scelta dall'utente
	const [language, setLanguage] = useState(
		sessionStorage.getItem("language") || "it"
	);
	// Stato in cui viene memorizzato l'endpoint scelto dall'utente, di default viene utilizzato quello di dbpedia
	const [endpointUrl, setEndpointUrl] = useState(
		sessionStorage.getItem("endpoint") || "http://dbpedia.org/sparql"
	);

	// Stato che conterrà gli rdf:type delle risorse presenti nell'endpoint inserito dall'utente
	const [endpointTypes, setEndpointTypes] = useState([]);

	const [resourcesList, setResourcesList] = useState([]);

	// Funzione che tramite chiamata all'api ottiene gli rdf:type dell'endpoint inserito dall'utente e li salva nello stato.
	async function getEndpointTypes(endpointUrl) {
		setEndpointTypes([]);
		await axios
			.get(`/get_types?endpoint=${endpointUrl}`)
			.then((response) => {
				console.log(response.data);
				setEndpointTypes(response.data);
			});
	}
	// Quando viene caricata la pagine vengono caricati i dati presenti nel sessionStorage in caso siano già stati salvati altrimenti vengono impostati i valori di default
	useEffect(() => {
		const sessionLanguage = sessionStorage.getItem("language");
		const sessionEndpoint = sessionStorage.getItem("endpoint");
		if (sessionLanguage) {
			setLanguage(sessionLanguage);
		} else {
			sessionStorage.setItem("language", "it");
		}
		if (sessionEndpoint) {
			setEndpointUrl(sessionEndpoint);
		} else {
			sessionStorage.setItem("endpoint", "http://dbpedia.org/sparql");
		}
		console.log("RICHIESTA!"); // STAMPA DI DEBUG
		getEndpointTypes(sessionEndpoint || "http://dbpedia.org/sparql");
	}, []);

	return (
		<Container fluid id="main-container">
			<Header language={language} setLanguage={setLanguage} />
			{/* Scelta dell'endpoint */}
			<Row id="endpoint-form">
				<EndpointSelection
					endpointUrl={endpointUrl}
					setEndpointUrl={setEndpointUrl}
					getEndpointTypes={getEndpointTypes}
				/>
			</Row>
			<hr />
			<SearchForm
				language={language}
				endpointUrl={endpointUrl}
				endpointTypes={endpointTypes}
				setResourcesList={setResourcesList}
			/>
			{resourcesList.length > 0 && (
				<SearchResults
					resourcesList={resourcesList}
					language={language}
					endpointUrl={endpointUrl}
				/>
			)}
		</Container>
	);
}

export default App;
