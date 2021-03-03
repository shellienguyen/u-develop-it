// Import dependencies.
const express = require( 'express' );
const PORT = process.env.PORT || 3001;
const app = express();
const morganLogger = require( 'morgan' );
const inputCheck = require( './utils/inputCheck' );

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


/* GEt all candidates
The all() method runs an SQL query and executes the callback with all
the resulting rows that match the query.  This method allows SQL commands
to be written in a Nodes.js application.  Returns an array of objects.
*/
app.get( '/api/candidates', ( req, res ) => {
   const sql = `SELECT candidates.*, parties.name AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id`;
   // Params is set to empty because there are no placeholders in the SQL statement.
   const params = [];

   // Handle the client's request and the database' response.
   db.all( sql, params, ( err, rows ) => {
      if ( err ) {
         // Error 500 is a server error; where as 404 is user request error.
         res.status( 500 ). json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: rows
      });
   });
});


// GET a single candidate
app.get( '/api/candidate/:id', ( req, res ) => {
   const sql = `SELECT candidates.*, parties.name AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id
                WHERE candidates.id = ?`;
   const params = [ req.params.id ];

   db.get( sql, params, ( err, row ) => {
      if ( err ) {
         // Error 400 notifies the client their request was not accepted
         // and to try another one.
         res.status( 400 ).json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: row
      });
   });
});


/* 
Delete a candidate
The run() method executes an SQL query but won't retrieve any result data.
The ? denotes a placeholder, making this a prepared statement.
Prepared statements can have placeholders that can be filled in dynamically
with real values at runtime.  The additional parameter can provide value for 
placeholder.
One reason to use a placeholder in the SQL query is to block an SQL injection
attack, which replaces the client user variable and inserts alternate commands
that could reveal or destroy the database. The sqlite3 module protects against
this kind of attack by escaping any parameters before they're inserted into a
prepared statement.
 */
app.delete( '/api/candidate/:id', ( req, res ) => {
   const sql = `DELETE FROM candidates WHERE id = ?`;
   const params = [ req.params.id ];

   db.run( sql, params, function( err, result ) {
      if ( err ) {
         res.status( 400 ).json({ error: res.message });
         return;
      };

      res.json({
         message: 'successfully deleted',
         changes: this.changes
      });
   });
});


// Create a candidate
app.post( '/api/candidate', ({ body }, res ) => {
   // Make sure the user info in the request can creat a candidate.
   const errors = inputCheck( body, 'first_name', 'last_name', 'industry_connected' );

   if ( errors ) {
      res.status( 400 ).json({ error: errors });
      return;
   };

   // Create a candidate
   const sql = `INSERT INTO candidates ( first_name, last_name, industry_connected )
                VALUES ( ?, ?, ? )`;
   // Use array to match the placeholders.
   const params = [ body.first_name, body.last_name, body.industry_connected ];

   // ES5 function, not arrow function, to use 'this'
   db.run( sql, params, function( err, result ) {
      if ( err ) {
         res.status( 400 ).json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: body,
         // lastID is the id of the inserted row.
         id: this.lastID
      });
   });
});


// Update a candidate.
app.put( '/api/candidate/:id', ( req, res ) => {

   // Verify that party_id was provided before attempt to update the db.
   const errors = inputCheck( req.body, 'party_id' );

   if ( errors ) {
      res.status( 400 ). json({ error: errors });
      return;
   };
   
   const sql = `UPDATE candidates SET party_id = ?
                WHERE id = ?`;
   // Value to update with is in the body and value to check against
   // for update is in the params.
   const params = [ req.body.party_id, req.params.id ];

   db.run( sql, params, function( err, result ) {
      if ( err ) {
         res.status( 400 ).json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: req.body,
         changes: this.changes
      });
   });
});


// Get all parties.
app.get( '/api/parties', ( reg, res ) => {
   const sql =   `SELECT * FROM parties`;
   const params = [];

   db.all( sql, params, ( err, rows ) => {
      if ( err ) {
         res.status( 500 ).json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: rows
      });
   });
});


// Get a single party.
app.get( '/api/party/:id', ( req, res ) => {
   const sql = `SELECT * FROM parties WHERE ID = ?`;
   const params = [ req.paramsid ];

   db.get( sql, params, ( err, row ) => {
      if ( err ) {
         res.status( 400 ).json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: row
      });
   });
});


// Date a party
app.delete( '/api/party/:id', ( req, res ) => {
   const sql = `DELETE FROM parties WHERE id = ?`;
   const params = [ req.params.id ];

   db.run( sql, params, function( err, result ) {
      if ( err ) {
         res.status( 400 ).json({ error: res.message });
         return;
      };

      res.json({ message: 'successfully deleted', changes: this.changes });
   });
});


//(Not Found) CATCH ALL. Route to handle user requets that aren't
// supported by the app.  Make sure this route is placed as the last route.
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