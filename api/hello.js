// The simplest possible serverless function
module.exports = (req, res) => {
  res.status(200).json({
    message: "Hello from serverless function!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    isVercel: process.env.VERCEL === '1',
    method: req.method
  });
};