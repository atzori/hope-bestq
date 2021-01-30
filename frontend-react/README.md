# Per iniziare:

Installare node, consigliata versione >= 12, node versione consigliata: 6
Installare Yarn
Andare nella cartella hope-bestq/frontend-react/
Lanciare da terminale il comando: "yarn install" verranno installate tutte le dipendenze necessarie.

Per eseguire il progetto lanciare il comando: "yarn start"
Per creare la build del progetto lanciare il comando: "yarn build"

La versione del progetto utiilizzata ora è si trova all'interno della cartella frontend-react/singlePageApp/SinglePage.jsx

---

Per visualizzare la pagina home recatevi nella cartella ./src e modificare il file index.jsx come segue: - Sostituire il contenuto di ReactDOM.render come segue: ReactDOM.render(<React.StrictMode> <Home> </React.StrictMode>,document.getElementById("root"))

Per Creare la build della home modifichiamo come sopra il file index.jsx e lanciamo il comando "yarn build", nella cartella build troviamo la build della pagina

Per visualizzare la pagine ResourcePage recatevi nella cartella ./src e modificate il file index.jsx come segue: - Sostituire il contenuto di ReactDOM.render come segue: ReactDOM.render(<React.StrictMode> <ResourcePage> </React.StrictMode>,document.getElementById("root")) - Aprire il file ReactPage.jsx che si trova nella cartella ./src/resource e rimuovere le righe commentate sotto il commento "//! DA UTILIZZARE SOLO PER DEBUG, SI PUO' ELIMINARE PER LA CREAZIONE DELLA BUILD" - Recarsi nella pagina iniziale del progetto ed eseguire anche il backend attivando il virtual environment e lanciando il comando "flask run"
! Questo ci permetterà di avere accesso a tutte le funzionalità del backend e ci verrà visualizzata una risorsa per effettuare le prove delle diverse funzioni, la risorsa è Los Angeles

Per creare la build della pagina RosourcePage modificare il file index.jsx come segue: - Sostituire il contenuto di ReactDom.render() come segue: ReactDOM.render(
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
); - Lanciare il comando "yarn build" - Modificare il file index.html presente nella cartella build aggiungendo dopo <noscript></noscript>: <script>window.resource = {{resource | tojson}};</script> - Questo ci permette di utilizzare i dati inviati passati alla build da flask nel backend

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
