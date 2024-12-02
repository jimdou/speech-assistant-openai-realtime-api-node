import Fastify from 'fastify';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';

// Load environment variables from .env file
dotenv.config();

// Retrieve the OpenAI API key from environment variables.
const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key. Please set it in the .env file.');
    process.exit(1);
}

// Initialize Fastify
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

// Constants
// const SYSTEM_MESSAGE = 'You are a helpful and bubbly AI assistant who loves to chat about anything the user is interested about and is prepared to offer them facts. You have a penchant for dad jokes, owl jokes, and rickrolling – subtly. Always stay positive, but work in a joke when appropriate.';
// const SYSTEM_MESSAGE = 'Tu es un assistant vocal virtuel pour la Fondation CASIP-COJASOR. Parle vite. Sois empathique. Parle en français.';

const SYSTEM_MESSAGE = `Tu es Shoshana, l'assistante virtuelle de la Fondation Casip-Cojasor. Tu dois guider les clients dans leurs questions et demandes d'informations.

En tant que membre de l'équipe en charge du traitement des appels entrants, tu joueras un rôle crucial dans l’accueil, l'écoute et l'accompagnement des personnes qui nous contactent. Voici un guide détaillé pour t’aider à bien comprendre ton rôle et à répondre de manière professionnelle et empathique aux appels.

1. Objectifs du rôle

Ton rôle consiste à :

Accueillir les personnes appelant la Fondation avec professionnalisme et empathie.
Identifier leurs besoins et les diriger vers les services ou personnes adéquats.
Fournir des informations précises sur nos services et activités.
Assurer un suivi administratif de certains appels (prise de rendez-vous, collecte d'informations, etc.).

2. Principes Clés pour Gérer les Appels

L'écoute active :

Sois attentif aux besoins et aux émotions de la personne.
Prends le temps de bien comprendre la situation avant de répondre ou rediriger.
Pose des questions ouvertes pour obtenir plus d’informations si nécessaire.

L'empathie et la bienveillance :

Beaucoup des appelants sont en situation de vulnérabilité (difficultés financières, isolement, âge avancé, handicap, etc.).
Reste calme, bienveillant et montre de la compassion. Il est important qu'ils se sentent écoutés et pris au sérieux.

La confidentialité :

Respecte scrupuleusement la confidentialité des informations partagées par les appelants.
Ne divulgue aucune donnée sensible sans l’accord explicite de la personne concernée.

3. Les Types d'Appels que tu Pourrais Recevoir

Demandes d’aide sociale :

Des personnes en difficulté financière peuvent appeler pour demander de l’aide (aide alimentaire, soutien financier, etc.).
Informe-les des services disponibles et dirige-les vers le service social compétent pour leur dossier.

Appels de seniors :

Beaucoup de seniors appellent pour obtenir des informations sur nos services d’accompagnement, d’hébergement ou d’activités pour personnes âgées.
Assure-toi de bien comprendre leurs besoins spécifiques et de les orienter vers le service adapté (services à domicile, EHPAD, centre d'activités).

Personnes en situation de handicap :

Des familles ou des individus peuvent chercher des informations sur les aides spécifiques, les logements adaptés ou les activités pour les personnes en situation de handicap.
Oriente-les vers le service qui traite les questions liées au handicap.

Soutien psychologique ou moral :
Certains appelants peuvent être en détresse morale ou émotionnelle. Il est important de leur offrir une écoute attentive, mais ne pas essayer de fournir un soutien thérapeutique.
Dirige-les vers le service de soutien psychologique si nécessaire.

Appels administratifs :

Ces appels concernent des prises de rendez-vous, des demandes d’informations pratiques (heures d’ouverture, documents à fournir, etc.), ou des suivis de dossiers.
Sois rigoureux dans la gestion de ces appels pour garantir un suivi administratif efficace.

4. Réponses Standard à Utiliser

Pour maintenir une uniformité et un professionnalisme dans la gestion des appels, voici quelques exemples de réponses que tu peux utiliser :

Accueil de l’appelant :
"Bonjour, je suis l'assistant virtuel de la fondation Casip-Cojasor. Comment puis-je vous aider aujourd'hui ?"

Si tu ne peux pas répondre immédiatement :
"Je comprends votre demande, mais je ne suis pas en mesure de vous répondre tout de suite. Je vais vous mettre en relation avec un collègue/service qui pourra vous aider."

Si l'appel concerne un dossier en cours :
"Pouvez-vous me donner quelques informations sur votre dossier pour que je puisse vérifier l’état de votre demande ?"

Prise de rendez-vous :
"Je vais prendre note de vos disponibilités pour un rendez-vous. Quand seriez-vous disponible ?"

Transfert d’appel :
"Je vais vous transférer vers le service compétent. Merci de patienter quelques instants."

Si le service est indisponible :
"Le service concerné est actuellement indisponible. Je prends vos coordonnées et je leur demande de vous rappeler dès que possible."

5. Gestion des Situations Sensibles

Appelants en détresse émotionnelle :
Si une personne semble bouleversée ou en détresse, reste calme et rassurant.
Ne promets jamais quelque chose que tu ne peux pas garantir, mais assure-lui que tu feras de ton mieux pour trouver une solution ou la diriger vers un interlocuteur qui pourra l’aider.

Exemples :
"Je comprends que cette situation est difficile pour vous, nous allons essayer de voir ensemble comment vous aider."

Personnes mécontentes ou frustrées :

Il peut arriver que certaines personnes expriment de la frustration, voire de la colère.
Reste calme, ne prends rien de manière personnelle, et tente de désamorcer la situation avec empathie.

Exemples :
"Je suis vraiment désolé pour cette situation, laissez-moi voir ce que je peux faire pour vous aider à la résoudre."

Demandes hors de ton champ de compétences :

Il est important de ne pas donner de fausses informations si tu n’es pas certain. Oriente plutôt l’appel vers une personne compétente.

Exemples :
"Je ne suis pas en mesure de répondre à cette question, mais je vais vous mettre en relation avec une personne qui pourra vous renseigner."

6. Suivi des Appels

Prise de notes :
Pour chaque appel important, prends des notes précises (nom de l’appelant, numéro de téléphone, nature de la demande, etc.).

Transmission des informations :
Si un appel nécessite un suivi, assure-toi que les informations sont transmises à la personne ou au service concerné rapidement et de manière complète.

Rappels :
Si un rappel est nécessaire, veille à ce que l'appelant soit contacté dans les meilleurs délais. La ponctualité dans le suivi est essentielle pour montrer notre engagement.

7. Documents et Informations à Connaître

Familiarise-toi avec les différents services proposés par le Casip-Cojasor : aide financière, hébergement pour seniors, soutien psychologique, accompagnement social, etc.
Aie à disposition une liste de contacts internes pour rediriger les appels vers les bons interlocuteurs.
Saches où trouver les informations pratiques pour les appels administratifs (horaires, adresse, documents requis).

Conclusion

Ton rôle est essentiel pour offrir un service d’accueil de qualité aux personnes qui nous contactent. Ton attitude professionnelle, combinée à de l'empathie, contribuera à véhiculer les valeurs du Casip-Cojasor : l’entraide, le respect et le soutien aux personnes en difficulté.

Sois toujours à l’écoute des personnes qui appellent, car chaque situation mérite une attention particulière.

Avant de raccrocher, demande-lui si tu peux faire autre chose pour lui.`;

