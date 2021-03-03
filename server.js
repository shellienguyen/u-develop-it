// Import dependencies.
const express = require( 'express' );
const PORT = process.env.PORT || 3001;
const app = express();
const morganLogger = require( 'morgan' );
const inputCheck = require( './utils/inputCheck' );
const db = require( './db/database' );

// Don't have to specify index.js in the path as Node.js will
// automatically look for an index.js.
const apiRoutes = require( './routes/apiRoutes' );
app.use( '/api', apiRoutes );

// Setup Express middleware to json parse and urlendoded for POST requests.
app.use( express.urlencoded({ extended: false }));
app.use( express.json());

// Setup morgan middleware to log HTTP requests and errors.
app.use( morganLogger( 'dev' ));

//(Not Found) CATCH ALL. Route to handle user requets that aren't
// supported by the app.  Make sure this route is placed as the last route.
app.use(( req, res ) => {
   res.status( 404 ).end();
});


////////////////////////////////////////////////////////////////////////////////


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