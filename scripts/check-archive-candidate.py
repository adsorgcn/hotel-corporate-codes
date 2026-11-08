#!/usr/bin/env python3
"""Read-only preflight for a manually reviewed main-branch Zenodo snapshot.

Fetch refs before running. This command does not upload or publish anything.
The exact commit and counts must come from the operator's review.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import urllib.parse
from pathlib import Path


def git(*args):
    return subprocess.check_output(['git', *args], stderr=subprocess.PIPE)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def inspect(tag, expected_commit, hotels, groups, cars):
    require(re.fullmatch(r'v\d+\.\d+\.\d+(?:[-+][A-Za-z0-9][A-Za-z0-9.-]*)?', tag),
            'Use a reviewed main release tag vX.Y.Z; maintenance data-* tags are forbidden')
    require(re.fullmatch(r'[0-9a-f]{40}', expected_commit), 'Supply the full reviewed commit SHA')
    require(hotels > 0 and groups > 0 and cars >= 0, 'Supply independently reviewed record counts')
    remote_url = git('remote', 'get-url', 'origin').decode().strip()
    if remote_url.startswith('git@github.com:'):
        remote_repository = remote_url.split(':', 1)[1].removesuffix('.git')
    else:
        parsed = urllib.parse.urlsplit(remote_url)
        remote_repository = parsed.path.strip('/').removesuffix('.git') if parsed.hostname == 'github.com' else ''
    require(remote_repository == 'adsorgcn/hotel-corporate-codes', 'origin is not the reviewed dataset repository')
    commit = git('rev-parse', f'refs/tags/{tag}^{{commit}}').decode().strip()
    require(commit == expected_commit, 'Tag does not match the reviewed commit')
    remote_lines = git('ls-remote', '--tags', 'origin', f'refs/tags/{tag}', f'refs/tags/{tag}^{{}}').decode().splitlines()
    remote_tags = {ref: sha for sha, ref in (line.split() for line in remote_lines)}
    remote_commit = remote_tags.get(f'refs/tags/{tag}^{{}}', remote_tags.get(f'refs/tags/{tag}'))
    require(remote_commit == commit, 'Remote and local tag commits differ or tag is not pushed')
    main = git('rev-parse', 'refs/remotes/origin/main').decode().strip()
    remote_main = git('ls-remote', 'origin', 'refs/heads/main').decode().split()[0]
    require(main == remote_main, 'origin/main is stale; fetch main before reviewing')
    ancestry = subprocess.run(['git', 'merge-base', '--is-ancestor', commit, main], capture_output=True)
    require(ancestry.returncode == 0, 'Reviewed tag is not an ancestor of current origin/main')
    paths = git('ls-tree', '-r', '--name-only', commit).decode().splitlines()
    require(not any(p.startswith('maintenance/') for p in paths), 'Maintenance payload cannot enter this dataset DOI series')
    def blob(path):
        return git('show', f'{commit}:{path}')
    metadata = json.loads(blob('.zenodo.json'))
    require(metadata['upload_type'] == 'dataset', 'Zenodo resource type must be dataset')
    require(metadata['version'] == tag[1:], 'Metadata version differs from release tag')
    require(metadata['license'] in ('MIT', 'mit', 'mit-license'), 'Unexpected dataset license')
    require(metadata.get('doi') is None, 'Do not pin future deposit metadata to an existing DOI')
    creators = metadata['creators']
    require(len(creators) == 1 and creators[0]['name'] == 'Zhu, Long Quan' and
            creators[0]['orcid'].removeprefix('https://orcid.org/') == '0009-0004-4540-8082',
            'Creator or ORCID differs from the reviewed dataset identity')
    paper_links = [r for r in metadata['related_identifiers'] if r['identifier'].startswith('10.')]
    require(len(paper_links) >= 5 and all(r['relation'] in ('cites', 'references') for r in paper_links),
            'Review the paper references and their relation types')
    data_paths = sorted(p for p in paths if p.startswith('data/') and p.endswith('.json'))
    require('data/car-rental.json' in data_paths, 'Main dataset car-rental file is missing')
    require(len(data_paths) == groups + 1, 'Hotel group count differs from reviewed count')
    counts, hashes = {}, {}
    for path in data_paths:
        raw = blob(path)
        records = json.loads(raw)
        require(isinstance(records, list), 'Main dataset files must contain record arrays')
        require(all(isinstance(r, dict) for r in records), 'Unexpected record schema')
        if path != 'data/car-rental.json':
            require(all(isinstance(r.get('code'), str) and isinstance(r.get('company'), str) for r in records),
                    'Hotel code and company fields must be strings')
        counts[path] = len(records)
        hashes[path] = hashlib.sha256(raw).hexdigest()
    require(counts['data/car-rental.json'] == cars, 'Car-rental count differs from reviewed count')
    require(sum(counts.values()) - cars == hotels, 'Hotel count differs from reviewed count')
    return {'passed': True, 'tag': tag, 'commit': commit, 'verified_main_head': main,
            'hotel_records': hotels, 'hotel_groups': groups, 'car_rental_records': cars,
            'metadata_version': metadata['version'], 'data_counts': counts, 'data_sha256': hashes,
            'next_action': 'Review the ZIP and use New version in the existing Zenodo series; keep native GitHub integration disabled.',
            'published': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag', required=True)
    parser.add_argument('--expected-commit', required=True)
    parser.add_argument('--expected-hotels', type=int, required=True)
    parser.add_argument('--expected-groups', type=int, required=True)
    parser.add_argument('--expected-car-rentals', type=int, required=True)
    parser.add_argument('--output', type=Path, help='Optional local evidence JSON file')
    args = parser.parse_args()
    try:
        result = inspect(args.tag, args.expected_commit, args.expected_hotels,
                         args.expected_groups, args.expected_car_rentals)
    except (ValueError, KeyError, IndexError, subprocess.CalledProcessError) as error:
        # Do not print raw process stderr; Git URLs can contain credentials.
        message = str(error) if not isinstance(error, subprocess.CalledProcessError) else 'A required Git read failed; verify repository, refs and access'
        result = {'passed': False, 'error': message, 'published': False}
    if args.output:
        args.output.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, indent=2))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
