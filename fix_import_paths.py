#!/usr/bin/env python3
"""
Script to fix import paths for API_ENDPOINTS
"""

import os
import re

def fix_import_paths(file_path):
    """Fix import paths for API_ENDPOINTS"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Check if this is a tailwind component (deeper directory)
    if 'tailwind' in file_path:
        # For tailwind components, need to go up two levels
        content = re.sub(
            r"import API_ENDPOINTS from '\.\./config';",
            "import API_ENDPOINTS from '../../config';",
            content
        )
    else:
        # For regular components, need to go up one level
        content = re.sub(
            r"import API_ENDPOINTS from '\.\./config';",
            "import API_ENDPOINTS from '../config';",
            content
        )
    
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
        if fix_import_paths(file_path):
            updated_count += 1
    
    print(f"Updated {updated_count} files!")

if __name__ == "__main__":
    main() 