// Catches 404s for unmatched routes
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Centralized error handler — keeps error responses consistent across all routes
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server.',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

module.exports = { notFound, errorHandler };