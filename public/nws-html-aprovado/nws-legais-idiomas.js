/* Nova Web Studio — traduções das três páginas de informação legal.
   Português de Portugal é a versão de referência, preservada no HTML. */
(()=>{
 'use strict';
 if(window.__nwsLegaisIdiomas2026)return;
 window.__nwsLegaisIdiomas2026=true;
 const supported=['pt','en','es','fr','de'];
 let saved='pt';try{saved=localStorage.getItem('nws-lang')||'pt'}catch(_e){}
 const query=new URLSearchParams(location.search).get('lang');
 const locale=supported.includes(query)?query:(supported.includes(saved)?saved:'pt');
 try{localStorage.setItem('nws-lang',locale)}catch(_e){}
 document.documentElement.lang=locale==='pt'?'pt-PT':locale;
 const page=location.pathname.match(/(?:privacidade|cookies|termos)(?:\.html)?$/)?.[0].replace('.html','');
 if(!page)return;
 const common={
  pt:{nav:['Início','Serviços','Portefólio','Contacto'],tag:'NOVA WEB STUDIO / INFORMAÇÃO LEGAL',updated:'Última atualização: outubro de 2026.',footer:['Todos os direitos reservados.','Privacidade','Cookies','Termos','Preferências de cookies','Equipa'],action:'Questões sobre estes documentos? Contacta',select:'Idioma'},
  en:{nav:['Home','Services','Portfolio','Contact'],tag:'NOVA WEB STUDIO / LEGAL INFORMATION',updated:'Last updated: October 2026.',footer:['All rights reserved.','Privacy','Cookies','Terms','Cookie preferences','Team'],action:'Questions about these documents? Contact',select:'Language'},
  es:{nav:['Inicio','Servicios','Portafolio','Contacto'],tag:'NOVA WEB STUDIO / INFORMACIÓN LEGAL',updated:'Última actualización: octubre de 2026.',footer:['Todos los derechos reservados.','Privacidad','Cookies','Términos','Preferencias de cookies','Equipo'],action:'¿Tienes preguntas sobre estos documentos? Contacta con',select:'Idioma'},
  fr:{nav:['Accueil','Services','Portfolio','Contact'],tag:'NOVA WEB STUDIO / INFORMATIONS LÉGALES',updated:'Dernière mise à jour : octobre 2026.',footer:['Tous droits réservés.','Confidentialité','Cookies','Conditions','Préférences de cookies','Équipe'],action:'Des questions sur ces documents ? Contacte',select:'Langue'},
  de:{nav:['Startseite','Leistungen','Portfolio','Kontakt'],tag:'NOVA WEB STUDIO / RECHTLICHE INFORMATIONEN',updated:'Letzte Aktualisierung: Oktober 2026.',footer:['Alle Rechte vorbehalten.','Datenschutz','Cookies','Bedingungen','Cookie-Einstellungen','Team'],action:'Fragen zu diesen Dokumenten? Kontaktiere',select:'Sprache'}
 };
 // Conteúdo traduzido por página. Os nomes dos serviços, contactos e categorias mantêm-se.
 const dictionary={
  en:{
   privacidade:{title:'Privacy Policy',intro:'Information about the personal data we collect, why we process it and the rights of people who contact us.',sections:[
    ['1. Data controller','Nova Web Studio is responsible for personal data collected through this website. For privacy questions or to exercise your rights, write to <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.'],
    ['2. Data collected','When you request a proposal, we may collect your name, email, company, phone number, current website, project type, budget, timeline, message and meeting request. We may also process technical data strictly necessary for security and abuse prevention.'],
    ['3. Purposes and legal bases','We use form data to reply, prepare proposals and manage communications related to your request, based on the pre-contractual steps you have requested and, where applicable, our legitimate interest in protecting the service. Google Analytics statistics are used only with your consent.'],
    ['4. Services used','The website is provided through hosting and infrastructure services, including Vercel. Contact requests are processed using database services associated with Lovable/Supabase infrastructure, and email notifications may be sent through a specialist service such as Resend. If you accept analytics cookies, Google Analytics may collect usage data. These providers process data under their applicable terms and safeguards.'],
    ['5. Retention period','Data is retained only for as long as necessary to respond, follow up on your request and comply with any legal obligations. You can request information about the retention period applicable to your case using the email address above.'],
    ['6. Sharing and international transfers','We do not sell personal data. Some technology providers may involve international processing or transfers, subject to legally required safeguards where applicable.'],
    ['7. Your rights','You may request access, correction, deletion, restriction, objection or portability where legally applicable. You can withdraw analytics consent at any time using “Cookie preferences”. You may also lodge a complaint with the <a href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer">Portuguese Data Protection Authority (CNPD)</a>.'],
    ['8. Updates','This policy may be updated to reflect changes to the website, its providers or legal requirements. The current version will be published on this page.']
   ]},
   cookies:{title:'Cookie Policy',intro:'Learn which technologies we use and how to manage Google Analytics.',sections:[
    ['1. What are cookies?','Cookies are small files stored in your browser. Preferences can also be stored using localStorage, which technically is not a cookie.'],
    ['2. Technologies used','<table><thead><tr><th>Technology</th><th>Purpose</th><th>When used</th></tr></thead><tbody><tr><td><strong>analytics-consent</strong> (localStorage)</td><td>Remembers your choice to accept or decline statistics.</td><td>When you save a preference. Necessary to respect your decision.</td></tr><tr><td><strong>_ga and _ga_*</strong> (Google Analytics)</td><td>Usage statistics such as visits and pages viewed. Retention depends on Google Analytics configuration and may be approximately 2 years.</td><td><strong>Only after accepting</strong> analytics.</td></tr><tr><td><strong>Technical cookies</strong> for security/services</td><td>Operation and protection of integrated services, when essential.</td><td>Only when strictly necessary for the service used.</td></tr></tbody></table>'],
    ['3. What happens if you decline?','The Google Analytics script is not loaded without consent. You can still use the website, including the contact form. If you withdraw previously granted consent, accessible analytics cookies are removed and the page reloads to stop the tag.'],
    ['4. Change your choice','You can reopen the consent panel at any time through “Cookie preferences” in the footer of every page. Accepting and declining are equally easy.<p><button type="button" class="pill" data-nws-cookies-open>Manage cookie preferences</button></p>'],
    ['5. External analytics service','If you accept analytics, we use Google Analytics 4 to understand website usage. See the <a href="https://policies.google.com/privacy?hl=en" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a> for more information.']
   ]},
   termos:{title:'Terms and Conditions',intro:'General information about access to this website and requests for proposals.',sections:[
    ['1. Scope','This website presents Nova Web Studio, its services and examples of projects. Using the website means respecting the conditions described here.'],
    ['2. Content and portfolio','Nova Web Studio materials, text, graphics and brand identity are protected by applicable law. The projects shown illustrate work, concepts or solutions and do not in themselves guarantee future results.'],
    ['3. Quote requests','Submitting the form is a request for contact or a proposal, not an order or automatic acceptance of services. Deadlines, features, prices and payment terms are confirmed in a separate proposal or agreement.'],
    ['4. Responsible use','The website must not be used to submit illegal, fraudulent or abusive content, or content that harms the security or availability of the service.'],
    ['5. External links','This website may include links to third-party portfolios and services. Those sites have their own policies and conditions, which Nova Web Studio does not control.'],
    ['6. Updates and contact','We may correct or update content and these terms when necessary, within applicable law. Questions about services and conditions can be sent to <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.']
   ]}
  },
  es:{
   privacidade:{title:'Política de Privacidad',intro:'Información sobre los datos personales que recopilamos, para qué los utilizamos y los derechos de quienes nos contactan.',sections:[
    ['1. Responsable del tratamiento','Nova Web Studio es responsable de los datos personales recopilados a través de esta web. Para cuestiones de privacidad o para ejercer tus derechos, escribe a <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.'],
    ['2. Datos recopilados','Al solicitar una propuesta, podemos recopilar nombre, correo electrónico, empresa, teléfono, web actual, tipo de proyecto, presupuesto, plazo, contenido del mensaje y solicitud de reunión. También podemos tratar datos técnicos estrictamente necesarios para la seguridad y la prevención de abusos.'],
    ['3. Finalidades y bases jurídicas','Utilizamos los datos del formulario para responder, preparar propuestas y gestionar comunicaciones relacionadas con tu solicitud, basándonos en las gestiones precontractuales solicitadas y, cuando corresponda, en nuestro interés legítimo de proteger el servicio. Las estadísticas de Google Analytics solo funcionan con tu consentimiento.'],
    ['4. Servicios utilizados','La web se aloja mediante servicios de infraestructura, incluido Vercel. Las solicitudes de contacto se procesan mediante servicios de base de datos asociados a Lovable/Supabase, y las notificaciones por correo pueden enviarse mediante un servicio especializado como Resend. Si aceptas las cookies analíticas, Google Analytics puede recopilar datos de uso. Estos proveedores tratan datos conforme a sus condiciones y garantías aplicables.'],
    ['5. Plazo de conservación','Conservamos los datos solo durante el tiempo necesario para responder, dar seguimiento a tu solicitud y cumplir posibles obligaciones legales. Puedes solicitar información sobre el plazo aplicable a tu caso a través del correo indicado.'],
    ['6. Comunicación y transferencias internacionales','No vendemos datos personales. Algunos servicios tecnológicos pueden implicar tratamientos o transferencias internacionales, sujetos a las garantías legalmente exigibles cuando correspondan.'],
    ['7. Tus derechos','Puedes solicitar acceso, rectificación, supresión, limitación, oposición o portabilidad cuando proceda legalmente. Puedes retirar el consentimiento para las estadísticas en cualquier momento mediante «Preferencias de cookies». También puedes presentar una reclamación ante la <a href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer">Comisión Nacional de Protección de Datos portuguesa (CNPD)</a>.'],
    ['8. Actualizaciones','Esta política puede actualizarse para reflejar cambios en la web, los proveedores o las obligaciones legales. La versión vigente se publicará en esta página.']
   ]},
   cookies:{title:'Política de Cookies',intro:'Explicamos qué tecnologías utilizamos y cómo puedes controlar Google Analytics.',sections:[
    ['1. ¿Qué son las cookies?','Las cookies son pequeños archivos guardados en el navegador. También se pueden recordar preferencias mediante localStorage, que técnicamente no es una cookie.'],
    ['2. Tecnologías utilizadas','<table><thead><tr><th>Tecnología</th><th>Finalidad</th><th>Cuándo se utiliza</th></tr></thead><tbody><tr><td><strong>analytics-consent</strong> (localStorage)</td><td>Guardar si aceptas o rechazas las estadísticas.</td><td>Al guardar una preferencia. Es necesaria para respetar tu elección.</td></tr><tr><td><strong>_ga y _ga_*</strong> (Google Analytics)</td><td>Estadísticas de uso, como visitas y páginas vistas. La duración depende de la configuración de Google Analytics y puede ser de aproximadamente 2 años.</td><td><strong>Solo después de aceptar</strong> la analítica.</td></tr><tr><td><strong>Cookies técnicas</strong> de seguridad/servicios</td><td>Funcionamiento y protección de servicios integrados cuando sean esenciales.</td><td>Solo cuando sean estrictamente necesarias.</td></tr></tbody></table>'],
    ['3. ¿Qué ocurre si las rechazas?','El script de Google Analytics no se carga sin consentimiento. Puedes seguir usando la web, incluido el formulario de contacto. Si retiras una autorización anterior, se eliminan las cookies analíticas accesibles y la página se recarga para detener la etiqueta.'],
    ['4. Cambiar tu elección','Puedes volver a abrir el panel desde «Preferencias de cookies» en el pie de todas las páginas. Aceptar y rechazar son igual de fáciles.<p><button type="button" class="pill" data-nws-cookies-open>Gestionar preferencias de cookies</button></p>'],
    ['5. Servicio externo de estadísticas','Si aceptas, usamos Google Analytics 4 para entender el uso de la web. Consulta la <a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noopener noreferrer">Política de Privacidad de Google</a> para más información.']
   ]},
   termos:{title:'Términos y Condiciones',intro:'Información general sobre el acceso a esta web y las solicitudes de propuestas.',sections:[
    ['1. Ámbito','Esta web presenta Nova Web Studio, sus servicios y ejemplos de proyectos. Su utilización implica respetar las condiciones aquí descritas.'],
    ['2. Contenidos y portafolio','Los materiales, textos, elementos gráficos e identidad de Nova Web Studio están protegidos por la legislación aplicable. Los proyectos mostrados ilustran trabajos, conceptos o soluciones y no garantizan por sí solos resultados futuros.'],
    ['3. Solicitudes de presupuesto','Enviar el formulario es una solicitud de contacto o propuesta, no un pedido ni la aceptación automática de servicios. Plazos, funcionalidades, precios y condiciones de pago se confirman en una propuesta o acuerdo específico.'],
    ['4. Uso responsable','No se permite utilizar la web para enviar contenidos ilegales, fraudulentos o abusivos, ni que perjudiquen la seguridad o disponibilidad del servicio.'],
    ['5. Enlaces externos','La web puede contener enlaces a portafolios y servicios de terceros. Esos sitios tienen políticas y condiciones propias que Nova Web Studio no controla.'],
    ['6. Actualizaciones y contacto','Podemos corregir o actualizar los contenidos y estos términos cuando sea necesario, dentro de la legislación aplicable. Puedes enviar preguntas a <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.']
   ]}
  },
  fr:{
   privacidade:{title:'Politique de confidentialité',intro:'Informations sur les données personnelles collectées, leur utilisation et les droits des personnes qui nous contactent.',sections:[
    ['1. Responsable du traitement','Nova Web Studio est responsable des données personnelles recueillies sur ce site. Pour toute question ou pour exercer tes droits, écris à <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.'],
    ['2. Données collectées','Lors d’une demande de devis, nous pouvons recueillir ton nom, ton adresse e-mail, ton entreprise, ton téléphone, ton site actuel, le type de projet, le budget, les délais, le contenu du message et une demande de rendez-vous. Nous pouvons également traiter des données techniques strictement nécessaires à la sécurité et à la prévention des abus.'],
    ['3. Finalités et bases légales','Nous utilisons les données du formulaire pour répondre, préparer des propositions et gérer les communications liées à ta demande, sur la base des démarches précontractuelles sollicitées et, le cas échéant, de notre intérêt légitime à protéger le service. Les statistiques de Google Analytics ne sont activées qu’avec ton consentement.'],
    ['4. Services utilisés','Le site est hébergé par des services d’infrastructure, notamment Vercel. Les demandes de contact sont traitées par des services de base de données liés à Lovable/Supabase, et les notifications par e-mail peuvent être envoyées via un service spécialisé tel que Resend. Si tu acceptes les cookies analytiques, Google Analytics peut recueillir des données d’utilisation. Ces prestataires traitent les données selon leurs conditions et garanties applicables.'],
    ['5. Durée de conservation','Les données ne sont conservées que le temps nécessaire pour répondre, assurer le suivi de la demande et respecter les obligations légales éventuelles. Tu peux demander des informations sur la durée applicable à ton cas à l’adresse indiquée.'],
    ['6. Partage et transferts internationaux','Nous ne vendons pas de données personnelles. Certains services technologiques peuvent impliquer des traitements ou transferts internationaux, soumis aux garanties légalement requises le cas échéant.'],
    ['7. Tes droits','Tu peux demander l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité lorsque la loi le prévoit. Tu peux retirer ton consentement aux statistiques à tout moment via « Préférences de cookies ». Tu peux également déposer une réclamation auprès de la <a href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer">Commission nationale portugaise de protection des données (CNPD)</a>.'],
    ['8. Mises à jour','Cette politique peut être mise à jour pour tenir compte des changements du site, des prestataires ou des obligations légales. La version en vigueur sera publiée ici.']
   ]},
   cookies:{title:'Politique de cookies',intro:'Découvre les technologies utilisées et comment gérer Google Analytics.',sections:[
    ['1. Que sont les cookies ?','Les cookies sont de petits fichiers enregistrés dans ton navigateur. Les préférences peuvent aussi être conservées via localStorage, qui n’est techniquement pas un cookie.'],
    ['2. Technologies utilisées','<table><thead><tr><th>Technologie</th><th>Finalité</th><th>Quand elle est utilisée</th></tr></thead><tbody><tr><td><strong>analytics-consent</strong> (localStorage)</td><td>Mémoriser l’acceptation ou le refus des statistiques.</td><td>Lors de l’enregistrement d’une préférence. Nécessaire pour respecter ton choix.</td></tr><tr><td><strong>_ga et _ga_*</strong> (Google Analytics)</td><td>Statistiques de fréquentation, comme les visites et les pages consultées. La durée dépend de la configuration de Google Analytics et peut atteindre environ 2 ans.</td><td><strong>Uniquement après acceptation</strong> de l’analyse.</td></tr><tr><td><strong>Cookies techniques</strong> de sécurité/services</td><td>Fonctionnement et protection des services intégrés lorsque cela est indispensable.</td><td>Uniquement lorsque cela est strictement nécessaire.</td></tr></tbody></table>'],
    ['3. Que se passe-t-il si tu refuses ?','Le script Google Analytics n’est pas chargé sans consentement. Tu peux continuer à utiliser le site, y compris le formulaire de contact. Si tu retires une autorisation précédente, les cookies analytiques accessibles sont supprimés et la page est rechargée pour arrêter la balise.'],
    ['4. Modifier ton choix','Tu peux rouvrir le panneau via « Préférences de cookies » dans le pied de page. Accepter et refuser sont aussi simples l’un que l’autre.<p><button type="button" class="pill" data-nws-cookies-open>Gérer les préférences de cookies</button></p>'],
    ['5. Service externe de statistiques','Si tu acceptes, nous utilisons Google Analytics 4 pour comprendre l’utilisation du site. Consulte la <a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noopener noreferrer">Politique de confidentialité de Google</a> pour en savoir plus.']
   ]},
   termos:{title:'Conditions générales',intro:'Informations générales sur l’accès à ce site et les demandes de propositions.',sections:[
    ['1. Champ d’application','Ce site présente Nova Web Studio, ses services et des exemples de projets. Son utilisation implique le respect des conditions décrites ici.'],
    ['2. Contenus et portfolio','Les documents, textes, graphismes et éléments d’identité de Nova Web Studio sont protégés par la législation applicable. Les projets présentés illustrent des réalisations, concepts ou solutions et ne garantissent pas, à eux seuls, de résultats futurs.'],
    ['3. Demandes de devis','L’envoi du formulaire constitue une demande de contact ou de proposition, et non une commande ou une acceptation automatique des services. Les délais, fonctionnalités, prix et modalités de paiement sont confirmés dans une proposition ou un accord distinct.'],
    ['4. Utilisation responsable','Il est interdit d’utiliser le site pour transmettre du contenu illégal, frauduleux ou abusif, ou qui porte atteinte à la sécurité ou à la disponibilité du service.'],
    ['5. Liens externes','Le site peut contenir des liens vers des portfolios ou services tiers. Ces sites ont leurs propres politiques et conditions, indépendantes de Nova Web Studio.'],
    ['6. Mises à jour et contact','Nous pouvons corriger ou mettre à jour les contenus et ces conditions lorsque cela est nécessaire, dans le respect de la loi applicable. Pour toute question, écris à <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.']
   ]}
  },
  de:{
   privacidade:{title:'Datenschutzerklärung',intro:'Informationen darüber, welche personenbezogenen Daten wir erheben, warum wir sie verarbeiten und welche Rechte du hast.',sections:[
    ['1. Verantwortlicher','Nova Web Studio ist für die über diese Website erhobenen personenbezogenen Daten verantwortlich. Bei Datenschutzfragen oder zur Ausübung deiner Rechte schreib an <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a>.'],
    ['2. Erhobene Daten','Bei einer Angebotsanfrage können wir Name, E-Mail, Unternehmen, Telefonnummer, aktuelle Website, Projektart, Budget, Zeitrahmen, Nachrichteninhalt und Besprechungswunsch erheben. Außerdem können wir technische Daten verarbeiten, die für Sicherheit und Missbrauchsschutz unbedingt erforderlich sind.'],
    ['3. Zwecke und Rechtsgrundlagen','Wir nutzen Formulardaten, um zu antworten, Angebote vorzubereiten und die Kommunikation rund um deine Anfrage zu verwalten. Grundlage sind die von dir gewünschten vorvertraglichen Maßnahmen und gegebenenfalls unser berechtigtes Interesse am Schutz des Dienstes. Google-Analytics-Statistiken werden nur mit deiner Einwilligung erhoben.'],
    ['4. Eingesetzte Dienste','Die Website wird über Hosting- und Infrastrukturdienste, darunter Vercel, bereitgestellt. Kontaktanfragen werden durch Datenbankdienste im Umfeld von Lovable/Supabase verarbeitet. E-Mail-Benachrichtigungen können über einen spezialisierten Dienst wie Resend versendet werden. Wenn du Analyse-Cookies akzeptierst, kann Google Analytics Nutzungsdaten erfassen. Diese Anbieter verarbeiten Daten gemäß ihren jeweiligen Bedingungen und Schutzmaßnahmen.'],
    ['5. Speicherdauer','Daten werden nur so lange aufbewahrt, wie dies zur Beantwortung und Bearbeitung deiner Anfrage und zur Erfüllung etwaiger gesetzlicher Pflichten nötig ist. Weitere Informationen zur jeweiligen Speicherdauer kannst du per E-Mail anfordern.'],
    ['6. Weitergabe und internationale Übermittlungen','Wir verkaufen keine personenbezogenen Daten. Einige Technologiedienste können internationale Verarbeitungen oder Übermittlungen umfassen, für die gegebenenfalls die gesetzlich vorgeschriebenen Garantien gelten.'],
    ['7. Deine Rechte','Du kannst im gesetzlich vorgesehenen Umfang Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch oder Datenübertragbarkeit verlangen. Deine Einwilligung zur Analyse kannst du jederzeit über „Cookie-Einstellungen“ widerrufen. Du kannst auch Beschwerde bei der <a href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer">portugiesischen Datenschutzbehörde (CNPD)</a> einreichen.'],
    ['8. Änderungen','Diese Erklärung kann bei Änderungen der Website, der Dienstleister oder gesetzlicher Anforderungen aktualisiert werden. Die jeweils aktuelle Fassung wird hier veröffentlicht.']
   ]},
   cookies:{title:'Cookie-Richtlinie',intro:'Wir erklären, welche Technologien wir einsetzen und wie du Google Analytics steuern kannst.',sections:[
    ['1. Was sind Cookies?','Cookies sind kleine Dateien, die im Browser gespeichert werden. Einstellungen können auch in localStorage abgelegt werden. Technisch gesehen ist dies kein Cookie.'],
    ['2. Eingesetzte Technologien','<table><thead><tr><th>Technologie</th><th>Zweck</th><th>Wann verwendet</th></tr></thead><tbody><tr><td><strong>analytics-consent</strong> (localStorage)</td><td>Speichert deine Entscheidung, Statistik zu erlauben oder abzulehnen.</td><td>Beim Speichern der Einstellung. Notwendig, um deine Wahl zu respektieren.</td></tr><tr><td><strong>_ga und _ga_*</strong> (Google Analytics)</td><td>Nutzungsstatistiken wie Besuche und aufgerufene Seiten. Die Dauer hängt von der Konfiguration ab und kann etwa 2 Jahre betragen.</td><td><strong>Erst nach Zustimmung</strong> zur Analyse.</td></tr><tr><td><strong>Technische Cookies</strong> für Sicherheit/Dienste</td><td>Betrieb und Schutz integrierter Dienste, soweit notwendig.</td><td>Nur wenn für den jeweiligen Dienst unbedingt erforderlich.</td></tr></tbody></table>'],
    ['3. Was passiert bei Ablehnung?','Das Google-Analytics-Skript wird ohne Einwilligung nicht geladen. Du kannst die Website einschließlich des Kontaktformulars weiterhin nutzen. Wenn du eine frühere Einwilligung widerrufst, werden erreichbare Analyse-Cookies gelöscht und die Seite neu geladen, um das Tag zu stoppen.'],
    ['4. Entscheidung ändern','Du kannst das Einwilligungsfenster jederzeit über „Cookie-Einstellungen“ in der Fußzeile öffnen. Zustimmen und Ablehnen ist gleich einfach.<p><button type="button" class="pill" data-nws-cookies-open>Cookie-Einstellungen verwalten</button></p>'],
    ['5. Externer Analysedienst','Wenn du zustimmst, nutzen wir Google Analytics 4, um die Website-Nutzung zu verstehen. Weitere Informationen findest du in der <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer">Datenschutzerklärung von Google</a>.']
   ]},
   termos:{title:'Allgemeine Geschäftsbedingungen',intro:'Allgemeine Informationen zur Nutzung der Website und zu Angebotsanfragen.',sections:[
    ['1. Geltungsbereich','Diese Website stellt Nova Web Studio, seine Dienstleistungen und Projektbeispiele vor. Die Nutzung setzt die Beachtung der hier beschriebenen Bedingungen voraus.'],
    ['2. Inhalte und Portfolio','Materialien, Texte, Grafiken und Markenidentität von Nova Web Studio sind durch geltendes Recht geschützt. Die vorgestellten Projekte veranschaulichen Arbeiten, Konzepte oder Lösungen und stellen keine Garantie für zukünftige Ergebnisse dar.'],
    ['3. Angebotsanfragen','Das Absenden des Formulars ist eine Kontakt- oder Angebotsanfrage und weder eine Bestellung noch die automatische Annahme von Leistungen. Fristen, Funktionen, Preise und Zahlungsbedingungen werden in einem gesonderten Angebot oder Vertrag bestätigt.'],
    ['4. Verantwortungsvolle Nutzung','Die Website darf nicht zur Übermittlung illegaler, betrügerischer oder missbräuchlicher Inhalte oder zur Beeinträchtigung der Sicherheit beziehungsweise Verfügbarkeit des Dienstes verwendet werden.'],
    ['5. Externe Links','Die Website kann Links zu Portfolios und Diensten Dritter enthalten. Für diese gelten eigene Datenschutzrichtlinien und Bedingungen, die Nova Web Studio nicht kontrolliert.'],
    ['6. Änderungen und Kontakt','Wir können Inhalte und diese Bedingungen bei Bedarf im Rahmen des geltenden Rechts aktualisieren. Fragen zu Leistungen und Bedingungen kannst du an <a href="mailto:geral@novawebstudio.pt">geral@novawebstudio.pt</a> senden.']
   ]}
  }
 };
 const c=common[locale];
 const css=`.nws-legal-lang{font:600 12px/1.3 'DM Sans',Arial,sans-serif;color:#e5ebff;background:#121c35;border:1px solid #9faad066;border-radius:10px;padding:8px 11px;min-width:71px;min-height:36px;cursor:pointer}.nws-legal-lang:focus-visible{outline:2px solid #8ce7ed;outline-offset:3px}.nws-legal-team{font-size:10px!important;opacity:.62;padding:12px 7px;display:inline-block;transition:opacity .2s}.nws-legal-team:hover,.nws-legal-team:focus-visible{opacity:1}.nws-legal-lang option{color:#111;background:#fff}@media(max-width:720px){.nws-legal-lang{margin-top:2px}}`;
 const style=document.createElement('style');style.textContent=css;document.head.append(style);
 const header=document.querySelector('header nav');
 if(header){
   const nav=header.querySelectorAll('.links a');
   nav.forEach((a,i)=>{if(c.nav[i])a.textContent=c.nav[i]});
   const picker=document.createElement('select');picker.className='nws-legal-lang';picker.setAttribute('aria-label',c.select);
   for(const code of supported){const option=document.createElement('option');option.value=code;option.textContent=code.toUpperCase();picker.appendChild(option)}
   picker.value=locale;
   picker.addEventListener('change',()=>{
     try{localStorage.setItem('nws-lang',picker.value)}catch(_e){}
     const url=new URL(location.href);url.searchParams.set('lang',picker.value);location.assign(url.href);
   });
   header.append(picker);
 }
 const main=document.querySelector('main.wrap');
 if(main){
   const tag=main.querySelector('.tag');if(tag)tag.textContent=c.tag;
   const entry=dictionary[locale]?.[page];
   if(entry){
     const sections=main.querySelectorAll(':scope > section');
     if(sections.length===entry.sections.length){
       main.querySelector('h1').textContent=entry.title;
       main.querySelector('.intro').textContent=entry.intro+' '+c.updated;
       sections.forEach((section,i)=>{
         section.querySelector('h2').textContent=entry.sections[i][0];
         // O corpo das secções traduzidas usa apenas HTML fixo definido neste ficheiro.
         const raw=entry.sections[i][1];
         const body=raw.startsWith('<table') ? raw : raw.includes('<p>') ? '<p>'+raw.replace('<p>','</p><p>') : '<p>'+raw+'</p>';
         section.querySelector('h2').insertAdjacentHTML('afterend','<div class="nws-legal-body">'+body+'</div>');
         for(const node of [...section.children])if(node.tagName!=='H2'&&!node.classList.contains('nws-legal-body'))node.remove();
       });
       document.title=entry.title+' | Nova Web Studio';
       const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=entry.intro;
     } else console.warn('[NWS] As secções legais mudaram. Tradução preservada em português por segurança.');
   }
   const action=main.querySelector('.action');if(action){const a=action.querySelector('a');action.replaceChildren(document.createTextNode(c.action+' '),...(a?[a]:[]),document.createTextNode('.'));}
 }
 const footer=document.querySelector('footer .foot');
 if(footer){
   const rights=footer.querySelector(':scope > span:first-child');if(rights)rights.textContent='© 2026 Nova Web Studio · '+c.footer[0];
   const legal=footer.querySelector('.nws-legal-links');if(legal){
     const links=legal.querySelectorAll('a');links.forEach((a,i)=>{if(c.footer[i+1])a.textContent=c.footer[i+1]});
     const preference=legal.querySelector('[data-nws-cookies-open]');if(preference)preference.textContent=c.footer[4];
     if(!legal.querySelector('.nws-legal-team')){const a=document.createElement('a');a.href='/hub';a.textContent=c.footer[5];a.className='nws-legal-team';a.setAttribute('aria-label',c.footer[5]+' — Nova Web Studio');legal.append(a)}
   }
 }
 // Não perder o idioma ao saltar para as outras políticas ou voltar ao site.
 if(locale!=='pt')for(const a of document.querySelectorAll('a[href^="/"]')){
   let u;try{u=new URL(a.href,location.href)}catch(_e){continue}if(u.origin!==location.origin)continue;
   if(u.pathname==='/hub')continue;
   u.searchParams.set('lang',locale);a.href=u.pathname+u.search+u.hash;
 }
})();