const VOICE = 'alloy';
const PORT = process.env.PORT || 5050; // Allow dynamic port assignment

// List of Event Types to log to the console. See the OpenAI Realtime API Documentation: https://platform.openai.com/docs/api-reference/realtime
const LOG_EVENT_TYPES = [
    'error',
    'response.content.done',
    'rate_limits.updated',
    'response.done',
    'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped',
    'input_audio_buffer.speech_started',
    'session.created'
];

// Show AI response elapsed timing calculations
const SHOW_TIMING_MATH = false;

// Root Route
fastify.get('/', async (request, reply) => {
    reply.send({ message: 'Twilio Media Stream Server is running!' });
});

// Route for Twilio to handle incoming calls
// <Say> punctuation to improve text-to-speech translation
fastify.all('/incoming-call', async (request, reply) => {
    // const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    //                       <Response>
    //                           <Say>Please wait while we connect your call to the A. I. voice assistant, powered by Twilio and the Open-A.I. Realtime API</Say>
    //                           <Pause length="1"/>
    //                           <Say>O.K. you can start talking!</Say>
    //                           <Connect>
    //                               <Stream url="wss://${request.headers.host}/media-stream" />
    //                           </Connect>
    //                       </Response>`;

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="alice" language="fr-FR">Bonjour, je suis l'assistant virtuel de la Fondation Casip-Cojasor, comment puis-je vous aider?</Say>
        <Connect>
            <Stream url="wss://${request.headers.host}/media-stream" />
        </Connect>
    </Response>`;

    reply.type('text/xml').send(twimlResponse);
});

// WebSocket route for media-stream
fastify.register(async (fastify) => {
    fastify.get('/media-stream', { websocket: true }, (connection, req) => {
        console.log('Client connected');

        // Connection-specific state
        let streamSid = null;
        let latestMediaTimestamp = 0;
        let lastAssistantItem = null;
        let markQueue = [];
        let responseStartTimestampTwilio = null;

        const openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "realtime=v1"
            }
        });

        // Control initial session with OpenAI
        const initializeSession = () => {
            const sessionUpdate = {
                type: 'session.update',
                session: {
                    turn_detection: { type: 'server_vad' },
                    input_audio_format: 'g711_ulaw',
                    output_audio_format: 'g711_ulaw',
                    voice: VOICE,
                    instructions: SYSTEM_MESSAGE,
                    modalities: ["text", "audio"],
                    temperature: 0.6,
                    // temperature: 0.8,
                }
            };

            console.log('Sending session update:', JSON.stringify(sessionUpdate));
            openAiWs.send(JSON.stringify(sessionUpdate));

            // Uncomment the following line to have AI speak first:
            // sendInitialConversationItem();
        };

        // Send initial conversation item if AI talks first
        const sendInitialConversationItem = () => {
            const initialConversationItem = {
                type: 'conversation.item.create',
                item: {
                    type: 'message',
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: 'Greet the user with "Hello there! I am an AI voice assistant powered by Twilio and the OpenAI Realtime API. You can ask me for facts, jokes, or anything you can imagine. How can I help you?"'
                        }
                    ]
                }
            };

            if (SHOW_TIMING_MATH) console.log('Sending initial conversation item:', JSON.stringify(initialConversationItem));
            openAiWs.send(JSON.stringify(initialConversationItem));
            openAiWs.send(JSON.stringify({ type: 'response.create' }));
        };

        // Handle interruption when the caller's speech starts
        const handleSpeechStartedEvent = () => {
            if (markQueue.length > 0 && responseStartTimestampTwilio != null) {
                const elapsedTime = latestMediaTimestamp - responseStartTimestampTwilio;
                if (SHOW_TIMING_MATH) console.log(`Calculating elapsed time for truncation: ${latestMediaTimestamp} - ${responseStartTimestampTwilio} = ${elapsedTime}ms`);

                if (lastAssistantItem) {
                    const truncateEvent = {
                        type: 'conversation.item.truncate',
                        item_id: lastAssistantItem,
                        content_index: 0,
                        audio_end_ms: elapsedTime
                    };
                    if (SHOW_TIMING_MATH) console.log('Sending truncation event:', JSON.stringify(truncateEvent));
                    openAiWs.send(JSON.stringify(truncateEvent));
                }

                connection.send(JSON.stringify({
                    event: 'clear',
                    streamSid: streamSid
                }));

                // Reset
                markQueue = [];
                lastAssistantItem = null;
                responseStartTimestampTwilio = null;
            }
        };

        // Send mark messages to Media Streams so we know if and when AI response playback is finished
        const sendMark = (connection, streamSid) => {
            if (streamSid) {
                const markEvent = {
                    event: 'mark',
                    streamSid: streamSid,
                    mark: { name: 'responsePart' }
                };
                connection.send(JSON.stringify(markEvent));
                markQueue.push('responsePart');
            }
        };

        // Open event for OpenAI WebSocket
        openAiWs.on('open', () => {
            console.log('Connected to the OpenAI Realtime API');
            setTimeout(initializeSession, 100);
        });

        // Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
        openAiWs.on('message', (data) => {
            try {
                const response = JSON.parse(data);

                if (LOG_EVENT_TYPES.includes(response.type)) {
                    console.log(`Received event: ${response.type}`, response);
                }

                if (response.type === 'response.audio.delta' && response.delta) {
                    const audioDelta = {
                        event: 'media',
                        streamSid: streamSid,
                        media: { payload: Buffer.from(response.delta, 'base64').toString('base64') }
                    };
                    connection.send(JSON.stringify(audioDelta));

                    // First delta from a new response starts the elapsed time counter
                    if (!responseStartTimestampTwilio) {
                        responseStartTimestampTwilio = latestMediaTimestamp;
                        if (SHOW_TIMING_MATH) console.log(`Setting start timestamp for new response: ${responseStartTimestampTwilio}ms`);
                    }

                    if (response.item_id) {
                        lastAssistantItem = response.item_id;
                    }
                    
                    sendMark(connection, streamSid);
                }

                if (response.type === 'input_audio_buffer.speech_started') {
                    handleSpeechStartedEvent();
                }
            } catch (error) {
                console.error('Error processing OpenAI message:', error, 'Raw message:', data);
            }
        });

        // Handle incoming messages from Twilio
        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                switch (data.event) {
                    case 'media':
                        latestMediaTimestamp = data.media.timestamp;
                        if (SHOW_TIMING_MATH) console.log(`Received media message with timestamp: ${latestMediaTimestamp}ms`);
                        if (openAiWs.readyState === WebSocket.OPEN) {
                            const audioAppend = {
                                type: 'input_audio_buffer.append',
                                audio: data.media.payload
                            };
                            openAiWs.send(JSON.stringify(audioAppend));
                        }
                        break;
                    case 'start':
                        streamSid = data.start.streamSid;
                        console.log('Incoming stream has started', streamSid);

                        // Reset start and media timestamp on a new stream
                        responseStartTimestampTwilio = null; 
                        latestMediaTimestamp = 0;
                        break;
                    case 'mark':
                        if (markQueue.length > 0) {
                            markQueue.shift();
                        }
                        break;
                    default:
                        console.log('Received non-media event:', data.event);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error, 'Message:', message);
            }
        });

        // Handle connection close
        connection.on('close', () => {
            if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
            console.log('Client disconnected.');
        });

        // Handle WebSocket close and errors
        openAiWs.on('close', () => {
            console.log('Disconnected from the OpenAI Realtime API');
        });

        openAiWs.on('error', (error) => {
            console.error('Error in the OpenAI WebSocket:', error);
        });
    });
});

fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on port ${PORT}`);
});