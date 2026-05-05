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
const Transaction = require('./models/Transaction')
const Family = require('./models/Family')
const Support = require('./models/Support')
const Donor = require('./models/Donors')
const Event = require('./models/Event')

require('./config/passport'); // Initialize passport config

const authRoutes = require('./routes/auth');
const {googleAuthRoutes} = require('./routes/googleAuth');
const Donation = require('./models/Donations');

const app = express();

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS: Allow frontend to send credentials (cookies)
// app.use(cors({
//   origin: "https://amana--fullstack.vercel.app", // e.g., http://localhost:8080
//   credentials: true
// }));

app.use(cors({
  origin: "https://amana--fullstack.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes); // Mounts /api/auth/google


//Payment section
app.get('/makePayment', (req, res) => {
  res.send(`<a href="/initialize">Donate</a>`)
})

// app.post('/initialize', (req, res)=> {
//   const body = req.body;
//   console.log(body)
// })

app.post("/initialize", (req, res) => {
  const paymentInfo = {paymentMethod: req.body.paymentMethod, amount: req.body.selectedAmount || req.body.customAmount * 1, phone: req.body.telebirrPhone}
  req.session.paymentData = paymentInfo

  return res.json({ message: "received", body: req.body });
});

app.get('/initialize', async (req, res) => {
  const tx_ref = "tx-" + Date.now(); // unique reference
  const paymentData = req.session.paymentData;
  if (!paymentData) {
    return res.status(400).json({ message: "No payment data found. Submit form first." });
  }
  const token = req.cookies.token
  if(!token) return res.status(401).json({message: "not logged in"})

  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  console.log(decoded)

  //options object
  let options = {
    'method': 'POST',
    'url': 'https://api.chapa.co/v1/transaction/initialize',
    'headers': {
  'Authorization': 'Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6',
  'Content-Type': 'application/json'
    },
    body: {
      "amount": paymentData.amount,
      "currency": "ETB",
      "email": decoded.userEmail,
      "first_name": decoded.userName,
      "phone_number": paymentData.phone,
      "tx_ref": tx_ref,
      "callback_url": "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60",
      "return_url": `${process.env.BACKEND_URL}/paymentComplete?tx_ref=${tx_ref}`,
    }
};


  //initialize transaction payload and save number to update donor entity
  let transactionPayload = {
    donorId: "",
    donorName: decoded.userName,
    donationType: "monetary",
    amount: paymentData.amount,
    currency: options.body.currency,
    donationReference: "",
  }
  //clearing the session after assigning
  req.session.paymentData = null;

  try{
    //get donor info through first name and update its phone number
    const preResponse = await Donor.findOneAndUpdate({email: decoded.userEmail}, {phone: options.body.phone_number});
    if (!preResponse) {
      return res.status(404).json({ message: "Donor not found" });
    }
     
    // console.log(preResponse);

    //create a donation with the payload + preResponse information
    transactionPayload.donorId = preResponse._id;
    // transactionPayload.donationReference =`DON-${ transactionPayload.donorId.toString().slice(4,11)}`;

    const response = await Donation.create(transactionPayload);
    const {_id} = response;

    transactionPayload.donationReference = `DON-${_id.toString().slice(4,11)}`;

    const resp = await Donation.findByIdAndUpdate({_id: _id}, {donationReference: transactionPayload.donationReference});
    console.log("PAYLOAD", transactionPayload)

    const response2 = await Donor.findOneAndUpdate({_id: transactionPayload.donorId},{
      $inc: {donationCount: 1, totalDonated: transactionPayload.amount},
      $push: {donations: resp}
    }, {new: true})
    console.log(response2)
    
    await Transaction.createFromPayload(options.body);
  } catch (err) {
    console.log("Failed to make the transaction", err)
  }
  options.body = JSON.stringify(options.body)
  // console.log(options)
  
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const parsed = JSON.parse(response.body);

    if (!parsed?.data?.checkout_url) {
      console.log("CHAPA ERROR:", parsed);
      return res.status(400).json(parsed);
    }
    return res.redirect(parsed.data.checkout_url);
  });
})

app.get("/paymentComplete", (req, res) => {
  const request = require("request");

  const tx_ref = req.query.tx_ref;

  if (!tx_ref) {
    console.log("Missing tx_ref. Query:", req.query);
    return res.send("Missing tx_ref");
  }


  const options = {
    method: "GET",
    url: `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
    headers: {
      Authorization: "Bearer CHASECK_TEST-gubJD4pSW7a1AXSMeWRJWm08aU2nGju6",
    },
  };

  request(options, async function (error, response) {
    if (error) return res.send("Verification failed");

    const data = JSON.parse(response.body);

    console.log("VERIFY RESPONSE:", data);

    const receiptReference = data.data.reference;

      //update transfer reference value
    try{
        await Transaction.updateAfterVerification(tx_ref, data.data);
    } catch (err) {
      console.log("Failed to make the transaction", err)
    }

    // receipt url depends on chapa response
    // const receiptUrl = data?.data?.receipt_url || "";
    // console.log(receiptUrl)
    res.send(`
      <html>
        <head>
          <title>Payment Complete</title>
        </head>
        <body>
          <h2>Payment Successful. Redirecting...</h2>

          <script>
            ${receiptReference ? `window.open("https://chapa.link/payment-receipt/${receiptReference}", "_blank");` : ""}
            window.location.href = "${process.env.CLIENT_URL}";
          </script>
        </body>
      </html>
    `);
  });
});

//family routes
app.post('/api/families', async (req, res) => {
  console.log(req.body);
  try{
    const response = await Family.create(req.body)
    res.status(201).json(response)
    console.log(response)
  }catch(err){
    console.log("Failed to register family", err)
    res.status(400).json({message: err.message})
  }
})
app.get('/api/families', async (req, res) => {
  try{
    // console.log(req.query)
    const {page = 1, limit = 10, search= '', registrationStatus, urgencyLevel, registrationCompleted} = req.query;
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

    const response = await Family.find(searchQuery).limit(limit * 1).skip((page - 1) * limit);
    // console.log("response", response)
    res.send(response)
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

app.put('/api/families/:id', async (req, res) => {
  const id = req.params.id;
  const resp = await Family.findOne({_id: id});
  if(req.body.isVerified && resp.familyHead){
    req.body.registrationStatus = "verified"
  }
  else if(req.body.familyHead || (req.body.isVerified === false && resp.familyHead)){
    req.body.registrationStatus = "pending"
  }
  else{
    req.body.registrationStatus = "incomplete"
  }

  try{
    const response = await Family.findByIdAndUpdate({_id: id}, req.body)
    res.status(201).json(response);
  }catch(err){
    res.status(400).json({message: "failed to update family"})
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
  const {donorType, page = 1, limit = 12, search = ''} = req.query;
  let searchQuery = {}
  if(search){
    searchQuery = {name: {$regex: search, $options: 'i'}}
  }
  if(donorType){
    searchQuery.donorType = donorType
  }
  try {
    const response = await Donor.find(searchQuery).limit(limit * 1).skip((page - 1) * limit)
    // console.log(response);
    res.json(response)
  } catch (err) {
    console.error(err)
    res.end()
  }
})

app.post('/api/donors', async (req, res)=>{
  console.log(req.body)
  try {
    const response = await Donor.create(req.body)
    // console.log(response)
    res.end();
  } catch (err) {
    console.log(err)
    res.end();
  }
})

app.get('/api/donors/:id', async (req, res)=>{
  const id = req.params.id;
  try {
    const response = await Donor.findById({_id: id})
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
    if(preResponse.name !== req.body.name){
      (preResponse.donations).map(donation=> donation.donorName = req.body.name);
      req.body.donations = preResponse.donations;
    }

    const response = await Donor.findByIdAndUpdate({_id: id}, req.body)
    const response2 = await Donation.updateMany({donorId: id}, {donorName: req.body.name})

    console.log(response2)
    res.end()
  } catch (err) {
    console.error(err)
    res.end()
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
app.post('/api/donations/', async (req, res)=>{
  // console.log(req.body)
  // req.body.donationReference = `DON-${(req.body.id).slice(1,8)}`;
  console.log("donation coming from donations page",req.body)
  try {
    // const preResponse = await Donor.findOne({_id: req.body.donorId})
    const response = await Donation.create(req.body);
    const {_id} = response;
    console.log(response)
    await Donation.findByIdAndUpdate({_id: _id}, {donationReference: `DON-${(_id.toString()).slice(4,11)}`})

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
    console.log("response for donors update", response2)
    res.end()
  } catch (err) {
    console.error(err)
    res.end()
  }
})

app.get('/api/donations', async (req, res)=> {
  // console.log(req.query);
  const {search = '', page=1, limit=50, status, donationType} = req.query;
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
    const response = await Donation.find(searchQuery).limit(limit).skip((page - 1) * limit)
    // console.log(response)
    res.send(response)
    // res.end()
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.get('/api/donations/months', async (req, res)=>{
  // console.log(req.body);
  const now = new Date();
  let monthlyAmounts = [];
  const {months} = req.query;
  try {
    for(let i = months.length - 1; i >= 0; i--){
      const monthStart = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() -i+1, 1)
      const monthDono = await Donation.find({receivedAt: {
        $gte: monthStart,
        $lt: monthEnd,
      }})
      // console.log(monthDono)
      monthlyAmounts.push(monthDono.reduce((total, dono)=>total+=dono.amount, 0))
    }
    // console.log(monthlyAmounts);
    res.send(monthlyAmounts)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.get('/api/donations/:id', async (req, res)=>{
  const id = req.params.id;
  try {
    const response = await Donation.findById({_id: id})
    // console.log("RESPOOOOOOOOOOOOOOOOONSE", response)
    res.send(response)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

app.put('/api/donations/:id', async (req, res)=> {
  const id = req.params.id;
  try {
    const updatedDonation = await Donation.findByIdAndUpdate({_id: id}, req.body, {new: true})
    const donorId = updatedDonation.donorId;
    // console.log(updatedDonation)
    const donorInfo = await Donor.findOne({_id: donorId});
    console.log(donorInfo)
    const index = donorInfo.donations.findIndex(i => (i.id || i._id).toString() === id);
    if(index !== -1){
      donorInfo.donations[index] = updatedDonation;
      console.log("INDEX",index)
    }
    // donorInfo.donations.map(donation=>{
    //   if(donation.id === id) return donation = updatedDonation
    //   else return donation
    // })
    const newTotal = donorInfo.donations.reduce((total,donation)=>{
      return total+=(donation.amount * 1);
    }, 0)
    console.log(newTotal)
    donorInfo.totalDonated = newTotal;
    const finalDonor = await Donor.findByIdAndUpdate({_id: donorId}, donorInfo, {new: true})
    console.log(finalDonor);
    res.end();
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
  const payload = {families: {}, donors: {}, donations: {}, events: {},};
  try {
    const AllFamilies = await Family.find({});
    const AllDonors = await Donor.find({});
    const AllDonations = await Donation.find({});
    const AllEvents = await Event.find({})
    // console.log("families", AllFamilies)
    // console.log("donors", AllDonors)
    // console.log("donations", AllDonations)
    //calculating what needs to be calculated
      //this month donations
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const thisMonthDono = await Donation.find({receivedAt: {
        $gte: monthStart,
        $lt: monthEnd,
      }});
      // console.log(monthStart, monthEnd)
      const totalAmount = AllDonations.reduce((total, dono)=>total+=dono.amount,0);
      // console.log("This month's donations", thisMonthDono)
      // console.log("total donations all time", totalAmount);
      const monthDonoTotal = thisMonthDono.reduce((total, dono)=> total+=dono.amount, 0);
      // console.log("This month's total",monthDonoTotal)
      const monthlyDonorIds = new Set (
        thisMonthDono.filter(dono=>dono.donorId)
        .map(dono=>dono.donorId = dono.donorId.toString())
      )
      // console.log("ACTIIIIIIIIIVE IDS",monthlyDonorIds)
      const activeDonors = AllDonors
      .filter(donor=> monthlyDonorIds.has(donor._id.toString()))
      // console.log("ACTIIIIIIVE",activeDonors)


      const verifiedFam = AllFamilies.reduce((famCount, fam)=>famCount+= fam.registrationStatus === "verified"? 1: 0,0)
      // console.log("Verified Fam", verifiedFam);

      const urgentFam = AllFamilies.reduce((famCount, fam)=> famCount+= fam.urgencyLevel === "high" || fam.urgencyLevel === "critical"? 1: 0, 0)
      // console.log("Urgent Family", urgentFam);
      const activeEvents = AllEvents.filter(event=> event.isActive)


    payload.families.total = AllFamilies.length;
    payload.families.verified = verifiedFam;
    payload.families.urgent = urgentFam;

    payload.donors.total = AllDonors.length;
    payload.donors.active = activeDonors.length;

    payload.donations.totalCount = AllDonations.length;
    payload.donations.recurringCount = 0
    payload.donations.totalAmount = totalAmount;
    payload.donations.monthlyAmount = monthDonoTotal;

    payload.events.total = AllEvents.length;
    payload.events.active = activeEvents.length;
    // console.log(payload);

    res.send(payload)
  } catch (err) {
    console.log(err)
  }
})

app.get('/api/dashboard/top-donors', async (req, res)=>{
  let topDonors = []
  try {
    let donors = await Donor.find({}, {_id: 1, name: 1, totalDonated: 1, donationCount: 1});
    donors = donors.sort((donorA,donorB)=> donorA.amount-donorB.amount);
    donors.forEach(donor=> {
      let payload = {};
      payload.id = donor._id;
      payload.name = donor.name;
      payload.totalAmount = donor.totalDonated;
      payload.donationCount = donor.donationCount
      topDonors.push(payload);
    })
    // console.log("TOP DONORS: ", topDonors);
    res.send(topDonors.slice(0, req.query.limit));

  } catch (err) {
    console.log("Couldn't get top donors: ", err)
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
  console.log(req.query)
  const {page = 1, limit = 10, search = '', status, eventType} = req.query;

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
    const response = await Event.find(searchQuery).limit(limit).skip((page - 1) * limit);
    res.send(response)
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

app.get('/api/dashboard/analytics', async (req, res)=>{
  let {range} = req.query;

  const fetchTrendData = async (n) => {
    // const n = range === "3m" ? 3 : range === "6m" ? 6 : 12;
  
    const months = [];
    const now = new Date();
  
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString("en-US", { month: "short" }));
    }
  
    // const monthResponse = await donationApi.getMonth(months);
  
    // return { months, values: monthResponse?.data || [] };
    return {months};
  };



  let payload = {
    stats: {
      families: {
        total: 0,
        change: 0,
      },
      donations: {
        total: 0,
        change: 0,
      },
      events: {
        total: 0,
        change: 0,
      }
    },
    monthlyTrends: {
      labels: [],
      values: [],
    },
    urgencyLevels: [
      {
        label: "Critical",
        value: 0,
        color: "#EF4444"
      },
      {
        label: "High",
        value: 0,
        color: "#F97316"
      },
      {
        label: "Medium",
        value: 0,
        color: "#EAB308"
      },
      {
        label: "Low",
        value: 0,
        color: "#22C55E"
      },
    ],
    donationSources: [
      {
        label: "Individual",
        value: 0,
        color: "#3B82F6"
      },
      {
        label: "Corporate",
        value: 0,
        color: "#8B5CF6"
      },
      {
        label: "Foundation",
        value: 0,
        color: "#EC4899"
      },
      {
        label: "Organization",
        value: 0,
        color: "#64748B"
      },
    ],
    eventTypes: [
      {
        label: "Distribution",
        value: 0,
        color: "#F59E0B"
      },
      {
        label: "Fundraising",
        value: 0,
        color: "#8B5CF6"
      },
      {
        label: "Awareness",
        value: 0,
        color: "#EC4899"
      },
      {
        label: "Food Package",
        value: 0,
        color: "#22C55E"
      },
      {
        label: "Medical Aid",
        value: 0,
        color: "#3B82F6"
      },
      {
        label: "Job Opportunity",
        value: 0,
        color: "#1b5e4a"
      },
      {
        label: "Other",
        value: 0,
        color: "#64748B"
      },
    ]
  }
  //lets get the easy ones out of the way
  const allFamilies = await Family.find({});
  const allDonors = await Donor.find({});
  const allEvents = await Event.find({});

  
  allFamilies.forEach(fam=>{
    fam.urgencyLevel === "low"? payload.urgencyLevels[3].value++
    : fam.urgencyLevel === "medium"? payload.urgencyLevels[2].value++
    : fam.urgencyLevel === "high"? payload.urgencyLevels[1].value++
    : payload.urgencyLevels[0].value++
  })

  allDonors.forEach(donor=>{
    donor.donorType === "Organization"? payload.donationSources[3].value++
    : donor.donorType === "Foundation"? payload.donationSources[2].value++
    : donor.donorType === "Corporate"? payload.donationSources[1].value++
    : payload.donationSources[0].value++
  })

  allEvents.forEach(event=>{
    event.eventType === "other"? payload.eventTypes[6].value++
    : event.eventType === "job_opportunity"? payload.eventTypes[5].value++
    : event.eventType === "medical_aid"? payload.eventTypes[4].value++ 
    : event.eventType === "food_package"? payload.eventTypes[3].value++
    : event.eventType === "awareness"? payload.eventTypes[2].value++
    : event.eventType === "fundraising"? payload.eventTypes[1].value++
    : payload.eventTypes[0].value++
  })

  // console.log("EZ payload insertions: ", payload)


  let month = range === "month"? 1 : range === "3m"? 3: range === "6m"? 6 : 12;

  let monthlyFamRegisterations = [];
  // console.log(months)
  const now = new Date();
  try {
    for(let i = month - 1; i >=0; i--){
      const monthStart = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth()-i + 1, 1);
      const monthFam = await Family.find({createdAt: {
        $gte: monthStart,
        $lt: monthEnd,
      }})
      const monthDono = await Donation.find({receivedAt: {
        $gte: monthStart,
        $lt: monthEnd,
      }})
      const monthEvent = await Event.find({eventDate: {
        $gte: monthStart,
        $lt: monthEnd,
      }})
      // console.log(monthDono,monthFam,monthEvent)
      payload.stats.donations.total+=monthDono.reduce((total, dono)=>total+=dono.amount,0)
      payload.stats.families.total+=monthFam.length
      payload.stats.events.total+=monthEvent.length

      //for bar chart for families
      // payload.monthlyTrends.values.push(monthFam.length)
      //for bar chart for donations
      payload.monthlyTrends.values.push(monthDono.reduce((total, dono)=>total+=dono.amount, 0))
    }
    //set the months for the monthlyTrends
    let {months} = await fetchTrendData(month)
    // console.log(months)
    months.forEach(month=> payload.monthlyTrends.labels.push(month))
    // console.log("Finaly payload...kinda", payload)
    res.send(payload)
  } catch (err) {
    console.log(err)
    res.end()
  }
})

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
