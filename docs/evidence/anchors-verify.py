"""Fetch public DOI registration and Crossref evidence; no authenticated services."""
import concurrent.futures
import datetime as dt
import hashlib
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

DOIS = [
    '10.1177/19389655231152456',
    '10.1177/0010880402434010',
    '10.1177/1938965513507497',
    '10.1080/10548408.2015.1063825',
    '10.1177/0010880404270032',
    '10.1016/j.tourman.2016.02.006',
]
OUT = Path(__file__).resolve().parent

def get_json(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'HotelCorporateCodes-metadata-verification/1.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=45) as response:
        content = response.read()
        return {'url': url, 'http_status': response.status, 'final_url': response.geturl(),
                'retrieved_at_utc': dt.datetime.now(dt.timezone.utc).isoformat(),
                'sha256': hashlib.sha256(content).hexdigest(), 'response': json.loads(content)}

def verify(doi):
    handle = get_json('https://doi.org/api/handles/' + doi)
    crossref = get_json('https://api.crossref.org/works/' + urllib.parse.quote(doi, safe='/'))
    assert handle['response']['responseCode'] == 1, doi
    message = crossref['response']['message']
    accepted = message['DOI'].lower() == doi.lower() and message['type'] == 'journal-article'
    # Retain bibliographic evidence, not publisher abstracts or full reference lists.
    keys = ['DOI', 'title', 'subtitle', 'container-title', 'publisher', 'type',
            'published', 'published-online', 'published-print', 'volume', 'issue', 'page', 'URL']
    retained = {key: message[key] for key in keys if key in message}
    retained['author'] = [{key: author[key] for key in ['given', 'family'] if key in author}
                          for author in message.get('author', [])]
    crossref['response'] = {'status': crossref['response']['status'], 'message': retained}
    crossref['retention_note'] = 'Bibliographic fields selected; sha256 refers to the complete fetched API body before selection.'
    return {'doi': doi, 'accepted': accepted,
            'exclusion_reason': None if accepted else 'Crossref canonical DOI differs from requested DOI; candidate not included.',
            'handle': handle, 'crossref': crossref}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        evidence = list(pool.map(verify, DOIS))
    assert len([item for item in evidence if item['accepted']]) >= 5
    result = {'checked_on': '2026-11-08', 'records': evidence}
    (OUT / 'anchors-api-evidence.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for item in evidence:
        m = item['crossref']['response']['message']
        print(json.dumps({'doi': item['doi'], 'accepted': item['accepted'], 'handle_http': item['handle']['http_status'],
                          'responseCode': item['handle']['response']['responseCode'],
                          'crossref_http': item['crossref']['http_status'],
                          'title': m.get('title'), 'subtitle': m.get('subtitle'),
                          'journal': m.get('container-title'), 'author': [{k: a.get(k) for k in ['given', 'family']} for a in m.get('author', [])],
                          'published': m.get('published'), 'published-online': m.get('published-online'),
                          'published-print': m.get('published-print'), 'volume': m.get('volume'), 'issue': m.get('issue'),
                          'page': m.get('page')}, ensure_ascii=False))
