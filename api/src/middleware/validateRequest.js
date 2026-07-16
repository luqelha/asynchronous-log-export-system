module.exports = (req, res, next) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate & endDate must be filled',
    });
  }

  next();
};
