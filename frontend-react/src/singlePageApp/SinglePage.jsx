import React, { useState, useEffect } from "react";
// Import axios, libreria per effettuare le richieste Get e Post al server.
import axios from "axios";
// Import del file per lo style Sass
import "./style/SinglePageStyle.scss";
// Import dei component di react-bootstrap utilizzati
import Container from "react-bootstrap/Container"; //Container
import Row from "react-bootstrap/Row"; //Row
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Form from "react-bootstrap/Form";
// Import dei component che compongono la pagina
import Header from "./Header";
import EndpointSelection from "./EndpointSelection";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import ResourceTable from "./ResourceTable";
import ResourcePreview from "./ResourcePreview";
// Import dello spinner che viene mostrato quando si attende una risposta dal server
import loadingImage from "./images/tail-spin.svg";

export default function SinglePage() {
	// Stato che conterrà il lingua scelta dall'utente per i risultati
	const [language, setLanguage] = useState(
		sessionStorage.getItem("language") || "it"
	);
	// Stato in cui viene memorizzato l'endpoint scelto dall'utente, di default viene utilizzato quello di dbpedia
	const [endpointUrl, setEndpointUrl] = useState(
		sessionStorage.getItem("endpoint") || "http://dbpedia.org/sparql"
	);
	// Stato che conterrà gli rdf:type delle risorse presenti nell'endpoint inserito dall'utente
	const [endpointTypes, setEndpointTypes] = useState(undefined);
	/*Stato che indica se, a seguito di un cambio di endpoint da parte dell'utente, si sta attendendo la lista
	 * di rdf:type delle risorse presenti nel nuovo endpoint inserito, viene utilizzato per mostrare uno spinner di caricamento.*/
	const [endpointLoading, setEndpointLoading] = useState(false);
	// Stato che contiene rdf type su cui si effettua la ricerca
	const [searchTypeConstraint, setSearchTypeConstraint] = useState(undefined);
	// Stato che contiene la lista di risorse che hanno il label inserito dall'utente a seguito di una ricerca tramite il tasto Search,
	const [resourcesList, setResourcesList] = useState(undefined);
	// Stato che conterrà la risorsa cercata dall'utente
	const [resource, setResource] = useState(undefined);
	// Stato che conterrà il label della risorsa cercata dall'utente
	const [resourceLabel, setResourceLabel] = useState(undefined);
	// Stato che conterrà il commento della risorsa cercata dall'utente
	const [resourceComment, setResourceComment] = useState(undefined);
	/*Stato che viene utilizzato per memorizzare il cancel token dell'ultima richiesta inviata dall'utente
	 *Per poter cancellare la richiesta in caso ne venga fatta una nuova */
	const [request, setRequest] = useState(undefined);
	// Stato che conterrò i risultati della query effettuata dall'utente
	const [queryResult, setQueryResult] = useState(undefined);
	// Stato che contiene la tab selezionata dall'utente, di default viene mostrata la tab di ricerca
	const [selectedTab, setSelectedTab] = useState("search");
	// Stato utilizzato per mostrare uno spinner di caricamento in caso di attesa di una risposta dal server a seguito di una richiesta
	const [isLoading, setIsLoading] = useState(false);
	// Stato utilizzato per continuare ad utilizzare il vincolo sul tipo
	const [resourceTypeConstraint, setResourceTypeConstraint] = useState({
		type: undefined,
		isConstraint: false,
	});
	// Quando viene caricata la pagine vengono caricati i dati presenti nel sessionStorage in caso siano già stati salvati altrimenti vengono impostati i valori di default
	useEffect(() => {
		// Get del valore presente nel session storage della lingua selezionata dall'utente in precedenza
		const sessionLanguage = sessionStorage.getItem("language");
		// Get del valore presente nel session storage del endpoint selezionato dall'utente in precedenza
		const sessionEndpoint = sessionStorage.getItem("endpoint");
		// Se è presente una lingua salvata nel session storage viene impostato lo stato contenente la lingua al valore salvato
		if (sessionLanguage) {
			setLanguage(sessionLanguage);
		} else {
			// Se non è presente viene impostato con la lingua di default italiano
			sessionStorage.setItem("language", "it");
		}
		// Se è presente un endpoint salvato nel session storage viene impostato lo stato contenente l'endpoint al valore salvato
		if (sessionEndpoint) {
			setEndpointUrl(sessionEndpoint);
		} else {
			// Se non è presente viene impostato come endpoint di default l'endpoint di dbpedia
			sessionStorage.setItem("endpoint", "http://dbpedia.org/sparql");
		}
		console.log("RICHIESTA!"); //! STAMPA DI DEBUG
		// Viene eseguita la funzione che fa la richiesta degli rdf:type delle risorse presenti nell'endpoint selezionato
		getEndpointTypes(sessionEndpoint || "http://dbpedia.org/sparql");
		// Viene posto a undefined il valore dello stato che contiene rdf type precedentemente selezionato

		setSearchTypeConstraint(undefined);
	}, []);
	/* Funzione asincrona che tramite chiamata all'api ottiene gli rdf:type dell'endpoint inserito dall'utente e li salva nello stato.
	 endpointUrl è l'endpoint su cui effettuare la query per trovare gli rdf:type delle risorse presenti nell'endpoint */
	async function getEndpointTypes(endpointUrl) {
		// Viene posto a undefined lo stato che contiene gli rdf:type così da eliminare i precedenti salvati se presenti
		setEndpointTypes(undefined);
		// Viene settato a true il booleano che indica se si sta attendendo la risposta del server, così da dare un feedback visivo all'utente
		setEndpointLoading(true);
		// Richiesta Get all'url /get_types a cui viene passato come valore l'url dell'endpoint inserito dall'uente
		await axios
			.get(`/get_types?endpoint=${endpointUrl}`)
			.then((response) => {
				//! log di debug
				console.log(response.data);
				// Viene salvata la lista di rdf:type nello stato
				setEndpointTypes(response.data);
			})
			.catch((error) => {
				// In caso di errore nella risposta viene scritto nel log l'errore
				console.log(
					"Errore nel caricamento dei tipi dell'endpoint:" + error
				);
			});
		// Viene settato a false il booleano di caricamento in quanto la risposta è stata ricevuta
		setEndpointLoading(false);
	}
	/* Funzione asincrona che esegue una richiesta post al server per eseguire la query con i vincoli posti dall'utente */
	async function query() {
		// Creazione di una lista contenente i soli uri delle proprietà
		const attributes = resource.map((attribute) => attribute.property.uri);
		console.log(attributes); //! Log di debug
		// Chiamata all'api che salva l'ordine degli attributi inviando l'intera lista di attributi della risorsa
		console.log(resourceTypeConstraint.type);
		let rdftypeConstraint = null;

		console.log("BBBBBBBBBBBBBBBBBBBBB", rdftypeConstraint);
		if (
			resourceTypeConstraint.isConstraint &&
			resourceTypeConstraint.type !== undefined
		) {
			rdftypeConstraint = resourceTypeConstraint.type.uri;
		}

		console.log("CCCCCCCCCCCCCCCCCCCCC", rdftypeConstraint);
		axios
			.post("/save_order", {
				attributes: attributes,
				endpoint: endpointUrl,
				rdftypeConstraint: rdftypeConstraint,
			})
			.then((response) => console.log(response))
			.catch((error) => console.log(error));

		// Viene settato il booleano che indica se vi è un caricamendo della pagina a true
		setIsLoading(true);
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
		console.log(constraints); //! Log di debug
		// Se esiste una richiesta precedente ancora in elaborazione viene cancellata.
		if (request) {
			console.log("CANCELLATO"); //!DEBUG
			// Viene cancellata la richiesta precedente
			request.cancel("axios request cancelled");
			// Viene settato a undefined lo stato che contiene la richiesta in quanto è stata cancellata
			setRequest(undefined);
		}
		// Viene salvato il cancel token della richiesta axios
		const axiosSource = axios.CancelToken.source();
		// Viene memorizzato nello stato apposito
		setRequest(axiosSource);

		/* Post request al server, a cui viene passato:
		  L'url dell'endpoint selzionato dall'utente, la lingua selezionata per i risultati, la lista di vincoli e anche il cancelToken */
		await axios
			.post(
				"/query",
				{
					endpointUrl: endpointUrl,
					language: language,
					constraints: constraints,
					rdftypeConstraint: rdftypeConstraint,
				},
				{
					cancelToken: axiosSource.token,
				}
			)
			.then((response) => {
				console.log(response.data); //! Log di debug
				// Viene salvata la lista dei risultati della quer nello stato che contiene i risultati della query
				setQueryResult(response.data);
				// Viene cancellata la richiesta dallo stato in quanto è stata completata
				setRequest(undefined);
				// Viene spostata la visualizzazione alla tab results in cui vengono visualizzati i risultati della query
				setSelectedTab("results");
				// Viene impostata la visualizzazione al top della pagina
				window.scrollTo(0, 0);
			})
			.catch((error) => {
				// Se vi è un errore nella risposta viene scritto nel log l'errore
				if (error.message === "axios request cancelled") {
					console.log(
						"Nuova richiesta ricevuta, questa viene cancellata."
					);
				} else {
					console.log("Errore nell'esecuzione della query.", error);
				}
			});
		// Viene impostato a false il booleano che indica se si è in attesa di una risposta dal server in quanto è stata ricevuta
		setIsLoading(false);
	}
	/**Funzione asincrona che effettua la richiesta di una risorsa al server tramite una richiesta get a cui vengono passati i seguenti valori:
	 * l'url dell'endpoint selezionato dall'utente, la lingua in cui ricevere i risultati e l'uri della risorsa che si sta chiedendo*/
	async function getResource(uri) {
		// Viene settato a true il booleano che indica che si sta attendendo una risposta dal server
		setIsLoading(true);
		// Viene settato a undefined lo stato che contiene la risorsa, il suo comment e il suo label per eliminare la precedente risorsa salvata
		setResource(undefined);
		setResourceLabel(undefined);
		setResourceComment(undefined);
		// Richiesta get al server per ottenere la risorsa selezionata dall'utente
		await axios
			.get(
				`/resource?endpoint=${endpointUrl}&language=${language}&uri=${uri}`
			)
			.then((response) => {
				console.log(response.data); //!Log di debug
				// Viene salvata nello stato apposito la risorsa richiesta
				setResource(response.data.requestedResource);
				// Viene salvato nello apposito stato il label della risorsa
				setResourceLabel(response.data.label);
				// Viene salvato nello apposito stato il comment della risorsa
				setResourceComment(response.data.comment);
				// Viene salvato rdf:type su cui è stato posto il vincolo se presente
				if (searchTypeConstraint !== undefined) {
					console.log(searchTypeConstraint);
					setResourceTypeConstraint({
						type: {
							label: searchTypeConstraint?.label?.value,
							uri: searchTypeConstraint?.type?.value,
						},
						isConstraint: true,
					});
				} else {
					setResourceTypeConstraint({
						type: undefined,
						isConstraint: false,
					});
				}
				// Viene spostata la visualizzazione alla tab resource in cui è possibile vedere la tabella della risorsa richiesta
				setSelectedTab("resource");
				// Viene spostata la visualizzazione al top della pagina
				window.scrollTo(0, 0);
			})
			.catch((error) => {
				// In caso di errore nella risposta viene scritto nel log il messaggio di errore ricevuto
				console.log("Errore nella richiesta di una risorsa: " + error);
			});
		// Viene settato a false il booleano che indica che si sta aspettando una risposta dal server in quanto è stata ricevuta
		setIsLoading(false);
	}

	return (
		<Container fluid id="main-container">
			{isLoading && (
				<div id="loading">
					<img src={loadingImage} alt="Loading..." />
				</div>
			)}
			<Header language={language} setLanguage={setLanguage} />
			<Tabs
				className="width-90-centered mt-1"
				activeKey={selectedTab}
				onSelect={(tab) => setSelectedTab(tab)}
			>
				<Tab eventKey="search" title="Search" className="tab">
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
						endpointLoading={endpointLoading}
						setResourcesList={setResourcesList}
						getResource={getResource}
						resourceType={searchTypeConstraint}
						setResourceType={setSearchTypeConstraint}
					/>
					{resourcesList?.length > 0 && (
						<SearchResults
							resourcesList={resourcesList}
							language={language}
							endpointUrl={endpointUrl}
							getResource={getResource}
						/>
					)}
				</Tab>
				<Tab
					eventKey="resource"
					title="Resource"
					className="tab"
					disabled={resource === undefined ? true : false}
				>
					<div className="width-90-centered mt-2">
						<h3>{resourceLabel}</h3>
						<p>
							{resourceComment ||
								"No comment avaiable for this resource"}
						</p>
					</div>
					{resourceTypeConstraint.type !== undefined && (
						<Form
							inline
							className="width-90-centered mb-2 resource-type"
						>
							<Form.Check
								type="checkbox"
								id="resource-type-checkbox"
								checked={resourceTypeConstraint.isConstraint}
								onChange={() => {
									const aux = {
										type: resourceTypeConstraint.type,
										isConstraint: !resourceTypeConstraint.isConstraint,
									};
									setResourceTypeConstraint(aux);
								}}
							/>
							<Form.Label htmlFor="resource-type-checkbox">
								Continue with the constraint on the type:
								<span>
									{" <"}
									{resourceTypeConstraint?.type?.label ||
										resourceTypeConstraint?.type?.uri}
									{">"}
								</span>
							</Form.Label>
						</Form>
					)}
					<ResourceTable
						resource={resource}
						setResource={setResource}
					/>
					<br />
					<br />
					<Container fluid id="footer">
						<p>
							After having inserted the constraints that define
							the query you want to perform click the button "Run
							Query" on the right.
						</p>
						<Button variant="success" size="lg" onClick={query}>
							Run Query
						</Button>
					</Container>
				</Tab>
				<Tab
					eventKey="results"
					title={
						queryResult
							? `Query Results (${queryResult?.length})`
							: "Query Results"
					}
					className="tab"
					disabled={queryResult === undefined ? true : false}
				>
					{queryResult?.map((resource) => (
						<ResourcePreview
							key={resource.ID}
							resource={resource}
							getResource={getResource}
						/>
					))}
				</Tab>
			</Tabs>
		</Container>
	);
}
