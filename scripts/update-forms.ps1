# PowerShell script to update all listing forms with storage integration

$forms = @(
    "boat-rental\form\page.tsx",
    "vip-transfer\form\page.tsx",
    "properties-for-sale\form\page.tsx"
)

$baseDir = "C:\zybo\rentbuy\website\src\app\admin\listings"

foreach ($form in $forms) {
    $filePath = Join-Path $baseDir $form
    Write-Host "Updating: $filePath"
    
    # Dosya var mı kontrol et
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # 1. Import güncellemesi
        if ($content -notmatch "FileUpload") {
            $content = $content -replace "(import React.*next/navigation';)", "`$1`nimport FileUpload from '@/components/admin/FileUpload';`nimport { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';"
        }
        
        # 2. Interface güncelleme - images: string[]; satırından sonra storage alanları ekle
        if ($content -match "images: string\[\];") {
            $content = $content -replace "(images: string\[\];)", "`$1`n  storage_paths?: string[];`n  storage_bucket?: string;"
        }
        
        # 3. Initial state güncelleme
        if ($content -match "images: \[\],") {
            $content = $content -replace "(images: \[\],)", "`$1`n    storage_paths: [],`n    storage_bucket: 'listings',"
        }
        
        Write-Host "Updated $filePath"
        $content | Set-Content $filePath -Encoding UTF8
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "All forms updated!" -ForegroundColor Green