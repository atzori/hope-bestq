from flask import Flask, render_template, redirect, make_response, request, json, jsonify
from pathlib import Path
from query_functions import run_query, user_query

app = Flask(__name__, template_folder="ReactBuilds")


@app.route('/')
def redirect_home():
    return redirect('/homepage')


@app.route('/homepage')
def home():
    app.static_folder = 'ReactBuilds/homepage/static'
    return render_template('homepage/index.html')


# API che restituisce gli rdf:type di risorse presenti nell'endpoint selezionato ordinati in base al numero di risorse presenti con tale rdf:type
@app.route('/get_types', methods=['GET'])
def get_endpoint_types():
    # Salvo l'endpoint su cui eseguire la query inserito nella GET request.
    endpoint = request.args.get('endpoint')
    # Variabile che conterrà i tipi di risorsa presenti nell'endpoint.
    endpoint_types = []
    # Variabile usata per salvare il contenuto del file in cui sono salvati i tipi di risorsa per ogni endpoint su cui è già stata fatta la richiesta.
    data = {}
    # Query per ricercare i tipi di risorsa presenti nell'endpoint.
    query = """select ?type ?label where{
                    {select distinct ?type count(?resource) as ?count
                    where {?type rdf:type ?Concept. ?resource rdf:type ?type} group by ?type}
                    OPTIONAL{?type rdfs:label ?label FILTER(LANG(?label) = "")}
                    OPTIONAL{?type rdfs:label ?label FILTER(LANGMATCHES(LANG(?label),"it"))}
                    OPTIONAL{?type rdfs:label ?label FILTER(LANGMATCHES(LANG(?label),"en"))}
                }order by desc(?count)"""
    # File che contiene i tipi delle risorse contenuti negli endpoint già utilizzati.
    my_file = Path("./endpointTypes/data.json")
    # Se il file esiste salvo il contenuto del file nella variabile data
    if my_file.exists():
        with open('./endpointTypes/data.json') as f:
            data = json.load(f)
        # Se nel file è già presente l'endpoint che ha inserito l'utente salvo la lista dei tipi delle risorse presenti nell'endpoint
        if endpoint in data:
            endpoint_types = data[endpoint]
            # Viene restituita la lista contenente i tipi di risorse presenti nell'endpoint
            return make_response(jsonify(endpoint_types))
    # Se il file non esiste o se esiste ma non è presente l'endpoint inserito dall'utente viene effettuata la query
    query_result = run_query(endpoint, query, 0)
    if type(query_result) is not str:
        endpoint_types = query_result['results']['bindings']
        # Viene aggiunta la lista di tipi di risorse presenti nell'endpoint al variabile data, in cui è salvato il contenuto del file
        data.update({endpoint: endpoint_types})
        # Viene scritto/riscritto il file con l'aggiunta del nuovo endpoint e la sua lista di tipi di risorse presenti.
        with open(f'./endpointTypes/data.json', 'w') as outfile:
            json.dump(data, outfile, indent=4)
        # Viene restituita la lista contenente i tipi di risorse presenti nell'endpoint
        return make_response(jsonify(endpoint_types))
    else:
        return make_response(jsonify(query_result), 408)


# Api per l'autocompletamento della ricerca.
@app.route('/autocomplete_search', methods=['GET'])
def autocomplete_search():
    # La stringa inserita dall'utente viene passata tramite GET request come parametro "query"
    search = request.args.get('query')
    # La stringa contenente la lingua in cui ottenere i risultati come parametro "language"
    favorite_language = request.args.get('language')
    # In caso non sia possibile trovare risultati con la lingua scelta dall'utente vengono cercati risultati nella seconda lingua disponibile
    secondary_language = 'en' if favorite_language == 'it' else 'it'
    # La stringa contenente l'endpoint su cui effettuare la ricerca come parametro "endpoint"
    endpoint_URL = request.args.get('endpoint')
    # rdf:type della risorsa cercata dall'utente
    resource_type = request.args.get('resourceType')
    # ! Print per debug
    print(resource_type)
    print(search)
    # In caso l'utente abbia scelto un rdf:type a cui deve appartenere la risorsa cercata viene inserito il vincolo nella query
    additional_constraint = '' if resource_type == '' else f'?resource rdf:type <{resource_type}>.'

    # Query che seleziona le prime n 10 risorse che hanno come sottostringa iniziale (del rdfs:label) quella inserita dall'utente
    if endpoint_URL == "http://dati.camera.it/sparql" and resource_type != None:
        query = 'SELECT DISTINCT ?resource (SAMPLE(?label) AS ?label) WHERE { '\
            '?resource rdfs:label ?label. '\
            f'{additional_constraint} '\
            'FILTER(LANGMATCHES(LANG(?label),"it") || LANGMATCHES(LANG(?label),"en") || LANG(?label) = "") '\
            f'FILTER( REGEX(?label, "^{search}", "i") )'\
            '} GROUP BY ?resource LIMIT 10'
    else:
        query = 'SELECT DISTINCT ?resource (SAMPLE(?label) AS ?label) WHERE { '\
            '?resource rdfs:label ?label. '\
            f'?label bif:contains "\'{search}*\'". '\
            f'{additional_constraint} '\
            'FILTER(LANGMATCHES(LANG(?label),"it") || LANGMATCHES(LANG(?label),"en") || LANG(?label) = "") '\
            '} GROUP BY ?resource '

    print(query)
    # results conterrà il risultato della query
    query_result = run_query(endpoint_URL, query, 40)
    print(query_result)
    if type(query_result) is not str:
        # Viene assegnata la lista delle risorse ottenute a possible_search_list
        possible_search_list = query_result['results']['bindings']
        # Ordinso in base alla lunghezza del label
        possible_search_list.sort(key=lambda x: len(x['label']['value']))
        # Prendo solo i primi 10 risultati
        possible_search_list = possible_search_list[:10]

        # Risposta con la lista delle risorse
        return make_response(jsonify(possible_search_list))
    else:
        return make_response(jsonify(query_result), 408)


