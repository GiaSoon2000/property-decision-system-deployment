#!/usr/bin/env python3
"""
Script to replace hardcoded localhost:5000 URLs with proper API_ENDPOINTS references
"""

import os
import re
import glob

def replace_urls_in_file(file_path):
    """Replace hardcoded URLs with API_ENDPOINTS references"""
    
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Define URL replacements
    replacements = [
        # API endpoints
        (r"fetch\('http://localhost:5000/login'", "fetch(API_ENDPOINTS.LOGIN"),
        (r"fetch\('http://localhost:5000/register'", "fetch(API_ENDPOINTS.REGISTER"),
        (r"fetch\('http://localhost:5000/logout'", "fetch(API_ENDPOINTS.LOGOUT"),
        (r"fetch\('http://localhost:5000/user-info'", "fetch(API_ENDPOINTS.USER_INFO"),
        (r"fetch\('http://localhost:5000/properties'", "fetch(API_ENDPOINTS.PROPERTIES"),
        (r"fetch\('http://localhost:5000/search'", "fetch(API_ENDPOINTS.SEARCH"),
        (r"fetch\('http://localhost:5000/areas'", "fetch(API_ENDPOINTS.AREAS"),
        (r"fetch\('http://localhost:5000/bedrooms'", "fetch(API_ENDPOINTS.BEDROOMS"),
        (r"fetch\('http://localhost:5000/bathrooms'", "fetch(API_ENDPOINTS.BATHROOMS"),
        (r"fetch\('http://localhost:5000/favorites'", "fetch(API_ENDPOINTS.FAVORITES"),
        (r"fetch\('http://localhost:5000/notifications/", "fetch(API_ENDPOINTS.NOTIFICATIONS + '/"),
        (r"fetch\('http://localhost:5000/submit-new-property'", "fetch(API_ENDPOINTS.SUBMIT_PROPERTY"),
        (r"fetch\('http://localhost:5000/recommended-properties'", "fetch(API_ENDPOINTS.RECOMMENDED_PROPERTIES"),
        (r"fetch\('http://localhost:5000/api/chat'", "fetch(API_ENDPOINTS.CHAT"),
        (r"fetch\('http://localhost:5000/api/compare-properties'", "fetch(API_ENDPOINTS.COMPARE_PROPERTIES"),
        
        # Admin endpoints
        (r"fetch\('http://localhost:5000/admin/pending-properties'", "fetch(API_ENDPOINTS.ADMIN_PENDING_PROPERTIES"),
        (r"fetch\('http://localhost:5000/admin/approved-properties'", "fetch(API_ENDPOINTS.ADMIN_APPROVED_PROPERTIES"),
        (r"fetch\('http://localhost:5000/admin/rejected-properties'", "fetch(API_ENDPOINTS.ADMIN_REJECTED_PROPERTIES"),
        (r"fetch\('http://localhost:5000/admin/users'", "fetch(API_ENDPOINTS.ADMIN_USERS"),
        (r"fetch\('http://localhost:5000/admin/rens'", "fetch(API_ENDPOINTS.ADMIN_RENS"),
        (r"fetch\('http://localhost:5000/admin/create-property'", "fetch(API_ENDPOINTS.ADMIN_CREATE_PROPERTY"),
        (r"fetch\('http://localhost:5000/admin/create-user'", "fetch(API_ENDPOINTS.ADMIN_CREATE_USER"),
        (r"fetch\('http://localhost:5000/admin/property/", "fetch(API_ENDPOINTS.ADMIN_PROPERTY_EDIT + '/"),
        (r"fetch\('http://localhost:5000/admin/user/", "fetch(API_ENDPOINTS.ADMIN_BAN_USER + '/"),
        (r"fetch\('http://localhost:5000/admin/ren/", "fetch(API_ENDPOINTS.ADMIN_VERIFY_REN + '/"),
        
        # REN endpoints
        (r"fetch\('http://localhost:5000/ren/properties/", "fetch(API_ENDPOINTS.REN_PROPERTIES + '/"),
        
        # User endpoints
        (r"fetch\('http://localhost:5000/user-profile/", "fetch(API_ENDPOINTS.USER_PROFILE + '/"),
        (r"fetch\('http://localhost:5000/update-profile/", "fetch(API_ENDPOINTS.UPDATE_PROFILE + '/"),
        
        # Static images
        (r"http://localhost:5000/static/images/property_images/", "API_ENDPOINTS.STATIC_IMAGES + '/"),
        
        # API properties
        (r"fetch\('http://localhost:5000/api/properties/", "fetch(API_ENDPOINTS.PROPERTY_DETAIL + '/"),
    ]
    
    # Apply replacements
    original_content = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    # Add import statement if not present
    if 'import API_ENDPOINTS' not in content and 'from' not in content:
        # Find the first import statement
        import_match = re.search(r'^import\s+', content, re.MULTILINE)
        if import_match:
            # Add after the first import
            content = re.sub(r'^import\s+', 'import API_ENDPOINTS from \'../config\';\nimport ', content, count=1)
        else:
            # Add at the beginning
            content = 'import API_ENDPOINTS from \'../config\';\n' + content
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {file_path}")
        return True
    
    return False

def main():
    """Main function to process all JavaScript files"""
    
    # Get all JavaScript files in the frontend directory
    frontend_dir = "frontend/src"
    js_files = []
    
    # Find all .js files
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                js_files.append(os.path.join(root, file))
    
    print(f"Found {len(js_files)} JavaScript files to process...")
    
    updated_count = 0
    for file_path in js_files:
        if replace_urls_in_file(file_path):
            updated_count += 1
    
    print(f"\nUpdated {updated_count} files successfully!")
    print("\nNote: You may need to manually review some replacements, especially for:")
    print("- Complex URL constructions")
    print("- Dynamic URL building")
    print("- Template literals with URLs")

if __name__ == "__main__":
    main() 