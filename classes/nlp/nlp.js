const projectId = process.env.DIALOG_FLOW_PROJECT_ID; //https://dialogflow.com/docs/agents#settings
const languageCode = 'en-US';
const dialogflow = require('dialogflow').v2beta1;
const util = require('util');

const contextsClient = new dialogflow.ContextsClient({
    keyFilename: './' + process.env.GOOGLE_SERVICE_JSON
});

const sessionClient = new dialogflow.SessionsClient({
    keyFilename: './' + process.env.GOOGLE_SERVICE_JSON
});


class Nlp {

    getSessionPath(sessionId) {
        // if(process.env.APP_ENV === "production") {
        //     return sessionClient.environmentSessionPath(projectId, "production", sessionId, sessionId);
        // }
        
        return sessionClient.sessionPath(projectId, sessionId);
    }

    getContextPath(contextId, sessionId) {
        // if(process.env.APP_ENV === "production") {
        //     return contextsClient.environmentContextPath(projectId, "production", sessionId, sessionId, contextId);
        // }

        return contextsClient.contextPath(projectId, sessionId, contextId);
    }

    sendToNlp(message, sessionId) {
        console.log("Sending to NLP");

        const sessionPath = this.getSessionPath(sessionId);

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: languageCode,
                },
            }
        };

        return new Promise((resolve, reject) => {
            sessionClient
                .detectIntent(request)
                .then(responses => {
                    const result = responses[0].queryResult;

                    console.log('NLP: ');
                    console.log(util.inspect(result, false, null))

                    resolve({
                        action: result.action,
                        parameters: result.parameters,
                        intentId: (result.intent) ? result.intent.displayName : null
                    });
                })
                .catch(error => {
                    reject('NLP ERROR:', error);
                });
        });
    }

    createContext(contextId, sessionId) {
        return new Promise(resolve => {
            const contextPath = this.getSessionPath(sessionId);

            const idContextPath = this.getContextPath(contextId, sessionId);
            const timeContextRequest = {
                parent: contextPath,
                context: {
                    name: idContextPath,
                    lifespanCount: 2
                },
            };
    
            contextsClient.createContext(timeContextRequest).then(responses => {
                console.log("Context Created: " + contextId);
                resolve(responses);
            }).catch(error => {
                console.log('Failed to create new context: ' + error);
            });
        })
    }



    clearContexts(sessionId) {

        return new Promise((resolve, reject) => {
            this.listContexts(sessionId)
                .then(contexts => {
                    Promise.all(
                        contexts.map(context => {
                            return this.deleteContext(context);
                        })
                    ).then(response => {
                        resolve("Cleared");
                    })
                    .catch(error => {
                        console.error('Failed to clear contexts:' + error);
                        reject('Failed to clear contexts:' + error)
                    });
                })
    
        });
    }

    listContexts(sessionId) {
        const sessionPath = this.getSessionPath(sessionId);

        const request = {
            parent: sessionPath,
        };
        
        // Send the request for listing contexts.
        return new Promise(resolve => {
            contextsClient
                .listContexts(request)
                .then(responses => {
                    resolve(responses[0]);
                })
                .catch(error => {
                    console.error('Failed to list contexts:' + error);
                });
        }) 
    }

    deleteAllContexts(sessionId) {
        const sessionPath = this.getSessionPath(sessionId);

        const request = {
            parent: sessionPath,
        };

        return contextsClient.deleteAllContexts(request);
    }

    deleteContext(context) {
        const request = {
            name: context.name,
        };

        const contextId = contextsClient.matchContextFromContextName(context.name);

        return new Promise((resolve, reject) => {
            return contextsClient
                .deleteContext(request)
                .then(() => {
                    resolve(`Context ${contextId} deleted`);
                })
                .catch(error => {
                    reject('Failed to delete contexts: ' + error)
                });
        })

        
    }
}

module.exports = new Nlp();