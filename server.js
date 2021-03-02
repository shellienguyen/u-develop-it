// Import dependencies.
const express = require( 'express' );
const PORT = process.env.PORT || 3001;
const app = express();
const morganLogger = require( 'morgan' );

// Verobse produces messages in the terminal regarding the state of the runtime,
// which can help explain what the app is doing, specifically SQLite.
const sqlite3 = require( 'sqlite3' ).verbose();

// Setup Express middleware to json parse and urlendoded for POST requests.
app.use( express.urlencoded({ extended: false }));
app.use( express.json());

// Setup morgan middleware to log HTTP requests and errors.
app.use( morganLogger( 'dev' ));

///////////////////////////////////////////////////////////////////////////////

// Connect the application to the SQLite database by creating a new instance
// of the election.db.
const db = new sqlite3.Database( './db/election.db', err => {
   if ( err ) {
      return console.error( err.message );
   };

   console.log( 'Connected to the election database.' );
});


// Route to handle user requets that aren't supported by the app,
// (Not Found) catch all.
// Make sure this route is placed as the last route.
app.use(( req, res ) => {
   res.status( 404 ).end();
});


// Start server after DB connection.  This is to ensure that the
// Express.js server doesn't start before the connection to the
// database has been established, hence we wrp the Express.js erver
// connection in an event handler.
db.on( 'open', () => {
   // Start Express.js server on designated port.
   app.listen( PORT, () => {
      console.log( `Server running on port ${PORT}` );
   });
});