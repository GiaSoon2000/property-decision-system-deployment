import os
import psycopg2

def import_properties_only():
    """只導入屬性數據到 PostgreSQL 數據庫"""
    
    # 示例屬性數據
    sample_properties = [
        {
            "name": "Modern Condo in Johor Bahru",
            "type": "Condominium",
            "area": "Johor Bahru",
            "price": 450000,
            "bedrooms": 2,
            "bathrooms": 2,
            "size": 850,
            "description": "Beautiful modern condominium with great amenities and location.",
            "facilities": "swimming pool, gym, 24 hours security, covered car park",
            "form_of_interest": "freehold",
            "facing_direction": "North",
            "furnishing_status": "Fully Furnished",
            "financing_options": "Conventional, Islamic",
            "year_built": 2020,
            "latitude": 1.4927,
            "longitude": 103.7414,
            "status": "approved"
        },
        {
            "name": "Luxury Villa in Skudai",
            "type": "Bungalow",
            "area": "Skudai",
            "price": 1200000,
            "bedrooms": 4,
            "bathrooms": 3,
            "size": 2500,
            "description": "Spacious luxury villa with private garden and modern design.",
            "facilities": "private garden, bbq, jacuzzi, tennis courts",
            "form_of_interest": "freehold",
            "facing_direction": "South East",
            "furnishing_status": "Partially Furnished",
            "financing_options": "Conventional",
            "year_built": 2018,
            "latitude": 1.5378,
            "longitude": 103.6578,
            "status": "approved"
        },
        {
            "name": "Affordable Apartment in Tampoi",
            "type": "Apartment",
            "area": "Tampoi",
            "price": 280000,
            "bedrooms": 1,
            "bathrooms": 1,
            "size": 650,
            "description": "Affordable apartment perfect for first-time buyers.",
            "facilities": "playground, multi-purpose hall",
            "form_of_interest": "leasehold",
            "facing_direction": "East",
            "furnishing_status": "Unfurnished",
            "financing_options": "Conventional, Islamic",
            "year_built": 2019,
            "latitude": 1.4789,
            "longitude": 103.7234,
            "status": "approved"
        },
        {
            "name": "Townhouse in Kempas",
            "type": "Townhouse",
            "area": "Kempas",
            "price": 680000,
            "bedrooms": 3,
            "bathrooms": 2,
            "size": 1200,
            "description": "Modern townhouse with excellent connectivity.",
            "facilities": "clubhouse, swimming pool, gym, landscaped garden",
            "form_of_interest": "freehold",
            "facing_direction": "North West",
            "furnishing_status": "Fully Furnished",
            "financing_options": "Conventional",
            "year_built": 2021,
            "latitude": 1.5123,
            "longitude": 103.6789,
            "status": "approved"
        },
        {
            "name": "Semi-Detached House in Pulai",
            "type": "Semi-detached house",
            "area": "Pulai",
            "price": 850000,
            "bedrooms": 3,
            "bathrooms": 3,
            "size": 1800,
            "description": "Spacious semi-detached house with beautiful surroundings.",
            "facilities": "bbq, jogging track, yoga room, lounge",
            "form_of_interest": "freehold",
            "facing_direction": "South",
            "furnishing_status": "Partially Furnished",
            "financing_options": "Conventional, Islamic",
            "year_built": 2017,
            "latitude": 1.5234,
            "longitude": 103.6456,
            "status": "approved"
        }
    ]
    
    try:
        # 連接數據庫
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com'),
            user=os.getenv('POSTGRES_USER', 'property_db_mk0k_user'),
            password=os.getenv('POSTGRES_PASSWORD', 'GFL0ceMFr7z9zG2yI7XURfT59SlOP8so'),
            database=os.getenv('POSTGRES_DB', 'property_db_mk0k'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
        
        cursor = conn.cursor()
        
        print("✅ 開始導入屬性數據...")
        
        # 獲取現有用戶ID
        cursor.execute("SELECT id FROM users WHERE role = 'REN' LIMIT 1")
        agent_result = cursor.fetchone()
        agent_id = agent_result[0] if agent_result else 1
        
        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        admin_result = cursor.fetchone()
        admin_id = admin_result[0] if admin_result else 1
        
        print(f"👤 使用 agent_id: {agent_id}, admin_id: {admin_id}")
        
        # 導入屬性數據
        print("🏠 導入屬性數據...")
        for property_data in sample_properties:
            cursor.execute("""
                INSERT INTO properties (
                    name, type, area, price, bedrooms, bathrooms, size, description,
                    facilities, form_of_interest, facing_direction, furnishing_status,
                    financing_options, year_built, latitude, longitude, status,
                    submitted_by, approved_by, submitted_at, approved_at, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW(), NOW()
                ) RETURNING id
            """, (
                property_data['name'], property_data['type'], property_data['area'],
                property_data['price'], property_data['bedrooms'], property_data['bathrooms'],
                property_data['size'], property_data['description'], property_data['facilities'],
                property_data['form_of_interest'], property_data['facing_direction'],
                property_data['furnishing_status'], property_data['financing_options'],
                property_data['year_built'], property_data['latitude'], property_data['longitude'],
                property_data['status'], agent_id, admin_id
            ))
            
            property_id = cursor.fetchone()[0]
            
            # 為每個屬性添加示例圖片
            cursor.execute("""
                INSERT INTO property_images (property_id, image_path, created_at)
                VALUES (%s, %s, NOW())
            """, (property_id, "default-property.jpg"))
            
            print(f"✅ 已導入屬性: {property_data['name']} (ID: {property_id})")
        
        # 提交事務
        conn.commit()
        
        print("✅ 屬性數據導入成功！")
        print(f"🏠 導入了 {len(sample_properties)} 個屬性")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 導入數據時出錯: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    import_properties_only() 