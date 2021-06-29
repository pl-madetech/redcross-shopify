import PDFDocument from 'pdfkit';
import getStream from 'get-stream';
import fs from 'fs';

export const createOrder = async (order) => {
  return new Promise(async (resolve, reject) => {
    console.log("CreateOrderFlow::", order);

    const s = 200;
    // Validate the order

    // Generate address labels
    try {
      const width = 89 * 2.83465; //size is in points - 1 point = 1/72 Inch
      const height = 36 * 2.83465; //size is in points - 1 point = 1/72 Inch
      const margin = 0;
      const doc = new PDFDocument(
        {
          size: [width, height],
          margins: { // by default, all are 72
            top: margin,
            bottom: margin,
            left: margin,
            right: margin
          }
        }
      );
      const shipping_address = order.shipping_address
      const address =
        `${shipping_address.first_name ? capataliseEach(shipping_address.first_name) + ' ' : ''}${shipping_address.last_name ? capataliseEach(shipping_address.last_name) : ''}  ${shipping_address.company != null ? '\n' + capataliseEach(shipping_address.company) : ''}
${capataliseEach(shipping_address.address1)} ${shipping_address.address2 != '' ? '\n' + capataliseEach(shipping_address.address2) : ''}
${capataliseEach(shipping_address.city)}
${shipping_address.zip.toUpperCase()}` //indentation to ensure address is formatted correctly
      doc
        .fontSize(14)
        .text(address, {
          align: 'center'
        })
      if (process.env.NODE_ENV === 'development') {
        doc.pipe(fs.createWriteStream(`${__dirname}/../file.pdf`));
      }
      doc.end();

      const pdfStream = await getStream.buffer(doc);
      resolve(200);
    } catch (error) {
      console.log(error);
      reject("Create order flow failed to succeed.");
    }

    // Call Clicksit to generate the return labels

    // Send labels to Sharepoint, investigate use of streams

    // Update order reference with tracking number from Clicksit and fulfillment_status to Fulfilled
    // Double check the status and if we can use the reference property to store the tracking number

  });
}

function capataliseEach(text) {
  return text.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}