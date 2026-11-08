"""Normalize the verified bibliography for CFF, Zenodo and website metadata."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
contexts = {
    '10.1177/19389655231152456': {
        'relation': 'cites',
        'why_zh': '解释固定比例围栏折扣与逐客群定价的区别；该文指出固定层级定价可能次优，不能据此承诺协议码优惠或定价效果。',
        'why_en': 'Explains fixed-percentage fenced discounts and their limitations; it does not establish savings or validate any code in this dataset.',
        'primary_source': 'https://udspace.udel.edu/server/api/core/bitstreams/395bec67-d12b-4c50-992d-bde878ca4191/content',
        'peer_review_source': 'https://in.sagepub.com/en-in/ind/journal/cornell-hospitality-quarterly',
        'scope': 'hotel fixed-tier and fenced-rate pricing',
    },
    '10.1177/1938965513507497': {
        'relation': 'references',
        'why_zh': '研究酒店价格限制、预订条件和退款条件的取舍，为把代码资格与价格条件分开记录提供背景。',
        'why_en': 'Provides background on hotel rate restrictions, advance booking and refundability; it is not evidence about individual corporate codes.',
        'primary_source': 'https://journals.sagepub.com/doi/10.1177/1938965513507497',
        'peer_review_source': 'https://in.sagepub.com/en-in/ind/journal/cornell-hospitality-quarterly',
        'scope': 'hotel rate fences',
        'year_note': 'Use the 2014 issue year; online publication was 2013-11-28. Both dates appear in Crossref and the publisher record.',
    },
    '10.1080/10548408.2015.1063825': {
        'relation': 'references',
        'why_zh': '以房价与价格围栏划分酒店客群，为资格、限制与客群不能混作统一优惠的描述提供背景。',
        'why_en': 'Shows how hotel customers can be segmented by prices and rate fences, providing context for recording restrictions separately from code strings.',
        'primary_source': 'https://research.polyu.edu.hk/en/publications/segmenting-hotel-customers-based-on-rate-fences-through-conjoint-/',
        'peer_review_source': 'https://research.polyu.edu.hk/en/publications/segmenting-hotel-customers-based-on-rate-fences-through-conjoint-/',
        'scope': 'hotel customer segmentation and rate fences',
    },
    '10.1177/0010880404270032': {
        'relation': 'references',
        'why_zh': '研究说明酒店定价条件与顾客公平感之间的关系，为明确披露资格和限制条件提供背景。',
        'why_en': 'Provides context on disclosure of hotel pricing conditions and perceived fairness, supporting clear descriptions of eligibility and restrictions.',
        'primary_source': 'https://journals.sagepub.com/doi/abs/10.1177/0010880404270032',
        'peer_review_source': 'https://in.sagepub.com/en-in/ind/journal/cornell-hospitality-quarterly',
        'scope': 'hotel revenue management and pricing disclosure',
    },
    '10.1016/j.tourman.2016.02.006': {
        'relation': 'references',
        'why_zh': '讨论酒店价格的战略与短期情境因素，为代码目录不等于实时房价或可订承诺提供收益管理背景。',
        'why_en': 'Provides hotel revenue-management context on strategic and short-term pricing factors; a code directory alone does not specify a live room price.',
        'primary_source': 'https://researchportal.port.ac.uk/en/publications/strategic-and-tactical-price-decisions-in-hotel-revenue-managemen/',
        'peer_review_source': 'https://researchportal.port.ac.uk/en/publications/strategic-and-tactical-price-decisions-in-hotel-revenue-managemen/',
        'scope': 'hotel revenue management and dynamic pricing',
    },
}

data = json.loads((ROOT / 'anchors-api-evidence.json').read_text(encoding='utf-8'))
records = []
excluded = []
for item in data['records']:
    m = item['crossref']['response']['message']
    if not item['accepted']:
        excluded.append({'doi_requested': item['doi'], 'doi_returned': m['DOI'],
                         'reason': item['exclusion_reason'], 'title_returned': m['title'][0],
                         'handle_http_status': item['handle']['http_status'],
                         'handle_response_code': item['handle']['response']['responseCode'],
                         'crossref_http_status': item['crossref']['http_status'],
                         'checked_on': data['checked_on']})
        continue
    title = m['title'][0]
    if m.get('subtitle'):
        title += ': ' + m['subtitle'][0]
    dates = m.get('published-print') or m['published']
    records.append({
        'doi': item['doi'], 'title': html.unescape(title),
        'journal': html.unescape(m['container-title'][0]),
        'year': dates['date-parts'][0][0],
        'authors': [{'given': a.get('given', ''), 'family': a['family']} for a in m['author']],
        'volume': m.get('volume'), 'issue': m.get('issue'), 'pages': m.get('page'),
        'type': 'article', 'crossref_type': m['type'],
        'checked_on': data['checked_on'],
        'handle_url': item['handle']['url'], 'handle_http_status': item['handle']['http_status'],
        'handle_response_code': item['handle']['response']['responseCode'],
        'crossref_url': item['crossref']['url'], 'crossref_http_status': item['crossref']['http_status'],
        'doi_matches_crossref': m['DOI'].lower() == item['doi'].lower(),
        'date_fields': {k: m[k] for k in ['published', 'published-online', 'published-print'] if k in m},
        **contexts[item['doi']],
    })

further = [{
    'title': 'Hilton HHonors Worldwide: Loyalty Wars',
    'authors': [{'given': 'John', 'family': 'Deighton'}, {'given': 'Stowe', 'family': 'Shoemaker'}],
    'publisher': 'Harvard Business Publishing', 'source': 'Harvard Business School',
    'publication_date': '2000-10-12', 'year': 2000, 'product_id': '501010',
    'url': 'https://store.hbr.org/product/hilton-hhonors-worldwide-loyalty-wars/501010',
    'doi': None,
    'doi_note': 'No DOI is listed in the official product record inspected. Not included in DOI relations.',
    'why_zh': '忠诚度与常客营销案例，属于酒店客群管理的相邻主题，只作延伸阅读。',
    'checked_on': '2026-11-08', 'http_status': 200,
}]

result = {'checked_on': data['checked_on'], 'records': records, 'further_reading': further,
          'excluded_candidates': excluded,
          'scope_note': 'These works are conceptual/background references. Dataset records were not derived from these papers. No publication author is a dataset creator or contributor.'}
assert len(records) == 5 and len({r['doi'] for r in records}) == 5
assert all(r['relation'] in ('cites', 'references') for r in records)
(ROOT / 'anchors-metadata.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Wrote five verified references, one further-reading case, one excluded candidate.')
