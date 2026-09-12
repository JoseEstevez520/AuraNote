ntarlo de nuevo

exopciame un pco 

urchade/GLiNER



Sí. GLiNER es bastante interesante para lo que tú estás mirando de modelos pequeños y especializados, porque intenta hacer una cosa que normalmente harías con un LLM, pero con un modelo mucho más pequeño y especializado.



Repositorio de GLiNER



La idea básica



GLiNER significa Generalist and Lightweight Named Entity Recognition.



Imagina este texto:



"Jose estudia DAW en IES de Teis y está aprendiendo Spring Boot."



Un NER tradicional podría detectar:



Jose        → PERSON

IES de Teis → ORGANIZATION

Spring Boot → TECHNOLOGY



El problema es que los NER tradicionales suelen venir entrenados para tipos de entidades concretos: persona, organización, lugar, fecha, etc.



GLiNER permite que tú le digas qué tipos quieres buscar:



labels = \[

&#x20;   "person",

&#x20;   "school",

&#x20;   "technology",

&#x20;   "programming language"

]



Y el modelo intenta encontrar esas entidades aunque esos labels no fueran exactamente los que utilizó durante su entrenamiento. Eso es lo que llaman zero-shot NER.



Lo interesante: no es un LLM



Esta es probablemente la parte que más te interesa.



En vez de hacer:



Texto

&#x20; ↓

LLM

&#x20; ↓

"Devuélveme un JSON con las entidades"



GLiNER utiliza un transformer bidireccional tipo BERT y trabaja directamente sobre el texto y los tipos de entidades que le das.



Conceptualmente:



&#x20;             ┌── "person"

&#x20;             │

Texto ────────┼── "technology"

&#x20;             │

&#x20;             └── "company"

&#x20;                   ↓

&#x20;                GLiNER

&#x20;                   ↓

&#x20;         entidades encontradas



Eso hace que sea mucho más ligero que mandar cada texto a un LLM.



El proyecto está específicamente diseñado para funcionar en CPU, hardware de consumo, cuantización e incluso exportación a ONNX.



Ejemplo muy sencillo

from gliner import GLiNER



model = GLiNER.from\_pretrained(

&#x20;   "gliner-community/gliner\_small-v2.5"

)



text = """

Jose está desarrollando SkillNet en España usando

Python, FastAPI y OpenUI.

"""



labels = \[

&#x20;   "person",

&#x20;   "country",

&#x20;   "programming language",

&#x20;   "software framework",

&#x20;   "software project"

]



entities = model.predict\_entities(

&#x20;   text,

&#x20;   labels,

&#x20;   threshold=0.5

)



for entity in entities:

&#x20;   print(entity\["text"], "=>", entity\["label"])



Podrías obtener algo parecido a:



Jose       => person

España     => country

SkillNet   => software project

Python     => programming language

FastAPI    => software framework

OpenUI     => software project



La gracia es que tú defines el esquema de extracción en el momento de usar el modelo.



¿Y por qué puede ser interesante para tus proyectos?



Aquí es donde yo le veo bastante sentido con lo que tú quieres hacer.



Por ejemplo, imagina una aplicación que observa documentos, interacciones del usuario, cursos, etc.



Podrías tener:



Documento

&#x20;  ↓

GLiNER

&#x20;  ↓

personas

tecnologías

conceptos

empresas

lugares

temas

habilidades

...



Y después utilizar eso para construir otras cosas:



&#x20;            ┌── GLiNER → entidades

Documento ───┤

&#x20;            └── embeddings → significado

&#x20;                      ↓

&#x20;                   tu sistema

&#x20;                      ↓

&#x20;             GenUI / recomendaciones



En lugar de utilizar un LLM gigantesco para cada pequeña tarea de extracción.



Y puedes hacer Fine-tuning



Esto también encaja bastante con lo que me comentabas de querer aprender fine-tuning de modelos pequeños.



Supongamos que quieres detectar específicamente:



SKILL

CONCEPT

TOOL

FRAMEWORK

PROJECT

DIFFICULTY



Podrías crear ejemplos de tu dominio y hacer fine-tuning de GLiNER.



Por ejemplo:



{

&#x20; "text": "Spring Boot is used to build REST APIs",

&#x20; "entities": \[

&#x20;   \[0, 11, "FRAMEWORK"],

&#x20;   \[29, 38, "CONCEPT"]

&#x20; ]

}



Y entrenarlo para que sea mucho mejor en tu problema concreto.



El propio proyecto incluye herramientas y ejemplos para fine-tuning y generación sintética de datos.



También tiene una cosa bastante potente



Las versiones actuales de GLiNER no se quedan únicamente en NER.



El proyecto incluye:



NER

extracción de relaciones

detección de PII

clasificación/token classification

streaming NER

arquitecturas bi-encoder para muchísimos tipos de entidades



Por ejemplo, puedes pasar de:



Jose → PERSON

SkillNet → PROJECT



a intentar obtener relaciones:



Jose

&#x20; │

&#x20; └── developed → SkillNet



Eso ya empieza a ser interesante para knowledge graphs / Graph RAG.



La diferencia con un LLM sería más o menos esta

&#x09;GLiNER	LLM

Tamaño	pequeño	normalmente grande

CPU	✅	normalmente peor

Coste por inferencia	muy bajo	mayor

Zero-shot	✅	✅

Entidades personalizadas	✅	✅

Generación de texto	❌	✅

