// Verbose produces messages in the terminal regarding the state of the runtime,
// which can help explain what the app is doing, specifically SQLite.
const sqlite3 = require( 'sqlite3' ).verbose();


///////////////////////////////////////////////////////////////////////////////


// Connect the application to the SQLite database by creating a new instance
// of the election.db.
const db = new sqlite3.Database( './db/election.db', err => {
   if ( err ) {
      return console.error( err.message );
   };

   console.log( 'Connected to the election database.' );
});


module.exports = db;