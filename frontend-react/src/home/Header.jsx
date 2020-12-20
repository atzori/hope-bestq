import React from "react";
import Navbar from "react-bootstrap/Navbar"; //Navbar
import Nav from "react-bootstrap/Nav"; //Nav
import Form from "react-bootstrap/Form"; //Form

export default function Header(props) {
	// Funzione che viene chiamata quando l'utente cambia lingua.
	function changeHandler(event) {
		// Viene memorizzata la lingua nel SessionStorage
		props.setLanguage(event.target.value);
		sessionStorage.setItem("language", event.target.value);
	}
	return (
		<Navbar variant="dark" id="navbar">
			<Navbar.Brand href="#home">Swipe</Navbar.Brand>

			<Nav className="mr-auto">
				<Nav.Link id="current-page">Home</Nav.Link>
				<Nav.Link href="/about">About</Nav.Link>
			</Nav>

			<Form inline id="language-select">
				<Form.Label>Results' language: </Form.Label>

				<Form.Control
					as="select"
					size="sm"
					id="languages"
					value={props.language}
					onChange={changeHandler}
				>
					<option value="it">Italian</option>
					<option value="en">English</option>
				</Form.Control>
			</Form>
		</Navbar>
	);
}