Fine-tuning específico	✅	✅

Velocidad para extracción	muy buena	normalmente menor

Puede funcionar local	✅	depende del modelo



Por eso yo no lo vería como sustituto de un LLM, sino como una pieza que puedes poner antes o después del LLM.



Por ejemplo, para algo tipo SkillNet:



&#x20;                   DOCUMENTO

&#x20;                       │

&#x20;            ┌──────────┴──────────┐

&#x20;            ↓                     ↓

&#x20;         GLiNER               Embeddings

&#x20;            │                     │

&#x20;      "qué aparece"        "de qué trata"

&#x20;            │                     │

&#x20;            └──────────┬──────────┘

&#x20;                       ↓

&#x20;                   TU SISTEMA

&#x20;                       ↓

&#x20;                LLM / GenUI



Y ahí es donde conecta bastante con tu idea de usar modelos pequeños especializados en lugar de tirar siempre de un modelo gigante. GLiNER es literalmente una implementación bastante buena de ese enfoque: un modelo pequeño que hace una tarea concreta muy bien.



Sí. Yo usaría un prompt que deje claro que no es una app de notas convencional, sino un documento que genera interfaces según lo que escribes:



Create a high-fidelity product concept visualization of a futuristic dynamic notes application.



The core idea: the user writes completely normal free-form text, and the document understands its content and dynamically generates interactive UI directly inside the document. The interface is not predefined — it emerges from the information contained in the note.



Show a clean desktop web app with a large white canvas, inspired by Apple/iPhone design language, Notion, Linear and modern editorial interfaces. Extremely minimal, premium and calm. Lots of whitespace, black and dark-gray typography, very subtle blue accents, thin light-gray borders, soft rounded corners, elegant SF Pro-like typography, restrained shadows. No gradients, no neon, no excessive cards, no dashboard feeling.



Main example note:



"El viernes voy a Lisboa para JunctionX. Llego el jueves y quiero aprovechar el viernes para conocer la ciudad y quizá hacer algo por el mar."



Some entities in the text are subtly interactive: "Lisboa", "viernes", "JunctionX", "mar". They should look naturally integrated into the text, perhaps with a very subtle underline or hover-like treatment.



Below and around the note, show the system dynamically generating useful interfaces based on the content:

\- a beautiful compact interactive map of Lisbon

\- a small timeline showing Thursday arrival, Friday exploration and JunctionX

\- contextual suggestions related to the ocean

\- an expandable event section for JunctionX



These should feel like they emerged naturally from the document, not like a collection of predefined dashboard widgets.



Also show a second smaller note elsewhere in the interface:



"Estoy comparando Spring Boot y FastAPI para mis próximos proyectos."



For this note, dynamically generated content should be completely different: an elegant interactive Spring Boot vs FastAPI comparison, with a few concise dimensions such as language, architecture, ecosystem and use cases.



The important visual concept is that different text produces different interfaces.



Show subtle visual cues suggesting the flow:

WRITE → UNDERSTAND → GENERATE → EXPLORE



The user should feel that everything inside the document can become interactive. Clicking an entity such as "Lisboa" could expand its map; clicking "viernes" could open the timeline; selecting a phrase could generate a contextual exploration interface.



The final image should communicate "the document itself becomes an adaptive interface."



High-end SaaS product design, realistic UI mockup, polished UX case study presentation, minimal Apple-like aesthetic, extremely clean composition, believable typography and spacing, sophisticated interaction design, 16:9 desktop screenshot, no people, no logos, no decorative illustrations.



La clave del prompt es que no diga simplemente “AI notes app with cards”. Tiene que transmitir que el texto es la materia prima de la interfaz y que la UI cambia dependiendo del contenido.



hizo ets0o



Sí, ha pillado bastante bien la idea. De hecho, visualmente yo cambiaría algunas cosas para acercarlo más a lo que tú estás imaginando:



La parte de Lisboa funciona: texto → entidades → interfaz contextual.

La comparación de Spring Boot/FastAPI demuestra bien que la UI cambia según el contenido.

Pero ahora mismo se ve demasiado como “notas + varios widgets/cards”.

Yo haría que las interfaces estuvieran mucho más integradas en el propio documento, casi como si el texto se transformase en una interfaz.

También quitaría bastante la sensación de dashboard. La gracia es que no hay bloques prediseñados esperando ahí.

Y potenciaría lo de Curio: seleccionar Lisboa, JunctionX, mar o incluso una frase debería abrir/explorar información directamente sin abandonar el documento.



Conceptualmente, la imagen ya transmite:



Write something → the system understands it → the document becomes interactive.



Y creo que esa es exactamente la dirección buena para el proyecto.



Sé breve y conciso. Dime cómo funcionaría, en plan, yo escribo la frase y qué pasa. Dímelo claro. quiero que seas claro, breve.



Escribes normalmente:



“El viernes voy a Lisboa para JunctionX y quiero hacer algo por el mar.”



GLiNER detecta → Lisboa, viernes, JunctionX, mar.

Un modelo de razonamiento interpreta el contexto y decide qué puede ser útil.

OUI-1 genera la interfaz → mapa de Lisboa + timeline + opciones relacionadas con el mar.

Aparece dentro de la nota, no en otra página.

Todo es interactivo: pulsas “Lisboa” → mapa; “viernes” → fecha; seleccionas una frase → explorar esa información.



La idea: escribes información → la interfaz nace de esa información.

