#!/usr/bin/env python3
"""Descarrega pontos de interesse reais da região Lisboa-Oeste do Overture Maps.

NÃO usa Overpass/Google Places nem requer chave. Exige internet apenas na atualização.
Atualiza public/data/nws-places-lisboa.json; não mexe em dados do CRM.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import sysconfig
import tempfile

ROOT = Path(__file__).resolve().parent.parent
DESTINO = ROOT / 'public' / 'data' / 'nws-places-lisboa.json'
# Cascais / Sintra / Oeiras com margem, de Sintra à costa de Oeiras.
BBOX = '-9.54,38.59,-9.13,38.93'  # xmin, ymin, xmax, ymax
CATEGORIAS = {
  'restaurantes': ['restaurant', 'steakhouse', 'pizzeria', 'pizza_restaurant', 'seafood_restaurant', 'sushi', 'bistro', 'diner', 'tapas', 'churrasqueira'],
  'cafes': ['cafe', 'coffee', 'bakery', 'pastry', 'fast_food', 'tea_house', 'snack_bar', 'ice_cream'],
  'barbearias': ['hair', 'barber', 'beauty_salon', 'nail_salon'],
  'oficinas': ['auto_repair', 'car_repair', 'mechanic', 'tyre', 'tire', 'auto_service', 'automotive_repair'],
  'piscinas': ['pool_supply', 'swimming_pool_contractor', 'pool_contractor', 'pool_cleaning', 'pool_service'],
  'carpintarias': ['carpenter', 'woodwork', 'cabinet', 'joiner', 'furniture_maker'],
  'construcao': ['construction', 'contractor', 'builder', 'roofing', 'plumber', 'electrician', 'landscaping'],
  'clinicas': ['clinic', 'dentist', 'doctor', 'medical', 'physiotherap', 'optometrist'],
  'alojamentos': ['hotel', 'lodging', 'guest_house', 'hostel', 'motel', 'bed_and_breakfast', 'holiday_rental', 'vacation_rental', 'apartment_hotel'],
  'imobiliarias': ['estate_agent', 'real_estate', 'realty'],
  'limpeza': ['laundry', 'dry_cleaning', 'cleaning_service', 'cleaners'],
  'outros': ['retail', 'shop', 'store', 'retailer', 'merchant', 'florist', 'bookshop', 'supermarket', 'pet_store', 'convenience_store', 'hardware_store'],
}

def primeiro(lista):
    if not isinstance(lista, list):return None
    for x in lista:
        if isinstance(x,str) and x.strip():return x.strip()
    return None

def categoria_nws(props):
    tax=props.get('taxonomy') or {}
    if not isinstance(tax,dict):tax={}
    paths=[props.get('basic_category'), tax.get('primary')]
    paths += tax.get('hierarchy') if isinstance(tax.get('hierarchy'),list) else []
    paths += tax.get('alternates') if isinstance(tax.get('alternates'),list) else []
    if isinstance(props.get('categories'),dict):paths.append(props['categories'].get('primary'))
    normal=re.sub(r'[^a-z_]+','_', ' '.join(str(x or '') for x in paths).lower())
    for key, needles in CATEGORIAS.items():
        if key=='outros':continue
        if any(re.search(r'(?<![a-z])'+re.escape(n),normal) for n in needles):return key
    if any(n in normal for n in CATEGORIAS['outros']):return 'outros'
    return None

def validar_url(url):
    if not isinstance(url,str):return None
    url=url.strip()
    if not url:return None
    if not url.startswith(('http://','https://')):url='https://'+url
    return url if re.match(r'^https?://[^\s/]+',url) else None

def converter(feature):
    if not isinstance(feature,dict):return None
    props=feature.get('properties') or {}
    if not isinstance(props,dict):return None
    names=props.get('names') or {}
    name=names.get('primary') if isinstance(names,dict) else props.get('name')
    if not isinstance(name,str) or not name.strip():return None
    cat=categoria_nws(props)
    if not cat:return None
    geom=feature.get('geometry') or {}
    xy=geom.get('coordinates') if isinstance(geom,dict) else None
    if not isinstance(xy,list) or len(xy)<2:return None
    try: lon,lat=float(xy[0]),float(xy[1])
    except (ValueError,TypeError):return None
    if not (-9.54<=lon<=-9.13 and 38.59<=lat<=38.93):return None
    addr=(props.get('addresses') or [])
    addr=addr[0] if isinstance(addr,list) and addr and isinstance(addr[0],dict) else {}
    loc=addr.get('locality') if isinstance(addr.get('locality'),str) else None
    website=validar_url(primeiro(props.get('websites')))
    email=primeiro(props.get('emails'))
    if email and not re.fullmatch(r'[^\s@;]+@[^\s@;]+\.[^\s@;]+',email):email=None
    phone=primeiro(props.get('phones'))
    iid=feature.get('id') or props.get('id')
    if not iid:return None
    return {
      'id':'overture/'+str(iid),'nome':name.strip()[:240],
      'categoria': str((props.get('taxonomy') or {}).get('primary') or props.get('basic_category') or cat)[:160],
      'tipoNws':cat, 'morada':addr.get('freeform') or None, 'localidade':loc,
      'website':website, 'email':email, 'telefone':phone,
      'mapsUrl':f'https://www.openstreetmap.org/?mlat={lat:.6f}&mlon={lon:.6f}#map=17/{lat:.6f}/{lon:.6f}',
      'classificacao':None, 'avaliacoes':None,'esplanada':'desconhecido',
      'oportunidade':'site_identificado' if website else 'sem_website_identificado',
      'latitude':lat,'longitude':lon
    }

def indexar(geojson):
    if not isinstance(geojson,dict) or geojson.get('type')!='FeatureCollection':
        raise ValueError('A origem não forneceu um GeoJSON FeatureCollection.')
    features=geojson.get('features')
    if not isinstance(features,list):raise ValueError('GeoJSON sem lista de estabelecimentos.')
    data=[]; seen=set()
    for feature in features:
        item=converter(feature)
        if not item:continue
        key=(item['nome'].casefold(),round(item['latitude'],4),round(item['longitude'],4))
        if key in seen:continue
        seen.add(key)
        data.append(item)
    data.sort(key=lambda a:(a['tipoNws'],a['nome'].casefold()))
    return {'fonte':'Overture Maps Places', 'geradoEm':datetime.now(timezone.utc).isoformat(),
            'quantidade':len(data), 'resultados':data}

def atualizar():
    scripts=Path(sysconfig.get_path('scripts'))
    executable=shutil.which('overturemaps') or str(scripts / ('overturemaps.exe' if sys.platform=='win32' else 'overturemaps'))
    if not Path(executable).exists() and not shutil.which('overturemaps'):
        raise RuntimeError('Overture Maps não está instalado. Executa: py -3 -m pip install overturemaps')
    with tempfile.TemporaryDirectory(prefix='nws-overture-') as tmp:
        ficheiro=Path(tmp)/'lisboa-oeste.geojson'
        comando=[executable,'download','--bbox='+BBOX,'-f','geojson','--type=place','-o',str(ficheiro)]
        print('A descarregar dados reais Overture Maps da região Cascais / Oeiras / Sintra...')
        print('Este download pode demorar alguns minutos. Não utiliza Google nem Overpass.')
        subprocess.run(comando,check=True)
        if not ficheiro.is_file():raise RuntimeError('O Overture não devolveu o ficheiro esperado.')
        dados=json.loads(ficheiro.read_text(encoding='utf-8'))
        resultado=indexar(dados)
        if not resultado['quantidade']:
            raise RuntimeError('Não foram obtidos negócios identificáveis. O catálogo anterior foi preservado.')
        DESTINO.parent.mkdir(parents=True,exist_ok=True)
        temporario=DESTINO.with_suffix('.tmp')
        temporario.write_text(json.dumps(resultado,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        temporario.replace(DESTINO)
        print(f'CONCLUÍDO: {resultado["quantidade"]} negócios reais indexados em {DESTINO}')
        print('Agora executa npm run dev e abre /descobrir. Sem pedidos ao Overpass por cada pesquisa.')

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--testar',action='store_true',help='Testar a conversão com exemplos fictícios sem os instalar')
    args=p.parse_args()
    if args.testar:
        obj={'type':'FeatureCollection','features':[{'id':'teste','type':'Feature','geometry':{'type':'Point','coordinates':[-9.42,38.70]},'properties':{'names':{'primary':'Restaurante de Teste'},'taxonomy':{'primary':'portuguese_restaurant','hierarchy':['food_and_drink','restaurant','portuguese_restaurant']},'websites':['https://example.org'],'emails':['info@example.org'],'phones':['+351210000000'],'addresses':[{'locality':'Cascais'}]}}]}
        data=indexar(obj)
        assert len(data['resultados'])==1 and data['resultados'][0]['tipoNws']=='restaurantes'
        print('TESTE OK — exemplo fictício não gravado no catálogo público.')
    else:
        try:atualizar()
        except Exception as err:
            print('ERRO:',str(err),file=sys.stderr)
            sys.exit(1)
