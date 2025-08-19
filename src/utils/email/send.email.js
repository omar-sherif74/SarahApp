import nodemailer from 'nodemailer'



export async function sendEmail({
   From = process.env.APP_EMAIL ,to=""
    , cc=""
     , bcc="" 
     , text="" 
     , html="" 
     , subject="Sarha App" 
     , attachments=[]} = {}) {
    
    // Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});
  const info = await transporter.sendMail({
    from: `"Routy acadmy " ${From}`,
    to , cc , bcc , text , html , subject , attachments 
  })
  
  console.log(info.messageId);
}