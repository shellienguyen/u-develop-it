const express = require( 'express' );
const router =  express.Router();
const db = require( '../../db/database' );
const inputCheck = require( '../../utils/inputCheck' );


////////////////////////////////////////////////////////////////////////////////


/* GEt all candidates
The all() method runs an SQL query and executes the callback with all
the resulting rows that match the query.  This method allows SQL commands
to be written in a Nodes.js application.  Returns an array of objects.
*/
router.get( '/candidates', ( req, res ) => {
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
router.get( '/candidate/:id', ( req, res ) => {
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
router.delete( '/candidate/:id', ( req, res ) => {
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
router.post( '/candidate', ({ body }, res ) => {
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
router.put( '/candidate/:id', ( req, res ) => {

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

module.exports = router;