const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadPath = path.join(__dirname, '..', 'public', 'documents');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Known standalone fields
const knownFields = [
  'aadharFront',
  'aadharBack',
  'panCard',
  'resume',
  'joiningLetter',
  'offerletter'
];

// Function to determine logical field label
function extractFieldLabel(fieldname) {
  if (knownFields.includes(fieldname)) return fieldname;

  // Nested document pattern (e.g., documents[0][files][1][filename])
  const match = fieldname.match(/\[files]/i);
  if (match) return 'marksheet';

  // You can extend this if certificates come in a different pattern
  const certMatch = fieldname.match(/\[certificate]/i);
  if (certMatch) return 'certificate';

  return 'other';
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // e.g. .pdf
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    const logicalField = extractFieldLabel(file.fieldname);
    const newFileName = `${logicalField}_${random}_${timestamp}${ext}`;

    cb(null, newFileName);
  }
});

const upload = multer({ storage });
module.exports = upload;
