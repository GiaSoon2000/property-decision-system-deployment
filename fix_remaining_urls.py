#!/usr/bin/env python3
"""
Script to fix remaining hardcoded localhost:5000 URLs
"""

import os
import re

def fix_remaining_urls(file_path):
    """Fix remaining hardcoded URLs"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Add import if needed
    if 'API_ENDPOINTS.' in content and 'import API_ENDPOINTS' not in content:
        content = 'import API_ENDPOINTS from \'../config\';\n' + content
    
    # Fix remaining patterns
    replacements = [
        # Template literals with localhost
        (r"fetch\(`http://localhost:5000/admin/property/\$\{([^}]+)\}/edit`", r"fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_EDIT}/\${1}/edit`"),
        (r"fetch\(`http://localhost:5000/admin/property/\$\{([^}]+)\}/images`", r"fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_IMAGES}/\${1}/images`"),
        (r"fetch\(`http://localhost:5000/admin/property/\$\{([^}]+)\}/delete`", r"fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_DELETE}/\${1}/delete`"),
        (r"fetch\(`http://localhost:5000/api/properties/\$\{([^}]+)\}`", r"fetch(`${API_ENDPOINTS.PROPERTY_DETAIL}/\${1}`"),
        (r"fetch\(`http://localhost:5000/search\?\$\{([^}]+)\}`", r"fetch(`${API_ENDPOINTS.SEARCH}?\${1}`"),
        (r"fetch\(`http://localhost:5000/ren/properties/\$\{([^}]+)\}`", r"fetch(`${API_ENDPOINTS.REN_PROPERTIES}/\${1}`"),
        (r"fetch\(`http://localhost:5000/user-profile/\$\{([^}]+)\}`", r"fetch(`${API_ENDPOINTS.USER_PROFILE}/\${1}`"),
        (r"fetch\(`http://localhost:5000/update-profile/\$\{([^}]+)\}`", r"fetch(`${API_ENDPOINTS.UPDATE_PROFILE}/\${1}`"),
        (r"fetch\(`http://localhost:5000/notifications/\$\{([^}]+)\}`", r"fetch(`${API_ENDPOINTS.NOTIFICATIONS}/\${1}`"),
        (r"fetch\(`http://localhost:5000/notifications/\$\{([^}]+)\}/read`", r"fetch(`${API_ENDPOINTS.MARK_NOTIFICATION_READ}/\${1}/read`"),
        (r"fetch\(`http://localhost:5000/notifications/\$\{([^}]+)\}/mark-all-read`", r"fetch(`${API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ}/\${1}/mark-all-read`"),
        (r"fetch\(`http://localhost:5000/admin/property/\$\{([^}]+)\}/approve`", r"fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_APPROVE}/\${1}/approve`"),
        (r"fetch\(`http://localhost:5000/admin/property/\$\{([^}]+)\}/reject`", r"fetch(`${API_ENDPOINTS.ADMIN_PROPERTY_REJECT}/\${1}/reject`"),
        (r"fetch\(`http://localhost:5000/admin/user/\$\{([^}]+)\}/ban`", r"fetch(`${API_ENDPOINTS.ADMIN_BAN_USER}/\${1}/ban`"),
        (r"fetch\(`http://localhost:5000/admin/ren/\$\{([^}]+)\}/verify`", r"fetch(`${API_ENDPOINTS.ADMIN_VERIFY_REN}/\${1}/verify`"),
        
        # String concatenation patterns
        (r"`http://localhost:5000/admin/property/\$\{([^}]+)\}/image/\$\{([^}]+)\}/delete`", r"`${API_ENDPOINTS.ADMIN_PROPERTY_IMAGES}/\${1}/image/\${2}/delete`"),
        (r"\?\s*`http://localhost:5000/admin/property/\$\{([^}]+)\}/edit`", r"? `${API_ENDPOINTS.ADMIN_PROPERTY_EDIT}/\${1}/edit`"),
        (r":\s*'http://localhost:5000/admin/create-property'", r": API_ENDPOINTS.ADMIN_CREATE_PROPERTY"),
        
        # Static images
        (r"src=\{`http://localhost:5000/static/images/property_images/\$\{([^}]+)\}`\}", r"src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}"),
        (r"e\.target\.src = 'http://localhost:5000/static/images/property_images/default-property\.jpg'", r"e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`"),
        
        # Console.log statements
        (r"console\.log\('Making fetch request to:', `http://localhost:5000/user-profile/\$\{([^}]+)\}`", r"console.log('Making fetch request to:', `${API_ENDPOINTS.USER_PROFILE}/\${1}`"),
        
        # URL construction
        (r"const url = `http://localhost:5000/favorites\$\{([^}]+)\}`", r"const url = `${API_ENDPOINTS.FAVORITES}\${1}`"),
    ]
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")
        return True
    
    return False

def main():
    """Main function"""
    frontend_dir = "frontend/src"
    js_files = []
    
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                js_files.append(os.path.join(root, file))
    
    print(f"Processing {len(js_files)} files...")
    
    updated_count = 0
    for file_path in js_files:
        if fix_remaining_urls(file_path):
            updated_count += 1
    
    print(f"Updated {updated_count} files!")

if __name__ == "__main__":
    main() 