// const express = require('express');
// const session = require('express-session')
// require('./auth');
// const passport = require('passport')
// const cors = require('cors')
// const jwt = require('jsonwebtoken')
// const crypto = require("crypto");
// const handoffStore = new Map()

// const JWT_SECRET = '8rG_Z8A2vRlvzkInyyV0nFDH_pBMtJH2U1PfCOMb24vPsHX3896BukU8clU8fpC3';

// const app = express();
// app.use(session({secret: 'cats'}))
// app.use(passport.initialize())
// app.use(passport.session())

// //rendering engine
// app.set('view engine', 'ejs');

// //middleware for cors
// app.use(cors({
//   origin: [
//     process.env.CORS_ORIGIN || "http://localhost:5173",
//     "http://localhost:8080",
//     "http://localhost:3000"
//   ],
//   credentials: true,
// }));

// //middleware for body parsing
// app.use(express.urlencoded({extended: true}))
// app.use(express.json())

// function isLoggedIn(req, res, next){
//   req.user? next(): res.sendStatus(401);
// }

// app.get('/', (req,res)=>{
//   res.send("hello")
// })

// app.post('/api/auth/login', (req, res)=>{
//   console.log(req.body);
//   res.send(`<a href="/auth/google">Login in with google</a>`)
// })

// app.get('/api/auth/google', passport.authenticate('google', {scope: ['email', 'profile']}));

// // app.get('/google/callback', passport.authenticate('google', {failureRedirect: '/failedRequest'}), 
// //   (req, res) => {
// //     const token = jwt.sign({id: req.user.name, email: req.user.email}, JWT_SECRET, {expiresIn: '1h'});
    
// //     res.status(200).json({
// //       success: true,
// //       token: `Bearer ${token}`
// //     });

// //     //one time code
// //     const code = crypto.randomBytes(32).toString("hex");

// //     // save payload temporarily
// //     // handoffStore.set( _token, token );
// //     // handoffStore.set(_user, user);
// //     // handoffStore.set(_code, code);
// //     handoffStore.set(code, {jwt, user});

// //     // expire in 60s (handoff TTL)
// //     setTimeout(() => handoffStore.delete(code), 60 * 1000);

// //     console.log(req.user)
// //     res.redirect("http://localhost:8080/auth/callback?code=${code}")
// //   }
// // )

// app.get(
//   '/google/callback',
//   passport.authenticate('google', { failureRedirect: '/failedRequest' }),
//   (req, res) => {
//     // Normalize user from passport profile
//     const user = {
//       email: req.user?.email || req.user?.emails?.[0]?.value || '',
//       fullName: req.user?.displayName || req.user?.name?.givenName || '',
//     };

//     // Raw JWT only (NO "Bearer " prefix)
//     const token = jwt.sign(
//       { id: user.fullName, email: user.email },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // One-time handoff code
//     const code = crypto.randomBytes(32).toString('hex');

//     // Save temporary payload
//     handoffStore.set(code, { token, user });

//     // Expire code after 60s
//     setTimeout(() => handoffStore.delete(code), 60 * 1000);

//     // Redirect to frontend callback page
//     res.redirect(`http://localhost:8080/auth/callback?code=${code}`);
//   }
// );

// app.post('/api/google/callback/exchange', (req, res) => {
//   const code = req.body.code;
//   console.log(code)
//   if (!code) {
//     return res.status(400).json({ message: 'Missing code' });
//   }

//   const record = handoffStore.get(code);
//   console.log(record)
//   if (!record) {
//     return res.status(400).json({ message: 'Invalid or expired code' });
//   }

//   handoffStore.delete(code); // one-time use
//   return res.status(200).json(record); // { token, user }
// });

// app.get('/failedRequest', (req, res) => {
//   res.send("Something went wrong")
// })
// app.get('/protected', isLoggedIn, (req, res) => {
//   // res.send("Welcome, user...")
//   res.render('store', {title: 'Checkout Page'})
// })

// // payment routes
// app.get('/makePayment', (req, res) => {
//   res.send(`<a href="/initialize">Donate</a>`)
// })

// app.get('/initialize', (req, res) => {
//   var request = require('request');
//   const tx_ref = "tx-" + Date.now(); // unique reference

//   var options = {
//     'method': 'POST',
//     'url': 'https://api.chapa.co/v1/transaction/initialize',
//     'headers': {
//   'Authorization': 'Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6',
//   'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       "amount": "10",
//       "currency": "ETB",
//       "email": "abebech_bekele@gmail.com",
//       "first_name": "Bilen",
//       "last_name": "Gizachew",
//       "phone_number": "0912345678",
//       "tx_ref": tx_ref,
//       "callback_url": "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60",
//       "return_url": `http://localhost:3000/paymentComplete?tx_ref=${tx_ref}`,
//     })

//   };
//   request(options, function (error, response) {
//     if (error) throw new Error(error);
//     res.redirect(JSON.parse(response.body).data.checkout_url);
//   });
// })

// // app.get('/paymentComplete', (req, res) => {
// //   res.redirect("http://localhost:8080/")
// // })

// // app.get("/paymentComplete", async (req, res) => {
// //   // You usually get tx_ref from query params
// //   const tx_ref = req.query.tx_ref;

// //   // This is the Chapa receipt URL format (example)
// //   const receiptUrl = await fetch(`https://api.chapa.co/v1/transaction/verify/:tx_ref=`);

// //   console.log(tx_ref, receiptUrl)
// //   res.send(`
// //     <html>
// //       <head>
// //         <title>Payment Complete</title>
// //       </head>
// //       <body>
// //         <h2>Payment Successful. Redirecting...</h2>

// //         <script>
// //           // open receipt in new tab
// //           window.open("${receiptUrl}", "_blank");

// //           // redirect current tab to frontend root
// //           window.location.href = "http://localhost:8080/";
// //         </script>
// //       </body>
// //     </html>
// //   `);
// // });

// app.get("/paymentComplete", (req, res) => {
//   const request = require("request");

//   const tx_ref = req.query.tx_ref;

//   if (!tx_ref) {
//     console.log("Missing tx_ref. Query:", req.query);
//     return res.send("Missing tx_ref");
//   }

//   const options = {
//     method: "GET",
//     url: `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
//     headers: {
//       Authorization: "Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6",
//     },
//   };

//   request(options, function (error, response) {
//     if (error) return res.send("Verification failed");

//     const data = JSON.parse(response.body);

//     console.log("VERIFY RESPONSE:", data);

//     const receiptReference = data.data.reference;

//     // receipt url depends on chapa response
//     // const receiptUrl = data?.data?.receipt_url || "";
//     // console.log(receiptUrl)
//     res.send(`
//       <html>
//         <head>
//           <title>Payment Complete</title>
//         </head>
//         <body>
//           <h2>Payment Successful. Redirecting...</h2>

//           <script>
//             ${receiptReference ? `window.open("https://chapa.link/payment-receipt/${receiptReference}", "_blank");` : ""}
//             window.location.href = "http://localhost:8080/";
//           </script>
//         </body>
//       </html>
//     `);
//   });
// });

// app.listen("3000", ()=>{
//   console.log("server running at port 3000")
// })

////////////////////////////////////////////////////////////////////////////////
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken')
const request = require("request");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { put } = require('@vercel/blob');
const Transaction = require('./models/Transaction')
const Family = require('./models/Family')
const Support = require('./models/Support')
const Donor = require('./models/Donors')
const User = require('./models/User')
const Event = require('./models/Event')
const Notification = require('./models/Notification')
const connectToDatabase = require('./lib/db')

require('./config/passport'); // Initialize passport config

const authRoutes = require('./routes/auth');
const {googleAuthRoutes} = require('./routes/googleAuth');
const Donation = require('./models/Donations');

const app = express();
app.set("trust proxy", 1);

// Connect DB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

//initially connect to db too
// connectToDatabase()
// .then(()=>console.log("connected to database"))
// .catch(err=>console.log("COULDNT CONNECT: ", err))

// Middleware
app.use(express.json());
app.use(cookieParser());

// DB connection middleware
// app.use(async (req, res, next)=>{
//   try {
//     await connectToDatabase;
//     next()
    
//   } catch (error) {
//     console.log("ERROOOOOOOOOOR", error)
//     next()
//   }
// })

// CORS: Allow frontend to send credentials (cookies)
// app.use(cors({
//   origin: "https://amana--fullstack.vercel.app", // e.g., http://localhost:8080
//   credentials: true
// }));

process.env.NODE_ENV === "development"? 
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
  // methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
})) :
app.use(cors({
  origin: "https://amana--fullstack.vercel.app",
  credentials: true,
  // methods: ["GET", "POST", "PUT", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
}));

// Passport session middleware (required for OAuth flow)
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 24 * 60 * 60 * 1000
//   }
// }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Changed from true - Google OAuth needs same-site cookies in production too
    sameSite: "lax", // Changed from "none" - Google OAuth requires same-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Auth middleware
function authenticateToken(req, res, next) {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: "Not logged in" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Shared helper: saves to Vercel Blob in production, local disk in dev
async function saveFile(buffer, originalname, mimetype, subdir) {
  const ext = path.extname(originalname);
  const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, filename };
  }

  const destDir = path.join(__dirname, 'uploads', subdir);
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(path.join(destDir, filename), buffer);
  return { url: `/uploads/${subdir}/${filename}`, filename };
}

// Multer (memory storage — no disk writes in production)
const MB = 1024 * 1024;
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * MB } });
const photoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * MB } });
const smallUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * MB } });

