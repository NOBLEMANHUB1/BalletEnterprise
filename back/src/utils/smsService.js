async function sendVerificationSMS(phoneNumber, code) {
  const message = `Your Ballet Enterprise verification code is ${code}. It expires in 10 minutes.`;

  console.log("Sending SMS to:", phoneNumber);

  const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
    method: "POST",
    headers: {
      "api-key": process.env.ARKESEL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: process.env.ARKESEL_SENDER_ID,
      message,
      recipients: [phoneNumber],
    }),
  });

  const data = await res.json().catch(() => ({}));

  console.log("Status:", res.status);
  console.log("Response:", data);

  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }

  return data;
}