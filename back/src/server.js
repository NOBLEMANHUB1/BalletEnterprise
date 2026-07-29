require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logActivity = require('./utils/logActivity');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Ballet Enterprise API running on port ${PORT}`);
    logActivity({ category: 'System', action: 'Server started', user: 'System', details: `Listening on port ${PORT}.` });
  });
});