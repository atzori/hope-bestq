from SPARQLWrapper import SPARQLWrapper, JSON
import socket


def run_query(endpoint_URL, query, timeout):
    # Creazione del wrapper sull'endpoint selezionato dall'utente
    sparql = SPARQLWrapper(endpoint_URL)
    # Impostazione di defaultGraph (testato solo per DBPEDIA, trovare metodo per farlo funzionare in tutti)
    if endpoint_URL == "http://dbpedia.org/sparql":
        sparql.addDefaultGraph(endpoint_URL.replace('/sparql', ''))

    # Viene impostato timeout di 30 secondi sulla query
    if timeout is not None or timeout != 0:
        sparql.setTimeout(timeout)
    # Viene impostata la query
    sparql.setQuery(query)
    # Viene impostato il formato di conversione del risultato della query in JSON
    sparql.setReturnFormat(JSON)
    # Viene eseguita la query e restituito il dizionario contenente il risultato della stessa se riceve la risposta
    response_data = None
    try:
        response_data = sparql.query().convert()
    except socket.timeout:
        response_data = "ERROR: Timeout superato"
    except Exception:
        response_data = "ERROR: Errore generico"
    finally:
        return response_data
