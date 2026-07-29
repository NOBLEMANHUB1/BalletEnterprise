// Verifies a Paystack transaction server-side before an order is created.
// This is the critical security step — never trust the frontend's word that
// a payment succeeded; always confirm directly with Paystack using the
// secret key, which only ever lives on the backend.

async function verifyPayment(req, res, next) {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: 'Missing payment reference.' });
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status || data.data.status !== 'success') {
      return res.status(400).json({ verified: false, message: 'Payment could not be verified.' });
    }

    res.json({
      verified: true,
      amount: data.data.amount / 100, // Paystack returns pesewas/cents — convert back
      currency: data.data.currency,
      reference: data.data.reference
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyPayment };