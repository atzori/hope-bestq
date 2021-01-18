from SPARQLWrapper import SPARQLWrapper, JSON
from flask import json
import socket


def run_query(endpoint_URL, query, timeout):
    # Creazione del wrapper sull'endpoint selezionato dall'utente
    sparql = SPARQLWrapper(
        endpoint_URL, agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11")
    # Impostazione di defaultGraph (testato solo per DBPEDIA, trovare metodo per farlo funzionare in tutti)
    if endpoint_URL == "http://dbpedia.org/sparql":
        sparql.addDefaultGraph(endpoint_URL.replace('/sparql', ''))

    # Viene impostato timeout di 30 secondi sulla query
    if timeout is not None or timeout != 0:
        sparql.setTimeout(timeout)
        # Timeout inserito come parametro della richiesta in millisecondi
        sparql.addParameter("timeout", str(timeout*1000))
    # Viene impostata la query
    sparql.setQuery(query)
    # Viene impostato il formato di conversione del risultato della query in JSON
    sparql.setReturnFormat(JSON)
    # Viene eseguita la query e restituito il dizionario contenente il risultato della stessa se riceve la risposta
    response_data = None

    #! DEBUG stampa della richiesta
    # print(vars(sparql._createRequest()))
    #a = sparql.query()
    # print(a)

    try:
        response_data = sparql.query().convert()
        print(response_data)
    except socket.timeout:
        response_data = "ERROR: Timeout superato"
    except Exception:
        response_data = "ERROR: Errore generico"
    finally:
        return response_data if type(response_data) is not str and response_data['results']['bindings'] != [] else "Nessun Risultato"


def get_value_and_operator(attribute_value):
    value = (attribute_value['label'] or attribute_value['value']).strip()
    # Se non è stato inserito nessun'operatore viene impostato come default l'uguale
    operatore = '='
    # Se l'utente ha inserito >= o <=, viene salvato l'operatore e viene rimosso dal value
    if(value[0] == '>' or value[0] == '<') and value[1] == '=':
        operatore = value[:2]
        value = value[2:].strip()
    # Se l'utente a inserito '>' o '<' o '=' viene salvato l'operatore e rimosso dal value
    elif value[0] == '>' or value[0] == '<' or value[0] == '=':
        operatore = value[0]
        value = value[1:].strip()

    # Viene restituito l'operatore e la stringa contenente il value senza operatore all'interno
    return value, operatore


def create_type_based_comparison(attribute_value, value, operatore):
    # http://www.w3.org/2001/XMLSchema#date potrebbe non funzionare
    value_datatype = attribute_value['datatype']
    value_id = attribute_value['ID']

    value_id_label = f'{value_id}_label' if attribute_value['label'] != None else None
    numeric_datatypes = None

    with open('./numericDatatypes.json') as datatypes:
        numeric_datatypes = json.load(datatypes)

    if attribute_value['datatype'] in numeric_datatypes:
        return f'?{value_id_label or value_id} {operatore} "{value}"^^<{value_datatype}> '
    else:
        return f'xsd:double(?{value_id_label or value_id}) {operatore} {value} '


def user_query(constraints, endpoint_URL, language):
    query_select = ''
    query_body = ''
    query_filter = ''
    attribute_to_show = []

    for attribute in constraints:
        attribute_id = attribute['ID']
        property_uri = attribute['property']['uri']

        if attribute['show']:
            terminatore_stringa = '. ' if attribute == constraints[-1] and len(
                attribute['value']) == 0 else '; '

            query_body += f'<{property_uri}> ?{attribute_id} {terminatore_stringa}'
            query_select += f' group_concat(distinct ?{attribute_id}; separator=" | ") as ?{attribute_id} '

            # il valore dell'uri dell'attributo o del label se presente:
            attribute_uri_or_label = attribute['property']['label'] or property_uri
            attribute_to_show.append(
                {'ID': attribute_id, 'attribute': attribute_uri_or_label})

        for attribute_value in attribute['value']:

            terminatore_stringa = '. ' if attribute == constraints[
                -1] and attribute_value == attribute['value'][-1] else '; '

            value_id = attribute_value['ID']
            value_id_label = f'{value_id}_label' if attribute_value['label'] != None else None
            comparison = attribute_value['comparison']

            # Utilizzando l'apposita funzione viene salvato l'operatore di confronto e il valore
            value, operatore = get_value_and_operator(attribute_value)

            if query_body != "" and query_body[-2] == '.':
                query_body += f'?resource <{property_uri}> ?{value_id}{terminatore_stringa}'
            else:
                query_body += f'<{property_uri}> ?{value_id}{terminatore_stringa}'

            if value_id_label != None:
                query_body += f'?{value_id} rdfs:label ?{value_id_label}. '

            if comparison == 'uri':
                query_filter += f'?{value_id_label or value_id} = <{value}> '

            elif comparison == 'exact-string':
                # , "i"
                query_filter += f'regex(str(?{value_id_label or value_id}), "^{value}$") '
                #query_filter += f'?{value_id} = {value} '
            elif comparison == 'substring':
                # , "i"
                query_filter += f'regex(str(?{value_id_label or value_id}), "{value}") '
            elif comparison == 'type-based':
                query_filter += create_type_based_comparison(
                    attribute_value, value, operatore)
            elif comparison == 'regex':
                print("DA GESTIRE")

            query_filter += "&& "
            """
        # Se è l'ultimo attributo viene inserito il '.' come ultimo carattere altrimenti il ';'
            if attribute == constraints[-1] and attribute_value == attribute['value'][-1]:
                query_body += '.'
            else:
                query_body += ";"
            """
    # Se l'ultimo attributo era una stringa vuota elimino l'and dovuto all'attributo precedente.
    if query_filter != '' and query_filter[-2] == '&':
        query_filter = query_filter[:-3]

    all_filter = '' if query_filter == '' else f'FILTER ({query_filter})'

    query = 'PREFIX dbo: <http://dbpedia.org/ontology/> '\
            f'SELECT ?resource (SAMPLE(?comment)AS ?comment) (SAMPLE(?label)AS ?label) (SAMPLE(?thumbnail)AS ?thumbnail) {query_select} '\
            f'WHERE {{?resource ?attribute ?value; {query_body} '\
            f'OPTIONAL {{ ?resource rdfs:comment ?comment FILTER (LANGMATCHES(LANG(?comment),"{language}") || LANG(?comment)="" )}} '\
            'OPTIONAL { ?resource dbo:thumbnail ?thumbnail } '\
            'OPTIONAL { ?resource rdfs:label ?label FILTER( LANGMATCHES(LANG(?label),"en") || LANG(?label)="") } '\
            f'{all_filter} }} GROUP BY ?resource LIMIT 25 '\
        # DECIDERE SE INSERIRE OFFSET
    print(query)
    query_result = run_query(endpoint_URL, query, 120)
    print(query_result)

    return query_result, attribute_to_show
#   return run_query(endpoint_URL, final_query), attribute_to_show