# API per la ricerca di risorse aventi un determinato rdfs:label
@app.route('/search_by_label', methods=["GET"])
def search_by_label():
    # La stringa contenuta in search.
    search = request.args.get('query')
    # La stringa contenente la lingua scelta dall'utente in cui visualizzare i risultati
    favorite_language = request.args.get('language')
    # Salviamo la stringa contenente l'endpoint su cui eseguire la ricerca
    endpoint_URL = request.args.get('endpoint')
    # rdf:type della risorsa cercata dall'utente
    resource_type = request.args.get('resourceType')

    # In caso non sia possibile trovare risultati con la lingua scelta dall'utente vengono cercati risultati nella seconda lingua disponibile
    secondary_language = 'en' if favorite_language == 'it' else 'it'

    # Se searched non contiene nulla da errore.
    if not search:
        return "Error"
    # Se l'utente ha selezionato un rdf:type per la risorsa che sta cercando viene aggiunto il vincolo alla query
    additional_constraint = '' if resource_type == '' else f'?resource rdf:type <{resource_type}>.'

    # query = 'select distinct ?resource group_concat(distinct ?label; separator=" | ") as ?label ' \
    #        'group_concat(distinct ?comment; separator=" | ") as ?comment where {'\
    #        '?resource rdfs:label ?label.'\
    #        f'{additional_constraint}'\
    #        f'FILTER(LANGMATCHES(LANG(?label),"{favorite_language}") || LANGMATCHES(LANG(?label),"{secondary_language}") || LANG(?label) = "")'\
    #        f'FILTER( REGEX(?label, "^{search}$", "i") )'\
    #        'OPTIONAL{?resource rdfs:comment ?comment FILTER(LANG(?comment) = "")}'\
    #        f'OPTIONAL{{?resource rdfs:comment ?comment FILTER(LANGMATCHES(LANG(?comment),"{favorite_language}"))}}'\
    #        f'OPTIONAL{{?resource rdfs:comment ?comment FILTER(LANGMATCHES(LANG(?comment),"{secondary_language}"))}}'\
    #        '}GROUP BY ?resource LIMIT 10'
    query = 'SELECT DISTINCT ?resource (SAMPLE(?label) AS ?label) (SAMPLE(?comment) as ?comment) where {'\
            '?resource rdfs:label ?label.'\
            f'?label bif:contains "\'{search}*\'"'\
            f'{additional_constraint}'\
            f'FILTER(LANGMATCHES(LANG(?label),"{favorite_language}") || LANGMATCHES(LANG(?label),"{secondary_language}") || LANG(?label) = "")'\
            'OPTIONAL{?resource rdfs:comment ?comment FILTER(LANG(?comment) = "")}'\
            f'OPTIONAL{{?resource rdfs:comment ?comment FILTER(LANGMATCHES(LANG(?comment),"{favorite_language}"))}}'\
            f'OPTIONAL{{?resource rdfs:comment ?comment FILTER(LANGMATCHES(LANG(?comment),"{secondary_language}"))}}'\
            '}GROUP BY ?resource'

    print(query)
    results = run_query(endpoint_URL, query, 120)
    print(results)

    if type(results) is not str:
        # Viene assegnata la lista delle risorse ottenute a possible_search_list
        possible_search_list = results['results']['bindings']
        # Ordinso in base alla lunghezza del label
        possible_search_list.sort(key=lambda x: len(x['label']['value']))
        # Prendo solo i primi 10 risultati
        possible_search_list = possible_search_list[:10]

        # Risposta con la lista delle risorse
        return make_response(jsonify(possible_search_list))
    else:
        return make_response(jsonify(results), 408)


