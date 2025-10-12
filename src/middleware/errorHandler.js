export const errorHandler = (err, _req, res, _next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({
    success: false,
    msg: err.message || 'Internal Server Error',
    data: {}
  })
}
