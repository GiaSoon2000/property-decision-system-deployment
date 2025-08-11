# -*- coding: utf-8 -*-
import psycopg2
from psycopg2.extras import RealDictCursor

def import_properties_direct():
    try:
        conn = psycopg2.connect(
            host='dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com',
            user='property_db_mk0k_user',
            password='GFL0ceMFr7z9zG2yI7XURfT59SlOP8so',
            database='property_db_mk0k',
            port='5432'
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔄 開始直接導入屬性數據...")
        
        # 清空現有數據
        print("🧹 清空現有數據...")
        cursor.execute("DELETE FROM property_images")
        cursor.execute("DELETE FROM properties")
        cursor.execute("ALTER SEQUENCE properties_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE property_images_id_seq RESTART WITH 1")
        
        # 手動插入主要屬性
        properties_to_insert = [
            (1, 'Austin Duta Phase 9B', 'Double storey terraced house', 4, 3, 2006, 651100.00, 1.564803, 103.778473, 'Austin Heights', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (2, 'Ponderosa Vista', 'Semi-detached house', 4, 4, 4258, 1800000.00, 1.518218, 103.775350, 'Johor Bahru', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (3, 'The Senai Garden', 'Apartment', 3, 2, 968, 430000.00, 1.594574, 103.648138, 'Senai', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (13, 'Citrine Hills Double', 'Double storey terraced house', 4, 3, 1845, 518000.00, 1.564396, 103.574648, 'Kangkar Pulai', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (14, 'R&F Princess Cove', 'Apartment', 1, 1, 548, 580000.00, 1.458931, 103.769531, 'Tanjung Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (15, 'Nasa City - Desa Palma Phase 11A', 'Double storey terraced house', 4, 3, 2006, 880000.00, 1.554658, 103.726305, 'Desa Palma', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (16, 'Taman Selesa Indah, Phase 3A', 'Bungalow', 4, 4, 1898, 758000.00, 1.443379, 103.621060, 'Skudai', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (18, 'Greenwoods Residence @ Taman Daya', 'Cluster house', 4, 4, 2114, 838950.00, 1.556429, 103.762923, 'Taman Daya', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (21, 'Bukit Impian Residence @ Taman Impian Emas', 'Semi-detached house', 4, 5, 3613, 1700000.00, 1.555538, 103.680959, 'Impian Emas', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (30, 'Sunway Maple Residence', 'Double storey terraced house', 4, 4, 2200, 1220000.00, 1.390794, 103.639999, 'Iskandar Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (34, 'Southkey NADI Residences', 'Apartment', 1, 1, 649, 422000.00, 1.503936, 103.777295, 'Johor Bahru', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (35, 'Suria Hills Iskandar Puteri', 'Bungalow', 5, 6, 5462, 1200000.00, 1.450495, 103.648533, 'Iskandar Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (36, 'Petrie Villa@Johor Bahru', 'Bungalow', 5, 8, 4573, 3700000.00, 1.461265, 103.736538, 'Johor Bahru', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (37, 'Horizon Hills', 'Semi-detached house', 5, 5, 3441, 2300000.00, 1.451870, 103.631159, 'Iskandar Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (38, 'M Condominium @ Larkin', 'Condominium', 3, 2, 1067, 460000.00, 1.499865, 103.746677, 'Larkin', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (39, 'JALAN NUSA JAYA MAS', 'Double storey terraced house', 4, 3, 1650, 820000.00, 1.491776, 103.645284, 'Iskandar Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (40, 'Desa Cemerlang Desas Cemerlangs', 'Double storey terraced house', 4, 3, 2640, 550000.00, 1.563034, 103.815605, 'Desa Jaya', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (41, 'D Ambience Residences (Pangsapuri Ikatan Flora)', 'Bungalow', 2, 2, 830, 335000.00, 1.514511, 103.822692, 'Permas Jaya', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (42, 'PARC Regency (Residensi Masai)', 'Apartment', 2, 2, 1010, 399000.00, 1.520975, 103.813836, 'Molek', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (43, 'Bungalow at Taman Stulang Laut', 'Bungalow', 4, 3, 12643, 1500000.00, 1.470975, 103.779605, 'Taman Stulang Laut', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (44, 'Royal Strand @ Country Garden Danga Bay', 'Condominium', 2, 2, 816, 480000.00, 1.466215, 103.726362, 'Danga Bay', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (45, 'Eco Spring', 'Cluster house', 4, 5, 2360, 1300000.00, 1.588600, 103.760212, 'Taman Ekoflora', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (46, 'D Pristine', 'Apartment', 2, 2, 771, 385000.00, 1.429769, 103.634430, 'Medini Utara', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (47, 'TAMPOI HEIGHTS', 'Single storey terraced house', 3, 2, 950, 379000.00, 1.507195, 103.656698, 'Sutera Danga', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (48, 'Twin Galaxy (Dwi Galaksi)', 'Cluster house', 2, 2, 936, 688000.00, 1.478431, 103.762170, 'Jalan Dato Abdullah Tahir', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (49, 'Taman Senai Utama', 'Single storey terraced house', 3, 2, 1300, 405000.00, 1.611214, 103.642625, 'Senai', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (50, 'Setia Eco Cascadia', 'Cluster house', 4, 5, 2938, 1200000.00, 1.583511, 103.759951, 'Mount Austin', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (51, 'Horizon Hills', 'Double storey terraced house', 4, 3, 2298, 1450000.00, 1.448811, 103.638626, 'Iskandar Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (52, 'Eco Tropics', 'Single storey terraced house', 4, 3, 1400, 588000.00, 1.490832, 103.940062, 'Kota Masai', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (53, 'Taman Uda utama', 'Single storey terraced house', 3, 2, 1540, 538000.00, 1.499741, 103.670323, 'Uda Utama', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (54, 'Townhouse at Taman Tampoi Indah', 'Townhouse', 3, 2, 1323, 360000.00, 1.507129, 103.685000, 'Tampoi Indah', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (55, 'The Seed', 'Townhouse', 3, 3, 1240, 638000.00, 1.507632, 103.673381, 'Skudai', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (56, 'Medini Medini Medinis', 'Townhouse', 1, 1, 474, 294000.00, 1.414810, 103.627251, 'Iskandar Puteri', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (57, 'Leisures Farms', 'Townhouse', 3, 3, 1000, 600000.00, 1.410075, 103.609881, 'Gelang Patah', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (58, 'Nusa Villa @ Nusa Bestari', 'Townhouse', 3, 3, 1516, 505000.00, 1.501649, 103.651010, 'Skudai', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (59, 'The Astaka @ 1 Bukit Senyum', 'Condominium', 3, 4, 2217, 2350000.00, 1.473717, 103.765125, 'Johor Bahru', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (60, 'D Suites', 'Condominium', 3, 2, 1076, 647000.00, 1.448597, 103.628925, 'Horizon Hills', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (61, 'TriTower Residence @ Johor Bahru Sentral', 'Condominium', 2, 2, 980, 560000.00, 1.466708, 103.765123, 'Johor Bahru', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (62, 'Austin Perdana', 'Semi-detached house', 5, 5, 3200, 1680000.00, 1.545469, 103.782659, 'Mount Austin', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (63, 'Mont Callista', 'Semi-detached house', 5, 6, 3837, 1000000.00, 1.541974, 103.609759, 'Skudai', 'Freehold', 'Bank Loan', 1, 1, 'approved'),
            (64, 'Taman Ehsan Jaya', 'Flat', 3, 2, 710, 148000.00, 1.547756, 103.813315, 'Ulu Tiram', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (65, 'Taman Tan Sri Yaacob', 'Flat', 3, 2, 743, 175000.00, 1.495948, 103.659788, 'Skudai', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (66, 'Taman Mutiara Rini', 'Flat', 3, 2, 610, 173000.00, 1.515226, 103.644456, 'Skudai', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (67, 'Taman Melor', 'Flat', 2, 1, 495, 108000.00, 1.505452, 103.692272, 'Tampoi', 'Leasehold', 'Bank Loan', 1, 1, 'approved'),
            (68, 'TAMAN PUTRI KULAI', 'Flat', 2, 1, 500, 100000.00, 1.655709, 103.577583, 'Kulai', 'Freehold', 'Bank Loan', 1, 1, 'approved')
        ]
        
        print("🏠 導入屬性...")
        for prop in properties_to_insert:
            try:
                cursor.execute("""
                    INSERT INTO properties (
                        id, name, type, bedrooms, bathrooms, size, price, latitude, longitude,
                        area, form_of_interest, financing_options, submitted_by, approved_by, status
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, prop)
                print(f"✅ 導入屬性 {prop[0]}: {prop[1]}")
                
            except Exception as e:
                print(f"❌ 導入屬性 {prop[0]} 失敗: {e}")
                continue
        
        # 導入圖片
        print("📸 導入圖片...")
        images_to_insert = [
            (1, 35, '20241120_161134_1.jpg'),
            (2, 35, '20241120_161134_View_5_Type_A_View_2_04.jpg'),
            (3, 13, '20241122_155923_citrine_hills.jpg'),
            (4, 14, '20241128_143535_RF.jpg'),
            (5, 1, '20241128_143924_Austin_Duta_Phase_9B.jpeg'),
            (6, 2, '20241128_144328_Ponderosa_Vista.jpg'),
            (7, 2, '20241128_144328_Ponderosa_Vista1.jpg'),
            (8, 3, '20241128_144958_the_senai_garden.jpeg'),
            (9, 15, '20241128_145457_Nasa_City_-_Desa_Palma_Phase_11A.jpg'),
            (10, 15, '20241128_145511_Nasa_City_-_Desa_Palma_Phase_11A_1.jpg'),
            (11, 16, '20241128_150512_Taman_Selesa_Indah_Phase_3A.jpg'),
            (12, 18, '20241128_151147_greenwood.jpg'),
            (13, 21, '20241128_151512_Bukit_Impian_Residence_east.jpg'),
            (14, 30, '20241128_152256_Sunway_Maple_Residence.webp'),
            (15, 30, '20241128_152256_Sunway_Maple_Residence1.webp'),
            (16, 34, '20241128_153145_Southkey_NADI_Residences.jpeg'),
            (17, 34, '20241128_153145_Southkey_NADI_Residences1.jpg'),
            (18, 36, '20241128_154313_Petrie_Villa.jpg'),
            (19, 37, '20241231_232905_Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia.jpg'),
            (20, 38, '20241231_233722_M_Condominium.jpg'),
            (21, 39, '20241231_234027_JALAN-NUSA-JAYA-MAS-Iskandar-Puteri-Nusajaya-Malaysia.jpg'),
            (22, 40, '20250101_003504_Desa-Cemerlang-Desas-Cemerlangs-Johor-Bahru-Malaysia.jpg'),
            (23, 41, '20250101_181400_D-Ambience-Residences-Pangsapuri-Ikatan-Flora-Permas-Jaya-Malaysia.jpg'),
            (24, 42, '20250101_181710_PARC_Regency.jpg'),
            (25, 43, '20250101_182030_UPHO.webp'),
            (26, 44, '20250101_182342_royal_strand.jpg'),
            (27, 45, '20250101_182710_Eco-Spring-Johor-Bahru-Malaysia.jpg'),
            (28, 46, '20250101_183001_d_pristine.jpg'),
            (29, 47, '20250101_183312_TAMPOI-HEIGHTS-Johor-Bahru-Malaysia.jpg'),
            (30, 48, '20250102_004337_twin_galaxy.jpg'),
            (31, 49, '20250103_150202_Taman-Senai-Utama-Kulai-Malaysia.jpg'),
            (32, 50, '20250103_150617_Setia-Eco-Cascadia-Tebrau-Malaysia.jpg'),
            (33, 51, '20250103_150918_Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia_1.jpg'),
            (34, 51, '20250103_150918_Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia_2.jpg'),
            (35, 52, '20250103_151147_Eco-Tropics-Pasir-Gudang-Malaysia_1.jpg'),
            (36, 52, '20250103_151147_Eco-Tropics-Pasir-Gudang-Malaysia.jpg'),
            (37, 53, '20250103_151414_Taman-Uda-utama-Johor-Bahru-Malaysia_1.jpg'),
            (38, 53, '20250103_151414_Taman-Uda-utama-Johor-Bahru-Malaysia.jpg'),
            (39, 54, '20250103_151652_Townhouse-at-Taman-Tampoi-Indah-Tampoi-Malaysia_1.jpg'),
            (40, 54, '20250103_151652_Townhouse-at-Taman-Tampoi-Indah-Tampoi-Malaysia.jpg'),
            (41, 55, '20250103_151915_The-Seed-Skudai-Malaysia_1.jpg'),
            (42, 55, '20250103_151915_The-Seed-Skudai-Malaysia.jpg'),
            (43, 56, '20250103_152212_Medini-Medini-Medinis-Iskandar-Puteri-Nusajaya-Malaysia_1.jpg'),
            (44, 56, '20250103_152212_Medini-Medini-Medinis-Iskandar-Puteri-Nusajaya-Malaysia.jpg'),
            (45, 57, '20250103_160657_leisures_farms.jpg'),
            (46, 58, '20250103_162903_Nusa-Villa-Nusa-Bestari-Johor-Bahru-Malaysia_1.jpg'),
            (47, 58, '20250103_162903_Nusa-Villa-Nusa-Bestari-Johor-Bahru-Malaysia.jpg'),
            (48, 59, '20250103_163235_The-Astaka-1-Bukit-Senyum-Johor-Bahru-Malaysia_1.jpg'),
            (49, 59, '20250103_163235_The-Astaka-1-Bukit-Senyum-Johor-Bahru-Malaysia.jpg'),
            (50, 60, '20250103_163738_D_Suite_Condominium_at_Horizon_Hills.jpg'),
            (51, 60, '20250103_163738_D-Suites-Horizon-Hills-Iskandar-Puteri-Nusajaya-Malaysia.jpg'),
            (52, 61, '20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia_1.jpg'),
            (53, 61, '20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia_2.jpg'),
            (54, 61, '20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia_3.jpg'),
            (55, 61, '20250103_164019_TriTower-Residence-Johor-Bahru-Sentral-Johor-Bahru-Malaysia.jpg'),
            (56, 62, '20250103_164242_Austin-Perdana-Tebrau-Malaysia_1.jpg'),
            (57, 62, '20250103_164242_Austin-Perdana-Tebrau-Malaysia_2.jpg'),
            (58, 62, '20250103_164242_Austin-Perdana-Tebrau-Malaysia.jpg'),
            (59, 63, '20250103_164417_Mont-Callista-Skudai-Malaysia_1.jpg'),
            (60, 63, '20250103_164417_Mont-Callista-Skudai-Malaysia.jpg'),
            (61, 64, '20250103_164829_Taman-Ehsan-Jaya-Ulu-Tiram-Malaysia_1.jpg'),
            (62, 64, '20250103_164829_Taman-Ehsan-Jaya-Ulu-Tiram-Malaysia.jpg'),
            (63, 65, '20250103_164953_Taman-Tan-Sri-Yaacob-Skudai-Malaysia_1.jpg'),
            (64, 65, '20250103_164953_Taman-Tan-Sri-Yaacob-Skudai-Malaysia.jpg'),
            (65, 66, '20250103_165150_Taman-Mutiara-Rini-Skudai-Malaysia.jpg'),
            (66, 67, '20250103_165336_Taman-Melor-Tampoi-Malaysia_1.jpg'),
            (67, 67, '20250103_165336_Taman-Melor-Tampoi-Malaysia.jpg'),
            (68, 67, '20250103_165336_Melor.jpg'),
            (69, 68, '20250103_165503_TAMAN_PUTRI_KULAI.jpg')
        ]
        
        for img in images_to_insert:
            try:
                cursor.execute("""
                    INSERT INTO property_images (id, property_id, image_path)
                    VALUES (%s, %s, %s)
                """, img)
                print(f"✅ 導入圖片 {img[0]}: {img[2]}")
                
            except Exception as e:
                print(f"❌ 導入圖片 {img[0]} 失敗: {e}")
                continue
        
        conn.commit()
        
        cursor.execute("SELECT COUNT(*) as count FROM properties")
        properties_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM property_images")
        images_count = cursor.fetchone()['count']
        
        print(f"\n🎉 導入完成！")
        print(f"📊 屬性數量: {properties_count}")
        print(f"📸 圖片數量: {images_count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    import_properties_direct() 