# route per la visualizzazione di una risorsa, tramite una get request vengono inviati: l'endpoint su cui fare la ricarca, l'uri della risorsa cercata e la lingua per i risultati
@app.route('/resource', methods=['GET'])
def search_by_uri():
    app.static_folder = 'ReactBuilds/resource/static'
    endpoint = request.args.get('endpoint')
    language = request.args.get('language')
    resource_uri = request.args.get('uri')

    query = 'select distinct ?propertyURI ?propertyLabel ?value ?valueLabel where {' \
        f'<{resource_uri}> ?propertyURI ?value.' \
        'OPTIONAL{?propertyURI rdfs:label ?propertyLabel. FILTER( (LANGMATCHES(LANG(?propertyLabel), "en") || LANG(?propertyLabel)="") ) }' \
        f'OPTIONAL{{?value rdfs:label ?valueLabel FILTER( LANGMATCHES(LANG(?valueLabel),"{language}") || LANG(?valueLabel)="" ) }}'\
        f'FILTER( LANGMATCHES(LANG(?value),"{language}") || LANG(?value)="" || !isLiteral(?value))' \
        '} GROUP BY ?propertyURI ?propertyLabel ORDER BY ?propertyURI'
    query_result = run_query(endpoint, query, 0)
    print(query_result)
    if type(query_result) is not str:

        resource = structure_attributes_list(
            query_result['results']['bindings'])
        #!DEBUG
        print(resource)
        resource = sort_attribute_list(resource)

        label = next(
            (attribute['value'][0]['value'] for attribute in resource if attribute['property']['uri'] == 'http://www.w3.org/2000/01/rdf-schema#label'), None)
        comment = next(
            (attribute['value'][0]['value'] for attribute in resource if attribute['property']['uri'] == 'http://www.w3.org/2000/01/rdf-schema#comment'), None)

        return render_template('resource/index.html', resource={'requestedResource': resource, 'label': label, 'comment': comment, 'language': language, 'endpoint': endpoint})
    else:
        return redirect_home


# API per l'esecuzione della query con i vincoli posti dall'utente
@app.route('/query', methods=['POST'])
def query():
    req = request.get_json()
    endpoint_URL = req['endpointUrl']
    language = req['language']
    constraints = req['constraints']

    print(constraints)
    query_result, attribute_to_show = user_query(
        constraints, endpoint_URL, language)

    if type(query_result) is not str:
        resources = query_result['results']['bindings'] or None
        resources = [vars(ResourcePreview(resource, attribute_to_show, index))
                     for index, resource in enumerate(resources)]
        return make_response(jsonify(resources))
    else:
        if query_result == "Nessun Risultato":
            return make_response("Nessun risultato trovato", 404)
        else:
            return make_response(jsonify(query_result), 408)


# API per il salvataggio dell'ordine scelto dall'utente per la visualizzazione degli attributi
@app.route('/save_order', methods=['POST'])
def save_user_order():
    req = request.get_json()
    # Salvataggio dell'ordinamento tramite: "attributo modificato di posizione", "attributo precedente", "attributo successivo"
    """
    element = req['selected']
    prev_element = req['prev']
    next_element = req['next']

    order = {element: {'prev': prev_element, 'next': next_element}}

    my_file = Path('./sortData/data.json')
    data = {}

    if my_file.exists():
        with open(my_file) as f:
            data = json.load(f)

    data.update(order)

    with open(my_file, 'w') as outfile:
        json.dump(data, outfile, indent=4)
    """
    # Salvataggio dell'ordinamento attraverso il salvataggio della lista completa degli attributi in ordine
    attribute_list = req['attributes']
    my_file = Path('./sortData/data.json')

    with open(my_file, 'w') as outfile:
        json.dump(attribute_list, outfile, indent=4)

    return make_response("OK", 201)


# API DI DEBUG PER L'ESECUZIONE DELLA PAGINA NON BUILDATA RESOURCE
@app.route('/prova')
def prova():

    with open('./prova.json') as f:
        data = json.load(f)

    data = structure_attributes_list(data)
    data = sort_attribute_list(data)

    label = next(
        (attribute['value'][0]['value'] for attribute in data if attribute['property']['uri'] == 'http://www.w3.org/2000/01/rdf-schema#label'), None)
    comment = next(
        (attribute['value'][0]['value'] for attribute in data if attribute['property']['uri'] == 'http://www.w3.org/2000/01/rdf-schema#comment'), None)
    return make_response(jsonify({'data': data, 'label': label, 'comment': comment}))


