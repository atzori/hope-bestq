import React, { useState, useEffect } from "react";
import axios from "axios";

// Import del file per lo style Sass
import "./ResourcePage.scss";

import Container from "react-bootstrap/Container"; //Container
import Navbar from "react-bootstrap/Navbar"; //Navbar
import Nav from "react-bootstrap/Nav"; //Nav
import Button from "react-bootstrap/Button";

import ResourceTable from "./ResourceTable";

function App(props) {
	const [resource, setResource] = useState(props.resource);

	function getResource() {
		axios.get("/prova").then((response) => {
			setResource(response.data);
		});
	}

	// useEffect(getResource, []);

	return (
		<Container fluid id="main-container">
			<Navbar variant="dark" id="navbar">
				<Navbar.Brand href="/home">Swipe</Navbar.Brand>

				<Nav className="mr-auto">
					<Nav.Link href="/home">Home</Nav.Link>
					<Nav.Link href="#about">About</Nav.Link>
				</Nav>
			</Navbar>
			<ResourceTable resource={resource} />
			<Container fluid id="footer">
				<p>
					Dopo aver modificato gli attributi per effettuare una query
					clicca il tasto QUERY presente sulla destra
				</p>
				<Button variant="success" size="lg">
					Esegui Query
				</Button>
			</Container>
		</Container>
	);
}

export default App;