// Upload endpoint for family documents
app.post('/api/upload/family-document', async (req, res) => {
  memUpload.single('document')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const result = await saveFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'documents');
      res.json(result);
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save file' });
    }
  });
});

// Upload endpoint for beneficiary / event photos
app.post('/api/upload/beneficiary-photo', async (req, res) => {
  photoUpload.single('photo')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const result = await saveFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'photos');
      res.json(result);
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save photo' });
    }
  });
});

// Upload endpoint for user avatar
app.post('/api/upload/avatar', async (req, res) => {
  smallUpload.single('avatar')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const result = await saveFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
      res.json(result);
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save avatar' });
    }
  });
});

// Upload endpoint for donor (organization / embassy) logos
app.post('/api/upload/donor-logo', async (req, res) => {
  smallUpload.single('logo')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const result = await saveFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'logos');
      res.json(result);
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save logo' });
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes); // Mounts /api/auth/google

app.get('/api', (req,res)=>{
  console.log("root")
  res.send("hello")
})
app.get('/', (req,res)=>{
  console.log("root")
  res.send("hello")
})

//Payment section
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8080';

// Public base URL of THIS backend, used for Chapa's server-to-server callback.
// SERVER_URL env overrides everything (set it to your ngrok/tunnel URL for
// local testing so Chapa can actually reach the callback); otherwise fall back
// to NODE_ENV defaults.
const SERVER_URL =
  process.env.SERVER_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://api-amana-fullstack.onrender.com");

app.get('/api/makePayment', (req, res) => {
  res.send(`<a href="/initialize">Donate</a>`)
})

// app.post('/initialize', (req, res)=> {
//   const body = req.body;
//   console.log(body)
// })

app.post("/api/initialize", async (req, res) => {
  const tx_ref = "tx-" + Date.now(); // unique reference
  
  const paymentInfo = {
    paymentMethod: req.body.paymentMethod, 
    amount: req.body.selectedAmount || req.body.customAmount * 1, 
    phone: req.body.telebirrPhone,
    familyClassification: req.body.familyClassification || null
  };

  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if(!token) return res.status(401).json({message: "not logged in"});

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
  } catch (err) {
    return res.status(401).json({message: "invalid token"});
  }

  const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;

  //initialize transaction payload and save number to update donor entity
  try{
    // Look up the donor via User's donorId (fall back to email for legacy users)
    const paymentUser = await User.findById(decoded.userId);
    if (!paymentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    let donor;
    if (paymentUser.donorId) {
      donor = await Donor.findById(paymentUser.donorId);
    }
    if (!donor) {
      donor = await Donor.findOne({email: paymentUser.email});
    }
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    //options object
    let options = {
      'method': 'POST',
      'url': 'https://api.chapa.co/v1/transaction/initialize',
      'headers': {
        'Authorization': 'Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6',
        'Content-Type': 'application/json'
      },
      body: {
        "amount": paymentInfo.amount,
        "currency": "ETB",
        "email": paymentUser.email,
        "first_name": paymentUser.name,
        "phone_number": paymentInfo.phone,
        "tx_ref": tx_ref,
        "callback_url": `${SERVER_URL}/api/paymentComplete?tx_ref=${tx_ref}`,
        // return_url intentionally omitted (blank). Checkout opens in a new tab;
        // with no return_url Chapa's receipt page persists there and never
        // redirects. The main tab polls /transactions/:tx_ref/status for
        // completion, then navigates itself to /donation-success.
        "donorId": donor._id,
        "eventId": (req.body.eventId && mongoose.Types.ObjectId.isValid(req.body.eventId)) ? req.body.eventId : null,
        "familyClassification": paymentInfo.familyClassification,
      }
    };

    // Save a pending transaction — donation record is created after payment verification
    let txn = await Transaction.createFromPayload(options.body);
    console.log(txn)

    options.body = JSON.stringify(options.body)

    request(options, function (error, response) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "failed" });
      }
      const parsed = JSON.parse(response.body);

      if (!parsed?.data?.checkout_url) {
        console.log("CHAPA ERROR:", parsed);
        return res.status(400).json(parsed);
      }
      return res.json({ message: "ok", checkout_url: parsed.data.checkout_url, tx_ref });
    });
  } catch (err) {
    console.log("Failed to make the transaction", err)
    return res.status(400).json({message: "Failed to create donation record", error: err})
  }
});

