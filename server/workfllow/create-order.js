export const createOrder = async (order) => {
  return new Promise((resolve, reject) => {
    console.log("CreateOrderFlow::", order);

    const s = 200;

    // Validate the order

    // Generate address labels

    // Call Clicksit to generate the return labels

    // Send labels to Sharepoint, investigate use of streams

    // Update order reference with tracking number from Clicksit and fulfillment_status to Fulfilled
    // Double check the status and if we can use the reference property to store the tracking number

    // require dependencies
    const PDFDocument = require('pdfkit');

    var doc = new PDFDocument();
    var FileSystem = require('fs');
    doc.pipe(FileSystem.createWriteStream('output.pdf'));
    // draw some text
    doc.fontSize(25).text('Here is some vector graphics...', 100, 80);

    // some vector graphics
    doc
      .save()
      .moveTo(100, 150)
      .lineTo(100, 250)
      .lineTo(200, 250)
      .fill('#FF3300');

    doc.circle(280, 200, 50).fill('#6600FF');

    // an SVG path
    doc
      .scale(0.6)
      .translate(470, 130)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('red', 'even-odd')
      .restore();

    // and some justified text wrapped into columns
    doc
      .text('And here is some wrapped text...', 100, 300)
      .font('Times-Roman', 13)
      .moveDown() 
      .text("lorem wrapped text skdfjflsdjfkl sjfslf jslfjsdfjsfjskdldfj ksdjdljskl fdsdhfdhfjsdhfksf hsdjfhsdkfhsdjk dfhjsdfh sdfhjk fdshfjsddj hsfjkdhfjksdf", {
        width: 412,
        align: 'justify',
        indent: 30,
        columns: 2,
        height: 300,
        ellipsis: true
      });

    // end and display the document in the iframe to the right
    doc.end();


    if (s === 200) {
      resolve(200);
    } else {
      reject("Create order flow failed to succeed.");
    }

  });
}
