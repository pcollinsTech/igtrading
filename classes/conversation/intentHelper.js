const db = require('../databases/mysql');
const moment = require('moment');
const intents = require('../intents/index');

class IntentHelper {

    getIntent(intentId, type, conversation, newIntent) {
        new Promise((resolve, reject) => {
            db.getPool().getConnection(function (err, connection) {
                connection.query('INSERT INTO messages (conversation_id, intent_name, message_type, new_intent, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        conversation.id,
                        intentId.toString(),
                        type.toString(),
                        newIntent,
                        moment().format('YYYY-MM-DD HH:mm:ss'),
                        moment().format('YYYY-MM-DD HH:mm:ss')
                    ], function (err, result) {
                        connection.release()
                        if (err) reject(err);
                        resolve(result);
                    });
            });
        });

        return new (intents[intentId])(conversation)
    }

}

module.exports = new IntentHelper;