# FUnzione che data una lista di attributi, modifica la struttura dati in cui sono memorizzati per poter effettuare azioni in frontend
def structure_attributes_list(attributes_list):
    # LETTURA DA FILE PER DEBUGGING
    # with open('./prova.json') as f:
    #    data = json.load(f)
    # attributes_list = data

    # Variabile che conterrà la lista di attributi al termine della formattazione corretta degli attributi
    structured_attributes_list = []
    # Utilizzo la classe per creare oggetti attribute e sostituirli agli oggetti ottenuti dalla query
    attributes_list = [vars(ResourceAttribute(attribute, index))
                       for index, attribute in enumerate(attributes_list)]
    # Per ogni attributo nella lista veongono filtrati gli attributi con la stessa proprietà in modo tale da inserire
    # i diversi valori per la stessa proprietà in una lista e così mostrare solo una volta la proprietà con i diversi valori
    for attribute in attributes_list:
        uri_property = attribute['property']['uri']
        # Filtro la lista di attributi con lo stesso uri
        same_uri_list = [
            attribute for attribute in attributes_list if attribute['property']['uri'] == uri_property]
        # Utilizzo la classe AttributeValue per creare oggetti value e li inserisco in una lista
        value_list = [vars(AttributeValue(attribute['value'], index, attribute['ID']))
                      for index, attribute in enumerate(same_uri_list)]
        # Filtro la lista di attributi togliendo quelli già salvati ?
        attributes_list = [
            attribute for attribute in attributes_list if attribute['property']['uri'] != uri_property]
        # Se la lista di valori dell'attributo non è vuota viene inserita la lista di attributi nel campo value dell'attributo
        if value_list:
            attribute['value'] = value_list
            # Viene inserito l'attributo nella lista che verrà restituita
            structured_attributes_list.append(attribute)

    return structured_attributes_list


def sort_attribute_list(attribute_list):
    my_file = Path('./sortData/data.json')

    if my_file.exists():
        with open(my_file) as f:
            sorted_attributes = json.load(f)

        attribute_list.sort(key=lambda x: sorted_attributes.index(
            x['property']['uri']) if x['property']['uri'] in sorted_attributes else len(sorted_attributes))

    return attribute_list


class ResourcePreview:
    def __init__(self, resource, attribute_to_show, resource_index):
        self.ID = f'resource_{resource_index}'
        self.label = resource['label']['value'] if 'label' in resource else None
        self.uri = resource['resource']['value']
        self.comment = resource['comment']['value'] if 'comment' in resource else None

        self.thumbnail = resource['thumbnail']['value'] if 'thumbnail' in resource else None
        attributes = [{'attributeID': attribute['ID'], 'attribute': attribute['attribute'], 'values': resource[attribute['ID']]
                       ['value'].split(' | ')} for attribute in attribute_to_show]
        # for attributeID in attribute_to_show:
        #    attributes.update(
        #        {attributeID: resource[attributeID]['value'].split(' | ')})
        self.attributes = attributes


# Resource -> lista di proprietà della risorsa
# Resource Attribute -> Una determinata attributo della risorsa contenente (URI proprietà e label se presente, lista di valori della proprietà,
# un ID, un booleano che indica se deve essere effettuato lo show della proprietà, un booleano che indica se è stato selezionato per la query RIMUOVIBILE)
# AttributeValues -> Lista di valori di una proprietà
# AttributeValue -> Valore di una proprietà, contiene (un ID, il valore, il label del valore, un booleano modifying che indica se si sta modificando il valore,
# un booleano che indica se è stato modificato il valore, e una stringa che indica il metodo di comparazione scelto.


class ResourceAttribute:
    def __init__(self, attribute, attribute_index):
        uri = attribute['propertyURI']['value']
        label = attribute['propertyLabel']['value'] if 'propertyLabel' in attribute else None
        self.ID = f'prop_{attribute_index}'
        self.property = {'uri': uri, 'label': label}
        self.show = False
        self.isConstraint = False
        value_type = attribute['value']['type']
        value_datatype = attribute['value']['datatype'] if 'datatype' in attribute['value'] else None
        value = attribute['value']['value']
        value_label = attribute['valueLabel']['value'] if 'valueLabel' in attribute else None
        self.value = {'type': value_type, 'datatype': value_datatype,
                      'value': value, 'label': value_label}


class AttributeValue:
    def __init__(self, value, value_index, attribute_id):
        self.ID = f'{attribute_id}_val_{value_index}'
        self.type = value['type']
        self.datatype = value['datatype']
        self.value = value['value']
        self.label = value['label']
        self.editing = False
        self.edited = False
        if self.label is None and self.type != 'literal':
            if self.type == 'uri':
                self.comparison = 'uri'
            else:
                self.comparison = 'type-based'
        else:
            self.comparison = 'exact-string'


if __name__ == '__main__':
    app.run()
