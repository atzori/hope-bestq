import React, { useEffect } from "react";
import { Container } from "react-bootstrap";

export default function ResourcePreview({ resource, endpointUrl, language }) {
	function redirectToResource() {
		window.location.href = `/resource?endpoint=${endpointUrl}&language=${language}&uri=${resource.uri}`;
	}

	return (
		<Container className="resource-preview" onClick={redirectToResource}>
			<p className="result-title">{resource.label}</p>
			<p className="result-url">URI: {resource.uri}</p>
			<p className="result-comment">
				{resource.comment || "No comment avaiable for this resource"}
			</p>
			{resource.attributes?.map((attribute) => (
				<>
					<hr />
					<span style={{ fontWeight: "500" }}>
						{attribute.attribute} :
					</span>
					<ul>
						{attribute.values.map((value) => (
							<li>{value}</li>
						))}
					</ul>
				</>
			))}
		</Container>
	);
}
