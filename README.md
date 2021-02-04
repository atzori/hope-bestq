# How to run the current version of the webapp
To run the app as is, follow these steps:

* move to the repository root
* run `pip install -r requirements.txt` (you might want to do this from a virtual environment)
* launch the backend server: `flask run`

The webapp is now being served at http://localhost:5000/  
The backend server is configured to serve the frontend pages from the **ReactBuilds** folder.

# Instructions for developing

## Prerequisites

### Install Node.js, we recommend version >= 12
Download from node website: https://nodejs.org/en/download/  
Or via nvm: https://github.com/nvm-sh/nvm#installing-and-updating

### Install Yarn, version used for project creation: 1.22
Instructions from the website: https://yarnpkg.com/getting-started/install (npm is included in Node.js)

### Install required packages
Go to directory **frontend-react/**  
Run command: `yarn install`. All the required dependencies are downloaded and installed by this command.

## Development operations for the frontend

By running `yarn start` from the **frontend-react** folder, the whole frontend will be served at http://localhost:3000/  
The frontend server will automatically detect any change to the **.jsx** files, and refresh the UI accordingly.  
If you also need the APIs provided by the backend server, keep it running.

_We suggest you do your testing in this setup, so to have a better feel of the final result._

You might however want to test some minor local changes to the UI: in this case, you might find the two following sections helpful.

### If you only want to preview minor changes in appearence for a specific component
For a specific component preview, you generally need to operate as follows:

* open file **frontend-react/src/index.jsx**
* change the call to `ReactDOM.render` according to your needs:
  ```
  // This enables the preview of component Home
  ReactDOM.render(
	<React.StrictMode>
		<Home />
	</React.StrictMode>,
	document.getElementById("root")
  );
  ```
* move to **frontend-react/**
* run `yarn start`

The webapp is now being served at http://localhost:3000/  
The frontend server will automatically detect any change to the **.jsx** files, and refresh the UI accordingly.  
If you need the APIs provided by the backend server, keep it running.

### Instructions specific to the ResourcePage component
If you need to preview the `ResourcePage` component, do as follows:

* open file **frontend-react/src/index.jsx**
* change the call to `ReactDOM.render`:
  ```
  ReactDOM.render(
	<React.StrictMode>
		<ResourcePage />
	</React.StrictMode>,
	document.getElementById("root")
  );
  ```
* open file **frontend-react/src/resource/ResourcePage.jsx** and un-comment the code block following  
  `//! DA UTILIZZARE SOLO PER DEBUG, SI PUO' ELIMINARE PER LA CREAZIONE DELLA BUILD`
* launch the frontend server
* make sure the backend server is running, too

By browsing http://localhost:3000/ you should be able to test the component with a sample DBpedia entity (Los Angeles).

## Building the project
Once you are done updating and testing the components, it is time to build the project and make the edits permanent:

* open file **frontend-react/src/index.jsx** and be sure the call to `ReactDOM.render` conforms to:
  ```
  ReactDOM.render(
	<React.StrictMode>
		<SinglePage />
	</React.StrictMode>,
	document.getElementById("root")
  );
  ```
* in case you changed file **frontend-react/src/resource/ResourcePage.jsx** as per previous section, restore the block comment
* run `yarn build` from the **frontend-react** folder
* move the contents of folder **frontend-react/build** to **ReactBuilds/SinglePage**
* run the backend server

The webapp is now being served at http://localhost:5000/  
You don't need to keep the frontend server running.
