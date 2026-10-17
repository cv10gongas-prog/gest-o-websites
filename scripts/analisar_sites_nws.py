#!/usr/bin/env python3
"""NWS Website Analyzer — auditoria HTML conservadora a websites públicos.

Executar localmente: não depende de servidores OSM nem de chaves pagas.
Não considera a ausência de metadados como prova de problemas visuais, nem mede velocidade.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
from html.parser import HTMLParser
import ipaddress
import json
from pathlib import Path
import re
import socket
import ssl
import sys
import time
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import build_opener, HTTPSHandler, HTTPRedirectHandler, ProxyHandler, Request

ROOT = Path(__file__).resolve().parent.parent
CATALOGO = ROOT / "public" / "data" / "nws-places-lisboa.json"
DESTINO = ROOT / "public" / "data" / "nws-website-audits.json"
CENTROS = {
    "Cascais": (38.6979, -9.4215), "Alcabideche": (38.7385, -9.4080),
    "Estoril": (38.705, -9.395), "Carcavelos": (38.686, -9.337),
    "Parede": (38.693, -9.357), "Sintra": (38.798, -9.382),
    "Oeiras": (38.691, -9.311),
}
USER_AGENT = "Mozilla/5.0 (compatible; NWSWebsiteAuditor/1.0; +https://novawebstudio.pt)"
MAX_BYTES = 250_000

class Pagina(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_text = []
        self.in_title = False
        self.h1_count = 0
        self.viewport = False
        self.description = ""
        self.canonical = False
        self.contact = False
        self.form = False
        self.links_email = 0
        self.links_tel = 0

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k,v in attrs if k}
        if tag == "title": self.in_title = True
        if tag == "h1": self.h1_count += 1
        if tag == "meta":
            key = a.get("name", "").strip().lower()
            if key == "viewport" and "width=device-width" in a.get("content", "").replace(" ", "").lower(): self.viewport = True
            if key == "description" and a.get("content", "").strip(): self.description = a["content"].strip()[:230]
        if tag == "link" and "canonical" in a.get("rel", "").lower(): self.canonical = True
        if tag == "form": self.form = True
        if tag == "a":
            href = a.get("href", "").strip().lower()
            if href.startswith("mailto:"): self.links_email += 1; self.contact = True
            elif href.startswith("tel:"): self.links_tel += 1; self.contact = True
            elif any(w in href for w in ("contact", "contacto", "contato", "reservas", "booking")):
                self.contact = True

    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False

    def handle_data(self, data):
        if self.in_title and len(" ".join(self.title_text)) < 500: self.title_text.append(data)

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs): return None

OPENER = build_opener(ProxyHandler({}), HTTPSHandler(context=ssl.create_default_context()), NoRedirect())

def normalizar_url(texto):
    if not isinstance(texto, str): raise ValueError("Website inválido.")
    texto = texto.strip()
    if not texto: raise ValueError("Website vazio.")
    if not re.match(r"^https?://", texto, flags=re.I): texto = "https://" + texto
    u = urlsplit(texto)
    # Se a fonte registou HTTP, tentamos a versão HTTPS sem efetuar pedidos HTTP.
    if u.scheme.lower() not in ("https", "http") or u.username or u.password or u.port not in (None,443):
        raise ValueError("Apenas websites públicos HTTP/HTTPS, sem credenciais ou portas especiais.")
    host = (u.hostname or "").rstrip(".").lower()
    if (not host or "." not in host or len(host)>253 or
        any(host.endswith(x) for x in (".local", ".localhost", ".internal", ".test", ".invalid", ".onion")) or
        host in ("localhost", "metadata.google.internal") or ".." in host):
        raise ValueError("Domínio não público ou inválido.")
    try: ipaddress.ip_address(host); raise ValueError("Endereços IP diretos não são aceites.")
    except ValueError as err:
        if "não são aceites" in str(err): raise
    # DNS é validado ANTES de qualquer pedido; não seguir redirects sem revalidar.
    try:
        infos = socket.getaddrinfo(host,443,type=socket.SOCK_STREAM)
    except OSError as e:
        raise ValueError("Não foi possível resolver o domínio (DNS).") from e
    if not infos: raise ValueError("Não existem endereços DNS para este site.")
    for info in infos:
        ip=ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            raise ValueError("O site aponta para uma rede privada/reservada; análise recusada.")
    return urlunsplit(("https",host + (":443" if u.port==443 else ""),u.path or "/",u.query,""))

def descarregar(url):
    atual=url
    for _ in range(4):
        atual=normalizar_url(atual)
        try:
            req=Request(atual,headers={"User-Agent":USER_AGENT,"Accept":"text/html,application/xhtml+xml","Accept-Encoding":"identity"})
            with OPENER.open(req,timeout=7) as r:
                content_type=r.headers.get("Content-Type","")
                if "html" not in content_type.lower(): raise ValueError("A página não devolveu HTML.")
                tamanho=r.headers.get("Content-Length")
                if tamanho and int(tamanho)>2_000_000: raise ValueError("Página HTML demasiado grande.")
                data=r.read(MAX_BYTES+1)
                if len(data)>MAX_BYTES: raise ValueError("HTML excedeu o limite seguro de leitura.")
                charset=r.headers.get_content_charset() or "utf-8"
                return atual,data.decode(charset,errors="replace")
        except HTTPError as e:
            if e.code in (301,302,303,307,308):
                loc=e.headers.get("Location")
                if not loc: raise ValueError("Redirecionamento sem destino.")
                atual=urljoin(atual,loc)
                continue
            raise ValueError(f"O website devolveu HTTP {e.code}.") from e
        except (TimeoutError,URLError,OSError) as e:
            raise ValueError("O website não respondeu ou bloqueou a análise.") from e
    raise ValueError("Demasiados redirecionamentos.")

def check(codigo, rotulo, presente, evidencia_ok, evidencia_alerta, sugestao):
    return {"codigo":codigo,"rotulo":rotulo,"estado":"ok" if presente else "atencao",
            "evidencia":evidencia_ok if presente else evidencia_alerta,
            "sugestao":None if presente else sugestao}

def analisar_html(html, url):
    p=Pagina()
    p.feed(html)
    titulo=" ".join(" ".join(p.title_text).split())[:180]
    sinais=[
        ("https","Ligação HTTPS",url.startswith("https://"),"A página usa HTTPS.","A página não usa HTTPS.","Ativar HTTPS.",10),
        ("title","Título SEO",bool(titulo),"Título detetado: "+titulo,"Não foi encontrado <title> no HTML inicial.","Definir um título descritivo para a página.",20),
        ("description","Descrição SEO",bool(p.description),"Meta description detetada.","Não foi encontrada meta description no HTML inicial.","Adicionar uma descrição útil aos motores de pesquisa.",20),
        ("viewport","Preparação mobile",p.viewport,"Viewport responsivo encontrado.","Não foi encontrado viewport width=device-width no HTML inicial.","Verificar o viewport e testar a página em telemóvel.",20),
        ("h1","Título principal (H1)",p.h1_count>0,f"{p.h1_count} H1 detetado(s).","Não foi encontrado H1 no HTML inicial.","Rever a estrutura de títulos da página.",15),
        ("contacto","Acesso a contactos",p.contact or p.form,"Existem indícios de contacto/formulário no HTML.","Não se detetaram links de contacto nem formulários no HTML inicial.","Tornar as formas de contacto claras e acessíveis.",15),
    ]
    verificacoes=[check(*x[:6]) for x in sinais]
    pontuacao=sum(item[6] for item in sinais if item[2])
    sugestoes=[v["sugestao"] for v in verificacoes if v["sugestao"]]
    return {"titulo":titulo or None,"descricao":p.description or None,"pontuacao":pontuacao,
            "verificacoes":verificacoes,"sugestoes":sugestoes[:6], "contagens":{"h1":p.h1_count,"mailto":p.links_email,"telefone":p.links_tel}}

def analisar_lead(lead):
    dados={"id":str(lead.get("id") or "site:"+str(lead.get("website") or "")),
           "nome":str(lead.get("nome") or "Website"),"tipoNws":lead.get("tipoNws"),
           "localidade":lead.get("localidade"),"website":lead.get("website"),
           "verificadoEm":datetime.now(timezone.utc).isoformat(),
           "estado":"erro","erro":None,"pontuacao":None,"verificacoes":[],"sugestoes":[]}
    try:
        url=normalizar_url(lead.get("website"))
        final,html=descarregar(url)
        dados["websiteFinal"]=final
        dados.update(analisar_html(html,final))
        dados["estado"]="ok"
    except (ValueError,UnicodeError,ssl.SSLError) as e:
        dados["erro"]=str(e)[:250]
    return dados

def distancia(lat1, lon1, lat2, lon2):
    import math
    lat1,lat2=math.radians(lat1),math.radians(lat2)
    dlat=lat2-lat1;dlon=math.radians(lon2-lon1)
    a=math.sin(dlat/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    return 6371000*2*math.atan2(math.sqrt(a),math.sqrt(1-a))

# Heurísticas conservadoras por nome. Não provam pertença jurídica a uma rede.
# Não se apagam registos, apenas se evitam auditorias automáticas pouco relevantes.
MARCAS_REDE = (
    'burger king', 'mcdonald', 'kfc', 'pizza hut', 'domino', 'telepizza',
    'taco bell', 'subway', 'starbucks', 'pans & company', '100 montaditos',
    'jeronymo', 'a padaria portuguesa', 'the good burger',
    'pingo doce', 'continente', 'worten', 'fnac', 'lidl', 'aldi', 'auchan',
)
DOMINIOS_SOCIAIS = ('instagram.com','facebook.com','linktr.ee','tripadvisor.com',
                    'thefork.pt','thefork.com','ubereats.com','booking.com')

def nome_normalizado(nome):
    return ''.join(c for c in unicodedata.normalize('NFD',str(nome or '').lower())
                   if unicodedata.category(c) != 'Mn')

def possivel_rede(nome):
    n = nome_normalizado(nome)
    if re.search(r'(?:^|\s)h3(?:\s|$)', n): return True
    return any(marca in n for marca in MARCAS_REDE)

def website_proprio(host):
    return bool(host) and not any(host == domain or host.endswith('.'+domain)
                                  for domain in DOMINIOS_SOCIAIS)

def selecionar(catalogo,categoria,localidade,raio,limite,incluir_redes=False):
    lat,lon=CENTROS[localidade]
    nomes=set(); resultado=[]
    for lead in catalogo.get("resultados",[]):
        if not lead.get("website") or lead.get("tipoNws")!=categoria:continue
        if not incluir_redes and possivel_rede(lead.get("nome")):continue
        if not isinstance(lead.get("latitude"),(float,int)) or not isinstance(lead.get("longitude"),(float,int)):continue
        if distancia(lat,lon,lead["latitude"],lead["longitude"])>raio:continue
        # Repetições de URL não justificam novo pedido ao mesmo site.
        try: host=urlsplit(normalizar_sem_dns(lead["website"])).hostname
        except ValueError: continue
        if not website_proprio(host) or host in nomes:continue
        nomes.add(host);resultado.append(lead)
        if len(resultado)>=limite:break
    return resultado

def normalizar_sem_dns(site):
    if not isinstance(site,str) or not site.strip():raise ValueError("URL vazia")
    if not re.match(r"^https?://",site,re.I):site="https://"+site
    u=urlsplit(site)
    if u.scheme.lower()!='https' or not u.hostname:raise ValueError("URL HTTPS necessária")
    return site

def ler_anteriores():
    if not DESTINO.exists():return []
    try:
        antigos=json.loads(DESTINO.read_text(encoding="utf-8"))
        return antigos.get("resultados",[]) if isinstance(antigos.get("resultados"),list) else []
    except (json.JSONDecodeError,OSError):return []

def gravar(auditorias):
    if not auditorias: return
    antigos={v.get("id"):v for v in ler_anteriores() if isinstance(v,dict) and v.get("id")}
    for v in auditorias: antigos[v["id"]]=v
    registos=sorted(antigos.values(), key=lambda a:(a["estado"]!="ok", a.get("nome","").casefold()))
    saida={"versao":1,"fonte":"Auditoria HTML inicial por NWS — execução local",
           "geradoEm":datetime.now(timezone.utc).isoformat(),"quantidade":len(registos),"resultados":registos}
    DESTINO.parent.mkdir(parents=True,exist_ok=True)
    tmp=DESTINO.with_suffix(".tmp")
    tmp.write_text(json.dumps(saida,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    tmp.replace(DESTINO)

def testes():
    sample='<html><head><title> Restaurante X </title><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Menu e reservas"></head><body><h1>Menu</h1><a href="mailto:info@example.com">Email</a></body></html>'
    r=analisar_html(sample,'https://example.com/')
    assert r["pontuacao"]==100 and all(c["estado"]=="ok" for c in r["verificacoes"])
    r2=analisar_html('<html><body>Olá</body></html>','https://example.com/')
    assert r2["pontuacao"]==10 and len(r2["sugestoes"])==5
    original_dns = socket.getaddrinfo
    try:
        socket.getaddrinfo=lambda host,port,**kw: [(socket.AF_INET,socket.SOCK_STREAM,0,"",("8.8.8.8",443))]
        assert normalizar_url('http://example.com').startswith('https://')
        try: normalizar_url('https://127.0.0.1'); assert False
        except ValueError: pass
        try: normalizar_url('https://localhost'); assert False
        except ValueError: pass
    finally:
        socket.getaddrinfo=original_dns
    assert possivel_rede('Burger King Cascais')
    assert possivel_rede('McDonalds Alcabideche')
    assert not possivel_rede('A Nova Estrela')
    assert not website_proprio('instagram.com') and website_proprio('restaurantelocal.pt')
    print('TESTES OK: avaliação HTML, filtro de redes e bloqueio de URLs inseguras.')

def main():
    ap=argparse.ArgumentParser(description="NWS Website Analyzer: verificar websites públicos selecionados.")
    ap.add_argument('--categoria',default='restaurantes')
    ap.add_argument('--localidade',default='Cascais',choices=list(CENTROS))
    ap.add_argument('--raio',type=int,default=3000)
    ap.add_argument('--limite',type=int,default=20)
    ap.add_argument('--url',help='Auditar um único website HTTPS (sem usar o catálogo).')
    ap.add_argument('--nome',default='Website manual')
    ap.add_argument('--incluir-redes',action='store_true', help='Incluir possíveis grandes redes comerciais na seleção.')
    ap.add_argument('--testar',action='store_true')
    args=ap.parse_args()
    if args.testar: testes(); return 0
    if args.limite<1 or args.limite>50 or args.raio<500 or args.raio>10000:ap.error('Limite 1-50 e raio 500-10000 m')
    if args.url:
        leads=[{"id":"site:"+urlsplit(normalizar_sem_dns(args.url)).hostname,"nome":args.nome,
                "website":args.url,"tipoNws":None,"localidade":None}]
    else:
        if not CATALOGO.exists():
            print('ERRO: falta a base Overture. Executa ATUALIZAR_LEADS_NWS.bat primeiro.',file=sys.stderr)
            return 1
        catalogo=json.loads(CATALOGO.read_text(encoding='utf-8'))
        leads=selecionar(catalogo,args.categoria,args.localidade,args.raio,args.limite,args.incluir_redes)
        if not leads:
            print('Não há websites HTTPS identificados para esses filtros. Catálogo anterior preservado.')
            return 1
    print(f'A iniciar auditoria de {len(leads)} website(s), sem IA nem custos de API. Não feches esta janela.')
    resultados=[]
    for i,lead in enumerate(leads,1):
        print(f'[{i}/{len(leads)}] {lead["nome"][:52]} — {lead["website"]}',flush=True)
        item=analisar_lead(lead)
        print(('  OK: '+str(sum(v['estado']=='ok' for v in item['verificacoes']))+'/'+str(len(item['verificacoes']))+' sinais HTML') if item['estado']=='ok' else ('  Indisponível: '+str(item['erro'])),flush=True)
        resultados.append(item)
        if i<len(leads): time.sleep(0.7)
    gravar(resultados)
    bons=sum(r['estado']=='ok' for r in resultados)
    print(f'CONCLUÍDO: {bons}/{len(resultados)} websites analisados com HTML legível. Relatório: {DESTINO}')
    print('Abre /analisar no Hub. Se todos falharam, vê os erros acima antes de repetir.')
    return 0 if bons else 2

if __name__=='__main__':
    try:sys.exit(main())
    except (OSError,ValueError,json.JSONDecodeError) as e:
        print('ERRO:',str(e),file=sys.stderr)
        sys.exit(1)
