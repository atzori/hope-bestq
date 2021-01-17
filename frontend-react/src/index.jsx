import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import Home from "./home/Home";
import ResourcePage from "./resource/ResourcePage";

ReactDOM.render(
	<React.StrictMode>
		<ResourcePage
			requestedResource={window.resource.requestedResource}
			label={window.resource.label}
			comment={window.resource.comment}
			language={window.resource.language}
			endpoint={window.resource.endpoint}
		/>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
