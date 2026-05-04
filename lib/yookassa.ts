import { randomUUID } from "crypto";

const YOOKASSA_API_URL = "https://api.yookassa.ru/v3";

function getAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error("YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is missing");
  }

  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
}

export async function createYooKassaPayment(params: {
  value: string;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      "Idempotence-Key": randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: params.value,
        currency: "RUB",
      },
      capture: true,
      payment_method_data: {
        type: "sbp",
      },
      confirmation: {
        type: "redirect",
        return_url: params.returnUrl,
      },
      description: params.description,
      metadata: params.metadata,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("YooKassa create payment error:", JSON.stringify(data));
    throw new Error(`Failed to create YooKassa payment: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function getYooKassaPayment(paymentId: string) {
  const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("YooKassa get payment error:", JSON.stringify(data));
    throw new Error(`Failed to get YooKassa payment: ${JSON.stringify(data)}`);
  }

  return data;
}
