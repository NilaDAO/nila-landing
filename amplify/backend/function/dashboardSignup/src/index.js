/* Amplify Params - DO NOT EDIT
	API_SIGNUP_APIID
	API_SIGNUP_APINAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: process.env.REGION });

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  const method =
    event?.requestContext?.http?.method || event?.httpMethod || "UNKNOWN";

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  let payload = {};
  try {
    payload =
      typeof event.body === "string" && event.body.length > 0
        ? JSON.parse(event.body)
        : event.body || {};
  } catch (error) {
    console.error("Failed to parse payload", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid request body" }),
    };
  }

  const email = (payload.email || "").trim();
  const organization = (payload.organization || "").trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "A valid email address is required." }),
    };
  }

  const targetEmail =
    process.env.TARGET_EMAIL || "info@blockchainforcommons.com";
  const sourceEmail = process.env.SOURCE_EMAIL || targetEmail;

  if (!targetEmail || !sourceEmail) {
    console.error("Missing email configuration", {
      TARGET_EMAIL: targetEmail,
      SOURCE_EMAIL: sourceEmail,
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Email configuration is incomplete on the server.",
      }),
    };
  }

  const submittedAt = new Date().toISOString();

  const subject = `New dashboard signup request from ${email}`;
  const bodyText = [
    "A new organisation asked for dashboard access.",
    "",
    `Email: ${email}`,
    `Organisation: ${organization || "Not provided"}`,
    `Submitted at: ${submittedAt}`,
    "",
    "Replying to this email will reach the requester directly.",
  ].join("\n");

  const command = new SendEmailCommand({
    Source: sourceEmail,
    Destination: {
      ToAddresses: [targetEmail],
    },
    ReplyToAddresses: [email],
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: bodyText,
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    await sesClient.send(command);
  } catch (error) {
    console.error("Failed to send SES email", error);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        message: "We could not notify the Nila team. Please try again later.",
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true }),
  };
};
