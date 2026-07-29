require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  try {
    const res = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "user",
          content: "Say hello.",
        },
      ],
    });

    console.log(res.choices[0].message.content);
  } catch (err) {
    console.log("Status:", err.status);
    console.log("Message:", err.message);
    console.log("Body:", err.error);
    console.log(err);
  }
}

test();