// Server-side payment completion handler (triggered by Chapa's callback/webhook
// and/or when the browser returns to return_url). It verifies the transaction
// and records the donation, but does NOT auto-bounce the browser anywhere
// except when a real browser request hits it (then we send them to the success
// page). If return_url is blank, this is purely server-to-server.
app.get("/api/paymentComplete", (req, res) => {
  const request = require("request");

  const tx_ref = req.query.tx_ref;

  if (!tx_ref) {
    console.log("Missing tx_ref. Query:", req.query);
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect(`${CLIENT_URL}/donation-failure?reason=missing_reference`);
    }
    return res.status(400).json({ error: "Missing tx_ref" });
  }


  const options = {
    method: "GET",
    url: `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
    headers: {
      Authorization: "Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6",
    },
  };

  request(options, async function (error, response) {
    if (error) {
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect(`${CLIENT_URL}/donation-failure?tx_ref=${encodeURIComponent(tx_ref)}&reason=verification_failed`);
      }
      return res.status(502).json({ error: "Verification failed" });
    }

    const data = JSON.parse(response.body);

    console.log("VERIFY RESPONSE:", data);

    // Only trust a receipt URL that Chapa actually returns. Do NOT fabricate a
    // chapa.link/payment-receipt/<ref> URL: that hosted page does not exist in
    // test mode (and the format is not guaranteed), which causes 404s. When Chapa
    // gives us nothing, we leave receiptUrl empty and render our own internal
    // receipt (built from the stored verification data) instead.
    const chapaReceiptUrl = data.data?.receipt_url || "";
    const chapaStatus = data?.status || data?.data?.status;
    try{
        const txn = await Transaction.updateAfterVerification(tx_ref, data.data);

        // Only create the donation when Chapa confirms success
        if (txn && txn.status === 'success') {
          // Idempotency guard: Chapa can call this callback more than once, and
          // the browser may also hit paymentComplete. Never create a second
          // donation for the same tx_ref.
          const existing = await Donation.findOne({ tx_ref });
          if (existing) {
            console.log("Donation already exists for tx_ref, skipping create:", tx_ref);
            if (req.headers.accept && req.headers.accept.includes("text/html")) {
              return res.redirect(`${CLIENT_URL}/donation-success?tx_ref=${encodeURIComponent(tx_ref)}`);
            }
            return res.json({ success: true, status: "success", tx_ref, duplicate: true });
          }

          let donation;
          try {
            donation = await Donation.create({
              donorId: txn.donorId,
              donorName: txn.first_name,
              donationType: "monetary",
              amount: txn.amount,
              currency: txn.currency,
              eventId: txn.eventId && mongoose.Types.ObjectId.isValid(txn.eventId) ? txn.eventId : null,
              familyClassification: txn.familyClassification || null,
              receiptUrl: chapaReceiptUrl || undefined,
              // Mark as a Chapa receipt regardless of whether Chapa returned a
              // hosted URL, so the frontend routes to the internal receipt view.
              receiptType: "chapa",
              source: "chapa",
              tx_ref: tx_ref,
            });
          } catch (createErr) {
            // Concurrent duplicate: two callbacks raced past the findOne check
            // and the unique tx_ref index rejected the second insert.
            if (createErr && createErr.code === 11000) {
              console.log("Duplicate donation blocked by unique index for tx_ref:", tx_ref);
              if (req.headers.accept && req.headers.accept.includes("text/html")) {
                return res.redirect(`${CLIENT_URL}/donation-success?tx_ref=${encodeURIComponent(tx_ref)}`);
              }
              return res.json({ success: true, status: "success", tx_ref, duplicate: true });
            }
            throw createErr;
          }

          // Use Chapa's real receipt reference when available so the donation
          // reference is verifiable against the Chapa receipt; fall back to the
          // synthetic DON- reference otherwise.
          const chapaRef = data.data?.reference || data.data?.receipt_no;
          const donoRef = (chapaRef && String(chapaRef).trim()) || `DON-${donation._id.toString().slice(4,11)}`;
          await Donation.findByIdAndUpdate(donation._id, { donationReference: donoRef });

          await Donor.findByIdAndUpdate(txn.donorId, {
            $inc: { donationCount: 1, totalDonated: txn.amount },
            $push: { donations: donation },
          });

          if (txn.eventId && mongoose.Types.ObjectId.isValid(txn.eventId)) {
            await Event.findByIdAndUpdate(txn.eventId, {
              $push: { donations: donation._id },
              $inc: { "_count.donation": 1, collectedAmount: txn.amount },
            });
          }

          // Create notification for payment donation (no toast on frontend)
          try {
            await Notification.create({
              type: "donation",
              title: "New Online Donation",
              body: `${txn.first_name || "Someone"} donated ${txn.amount} ${txn.currency || "ETB"} online`,
              donationId: donation._id,
            });
          } catch (notifErr) {
            console.error("Failed to create payment notification:", notifErr);
          }

          // Success recorded. If a browser hit this directly, send them to the
          // success page; otherwise just confirm to the caller.
          if (req.headers.accept && req.headers.accept.includes("text/html")) {
            return res.redirect(`${CLIENT_URL}/donation-success?tx_ref=${encodeURIComponent(tx_ref)}`);
          }
          return res.json({ success: true, status: "success", tx_ref });
        }

        // Chapa did not confirm success (failed / cancelled / pending).
        const reason = chapaStatus === 'failed' ? 'payment_failed'
          : chapaStatus === 'cancelled' ? 'cancelled'
          : 'not_completed';
        if (req.headers.accept && req.headers.accept.includes("text/html")) {
          return res.redirect(`${CLIENT_URL}/donation-failure?tx_ref=${encodeURIComponent(tx_ref)}&reason=${reason}`);
        }
        return res.json({ success: true, status: reason, tx_ref });
    } catch (err) {
      console.log("Failed to make the transaction", err);
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect(`${CLIENT_URL}/donation-failure?tx_ref=${encodeURIComponent(tx_ref)}&reason=processing_error`);
      }
      return res.status(500).json({ error: "Processing error" });
    }
  });
});

//family routes
// app.post('/api/families', async (req, res) => {
//   console.log(req.body);
//   try{
//     const response = await Family.create(req.body)
//     res.status(201).json(response)
//     console.log(response)
//   }catch(err){
//     console.log("Failed to register family", err)
//     res.status(400).json({message: err.message})
//   }
// })
app.post('/api/families', async (req, res) => {
  console.log(req.body);
  try {
    // Normalize documents if present
    if (req.body.documents && Array.isArray(req.body.documents)) {
      req.body.documents = req.body.documents.map((doc) => ({
        title: doc.title || "Untitled",
        url: doc.url || "",
        uploadedAt: doc.uploadedAt || new Date(),
      }));
    }
    const response = await Family.create(req.body)
    res.status(201).json(response)
    console.log(response)
  } catch (err) {
    console.log("Failed to register family", err)
    res.status(400).json({ message: err.message })
  }
})
app.get('/api/families', async (req, res) => {
  // console.log(req.query)
  let {page = 1, limit = 10, search= '', registrationStatus, urgencyLevel, registrationCompleted} = req.query;
  limit = limit - 0;
  page = page - 0;
  const skip = (page - 1) * limit;

  const searchQuery = {}
  //conditionally setting the search
  if(search){
      searchQuery.$or = [
        {familyName: {$regex: search, $options: 'i'}},
        {familyCode: {$regex: search, $options: 'i'}},
        {familyHead: {$regex: search, $options: 'i'}}
      ]
  }

  //conditionally setting the registrationStatus
  if(registrationStatus){
    searchQuery.registrationStatus = registrationStatus;
  }

  //conditionally setting the urgency level
  if(urgencyLevel){
    searchQuery.urgencyLevel = urgencyLevel;
  }

  //conditionally setting the completion of registration
  if(registrationCompleted){
    searchQuery.registrationCompleted = registrationCompleted === 'true'
  }

  try{

    // const response = await Family.find(searchQuery).limit(limit * 1).skip((page - 1) * limit);

    const result = await Family.aggregate([
      //stage 1: matching
      {$match: searchQuery},
      {
        $facet: {
          metadata: [{$count: "totalRecords"}],
          data: [
            {$sort: {createdAt: -1}},
            {$skip: skip},
            {$limit: limit}
          ]
        }
      },
      //stage 3: reshape output 
      {
        $project: {
          data: 1,
          //extract total records from metadata array and compute pages
          pagination: {
            page: {$literal: page},
            limit: {$literal: limit},
            total: {$arrayElemAt: ["$metadata.totalRecords", 0]},
            totalPages: {
              $ceil: {
                $divide: [
                  {$ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0]}, 0]},
                  limit
                ]
              }
            }
          }
        }
      }
    ])


    // console.log("response", response)
    res.send(result)
  }catch(err){
    console.log("Failed to register family", err)
    res.end()
  }
})

app.delete('/api/families/:id', async (req, res)=> {
  const id = req.params.id;
  console.log(id)
  await Family.deleteOne({_id: id});
  res.end();
})

// app.put('/api/families/:id', async (req, res) => {
//   const id = req.params.id;
//   const resp = await Family.findOne({_id: id});
//   if(req.body.isVerified && resp.familyHead){
//     req.body.registrationStatus = "verified"
//   }
//   else if(req.body.familyHead || (req.body.isVerified === false && resp.familyHead)){
//     req.body.registrationStatus = "pending"
//   }
//   else{
//     req.body.registrationStatus = "incomplete"
//   }

//   try{
//     const response = await Family.findByIdAndUpdate({_id: id}, req.body)
//     res.status(201).json(response);
//   }catch(err){
//     res.status(400).json({message: "failed to update family"})
//   }

//   res.end();
// })
// ===== OLD PUT route (commented) =====
// app.put('/api/families/:id', async (req, res) => {
//   const id = req.params.id;
//   const resp = await Family.findOne({_id: id});
//   if (req.body.isVerified && resp.familyHead) {
//     req.body.registrationStatus = "verified"
//   }
//   else if (req.body.familyHead || (req.body.isVerified === false && resp.familyHead)) {
//     req.body.registrationStatus = "pending"
//   }
//   else {
//     req.body.registrationStatus = "incomplete"
//   }
//
//   // Normalize documents if present
//   if (req.body.documents && Array.isArray(req.body.documents)) {
//     req.body.documents = req.body.documents.map((doc) => ({
//       title: doc.title || "Untitled",
//       url: doc.url || "",
//       uploadedAt: doc.uploadedAt || new Date(),
//     }));
//   }
//
//   try {
//     const response = await Family.findByIdAndUpdate({ _id: id }, req.body, { new: true })
//     res.status(201).json(response);
//   } catch (err) {
//     res.status(400).json({ message: "failed to update family" })
//   }
//
//   res.end();
// })
app.put('/api/families/:id', async (req, res) => {
  const id = req.params.id;
  const resp = await Family.findOne({_id: id});

  // If verifying with classification(s)
  if (req.body.isVerified && req.body.familyClassification && Array.isArray(req.body.familyClassification) && req.body.familyClassification.length > 0 && resp.familyHead) {
    req.body.registrationStatus = "verified"
  }
  else if (req.body.isVerified && resp.familyHead) {
    // verified but no classification provided — still mark verified
    req.body.registrationStatus = "verified"
  }
  else if (req.body.familyHead || (req.body.isVerified === false && resp.familyHead)) {
    req.body.registrationStatus = "pending"
  }
  else if (req.body.registrationStatus === "rejected") {
    // explicitly rejected
  }
  else {
    req.body.registrationStatus = "incomplete"
  }

  // Normalize documents if present
  if (req.body.documents && Array.isArray(req.body.documents)) {
    req.body.documents = req.body.documents.map((doc) => ({
      title: doc.title || "Untitled",
      url: doc.url || "",
      uploadedAt: doc.uploadedAt || new Date(),
    }));
  }

  try {
    const response = await Family.findByIdAndUpdate({ _id: id }, req.body, { new: true })
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: "failed to update family" })
  }

  res.end();
})
app.get('/api/families/:id', async (req, res)=> {
  const id = req.params.id;
  // console.log(id)
  const response = await Family.findOne({_id: id});
  res.send(response);
})

//support history routes
app.post('/api/support-history', async (req, res) => {
  try {
    // console.log(req.body)
    const response = await Support.create(req.body)
    res.end();
  } catch (err) {
    console.error(err)
    res.end()
  }
})

app.get('/api/support-history', async (req, res) =>{
  console.log(req.query)
  const {page = 1, limit = 50} = req.query;
  const id = req.query.familyId;
  try {
    const response = await Support.find({familyId: id}).limit(limit * 1).skip((page - 1) * limit).populate("familyId")
    console.log(response);
    res.status(201).json(response)
  } catch (err) {
    console.log(err);
    res.status(400).json({message: err})
  }
})

//donors page
app.get('/api/donors', async (req, res)=> {
  // console.log(req.query);
  let {donorType, page = 1, limit = 10, search = ''} = req.query;
  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit;
  let searchQuery = {}
  if(search){
    searchQuery = {name: {$regex: search, $options: 'i'}}
  }
  if(donorType){
    const types = String(donorType).split(",").map(t => t.trim()).filter(Boolean);
    searchQuery.donorType = types.length > 1 ? { $in: types } : types[0];
  }
  try {
    // const response = await Donor.find(searchQuery).limit(limit * 1).skip((page - 1) * limit)
        const result = await Donor.aggregate([
      //stage 1: matching
      {$match: searchQuery},
      {
        $facet: {
          metadata: [{$count: "totalRecords"}],
          data: [
            {$sort: {registeredAt: -1}},
            {$skip: skip},
            {$limit: limit}
          ]
        }
      },
      //stage 3: reshape output 
      {
        $project: {
          data: 1,
          //extract total records from metadata array and compute pages
          pagination: {
            page: {$literal: page},
            limit: {$literal: limit},
            total: {$arrayElemAt: ["$metadata.totalRecords", 0]},
            totalPages: {
              $ceil: {
                $divide: [
                  {$ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0]}, 0]},
                  limit
                ]
              }
            }
          }
        }
      }
    ])
    // console.log(response);
    // res.json(response)
    console.log(result)
    res.json(result)
  } catch (err) {
     console.error(err);
     res.status(500).json({ message: 'Failed to fetch donors' });
  }
})

app.post('/api/donors', async (req, res)=>{
  console.log(req.body)
  try {
    if (req.body.phone) {
      const existing = await Donor.findOne({ phone: req.body.phone });
      if (existing) {
        return res.status(409).json({ message: 'A donor with this phone already exists' });
      }
    }
    const response = await Donor.create(req.body)
    res.status(201).json(response);
  } catch (err) {
    console.log(err)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ message: `A donor with this ${field} already exists` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create donor' });
  }
})

app.get('/api/donors/:id', async (req, res)=>{
  const id = req.params.id;
  try {
    const response = await Donor.findById({_id: id})
    // one-time cleanup script
await Donor.updateMany({ email: null }, { $unset: { email: "" } });
    console.log(response)
    res.json(response)
  } catch (err) {
    console.error(err)
    res.end()
  }
})

app.put('/api/donors/:id', async (req, res)=>{
  const id = req.params.id;
  
  console.log(req.body)
  try {
    const preResponse = await Donor.findOne({_id: id});
    console.log(preResponse);

    if (req.body.phone && req.body.phone !== preResponse.phone) {
      const existing = await Donor.findOne({ phone: req.body.phone });
      if (existing) {
        return res.status(409).json({ message: 'A donor with this phone already exists' });
      }
    }

    if(preResponse.name !== req.body.name){
      (preResponse.donations).map(donation=> donation.donorName = req.body.name);
      req.body.donations = preResponse.donations;
    }

    const response = await Donor.findByIdAndUpdate({_id: id}, req.body)
    const response2 = await Donation.updateMany({donorId: id}, {donorName: req.body.name})

    // Sync changes to linked User record
    const userToSync = await User.findOne({ donorId: id });
    if (userToSync) {
      if (req.body.name) userToSync.name = req.body.name;
      if (req.body.phone) userToSync.phoneNumber = req.body.phone;
      await userToSync.save();
    }

    console.log(response2)
    res.status(201).json(response2);
  } catch (err) {
    console.error(err)
if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ message: `A donor with this ${field} already exists` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create donor' });
  }
})

app.delete('/api/donors/:id', async (req, res)=>{
  const id = req.params.id;
  try {
    await Donor.deleteOne({_id: id})
    await Donation.deleteMany({donorId: id})
    res.end()
  } catch (err) {
    console.error(err)
    res.end()
  }
})

//making a donation using the donor info
// const Donation = require('./models/Donations')
// Upload a manual receipt for a donation (staff-entered received donations)
app.post('/api/donations/:id/receipt', (req, res) => {
  memUpload.single('receipt')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const result = await saveFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'receipts');
      const donation = await Donation.findByIdAndUpdate(
        req.params.id,
        { receiptUrl: result.url, receiptType: 'manual' },
        { new: true }
      );
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      res.json({ success: true, receiptUrl: result.url });
    } catch (saveErr) {
      console.error('Receipt upload failed:', saveErr);
      res.status(500).json({ error: 'Failed to save receipt' });
    }
  });
});

app.post('/api/donations/', async (req, res)=>{
  // console.log(req.body)
  // req.body.donationReference = `DON-${(req.body.id).slice(1,8)}`;
  console.log("donation coming from donations page",req.body)
  try {
    // Strip empty tx_ref so it stays absent (undefined). The unique+sparse
    // index treats "" as a value and would reject multiple manual donations.
    if (!req.body.tx_ref || !String(req.body.tx_ref).trim()) {
      delete req.body.tx_ref;
    }
    // const preResponse = await Donor.findOne({_id: req.body.donorId})
    const response = await Donation.create(req.body);
    const {_id} = response;
    // console.log(response)
    // Preserve a user-provided reference (manual donations); only synthesize a
    // DON- reference when none was supplied.
    if (!req.body.donationReference || !String(req.body.donationReference).trim()) {
      await Donation.findByIdAndUpdate({_id: _id}, {donationReference: `DON-${(_id.toString()).slice(4,11)}`})
    }

    req.body._id = response._id;
    req.body.id = response._id;
    req.body.lastDonated = req.body.createdAt;
    const response2 = await Donor.findOneAndUpdate({_id: req.body.donorId},{
      $inc: {donationCount: 1, totalDonated: req.body.amount * 1},
      $push: {donations: req.body},
    }, {new: true})

    //update events
    await Event.findByIdAndUpdate({_id: response.eventId}, {
      $push: {donations: response._id},
      $inc: {"_count.donation": 1, collectedAmount: req.body.amount},
    })
    // console.log("response", response)
    // console.log("response for donors update", response2)

    // Create notification for dashboard
    try {
      await Notification.create({
        type: "donation",
        title: "New Donation Received",
        body: `${req.body.donorName || "A donor"} donated ${req.body.amount ? req.body.amount + " " + (req.body.currency || "ETB") : "in-kind"}`,
        donationId: response._id,
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    res.end()
  } catch (err) {
    console.error(err)
    res.end()
  }
})

app.get('/api/donations', async (req, res)=> {
  console.log(req.query);
  let {search = '', page = 1, limit = 10, status, donationType} = req.query;
  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit;
  let searchQuery = {};
  if(search){
    searchQuery = {donorName: {$regex: search, $options: 'i'}}
  }
  if(status){
    searchQuery.status = status
  }
  if(donationType){
    searchQuery.donationType = donationType
  }
  try {
    // const response = await Donation.find(searchQuery).limit(limit).skip((page - 1) * limit).sort('-receivedAt')
    const result = await Donation.aggregate([
      //stage 1: matching
      {$match: searchQuery},
      {
        $facet: {
          metadata: [{$count: "totalRecords"}],
          data: [
            {$sort: {receivedAt: -1}},
            {$skip: skip},
            {$limit: limit}
          ]
        }
      },
      //stage 3: reshape output 
      {
        $project: {
          data: 1,
          //extract total records from metadata array and compute pages
          pagination: {
            page: {$literal: page},
            limit: {$literal: limit},
            total: {$arrayElemAt: ["$metadata.totalRecords", 0]},
            totalPages: {
              $ceil: {
                $divide: [
                  {$ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0]}, 0]},
                  limit
                ]
              }
            }
          }
        }
      }
    ])
    // console.log(response)
    // console.log(result)
    res.send(result)
    // res.end()
  } catch (err) {
    // console.log(err)
    res.end()
  }
})

// app.get('/api/donations/months', async (req, res)=>{
//   // console.log(req.body);
//   const now = new Date();
//   let monthlyAmounts = [];
//   const {months} = req.query;
//   try {
//     for(let i = months.length - 1; i >= 0; i--){
//       const monthStart = new Date(now.getFullYear(), now.getMonth()-i, 1);
//       const monthEnd = new Date(now.getFullYear(), now.getMonth() -i+1, 1)
//       const monthDono = await Donation.find({receivedAt: {
//         $gte: monthStart,
//         $lt: monthEnd,
//       }})
//       // console.log(monthDono)
//       monthlyAmounts.push(monthDono.reduce((total, dono)=>total+=dono.amount, 0))
//     }
//     // console.log(monthlyAmounts);
//     res.send(monthlyAmounts)
//   } catch (err) {
//     console.log(err)
//     res.end()
//   }
// })

app.get('/api/donations/months', async (req, res) => {
  const { months } = req.query;
  const monthCount = months.length;

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

  try {
    const results = await Donation.aggregate([
      { $match: { receivedAt: { $gte: rangeStart } } },
      { $group: {
          _id: { year: { $year: "$receivedAt" }, month: { $month: "$receivedAt" } },
          total: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Build a lookup map from aggregation results
    const donoMap = {};
    results.forEach(({ _id, total }) => {
      donoMap[`${_id.year}-${_id.month}`] = total;
    });

    // Walk the expected months in order, defaulting missing months to 0
    const monthlyAmounts = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyAmounts.push(donoMap[key] ?? 0);
    }

    res.json(monthlyAmounts);
  } catch (err) {
    console.error("Donations/months error:", err);
    res.status(500).json({ error: "Failed to fetch monthly donations" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Hero stats — public endpoint that powers the landing hero's "AMANA / OS"
// panel. Returns aggregated counters, the progress bar values against a
// hard-coded annual goal, and a recent-activity feed for the bottom ticker.
// All non-ETB donation amounts are converted to ETB using the FX_RATES map
// so the frontend always works in a single currency.
// ─────────────────────────────────────────────────────────────────────────────
const FX_RATES = {
  ETB: 1,
  USD: 137,   // approximate ETB per 1 USD — adjust as needed
  EUR: 148,   // approximate ETB per 1 EUR
  GBP: 173,   // approximate ETB per 1 GBP
};

// Single hard-coded annual goal for the hero progress bar (in ETB).
const HERO_GOAL_ETB = 2_000_000;

// Reusable $switch stage so currency conversion stays consistent across aggregates.
const ETB_EQUIVALENT_SWITCH = {
  $switch: {
    branches: [
      { case: { $eq: ["$currency", "USD"] }, then: { $multiply: ["$amount", FX_RATES.USD] } },
      { case: { $eq: ["$currency", "EUR"] }, then: { $multiply: ["$amount", FX_RATES.EUR] } },
      { case: { $eq: ["$currency", "GBP"] }, then: { $multiply: ["$amount", FX_RATES.GBP] } },
    ],
    default: "$amount",
  },
};

app.get('/api/hero-stats', async (req, res) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      familiesSupported,
      eventsThisYear,
      totalRaisedAgg,
      raisedThisMonthAgg,
      recentDonations,
      recentSupport,
      urgentFamilies,
      totalDonors,
    ] = await Promise.all([
      // Verified families — "directly supported"
      Family.countDocuments({ registrationStatus: "verified" }),

      // Events this year — has a startDate this year, or was created this year
      // with no startDate set, and wasn't cancelled.
      Event.countDocuments({
        $or: [
          { startDate: { $gte: yearStart } },
          { createdAt: { $gte: yearStart }, startDate: null },
        ],
        status: { $ne: "cancelled" },
      }),

      // All-time total raised converted to ETB
      Donation.aggregate([
        { $match: { status: "received", amount: { $gt: 0 } } },
        { $group: { _id: null, totalEtb: { $sum: ETB_EQUIVALENT_SWITCH } } },
      ]),

      // This-month raised converted to ETB (for ticker pulse)
      Donation.aggregate([
        {
          $match: {
            status: "received",
            receivedAt: { $gte: monthStart },
            amount: { $gt: 0 },
          },
        },
        { $group: { _id: null, totalEtb: { $sum: ETB_EQUIVALENT_SWITCH } } },
      ]),

      // Recent donation pulses for the ticker
      Donation.find({ status: "received", amount: { $gt: 0 } })
        .sort({ receivedAt: -1 })
        .limit(8)
        .select("donorName amount currency receivedAt")
        .lean(),

      // Recent support delivered for the ticker
      Support.find()
        .sort({ supportDate: -1 })
        .limit(6)
        .populate("familyId", "familyCode")
        .select("supportType supportDate familyId")
        .lean(),

      // Urgent families (high / critical urgency) — ticker pulse
      Family.countDocuments({ urgencyLevel: { $in: ["high", "critical"] } }),

      // Total registered donors — ticker pulse
      Donor.countDocuments({}),
    ]);

    const raised = Math.round(totalRaisedAgg[0]?.totalEtb || 0);
    const raisedThisMonth = Math.round(raisedThisMonthAgg[0]?.totalEtb || 0);

    res.json({
      counters: {
        familiesSupported,
        eventsThisYear,
        raisedEtb: raised,
      },
      progress: {
        raised,
        goal: HERO_GOAL_ETB,
        percent: Math.min(100, Math.round((raised / HERO_GOAL_ETB) * 1000) / 10),
      },
      ticker: {
        donations: recentDonations.map((d) => ({
          donorName: d.donorName,
          amount: d.amount,
          currency: d.currency,
          etbEquivalent: Math.round(d.amount * (FX_RATES[d.currency] || 1)),
          receivedAt: d.receivedAt,
        })),
        support: recentSupport.map((s) => ({
          supportType: s.supportType,
          familyCode: s.familyId?.familyCode || null,
          supportDate: s.supportDate,
        })),
        aggregates: {
          raisedThisMonth,
          urgentFamilies,
          totalDonors,
        },
      },
    });
  } catch (err) {
    console.error("Hero stats error:", err);
    res.status(500).json({ error: "Failed to load hero stats" });
  }
});

// Internal receipt data for a Chapa donation. Built from stored data
// (Donation + the verified Transaction record) so it works in test mode and
// offline, without depending on Chapa's hosted receipt page.
app.get('/api/donations/:id/receipt', async (req, res) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid donation id' });
    }

    const donation = await Donation.findById(id).lean();
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Find the matching transaction: prefer the stored tx_ref, then fall back
    // to matching Chapa's reference against the donation reference.
    let txn = null;
    if (donation.tx_ref) {
      txn = await Transaction.findOne({ tx_ref: donation.tx_ref }).lean();
    }
    if (!txn && donation.donationReference) {
      txn = await Transaction.findOne({ chapa_reference: donation.donationReference }).lean();
    }

    // Enrich with donor + event names when available.
    let donor = null;
    if (donation.donorId && mongoose.Types.ObjectId.isValid(donation.donorId)) {
      donor = await Donor.findById(donation.donorId).lean();
    }
    let event = null;
    if (donation.eventId && mongoose.Types.ObjectId.isValid(donation.eventId)) {
      event = await Event.findById(donation.eventId).lean();
    }

    const receipt = {
      donationId: donation._id,
      reference: donation.donationReference || txn.chapa_reference || '',
      txRef: donation.tx_ref || txn.tx_ref || '',
      source: donation.source || 'chapa',
      status: txn?.status || donation.status || 'received',
      donorName: donor?.name || donation.donorName || txn?.first_name || 'Anonymous',
      donorEmail: donor?.email || txn?.email || '',
      amount: donation.amount,
      currency: donation.currency || 'ETB',
      originalAmount: donation.originalAmount ?? null,
      originalCurrency: donation.originalCurrency ?? null,
      paymentMethod: donation.paymentMethod || txn?.paymentMethod || 'Chapa',
      familyClassification: donation.familyClassification || txn?.familyClassification || null,
      eventName: event?.title || event?.name || null,
      date: txn?.verified_at || donation.receivedAt || donation.createdAt,
      // Chapa's own hosted receipt, only when it genuinely returned one.
      hostedReceiptUrl: (txn?.receipt_url && String(txn.receipt_url).trim()) || null,
    };

    res.json({ success: true, receipt });
  } catch (err) {
    console.log('Failed to build receipt', err);
    res.status(500).json({ error: 'Failed to build receipt' });
  }
});

// Lightweight status poll for the MAIN tab. The checkout opens in a separate
// tab (with return_url blank so Chapa's receipt persists there), while this
// tab polls until the transaction is verified, then navigates to success.
app.get('/api/transactions/:tx_ref/status', async (req, res) => {
  const tx_ref = req.params.tx_ref;
  try {
    const txn = await Transaction.findOne({ tx_ref }).lean();
    if (!txn) {
      return res.json({ status: "pending" });
    }
    // 'success' => completed; anything else (pending/failed/cancelled) we surface.
    const status =
      txn.status === "success"
        ? "success"
        : txn.status === "failed" || txn.status === "cancelled"
          ? "failed"
          : "pending";
    return res.json({ status, tx_ref });
  } catch (err) {
    console.log("Status poll error:", err);
    return res.status(500).json({ error: "Status check failed" });
  }
});

// Resolve a receipt by Chapa tx_ref (the only identifier the success page has
// after the user returns from Chapa). Builds the receipt from the Transaction
// record (always created at payment init) plus a live Chapa verify, so it works
// even before the Donation document has been created by the callback.
app.get('/api/transactions/:tx_ref/receipt', async (req, res) => {
  const tx_ref = req.params.tx_ref;
  try {
    const txn = await Transaction.findOne({ tx_ref }).lean();
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Live status/reference from Chapa (best-effort; ignore failures).
    let chapaData = null;
    try {
      const request = require("request");
      const chapaRes = await new Promise((resolve, reject) => {
        request(
          {
            method: "GET",
            url: `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            headers: { Authorization: "Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6" },
          },
          (error, response) => (error ? reject(error) : resolve(response))
        );
      });
      chapaData = JSON.parse(chapaRes.body)?.data || null;
    } catch (e) {
      console.log("Chapa verify skipped for receipt:", e.message);
    }

    const donation = await Donation.findOne({ tx_ref }).lean();

    let donor = null;
    let event = null;
    if (donation) {
      if (donation.donorId && mongoose.Types.ObjectId.isValid(donation.donorId)) {
        donor = await Donor.findById(donation.donorId).lean();
      }
      if (donation.eventId && mongoose.Types.ObjectId.isValid(donation.eventId)) {
        event = await Event.findById(donation.eventId).lean();
      }
    }

    // Prefer Chapa's live reference/status; fall back to stored values.
    const reference = chapaData?.reference || donation?.donationReference || txn.chapa_reference || "";
    const status = chapaData?.status || txn.status || donation?.status || "pending";
    const amount = chapaData?.amount ?? donation?.amount ?? txn.amount;
    const currency = chapaData?.currency || donation?.currency || txn.currency || "ETB";
    const donorName =
      chapaData?.customer?.first_name || chapaData?.first_name || donor?.name || donation?.donorName || txn.first_name || "Anonymous";
    const donorEmail = chapaData?.email || donor?.email || txn.email || "";
    const eventName = event?.title || event?.name || null;

    const receipt = {
      donationId: donation?._id || null,
      reference,
      txRef: txn.tx_ref || "",
      source: "chapa",
      status,
      donorName,
      donorEmail,
      amount,
      currency,
      originalAmount: chapaData?.originalAmount ?? donation?.originalAmount ?? null,
      originalCurrency: chapaData?.originalCurrency ?? donation?.originalCurrency ?? null,
      paymentMethod: chapaData?.payment_method || donation?.paymentMethod || txn.paymentMethod || "Chapa",
      familyClassification: donation?.familyClassification || txn.familyClassification || null,
      eventName,
      date: txn.verified_at || chapaData?.created_at || donation?.receivedAt || donation?.createdAt || txn.created_at || null,
      hostedReceiptUrl: chapaData?.receipt_url || (txn.receipt_url && String(txn.receipt_url).trim()) || null,
    };

    res.json({ success: true, receipt });
  } catch (err) {
    console.log('Failed to build receipt by tx_ref', err);
    res.status(500).json({ error: 'Failed to build receipt' });
  }
});

