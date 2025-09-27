const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Doğrulama
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash doğrulaması:', isValid);
  } catch (error) {
    console.error('Hash oluşturma hatası:', error);
  }
}

hashPassword();