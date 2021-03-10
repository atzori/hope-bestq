import React from "react";
import Container from "react-bootstrap/Container"; //Container

export default function SearchResults(props) {
	//el.resource.value URI della risorsa
	return (
		<Container id="results-container">
			<h3>{props.resourcesList.length} Resources:</h3>
			{props.resourcesList.map((el) => (
				<Container
					className="results"
					onClick={() => props.getResource(el.resource.value)}
				>
					<p className="result-title">{el.label.value}</p>
					<p className="result-url">URI: {el.resource.value}</p>
					<p className="result-comment">
						{el?.comment?.value ||
							"No comment avaiable for this resource"}
					</p>
				</Container>
			))}
		</Container>
	);
}
