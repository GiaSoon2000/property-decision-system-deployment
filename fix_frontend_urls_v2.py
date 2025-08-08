#!/usr/bin/env python3
"""
Improved script to replace hardcoded localhost:5000 URLs with proper API_ENDPOINTS references
"""

import os
import re
import glob

def replace_urls_in_file(file_path):
    """Replace hardcoded URLs with API_ENDPOINTS references"""
    
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Add import statement if not present and API_ENDPOINTS is used
    if 'API_ENDPOINTS.' in content and 'import API_ENDPOINTS' not in content:
        # Find the first import statement
        import_match = re.search(r'^import\s+', content, re.MULTILINE)
        if import_match:
            # Add after the first import
            content = re.sub(r'^import\s+', 'import API_ENDPOINTS from \'../config\';\nimport ', content, count=1)
        else:
            # Add at the beginning
            content = 'import API_ENDPOINTS from \'../config\';\n' + content
    
    # Fix template literals and string concatenation issues
    # Replace src={`API_ENDPOINTS.STATIC_IMAGES + '/${...}`} with proper template literals
    content = re.sub(
        r"src=\{`API_ENDPOINTS\.STATIC_IMAGES \+ '/\$\{([^}]+)\}`\}",
        r"src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}",
        content
    )
    
    # Replace e.target.src = 'API_ENDPOINTS.STATIC_IMAGES + '/default-property.jpg';
    content = re.sub(
        r"e\.target\.src = 'API_ENDPOINTS\.STATIC_IMAGES \+ '/default-property\.jpg';",
        r"e.target.src = `${API_ENDPOINTS.STATIC_IMAGES}/default-property.jpg`;",
        content
    )
    
    # Replace other similar patterns
    content = re.sub(
        r"src=\{`API_ENDPOINTS\.STATIC_IMAGES \+ '/\$\{([^}]+)\}`\}",
        r"src={`${API_ENDPOINTS.STATIC_IMAGES}/\${1}`}",
        content
    )
    
    # Fix any remaining issues with static images
    content = re.sub(
        r"API_ENDPOINTS\.STATIC_IMAGES \+ '/",
        r"`${API_ENDPOINTS.STATIC_IMAGES}/",
        content
    )
    
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

if __name__ == "__main__":
    main() 