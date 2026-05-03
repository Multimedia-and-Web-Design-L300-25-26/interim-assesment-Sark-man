// ─── @desc    Get logged-in user's profile
// ─── @route   GET /api/users/profile
// ─── @access  Private (JWT required)
const getProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch profile.' });
  }
};

module.exports = { getProfile };
