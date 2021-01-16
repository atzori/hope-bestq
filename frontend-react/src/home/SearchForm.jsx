import React, { useState, useEffect } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form"; //Form
import FormControl from "react-bootstrap/FormControl"; //FormControl
import Row from "react-bootstrap/Row"; //Row
import Col from "react-bootstrap/Col"; //Col
import Dropdown from "react-bootstrap/Dropdown"; //Dropdown
import InputGroup from "react-bootstrap/InputGroup"; //InputGroup
import Button from "react-bootstrap/Button"; //Button
import Spinner from "react-bootstrap/Spinner";

export default function SearchForm(props) {
	const [isLoading, setIsLoading] = useState(false);
	const [resourceType, setResourceType] = useState(null);
	const [search, setSearch] = useState("");

	const [searchType, setSearchType] = useState("rdfs:label");
	const [suggestions, setSuggestions] = useState([]);
	/* Stato utilizzato per salvare il cancelToken della richiesta (per l'autocompletamento della ricerca) precedente
	 ** così da poterla cancellare quando se ne invia un altra */
	const [request, setRequest] = useState();

	const radioProps = { inline: true, name: "searchType", type: "radio" };

	function changeResourceType(type) {
		setResourceType(type);
	}

	useEffect(() => {
		setResourceType(null);
	}, [props.endpointTypes]);

	// Funzione chiamata quando l'utente modifica il valore dell'input per la ricerca
	function changeHandler(event) {
		// Se esiste una richiesta precedente ancora in elaborazione viene cancellata.
		if (request) {
			console.log("CANCELLATO"); //!DEBUG
			request.cancel("axios request cancelled");
			setRequest(null);
		}
		const string = event.target.value;
		// Viene impostato il valore dello stato contenente la stringa inserita dall'utente il nuovo valore
		setSearch(string);
		/* Se la stringa inserita dall'utente è vuota vengono cancellati i suggerimenti precedenti, altrimenti
		 ** viene chiamata la funzione che si occupa della richiesta al server per l'autocompletamento della ricerca */
		if (string.length === 0) {
			setSuggestions(null);
			setIsLoading(false);
		} else {
			if (searchType !== "URI") autocompleteSearch(event.target.value);
		}
	}

	// Funzione che si occupa della richiesta al server per l'autocompletamento
	async function autocompleteSearch(string) {
		props.setResourcesList([]);
		setIsLoading(true);
		// Viene generato un cancelToken
		const axiosSource = axios.CancelToken.source();
		// Viene memorizzato nello stato apposito
		setRequest(axiosSource);
		// Richiesta al server, a cui viene passato anche il cancelToken
		await axios
			.get(
				`/autocomplete_search?query=${string}&language=${
					props.language
				}&endpoint=${props.endpointUrl}&resourceType=${
					resourceType ? resourceType.type.value : ""
				}`,
				{
					cancelToken: axiosSource.token,
				}
			)
			.then((response) => {
				console.log(response);
				// Quando arriva la risposta vengono salvati i suggerimenti nello stato
				console.log(response.data);
				setSuggestions(response.data);
				// Viene cancellata la richiesta dallo stato in quanto è stata completata
				setRequest(null);
				setIsLoading(false);
			})
			.catch((error) => {
				if (error.message === "axios request cancelled") {
					console.log(
						"Nuova richiesta ricevuta, questa viene cancellata."
					);
				} else {
					console.log(
						"Errore nell'autocompletamento della ricerca",
						error
					);

					setIsLoading(false);
				}
			});
	}
	const radioChangeHandler = (event) => {
		setSearchType(event.target.value);
	};

	async function submitSearchHandler(event) {
		event.preventDefault();
		if (searchType === "rdfs:label") {
			setIsLoading(true);
			setSuggestions([]);
			// Viene generato un cancelToken
			const axiosSource = axios.CancelToken.source();
			// Viene memorizzato nello stato apposito
			setRequest(axiosSource);
			// Richiesta al server, a cui viene passato anche il cancelToken
			await axios
				.get(
					`/search_by_label?query=${search}&language=${
						props.language
					}&endpoint=${props.endpointUrl}&resourceType=${
						resourceType ? resourceType.type.value : ""
					}`,
					{
						cancelToken: axiosSource.token,
					}
				)
				.then((response) => {
					console.log(response.data);
					props.setResourcesList(response.data);

					if (response.data === []) {
						alert("Risorsa con il label inserito non trovata.");
					}

					// Viene cancellata la richiesta dallo stato in quanto è stata completata
					setRequest(null);
				})
				.catch((error) => {
					if (error.message === "axios request cancelled") {
						console.log(
							"Nuova richiesta ricevuta, questa viene cancellata."
						);
					} else {
						console.log(
							"Errore nell'autocompletamento della ricerca",
							error
						);

						setIsLoading(false);
					}
				});
		} else {
			setIsLoading(true);
			window.location.href = `/resource?endpoint=${props.endpointUrl}&language=${props.language}&uri=${search}`;
		}
	}
	// Variabile che conterrà la lista non ordinata dei suggerimenti (solo se non sarà vuota)
	const suggestList = suggestions && (
		<ul id="autocomplete-ul">
			{suggestions.map((el, i) => (
				<li
					className="autocomplete-li"
					key={i}
					onClick={() =>
						(window.location.href = `/resource?endpoint=${props.endpointUrl}&language=${props.language}&uri=${el.resource.value}`)
					}
				>
					<p>
						{el.label.value}
						<span>{el.resource.value}</span>
					</p>
				</li>
			))}
		</ul>
	);
	return (
		<Container fluid>
			<Row className="justify-content-center mb-2">
				<span style={{ marginRight: "1em", textAlign: "center" }}>
					Cerca per:
				</span>
				<Form.Check
					label="Label"
					value="rdfs:label"
					checked={searchType === "rdfs:label"}
					id="inline-radio-1"
					onChange={radioChangeHandler}
					{...radioProps}
				/>
				<Form.Check
					label="URI"
					value="URI"
					checked={searchType === "URI"}
					id="inline-radio-2"
					onChange={radioChangeHandler}
					{...radioProps}
				/>
			</Row>

			<Row>
				<Col md={{ span: 2, offset: 2 }} sm={12}>
					<Dropdown style={{ float: " left " }}>
						<Dropdown.Toggle id="dropdown-custom-components">
							{resourceType === null
								? "Any type of resource"
								: resourceType.label
								? resourceType.label.value
								: resourceType.type.value}
						</Dropdown.Toggle>

						<Dropdown.Menu as={CustomMenu}>
							{props.endpointTypes.map((el, i) => (
								<Dropdown.Item
									key={i}
									onClick={() => {
										changeResourceType(el);
										console.log(el);
									}}
								>
									{el.label ? el.label.value : el.type.value}
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
					{props.endpointLoading && (
						<Spinner animation="border" role="status">
							<span className="sr-only">Loading...</span>
						</Spinner>
					)}
					{resourceType !== null && (
						<Button
							id="reset-type-btn"
							variant="outline-danger"
							onClick={() => setResourceType(null)}
						>
							Reset
						</Button>
					)}
				</Col>

				<Col md={{ span: 4 }} xs={12}>
					<Form onSubmit={submitSearchHandler}>
						<InputGroup>
							<Form.Control
								type="text"
								name="search"
								placeholder="Type your search"
								autoComplete="off"
								autoFocus
								onChange={changeHandler}
								value={search}
							/>
							<InputGroup.Append>
								<Button
									id="primary-btn"
									variant="outline-primary"
									type="submit"
								>
									Search
								</Button>
							</InputGroup.Append>
						</InputGroup>
					</Form>
					{suggestList}
				</Col>
				<Col>
					{isLoading && (
						<Spinner animation="border" role="status">
							<span className="sr-only">Loading...</span>
						</Spinner>
					)}
				</Col>
			</Row>
		</Container>
	);
}

const CustomMenu = React.forwardRef(
	({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
		const [value, setValue] = useState("");
		return (
			<div
				ref={ref}
				style={style}
				className={className}
				aria-labelledby={labeledBy}
			>
				<FormControl
					autoFocus
					className="mx-3 my-2 w-auto"
					placeholder="Type to filter..."
					onChange={(e) => setValue(e.target.value)}
					value={value}
				/>
				<ul className="list-unstyled">
					{React.Children.toArray(children).filter(
						(child) =>
							!value ||
							child.props.children.toLowerCase().includes(value)
					)}
				</ul>
			</div>
		);
	}
);
