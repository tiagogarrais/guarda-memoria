import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const paramsToSign = await request.json();
    console.log("ALL params received:", JSON.stringify(paramsToSign, null, 2));

    // Usar todos os parâmetros recebidos, exceto api_key
    const requiredParams = { ...paramsToSign };
    delete requiredParams.api_key; // Remover api_key se existir

    console.log("Params for signing (without api_key):", requiredParams);

    // Criar string para assinar (sem URL encoding para valores simples)
    const sortedKeys = Object.keys(requiredParams).sort();
    const stringToSign = sortedKeys
      .map((key) => `${key}=${requiredParams[key]}`)
      .join("&");
    console.log("String to sign (no encoding):", stringToSign);

    // Usar o método oficial do Cloudinary
    const signature = cloudinary.utils.api_sign_request(
      requiredParams,
      process.env.CLOUDINARY_API_SECRET
    );

    console.log("Generated signature (Cloudinary method):", signature);

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
