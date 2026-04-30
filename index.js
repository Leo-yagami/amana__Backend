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
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g., http://localhost:8080
  credentials: true
}));

// Passport session middleware (required for OAuth flow)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
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
      "return_url": `http://localhost:3000/paymentComplete?tx_ref=${tx_ref}`,
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
            window.location.href = "http://localhost:8080";
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
    const response = await Support.find({familyId: id}).limit(limit * 1).skip((page - 1) * limit)
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
    const resp = await Donor.findOne({_id: response.donorId})
    let amount = response.amount;
    amount=resp.totalDonated - amount * 1;
    console.log("IMPORTANT",typeof(amount))
    // console.log("donation to be removed", response)
    // console.log("donation in donor to be removed", resp)
    console.log(resp.donations, response.donorId)
    const toBeRemoved = resp.donations.filter(donation=>donation._id.toString() !== response.id.toString());
    const upRes = await Donor.findByIdAndUpdate({_id: response.donorId}, {donations: toBeRemoved, totalDonated: amount})
    console.log(toBeRemoved)
    await Donation.deleteOne({_id: id})
    res.end();
  } catch (err) {
    console.log(err)
    res.end();
  }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));