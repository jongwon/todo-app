const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'abcd1234';
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Original password:', password);
  console.log('Hashed password:', hashedPassword);
  
  // 검증
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Verification test:', isValid);
}

hashPassword().catch(console.error);