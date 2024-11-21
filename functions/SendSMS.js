import AWS from '../models/AWS'

const sns = AWS.SNS()

function SendSMS(phoneNumber, message) {
    const params = {
        Message: message,
        PhoneNumber: phoneNumber,
      };
      
      sns.publish(params, function (err, data) {
        if (err) {
          console.error('Error sending message:', err);
        } else {
          console.log('Message sent successfully:', data);
        }
      });
}