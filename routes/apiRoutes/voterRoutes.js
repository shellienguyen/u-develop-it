const express = require( 'express' );
const router = express.Router();
const db = require( '../../db/database' );
const inputCheck = require( '../../utils/inputCheck' );


////////////////////////////////////////////////////////////////////////////////


// Get all voters
router.get( '/voters', ( req, res ) => {
   const sql = `SELECT * FROM voters ORDER BY last_name`;
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


// Get an individual voter
router.get( '/voter/:id', ( req, res ) => {
   const sql = `SELECT * FROM voters WHERE id = ?`;
   const params = [ req.params.id ];

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


// POST request to allow voters to register, assuming the front end will
// send user's first name, last name, and email address.
router.post( '/voter', ({ body }, res ) => {
   // Check for blank data
   const errors = inputCheck( body, 'first_name', 'last_name', 'email' );

   if ( errors ) {
      res.status( 400 ).json({ error: errors });
      return;
   };

   const sql = `INSERT INTO voters
                  ( first_name,
                    last_name, email )
                VALUES ( ?, ?, ? )`;
   const params = [ body.first_name, body.last_name, body.email ];

   db.run( sql, params, function( err, data ) {
      if ( err ) {
         res.status( 400 ).json({ error: err.message });
         return;
      };

      res.json({
         message: 'success',
         data: body,
         id: this.lastID
      });
   });
});


// Allow users to update their email address
router.put( '/voter/:id', ( req, res ) => {
   // Data validation
   const errors = inputCheck( req.body, 'email' );

   if ( errors ) {
      res.status( 400 ).json({ error: errors });
      return;
   };

   // Prepare SQL statment
   const sql = `UPDATE voters SET email = ? WHERE id = ?`;
   const params = [ req.body.email, req.params.id ];

   // Execute SQL statement
   db.run( sql, params, function( err, data ) {
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


// Allow users to delete a voter
router.delete( '/voter/:id', ( req, res ) => {
   const sql = `DELETE FROM voters WHERE id = ?`;

   db.run( sql, req.params.id, function( err, result ) {
      if ( err ) {
         res.status( 400 ).json({ error: res.message });
         return;
      };

      res.json({ message: 'deleted', changes: this.changes });
   });
});


module.exports = router;