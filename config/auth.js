// config/auth.js

var rootDir = process.env.APP_URL || 'http://localhost:3000';

// expose our config directly to our application using module.exports
module.exports = {
    'facebookAuth' : {
        'clientID'      : '1019147024815879', // your App ID
        'clientSecret'  : '1bc317215eb534ac068cb44416f578a6', // your App Secret
        'callbackURL'   : rootDir + '/auth/facebook/callback'
    },

    'googleAuth' : {
        'clientID'      : '322693589157-h8q2jv3epfe6fcs1lf3llcsn9v38f1sm.apps.googleusercontent.com',
        'clientSecret'  : 'W4ZNTRjjPJMIh_DaYo2OAD0e',
        'callbackURL'   : rootDir + '/auth/google/callback'
    }

};
