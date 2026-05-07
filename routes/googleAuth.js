const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const Donor = require('../models/Donors')

const googleAuthRoutes = express.Router();

// Initiate Google OAuth
googleAuthRoutes.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
googleAuthRoutes.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_failed',
    session: false // We use JWT, not sessions
  }),
  async (req, res) => {
    // Generate JWT and set HttpOnly cookie
    generateToken(res, req.user._id, req.user.name, req.user.email);
    

    //generate donor from google information    
    const payload = {
      name: req.user.name,
      email: req.user.email,
      donorType: 'Individual',
      notes: 'logged in from google yippie! + Amir is Gay'
    }
    try {
      //make sure donor doesn't exist
      let donor = await Donor.findOne({name: payload.name});
      if(donor){
        res.setHeader("Set-Cookie", res.getHeader("Set-Cookie"));
        return res.redirect(process.env.CLIENT_URL)
//         return res.send(`
//   <html>
//     <body>
//       <script>
//         window.location.href = "${process.env.CLIENT_URL}";
//       </script>
//     </body>
//   </html>
// `);
      }


      const response = Donor.create(payload)
    } catch (err) {
      console.log(err)
    }
    // Redirect to frontend dashboard
    res.setHeader("Set-Cookie", res.getHeader("Set-Cookie"));
    res.redirect(process.env.CLIENT_URL);
//     return res.send(`
//   <html>
//     <body>
//       <script>
//         window.location.href = "${process.env.CLIENT_URL}";
//       </script>
//     </body>
//   </html>
// `);
  }
);

module.exports = {googleAuthRoutes};
