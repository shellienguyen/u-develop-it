// Import dependencies.
const express = require( 'express' );
const PORT = process.env.PORT || 3001;
const app = express();
const morganLogger = require( 'morgan' );

// Setup Express middleware to json parse and urlendoded for POST requests.
app.use( express.urlencoded({ extended: false }));
app.use( express.json());

// Setup morgan middleware to log HTTP requests and errors.
app.use( morganLogger( 'dev' ));

///////////////////////////////////////////////////////////////////////////////

// Test route, remove later
/* app.get( '/', ( req, res ) => {
   res.json({ message: 'Hello World' });
}); */


// Route to handle user requets that aren't supported by the app,
// any other request (Not Found) catch all.
// Make sure this route is placed as the last route.
app.use(( req, res ) => {
   res.status( 404 ).end();
});


// Start Express.js server on designated port.
app.listen( PORT, () => {
   console.log( `Server running on port ${PORT}` );
});