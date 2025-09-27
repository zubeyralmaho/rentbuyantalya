import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { password = 'admin123', hash } = await request.json();
    
    console.log('Testing password:', password);
    console.log('Testing hash:', hash);
    
    // Mevcut hash ile test
    const currentHash = '$2b$10$8rKjQlJQw1Qw5kN2kP7a8uvD3F8v5x9L0o5cKa2j7I6G8sR4vT3nW';
    const isValidCurrent = await bcrypt.compare(password, currentHash);
    
    // Yeni hash oluştur
    const newHash = await bcrypt.hash(password, 10);
    const isValidNew = await bcrypt.compare(password, newHash);
    
    // Kullanıcının verdiği hash ile test (eğer varsa)
    let isValidCustom = false;
    if (hash) {
      isValidCustom = await bcrypt.compare(password, hash);
    }
    
    return NextResponse.json({
      success: true,
      password: password,
      tests: {
        currentHash: {
          hash: currentHash,
          isValid: isValidCurrent
        },
        newHash: {
          hash: newHash,
          isValid: isValidNew
        },
        customHash: hash ? {
          hash: hash,
          isValid: isValidCustom
        } : null
      }
    });

  } catch (error) {
    console.error('Password test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}