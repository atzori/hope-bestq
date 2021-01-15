import React, { useState, useEffect } from "react";
import axios from "axios";

// Import del file per lo style Sass
import "./ResourcePage.scss";

import Container from "react-bootstrap/Container"; //Container
import Navbar from "react-bootstrap/Navbar"; //Navbar
import Nav from "react-bootstrap/Nav"; //Nav
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import ResourceTable from "./ResourceTable";
import ResourcePreview from "./ResourcePreview";

function App(props) {
	const [resource, setResource] = useState(props.resource);

	const [request, setRequest] = useState();
	const [queryResult, setQueryResult] = useState(undefined);
	const [selectedTab, setSelectedTab] = useState("resource");

	//! DA UTILIZZARE SOLO PER DEBUG, SI PUO' ELIMINARE PER LA CREAZIONE DELLA BUILD
	const [resourceLabel, setResourceLabel] = useState();
	const [resourceComment, setResourceComment] = useState();

	function getResource() {
		axios.get("/prova").then((response) => {
			console.log(response.data);
			setResource(response.data.data);
			setResourceLabel(response.data.label);
			setResourceComment(response.data.comment);
		});
	}

	useEffect(getResource, []);

	async function prova() {
		/*
		*Copia più lenta
		console.time("json copy");
		const json = JSON.parse(JSON.stringify(resource));
		console.timeEnd("json copy");
		*/
		// Deep copy della risorsa
		const resourceCopy = resource?.map((attribute) => {
			return { ...attribute };
		});
		// Filter dei soli attributi che sono vincoli selezionati dall'utente
		const constraints = resourceCopy.filter(
			({ ...attribute }) => attribute.isConstraint
		);
		// Map che per ogni attributo lascia solo i valori modificati dall'utente
		constraints.map(
			(attribute) =>
				(attribute.value = attribute.value.filter(
					(value) => value.edited
				))
		);
		// !Debug
		console.log(constraints);
		// Se esiste una richiesta precedente ancora in elaborazione viene cancellata.
		if (request) {
			console.log("CANCELLATO"); //!DEBUG
			request.cancel("axios request cancelled");
			setRequest(null);
		}
		const axiosSource = axios.CancelToken.source();
		// Viene memorizzato nello stato apposito
		setRequest(axiosSource);
		// Richiesta al server, a cui viene passato anche il cancelToken

		// Post request al server
		await axios
			.post(
				"/query",
				{
					endpointUrl: "http://dbpedia.org/sparql",
					language: "it",
					resourceType: "provatipo",
					constraints: constraints,
				},
				{
					cancelToken: axiosSource.token,
				}
			)
			.then((response) => {
				console.log(response.data);
				setQueryResult(response.data);
				// Viene cancellata la richiesta dallo stato in quanto è stata completata
				setRequest(null);
				//setIsLoading(false);
			})
			.catch((error) => {
				if (error.message === "axios request cancelled") {
					console.log(
						"Nuova richiesta ricevuta, questa viene cancellata."
					);
				} else {
					console.log("Errore nell'esecuzione della query.", error);

					//setIsLoading(false);
				}
			});
	}

	return (
		<Container fluid id="main-container">
			<Navbar variant="dark" id="navbar">
				<Navbar.Brand href="/homepage">Swipe</Navbar.Brand>

				<Nav className="mr-auto">
					<Nav.Link href="/homepage">Home</Nav.Link>
					<Nav.Link href="#about">About</Nav.Link>
				</Nav>
			</Navbar>
			{resource !== [] && resource !== undefined ? (
				<Tabs
					className="width-90-centered mt-1"
					activeKey={selectedTab}
					onSelect={(tab) => setSelectedTab(tab)}
				>
					<Tab eventKey="resource" title="Resource">
						<div className="width-90-centered mt-2">
							<h3>{resourceLabel}</h3>
							<p>{resourceComment}</p>
						</div>
						<ResourceTable
							resource={resource}
							setResource={setResource}
						/>
						<br />
						<br />
						<Container fluid id="footer">
							<p>
								Dopo aver modificato gli attributi per
								effettuare una query clicca il tasto QUERY
								presente sulla destra
							</p>
							<Button variant="success" size="lg" onClick={prova}>
								Esegui Query
							</Button>
						</Container>
					</Tab>
					<Tab
						eventKey="results"
						title="Query Results"
						disabled={queryResult === undefined ? true : false}
					>
						{queryResult?.resources?.map((resource) => (
							<ResourcePreview
								key={resource.ID}
								resource={resource}
								toShow={queryResult.toShow}
							/>
						))}
					</Tab>
				</Tabs>
			) : (
				<Container id="notfound-container">
					<h3 className="notfound-msg">
						La risorsa richiesta non è stata trovata
					</h3>
					<Button>GO TO HOMEPAGE</Button>
				</Container>
			)}
		</Container>
	);
}

export default App;
