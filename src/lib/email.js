import nodemailer from "nodemailer";

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}) {
  // provider contains server config passed from NextAuth options
  const { server, from } = provider;

  const transporter = nodemailer.createTransport(server);

  const message = {
    to: email,
    from,
    subject: "Seu link mágico de login",
    text: `Use este link para entrar: ${url}`,
    html: `<p>Use este link para entrar:</p><p><a href="${url}">${url}</a></p>`,
  };

  await transporter.sendMail(message);
}
