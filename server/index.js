const express = require('express');
const cors = require('cors');
const referralRoutes = require('./referral');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/referral', referralRoutes);

app.listen(4242, () => console.log('Server running on port 4242'));