app.get('/api/donations/:id', async (req, res)=>{
  const id = req.params.id;
  try {
    const response = await Donation.findById({_id: id})
    console.log("RESPOOOOOOOOOOOOOOOOONSE", response)
    res.json(response)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.put('/api/donations/:id', async (req, res)=> {
  const id = req.params.id;
  try {
    const oldDonation = await Donation.findById(id);
    const updatedDonation = await Donation.findByIdAndUpdate({_id: id}, req.body, {new: true})

// ---- after you have `updatedDonation` ----
    const newEventId = updatedDonation.eventId?.toString();
    const oldEventId = oldDonation.eventId?.toString();

    // If the event reference changed, pull from old
    if (oldEventId && oldEventId !== newEventId) {
      await Event.findByIdAndUpdate(oldEventId, {
        $pull: { donations: id },
        $inc: { collectedAmount: -oldDonation.amount, "_count.donation": -1 },
      });
    }
    // Update new event
    if (newEventId) {
      const amountDelta = (updatedDonation.amount || 0) - (oldDonation.amount || 0);
      await Event.findByIdAndUpdate(newEventId, {
        $addToSet: { donations: id },
        $inc: { collectedAmount: amountDelta, "_count.donation": oldEventId === newEventId? 0 : 1 }
      });
    }

// Handle donor updates
    const oldDonorId = oldDonation.donorId?.toString();
    const newDonorId = updatedDonation.donorId?.toString();
    if (oldDonorId !== newDonorId) {
      // Move donation between donors
      // Move donation between donors using atomic updates only
      await Donor.findByIdAndUpdate(oldDonorId, {
        $pull: { donations: { _id: id } },
        $inc: { donationCount: -1, totalDonated: -oldDonation.amount }
      });
      await Donor.findByIdAndUpdate(newDonorId, {
        $push: { donations: updatedDonation },
        $inc: { donationCount: 1, totalDonated: updatedDonation.amount }
      });
    } else {
      // Update donation within same donor
      const amountDelta = (updatedDonation.amount || 0) - (oldDonation.amount || 0);

      // Use application-level update to handle both new and legacy data
      // (legacy subdocuments have auto-generated _id different from the donation document _id)
      const donor = await Donor.findById(oldDonorId);
      if (donor) {
        const idx = donor.donations.findIndex(d => d._id.toString() === id || d.id?.toString() === id);
        const updatedObj = updatedDonation.toObject();
        if (idx !== -1) {
          donor.donations = donor.donations.map((d, i) => i === idx ? updatedObj : d);
        } else {
          donor.donations = donor.donations.filter(d =>
            !(d.amount === oldDonation.amount &&
              d.donationType === oldDonation.donationType &&
              d.receivedAt?.getTime() === oldDonation.receivedAt?.getTime())
          );
          donor.donations.push(updatedObj);
        }
        donor.totalDonated = (donor.totalDonated || 0) + amountDelta;
        await donor.save();
      }
    }

    // Create notification when pledged donation is received
    if (oldDonation.status === "pledged" && updatedDonation.status === "received") {
      try {
        await Notification.create({
          type: "donation",
          title: "Promised Donation Received",
          body: `${updatedDonation.donorName || "A donor"} fulfilled their promise with ${updatedDonation.amount || 0} ${updatedDonation.currency || "ETB"}`,
          donationId: updatedDonation._id,
        });
      } catch (notifErr) {
        console.error("Failed to create fulfillment notification:", notifErr);
      }
    }

    res.end(resp);
  } catch (err) {
    console.log(err)
    res.end();
  }
})
app.delete('/api/donations/:id', async (req, res)=> {
  const id = req.params.id;

  try {
    const response = await Donation.findOne({_id: id});
    // console.log(response);
    const resp = await Donor.findOne({_id: response.donorId})
    let amount = response.amount;
    amount=resp.totalDonated - (amount * 1);
    let donationCount = resp.donationCount - 1;
    // console.log("IMPORTANT",typeof(amount))
    // console.log("donation to be removed", response)
    // console.log("donation in donor to be removed", resp)
    // console.log("donations to be tested: ",resp.donations,"donation to be removed", response.donorId)

    const toBeRemoved = resp.donations.filter(donation=>(donation?.id?.toString() || donation?._id?.toString()) !== response._id.toString());

    const upRes = await Donor.findByIdAndUpdate({_id: response.donorId}, {donations: toBeRemoved, totalDonated: amount, donationCount: donationCount})
    // console.log("This is going to be kept alive", toBeRemoved)
    await Donation.deleteOne({_id: id})
    res.end();
  } catch (err) {
    console.log(err)
    res.end();
  }
})

//DASHBOARD WOOOOOOOOOOOOOOOOOOOOOOOOO --  approach no model 
//calling from existing models
app.get('/api/dashboard/overview', async (req, res)=>{
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  try {
    const [
      familyStats,
      donorCountResult,
      donationStats,
      eventStats,
      monthlyResult,
    ] = await Promise.all([

      Family.aggregate([
        { $group: {
            _id: null,
            total: { $sum: 1 },
            verified: { $sum: { $cond: [{ $eq: ["$registrationStatus", "verified"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$registrationStatus", "pending"] }, 1, 0] } },
            incomplete: { $sum: { $cond: [{ $eq: ["$registrationStatus", "incomplete"] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$registrationStatus", "rejected"] }, 1, 0] } },
            urgent: { $sum: { $cond: [{ $or: [{ $eq: ["$urgencyLevel", "high"] }, { $eq: ["$urgencyLevel", "critical"] }] }, 1, 0] } },
            orphan: { $sum: { $cond: [{ $in: ["orphan", { $cond: [{ $isArray: "$familyClassification" }, "$familyClassification", []] }] }, 1, 0] } },
            disabled_disease: { $sum: { $cond: [{ $in: ["disabled_disease", { $cond: [{ $isArray: "$familyClassification" }, "$familyClassification", []] }] }, 1, 0] } },
            old_age: { $sum: { $cond: [{ $in: ["old_age", { $cond: [{ $isArray: "$familyClassification" }, "$familyClassification", []] }] }, 1, 0] } },
            single_mother: { $sum: { $cond: [{ $in: ["single_mother", { $cond: [{ $isArray: "$familyClassification" }, "$familyClassification", []] }] }, 1, 0] } },
          }
        }
      ]),

      Donor.aggregate([
        { $group: { _id: null, total: { $sum: 1 } } }
      ]),

      Donation.aggregate([
        { $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
        }}
      ]),

      Event.aggregate([
        { $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
        }}
      ]),

      Donation.aggregate([
        { $match: { receivedAt: { $gte: monthStart, $lt: monthEnd } } },
        { $group: {
            _id: null,
            monthlyAmount: { $sum: "$amount" },
            activeDonorIds: { $addToSet: "$donorId" },
        }}
      ]),
    ]);

    const f = familyStats[0] || {};
    const d = donorCountResult[0] || {};
    const dn = donationStats[0] || {};
    const e = eventStats[0] || {};
    const m = monthlyResult[0] || { monthlyAmount: 0, activeDonorIds: [] };

    res.send({
      families: {
        total: f.total || 0,
        verified: f.verified || 0,
        pending: f.pending || 0,
        incomplete: f.incomplete || 0,
        rejected: f.rejected || 0,
        urgent: f.urgent || 0,
        classifications: {
          orphan: f.orphan || 0,
          disabled_disease: f.disabled_disease || 0,
          old_age: f.old_age || 0,
          single_mother: f.single_mother || 0,
        },
      },
      donors: {
        total: d.total || 0,
        active: (m.activeDonorIds || []).length,
      },
      donations: {
        totalCount: dn.totalCount || 0,
        recurringCount: 0,
        totalAmount: dn.totalAmount || 0,
        monthlyAmount: m.monthlyAmount || 0,
      },
      events: {
        total: e.total || 0,
        active: e.active || 0,
      },
    });
  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
})

app.get('/api/dashboard/top-donors', async (req, res)=>{
  const limit = parseInt(req.query.limit) || 5;
  try {
    const donors = await Donor.aggregate([
      { $sort: { totalDonated: -1 } },
      { $limit: limit },
      { $project: { _id: 1, name: 1, totalDonated: 1, donationCount: 1 } },
    ]);

    const topDonors = donors.map(donor => ({
      id: donor._id,
      name: donor.name,
      totalAmount: donor.totalDonated || 0,
      donationCount: donor.donationCount || 0,
    }));

    res.send(topDonors);
  } catch (err) {
    console.error("Couldn't get top donors: ", err);
    res.status(500).json({ error: "Failed to fetch top donors" });
  }
})

app.get('/api/dashboard/recent-activities', async (req, res)=> {
  const {limit} = req.query
  let recentActivities = [];
  try {
    const recentDonors = await Donor.find({}).sort({createdAt: -1}).limit(limit/3);
    const recentDonations = await Donation.find({}).sort({createdAt: -1}).limit(limit/3);
    const recentFamilies = await Family.find({}).sort({createdAt: -1}).limit(limit/3);
    // console.log("Top 3 Donors", recentDonors);
    // console.log("Top 3 Donations", recentDonations);
    // console.log("Top 3 Families", recentFamilies);

    recentDonors.forEach(donor=>{
      let payload = {
        id: "",
        type: "",
        description: "",
        timestamp: "",
        metadata: {}
      };
      payload.id = donor._id;
      payload.type = "Donor Registered";
      payload.description = `New Donor registered: ${donor.name} (${donor.donorCode})`;
      payload.timestamp = donor.createdAt;
      payload.metadata = {
        donorId: donor._id,
        donorCode: donor.donorCode,
        name: donor.name,
        donorType: "Individual",
      }
      recentActivities.push(payload)
    })
    console.log("activities with donors", recentActivities)
    
    
    recentDonations.forEach(donation=>{
      let payload = {
        id: "",
        type: "",
        description: "",
        timestamp: "",
        metadata: {}
      };
      payload.id = donation?._id || donation?.id;
      payload.type = "Donation Received";
      payload.description = `Donation ${donation.currency} ${donation.amount} received from ${donation.donorName}`;
      payload.timestamp = donation.createdAt;
      payload.metadata = {
        donationId: donation._id,
        donationCode: donation.donationCode,
        amount: donation.amount,
        currency: donation.currency,
      }
      recentActivities.push(payload)
    })
    console.log("activities with donations", recentActivities)

    recentFamilies.forEach(family=>{
      let payload = {
        id: "",
        type: "",
        description: "",
        timestamp: "",
        metadata: {}
      };
      console.log("family individual: ", family)
      payload.id = family._id;
      payload.type = "family Registered";
      payload.description = `Family ${family.familyCode} registered ( ${family?.members?.length} members)`;
      payload.timestamp = family.createdAt;
      payload.metadata = {
        familyId: family._id,
        familyCode: family.familyCode,
      }
      recentActivities.push(payload)
    })
    console.log("activities with families", recentActivities)
    res.send(recentActivities);
  } catch (err) {
    console.log("Couldn't get the recent activities: ", err)
    res.end();
  }
})

//events apis
app.post('/api/events', async (req, res)=> {
  
  try {
    const response = await Event.create(req.body);
    let campaignCode = `EVT-${response._id.toString().slice(0,8)}`;
    const updatedResponse = await Event.findByIdAndUpdate({_id: response._id}, {campaignCode: campaignCode}, {new: true});  
    console.log(updatedResponse)
    res.end()
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.get('/api/events', async (req, res)=> {
  // console.log(req.query)
  let {page = 1, limit = 10, search = '', status, eventType} = req.query;
  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit;

  let searchQuery = {};
  if(search){
    searchQuery.$or= [
      {title: {$regex: search, $options: 'i'}},
      {campaignCode: {$regex: search, $options: 'i'}}
      ]
    }

  if(status){
    if(status === "Active"){
    searchQuery.isActive = true;
    }
    else 
    searchQuery.status = status
  }

  if(eventType){
    searchQuery.eventType = eventType
  }
  

  try {
    // const response = await Event.find(searchQuery).limit(limit).skip((page - 1) * limit);

    const result = await Event.aggregate([
      //stage 1: matching
      {$match: searchQuery},
      {
        $facet: {
          metadata: [{$count: "totalRecords"}],
          data: [
            {$sort: {eventDate: -1}},
            {$skip: skip},
            {$limit: limit}
          ]
        }
      },
      //stage 3: reshape output 
      {
        $project: {
          data: 1,
          //extract total records from metadata array and compute pages
          pagination: {
            page: {$literal: page},
            limit: {$literal: limit},
            total: {$arrayElemAt: ["$metadata.totalRecords", 0]},
            totalPages: {
              $ceil: {
                $divide: [
                  {$ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0]}, 0]},
                  limit
                ]
              }
            }
          }
        }
      }
    ])

    res.send(result)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

//event stats
app.get('/api/events/:id/stats', async (req,res)=>{
  const {id} = req.params;
  let payload = {
    familiesSupported: 0,
    uniqueDonors: 0,
    totalDonations: 0,
  };
  try {
    const event = await Event.findOne({_id: id}).populate([{
      path: "supportHistory", populate: [
        {path: "familyId"}, {path: "donorId"}
      ]
    },
    {
      path: "donations"
    }
  ]);
  // console.log(event);

    //getting unique families supported
    let supportedFamilies = new Set()
    event.supportHistory.forEach((support) => {
      // console.log(support)
      supportedFamilies.add(support?.familyId?._id?.toString());
    })
    payload.familiesSupported = supportedFamilies.size;


    //getting unique donors
    let uniqueDonors = new Set();
    let totalAmount = 0;
    // console.log(event.donations)
    event.donations.forEach(dono => {
      uniqueDonors.add(dono.donorId.toString())
      totalAmount+=dono.amount;
    })
    payload.uniqueDonors = uniqueDonors.size;

    payload.totalDonations = event.donations.length;

    //calculating total amount
    payload.totalAmount = totalAmount
    await Event.findOneAndUpdate({_id: id}, {collectedAmount: totalAmount})

    payload.averageDonation = (totalAmount/payload.totalDonations).toFixed(2) * 1

    payload.completionPercentage = (totalAmount/event.targetAmount).toFixed(2) * 100

    console.log(payload);
    res.send(payload)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.get('/api/events/:id', async (req, res)=>{
  const {id} = req.params;
  try {
    const response = await Event.findOne({_id: id}).populate([{path: "supportHistory", populate: [{path: "familyId"},{path: "donorId"}]}, {path: "donations"}]);
    console.log(response)
    res.send(response)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.put('/api/events/:id', async (req, res)=> {
  const {id} = req.params;
  if(req.body.status){
    req.body.isActive = req.body.status === "ongoing";
  }
  try {
    const response = await Event.findByIdAndUpdate({_id: id}, req.body, {new: true});
    res.end()
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.delete('/api/events/:id', async (req, res)=> {
  const {id} = req.params;
  try {
    await Event.deleteOne({_id: id})
    res.end()
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.post('/api/support-history/bulk', async (req,res)=> {
  console.log("BODY:", req.body);
// console.log("BODY.supportData:", req.body.supportData);
// console.log("BODY.data:", req.body.data);
  let {familyIds} = req.body;
  req.body.familyIds = undefined;
  if(req.body.totalAmount){

    let amount = req.body.distributeEqually? (req.body.totalAmount * 1) /(familyIds.length * 1) : (req.body.amount * 1);
    req.body.totalAmount = undefined;
    req.body.amountValue = amount;
  }
  if(req.body.eventId){
    req.body.targetType = "event";
  }
  //updating support history count
  
  try {
      //fetch event
      let event = await Event.findOne({_id: req.body.eventId});
      let supportHistoryCount = event._count.supportHistory; 
      console.log("COOOOOOOOUNT", supportHistoryCount);
      let supports = event.supportHistory;

     for(const id of familyIds){
      req.body.familyId = id;
      const response = await Support.create(req.body)
      console.log(`Family`, response)
      supports.push(response);
    }
    console.log(supports)
    event = await Event.findOneAndUpdate({_id: req.body.eventId}, {supportHistory: supports, _count: {supportHistory: ++supportHistoryCount}})
    console.log(event);
    
    res.end()
  } catch (err) {
    res.end()
  }
})

// app.get('/api/dashboard/analytics', async (req, res)=>{
//   let {range} = req.query;

//   const fetchTrendData = async (n) => {
//     // const n = range === "3m" ? 3 : range === "6m" ? 6 : 12;
  
//     const months = [];
//     const now = new Date();
  
//     for (let i = n - 1; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       months.push(date.toLocaleString("en-US", { month: "short" }));
//     }
  
//     // const monthResponse = await donationApi.getMonth(months);
  
//     // return { months, values: monthResponse?.data || [] };
//     return {months};
//   };



//   let payload = {
//     stats: {
//       families: {
//         total: 0,
//         change: 0,
//       },
//       donations: {
//         total: 0,
//         change: 0,
//       },
//       events: {
//         total: 0,
//         change: 0,
//       }
//     },
//     monthlyTrends: {
//       labels: [],
//       values: [],
//     },
//     urgencyLevels: [
//       {
//         label: "Critical",
//         value: 0,
//         color: "#EF4444"
//       },
//       {
//         label: "High",
//         value: 0,
//         color: "#F97316"
//       },
//       {
//         label: "Medium",
//         value: 0,
//         color: "#EAB308"
//       },
//       {
//         label: "Low",
//         value: 0,
//         color: "#22C55E"
//       },
//     ],
//     donationSources: [
//       {
//         label: "Individual",
//         value: 0,
//         color: "#3B82F6"
//       },
//       {
//         label: "Corporate",
//         value: 0,
//         color: "#8B5CF6"
//       },
//       {
//         label: "Foundation",
//         value: 0,
//         color: "#EC4899"
//       },
//       {
//         label: "Organization",
//         value: 0,
//         color: "#64748B"
//       },
//     ],
//     eventTypes: [
//       {
//         label: "Distribution",
//         value: 0,
//         color: "#F59E0B"
//       },
//       {
//         label: "Fundraising",
//         value: 0,
//         color: "#8B5CF6"
//       },
//       {
//         label: "Awareness",
//         value: 0,
//         color: "#EC4899"
//       },
//       {
//         label: "Food Package",
//         value: 0,
//         color: "#22C55E"
//       },
//       {
//         label: "Medical Aid",
//         value: 0,
//         color: "#3B82F6"
//       },
//       {
//         label: "Job Opportunity",
//         value: 0,
//         color: "#1b5e4a"
//       },
//       {
//         label: "Other",
//         value: 0,
//         color: "#64748B"
//       },
//     ]
//   }
//   //lets get the easy ones out of the way
//   const allFamilies = await Family.find({});
//   const allDonors = await Donor.find({});
//   const allEvents = await Event.find({});

  
//   allFamilies.forEach(fam=>{
//     fam.urgencyLevel === "low"? payload.urgencyLevels[3].value++
//     : fam.urgencyLevel === "medium"? payload.urgencyLevels[2].value++
//     : fam.urgencyLevel === "high"? payload.urgencyLevels[1].value++
//     : payload.urgencyLevels[0].value++
//   })

//   allDonors.forEach(donor=>{
//     donor.donorType === "Organization"? payload.donationSources[3].value++
//     : donor.donorType === "Foundation"? payload.donationSources[2].value++
//     : donor.donorType === "Corporate"? payload.donationSources[1].value++
//     : payload.donationSources[0].value++
//   })

//   allEvents.forEach(event=>{
//     event.eventType === "other"? payload.eventTypes[6].value++
//     : event.eventType === "job_opportunity"? payload.eventTypes[5].value++
//     : event.eventType === "medical_aid"? payload.eventTypes[4].value++ 
//     : event.eventType === "food_package"? payload.eventTypes[3].value++
//     : event.eventType === "awareness"? payload.eventTypes[2].value++
//     : event.eventType === "fundraising"? payload.eventTypes[1].value++
//     : payload.eventTypes[0].value++
//   })

//   // console.log("EZ payload insertions: ", payload)


//   let month = range === "month"? 1 : range === "3m"? 3: range === "6m"? 6 : 12;

//   let monthlyFamRegisterations = [];
//   // console.log(months)
//   const now = new Date();
//   try {
//     for(let i = month - 1; i >=0; i--){
//       const monthStart = new Date(now.getFullYear(), now.getMonth()-i, 1);
//       const monthEnd = new Date(now.getFullYear(), now.getMonth()-i + 1, 1);
//       const monthFam = await Family.find({createdAt: {
//         $gte: monthStart,
//         $lt: monthEnd,
//       }})
//       const monthDono = await Donation.find({receivedAt: {
//         $gte: monthStart,
//         $lt: monthEnd,
//       }})
//       const monthEvent = await Event.find({eventDate: {
//         $gte: monthStart,
//         $lt: monthEnd,
//       }})
//       // console.log(monthDono,monthFam,monthEvent)
//       payload.stats.donations.total+=monthDono.reduce((total, dono)=>total+=dono.amount,0)
//       payload.stats.families.total+=monthFam.length
//       payload.stats.events.total+=monthEvent.length

//       //for bar chart for families
//       // payload.monthlyTrends.values.push(monthFam.length)
//       //for bar chart for donations
//       payload.monthlyTrends.values.push(monthDono.reduce((total, dono)=>total+=dono.amount, 0))
//     }
//     //set the months for the monthlyTrends
//     let {months} = await fetchTrendData(month)
//     // console.log(months)
//     months.forEach(month=> payload.monthlyTrends.labels.push(month))
//     // console.log("Finaly payload...kinda", payload)
//     res.send(payload)
//   } catch (err) {
//     console.log(err)
//     res.end()
//   }
// })

app.get('/api/dashboard/analytics', async (req, res) => {
  const { range } = req.query;
  const monthCount = range === "month" ? 1 : range === "3m" ? 3 : range === "6m" ? 6 : 12;

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

  const prevRangeEnd = new Date(rangeStart); // exclusive: start of current range
  const prevRangeStart = new Date(now.getFullYear(), now.getMonth() - (monthCount * 2 - 1), 1);

  try {
    const [
      prevFamiliesData, 
      prevDonationsData,
      prevEventsData,
      urgencyData,
      donorTypeData,
      eventTypeData,
      monthlyFamilies,
      monthlyDonations,
      monthlyEvents,
    ] = await Promise.all([

      // Previous range: families
      Family.aggregate([
        { $match: { createdAt: { $gte: prevRangeStart, $lt: prevRangeEnd } } },
        { $count: "total" }
      ]),

      // Previous range: donations
      Donation.aggregate([
        { $match: { receivedAt: { $gte: prevRangeStart, $lt: prevRangeEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      // Previous range: events
      Event.aggregate([
        { $match: { eventDate: { $gte: prevRangeStart, $lt: prevRangeEnd } } },
        { $count: "total" }
      ]),

      // Urgency breakdown
      Family.aggregate([
        { $group: { _id: "$urgencyLevel", count: { $sum: 1 } } }
      ]),

      // Donor type breakdown
      Donor.aggregate([
        { $group: { _id: "$donorType", count: { $sum: 1 } } }
      ]),

      // Event type breakdown
      Event.aggregate([
        { $group: { _id: "$eventType", count: { $sum: 1 } } }
      ]),

      // Families registered per month (within range)
      Family.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // Donations amount per month (within range)
      Donation.aggregate([
        { $match: { receivedAt: { $gte: rangeStart } } },
        { $group: {
            _id: { year: { $year: "$receivedAt" }, month: { $month: "$receivedAt" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // Events per month (within range)
      Event.aggregate([
        { $match: { eventDate: { $gte: rangeStart } } },
        { $group: {
            _id: { year: { $year: "$eventDate" }, month: { $month: "$eventDate" } },
            count: { $sum: 1 }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
    ]);

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // --- Build month labels + lookup maps ---
    const monthLabels = [];
    const famByMonth = {};
    const donoByMonth = {};
    const eventByMonth = {};

    const prevFamilies  = prevFamiliesData[0]?.total ?? 0;
    const prevDonations = prevDonationsData[0]?.total ?? 0;
    const prevEvents    = prevEventsData[0]?.total ?? 0;

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthLabels.push(d.toLocaleString("en-US", { month: "short" }));
      famByMonth[key] = 0;
      donoByMonth[key] = 0;
      eventByMonth[key] = 0;
    }

    monthlyFamilies.forEach(({ _id, count }) => {
      const key = `${_id.year}-${_id.month}`;
      if (famByMonth[key] !== undefined) famByMonth[key] = count;
    });

    monthlyDonations.forEach(({ _id, total, count }) => {
      const key = `${_id.year}-${_id.month}`;
      if (donoByMonth[key] !== undefined) donoByMonth[key] = total;
    });

    monthlyEvents.forEach(({ _id, count }) => {
      const key = `${_id.year}-${_id.month}`;
      if (eventByMonth[key] !== undefined) eventByMonth[key] = count;
    });

    const donoValues = Object.values(donoByMonth);

    // --- Totals ---
    const totalFamilies = Object.values(famByMonth).reduce((a, b) => a + b, 0);
    const totalDonations = donoValues.reduce((a, b) => a + b, 0);
    const totalEvents = Object.values(eventByMonth).reduce((a, b) => a + b, 0);

    // --- Helper to find count from aggregation result ---
    const findCount = (arr, id) => arr.find(x => x._id === id)?.count || 0;

    // Weekly breakdown for month range — replaces monthlyTrends with 4-5 weekly bars
    let trendsLabels = monthLabels;
    let trendsValues = donoValues;

    if (range === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const weeklyDonations = await Donation.aggregate([
        { $match: { receivedAt: { $gte: monthStart, $lt: monthEnd } } },
        { $group: {
            _id: { $ceil: { $divide: [{ $dayOfMonth: "$receivedAt" }, 7] } },
            total: { $sum: "$amount" },
        }},
        { $sort: { "_id": 1 } }
      ]);

      const numDays   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const numWeeks  = Math.ceil(numDays / 7);
      const weekLabels = [];
      const weekValues = [];

      for (let w = 1; w <= numWeeks; w++) {
        weekLabels.push(`Week ${w}`);
        const found = weeklyDonations.find(d => d._id === w);
        weekValues.push(found ? found.total : 0);
      }

      trendsLabels = weekLabels;
      trendsValues = weekValues;
    }

    const payload = {
      stats: {
        families:  { total: totalFamilies,  change: calcChange(totalFamilies,  prevFamilies) },
        donations: { total: totalDonations, change: calcChange(totalDonations, prevDonations) },
        events:    { total: totalEvents,    change: calcChange(totalEvents, prevEvents) },
      },
      monthlyTrends: {
        labels: trendsLabels,
        values: trendsValues,
      },
      urgencyLevels: [
        { label: "Critical", value: findCount(urgencyData, "critical"), color: "#EF4444" },
        { label: "High",     value: findCount(urgencyData, "high"),     color: "#F97316" },
        { label: "Medium",   value: findCount(urgencyData, "medium"),   color: "#EAB308" },
        { label: "Low",      value: findCount(urgencyData, "low"),      color: "#22C55E" },
      ],
      donationSources: [
        { label: "Individual",   value: findCount(donorTypeData, "Individual"),   color: "#3B82F6" },
        { label: "Corporate",    value: findCount(donorTypeData, "Corporate"),    color: "#8B5CF6" },
        { label: "Foundation",   value: findCount(donorTypeData, "Foundation"),   color: "#EC4899" },
        { label: "Organization", value: findCount(donorTypeData, "Organization"), color: "#64748B" },
        { label: "Embassy",      value: findCount(donorTypeData, "Embassy"),      color: "#0EA5E9" },
      ],
      eventTypes: [
        { label: "Distribution",  value: findCount(eventTypeData, "distribution"),  color: "#F59E0B" },
        { label: "Fundraising",   value: findCount(eventTypeData, "fundraising"),   color: "#8B5CF6" },
        { label: "Awareness",     value: findCount(eventTypeData, "awareness"),     color: "#EC4899" },
        { label: "Food Package",  value: findCount(eventTypeData, "food_package"),  color: "#22C55E" },
        { label: "Medical Aid",   value: findCount(eventTypeData, "medical_aid"),   color: "#3B82F6" },
        { label: "Job Opportunity", value: findCount(eventTypeData, "job_opportunity"), color: "#1b5e4a" },
        { label: "Other",         value: findCount(eventTypeData, "other"),         color: "#64748B" },
      ],
    };
    console.log(payload)
    res.json(payload);
  } catch (err) {
    console.error("Analytics route error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ── Notification Routes ───────────────────────────────────────────── */

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.end();
  } catch (err) {
    res.status(500).end();
  }
});

app.post('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.end();
  } catch (err) {
    res.status(500).end();
  }
});

app.get('/api/notifications/due-promised', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueDonations = await Donation.find({
      status: "pledged",
      receivedAt: { $gte: today, $lt: tomorrow },
      notificationSent: { $ne: true },
    });

    const createdNotifications = [];
    for (const donation of dueDonations) {
      const notification = await Notification.create({
        type: "promised",
        title: "Promised Donation Due Today",
        body: `${donation.donorName || "A donor"} promised ${donation.amount ? donation.amount + " " + (donation.currency || "") : "a donation"}`,
        donationId: donation._id,
        metadata: { amount: donation.amount, donorName: donation.donorName },
      });
      createdNotifications.push(notification);
      await Donation.findByIdAndUpdate(donation._id, { notificationSent: true });
    }

    res.json(createdNotifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to check promised donations" });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
