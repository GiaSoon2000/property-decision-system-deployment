from flask import Flask, jsonify, request, session, Blueprint, redirect, url_for, render_template, send_from_directory, current_app
from flask_bcrypt import Bcrypt  # For hashing passwords
from flask_cors import CORS
from functools import wraps
from flask import abort
from datetime import datetime
from enum import Enum
import psycopg2
import psycopg2.extras
from psycopg2.extras import RealDictCursor
import os
from werkzeug.utils import secure_filename
from config import Config
import openai
from openai import AsyncOpenAI
from asgiref.wsgi import WsgiToAsgi
from hypercorn.config import Config as HypercornConfig
from hypercorn.asyncio import serve
import asyncio
import logging
import re

logging.getLogger('hypercorn.error').setLevel(logging.ERROR)

app = Flask(__name__)
if not Config.init_app(app):
    raise RuntimeError("Failed to initialize application configuration")
app.secret_key = "WW15257Z!"  # Use a secret key for session management
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
bcrypt = Bcrypt(app)
CORS(app, origins=['http://localhost:3000', 'https://property-frontend-mk0z.onrender.com', 'https://property-frontend-p69z.onrender.com'], supports_credentials=True, methods=['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'])  # Added DELETE and PUT methods


# Update these configurations to ensure consistency
UPLOAD_FOLDER = 'static/images/property_images'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.static_folder = 'static'
app.static_url_path = '/static'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class NotificationType(Enum):
    NEW_LAUNCH = 'new_launch'
    INQUIRY_RESPONSE = 'inquiry_response'
    PROPERTY = 'property'
    SYSTEM = 'system'
    
# Database connection setup for PostgreSQL
def connect_db():
    try:
        # 檢查是否使用 PostgreSQL
        if os.getenv('DATABASE_URL'):
            # 使用 DATABASE_URL 環境變量
            conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        else:
            # 使用單獨的環境變量
            conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST', 'dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com'),
                user=os.getenv('POSTGRES_USER', 'property_db_mk0k_user'),
                password=os.getenv('POSTGRES_PASSWORD', 'GFL0ceMFr7z9zG2yI7XURfT59SlOP8so'),
                database=os.getenv('POSTGRES_DB', 'property_db_mk0k'),
                port=os.getenv('POSTGRES_PORT', '5432')
            )
        return conn
    except Exception as e:
        print(f"數據庫連接錯誤: {e}")
        raise



@app.route('/')
def home():
    return "Welcome to the Property Buying Decision System API"

# Add this after the home route and before the admin_required decorator

@app.route('/test-db', methods=['GET'])
def test_db():
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Test basic connection
        cursor.execute("SELECT 1 as test")
        test_result = cursor.fetchone()
        
        # Check if properties table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'properties'
            ) as table_exists
        """)
        table_exists = cursor.fetchone()
        
        # Check if property_images table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'property_images'
            ) as table_exists
        """)
        images_table_exists = cursor.fetchone()
        
        # Get table structure if it exists
        table_structure = None
        if table_exists['table_exists']:
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'properties' 
                ORDER BY ordinal_position
            """)
            table_structure = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "database_connection": "success",
            "test_query": test_result,
            "properties_table_exists": table_exists['table_exists'],
            "property_images_table_exists": images_table_exists['table_exists'],
            "properties_table_structure": table_structure
        })
        
    except Exception as e:
        return jsonify({
            "database_connection": "failed",
            "error": str(e)
        }), 500

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'admin':
            abort(403)  # Send a 403 Forbidden response
        return f(*args, **kwargs)
    return decorated_function

def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print(f"Session contents: {session}")
        print(f"User ID in session: {session.get('user_id')}")
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized - No user_id in session"}), 401
        return f(*args, **kwargs)
    return decorated_function


# Utility function to create notifications
def create_notification(conn, recipient_id, message, notification_type, property_id=None):
    new_conn = connect_db()  # Create a new connection for this notification
    try:
        cursor = new_conn.cursor()
        cursor.execute("""
            INSERT INTO notifications 
            (recipient_id, message, type, property_id, is_read, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (recipient_id, message, notification_type, property_id, False, datetime.now()))
        
        new_conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error creating notification: {e}")
        new_conn.rollback()
        return None
    finally:
        cursor.close()
        new_conn.close()

# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone', '')
    role = data.get('role')  # user or REN

    # Validate required fields
    if not all([name, email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Insert user details
        cursor.execute(
            "INSERT INTO users (username, email, password, phone, role, status, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (name, email, hashed_password, phone, role, 'active', datetime.now())
        )
        user_id = cursor.lastrowid

        # Insert profile details based on role
        if role == 'user':
            # Handle price range values
            price_range_min = data.get('priceRangeMin')
            price_range_max = data.get('priceRangeMax')
            
            # Convert to float if values are provided, otherwise use NULL
            try:
                price_min = float(price_range_min) if price_range_min not in [None, '', '0'] else None
                price_max = float(price_range_max) if price_range_max not in [None, '', '0'] else None
            except ValueError:
                price_min = None
                price_max = None

            cursor.execute("INSERT INTO profiles (user_id, occupation, preferred_area, preferred_property_type, price_range_min, price_range_max) VALUES (%s, %s, %s, %s, %s, %s)", (user_id, data.get('occupation', ''), data.get('preferredArea', ''), data.get('propertyType', ''), price_min, price_max))
        elif role == 'REN':
            cursor.execute(
                """INSERT INTO profiles 
                   (user_id, REN_id, company_name, verified_status) 
                   VALUES (%s, %s, %s, %s)""",
                (user_id, 
                 data.get('renCode', ''),
                 data.get('companyName', ''),
                 False)  # Default to unverified
            )

        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user['password'], password):
            # Store user info in session
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            
            print(f"Session after login: {session}")
            print(f"User ID set in session: {session.get('user_id')}")
            
            # Remove sensitive data before sending
            user.pop('password', None)
            return jsonify({
                "message": "Login successful", 
                "role": user['role'],
                "user_id": user['id'],
                "username": user['username']
            }), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"message": "An error occurred during login"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# API Route to get all properties
@app.route('/properties', methods=['GET'])
def get_properties():
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # First check if properties table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'properties'
            ) as table_exists
        """)
        table_exists = cursor.fetchone()
        
        if not table_exists['table_exists']:
            return jsonify({"error": "Properties table does not exist", "properties": []}), 200

        # Check if property_images table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'property_images'
            ) as table_exists
        """)
        images_table_exists = cursor.fetchone()
        
        # Use a simpler approach - get properties first, then get images separately
        query = """
            SELECT p.*
            FROM properties p
            WHERE p.status = 'approved'
            ORDER BY p.created_at DESC
        """
        
        cursor.execute(query)
        properties = cursor.fetchall()
        
        # Convert results to dictionary format
        properties_dict = []
        
        for row in properties:
            property_dict = dict(row)  # RealDictCursor already returns dict, just make a copy
            
            # Get images for this property if property_images table exists
            if images_table_exists['table_exists']:
                try:
                    cursor.execute("""
                        SELECT id, image_path 
                        FROM property_images 
                        WHERE property_id = %s
                        ORDER BY created_at DESC
                    """, (property_dict['id'],))
                    images = cursor.fetchall()
                    
                    if images:
                        property_dict['images'] = [
                            {
                                'id': img['id'],
                                'image_path': img['image_path']
                            }
                            for img in images
                        ]
                    else:
                        property_dict['images'] = [{'id': 0, 'image_path': 'default-property.jpg'}]
                except Exception as e:
                    print(f"Error fetching images for property {property_dict['id']}: {e}")
                    property_dict['images'] = [{'id': 0, 'image_path': 'default-property.jpg'}]
            else:
                property_dict['images'] = [{'id': 0, 'image_path': 'default-property.jpg'}]
                
            properties_dict.append(property_dict)
        
        return jsonify(properties_dict)
    except Exception as e:
        print("Error fetching properties:", str(e))
        return jsonify({"error": str(e), "properties": []}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

        
@app.route('/search', methods=['GET'])
def search_properties():
    # Get filter parameters from the query string
    area = request.args.get('area', '')
    property_type = request.args.get('propertyType', '')
    min_price = request.args.get('minPrice', 0)
    max_price = request.args.get('maxPrice', 9999999999)
    bedrooms = request.args.get('bedrooms', '')
    bathrooms = request.args.get('bathrooms', '')
    financing_option = request.args.get('financingOption', '')
    form_of_interest = request.args.get('formOfInterest', '')
    facing_direction = request.args.get('facingDirection', '')
    furnishing_status = request.args.get('furnishingStatus', '')

    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Modified query to include agent information
        query = """
            SELECT p.*, 
                   STRING_AGG(DISTINCT pi.image_path::text, \',\') as images,
                   COUNT(DISTINCT pi.id) as image_count,
                   u.username as agent_name,
                   u.phone as agent_phone
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            LEFT JOIN users u ON p.submitted_by = u.id
            WHERE 1=1
        """
        params = []

        # Only add filters that have actual values
        if area.strip():
            query += " AND p.area LIKE %s"
            params.append(f"%{area.strip()}%")

        if property_type:
            query += " AND p.type = %s"
            params.append(property_type)

        if bedrooms:
            query += " AND p.bedrooms = %s"
            params.append(int(bedrooms))
            
        if bathrooms:
            query += " AND p.bathrooms = %s"
            params.append(int(bathrooms))

        if min_price:
            query += " AND p.price >= %s"
            params.append(float(min_price))

        if max_price:
            query += " AND p.price <= %s"
            params.append(float(max_price))

        if financing_option:
            query += " AND p.financing_options LIKE %s"
            params.append(f"%{financing_option}%")
        
        if form_of_interest:
            query += " AND p.form_of_interest = %s"
            params.append(form_of_interest)

        if facing_direction:
            query += " AND p.facing_direction = %s"
            params.append(facing_direction)

        if furnishing_status:
            query += " AND p.furnishing_status = %s"
            params.append(furnishing_status)
            
        # Add GROUP BY clause at the end
        query += " GROUP BY p.id, u.username, u.phone"

        # Debug logging
        print("Executing query:", query)
        print("With parameters:", params)
        
        cursor.execute(query, params)
        properties = cursor.fetchall()
        
        # Process the results
        for property in properties:
            # Handle images
            if property['images']:
                image_paths = property['images'].split(',')
                property['images'] = [path.strip() for path in image_paths if path.strip()]
            else:
                property['images'] = []
                
            if not property['images']:
                property['images'] = ['default-property.jpg']

            # Add agent information
            property['agent'] = {
                'name': property.pop('agent_name'),
                'phone': property.pop('agent_phone')
            }
        
        # Debug logging
        print(f"Found {len(properties)} matching properties")
        
        return jsonify(properties)
    except Exception as e:
        print("Error executing search:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Add new endpoint to get unique areas
@app.route('/areas', methods=['GET'])
def get_areas():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
            SELECT DISTINCT area 
            FROM properties 
            WHERE area IS NOT NULL AND area != ''
            ORDER BY area
        """
        cursor.execute(query)
        areas = cursor.fetchall()
        return jsonify([area['area'] for area in areas])
    except Exception as e:
        print("Error fetching areas:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        
@app.route('/bedrooms', methods=['GET'])
def get_bedrooms():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
            SELECT DISTINCT bedrooms 
            FROM properties 
            WHERE bedrooms IS NOT NULL 
            ORDER BY bedrooms
        """
        cursor.execute(query)
        bedrooms = [row['bedrooms'] for row in cursor.fetchall()]
        return jsonify(bedrooms)
    except Exception as e:
        print("Error fetching bedrooms:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/bathrooms', methods=['GET'])
def get_bathrooms():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
            SELECT DISTINCT bathrooms 
            FROM properties 
            WHERE bathrooms IS NOT NULL 
            ORDER BY bathrooms
        """
        cursor.execute(query)
        bathrooms = [row['bathrooms'] for row in cursor.fetchall()]
        return jsonify(bathrooms)
    except Exception as e:
        print("Error fetching bathrooms:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        
# Update the image serving route
@app.route('/static/images/property_images/<path:filename>')
def serve_image(filename):
    try:
        return send_from_directory(
            UPLOAD_FOLDER,
            filename,
            as_attachment=False
        )
    except FileNotFoundError:
        # Return default image if requested image not found
        return send_from_directory(
            UPLOAD_FOLDER,
            'default-property.jpg',
            as_attachment=False
        )

@app.route('/submit-new-property', methods=['POST'])
def submit_new_property():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:      
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Extract form data
        form_data = {
            'name': request.form.get('name'),
            'type': request.form.get('type'),
            'bedrooms': request.form.get('bedrooms'),
            'bathrooms': request.form.get('bathrooms'),
            'size': request.form.get('size'),
            'price': request.form.get('price'),
            'latitude': request.form.get('latitude'),
            'longitude': request.form.get('longitude'),
            'area': request.form.get('area'),
            'form_of_interest': request.form.get('form_of_interest'),
            'financing_options': request.form.get('financing_options'),
            'description': request.form.get('description'),
            'furnishing_status': request.form.get('furnishing_status'),
            'facing_direction': request.form.get('facing_direction'),
            'year_built': request.form.get('year_built'),
            'facilities': request.form.get('facilities'),
        }
        
        # Insert into pending_properties
        cursor.execute("""
            INSERT INTO pending_properties 
            (name, type, bedrooms, bathrooms, size, price, latitude, longitude, 
             area, form_of_interest, financing_options, description,
             furnishing_status, facing_direction, year_built, facilities,
             status, submitted_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)
        """, (
            form_data['name'], form_data['type'], form_data['bedrooms'],
            form_data['bathrooms'], form_data['size'], form_data['price'],
            form_data['latitude'], form_data['longitude'], form_data['area'],
            form_data['form_of_interest'], form_data['financing_options'],
            form_data['description'], form_data['furnishing_status'],
            form_data['facing_direction'], form_data['year_built'],
            form_data['facilities'], session['user_id']
        ))
        
        pending_property_id = cursor.lastrowid
        
        # Notify admins about new pending property
        notify_admins_new_pending_property({
            'name': form_data['name'],
            'area': form_data['area']
        })
        
        # Handle image uploads
        if 'images' in request.files:
            images = request.files.getlist('images')
            for image in images:
                if image and allowed_file(image.filename):
                    filename = secure_filename(image.filename)
                    # Add timestamp to filename to ensure uniqueness
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    unique_filename = f"{timestamp}_{filename}"
                    
                    # Ensure upload directory exists
                    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
                    # Save the file
                    image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    image.save(image_path)
                    
                    # Save image record in database
                    cursor.execute("""
                        INSERT INTO property_images 
                        (pending_property_id, image_path) 
                        VALUES (%s, %s)
                    """, (pending_property_id, unique_filename))
                    
        
        conn.commit()
        return jsonify({"message": "Property submitted successfully"}), 201
        
    except Exception as e:
        conn.rollback()
        print(f"Error submitting property: {e}")
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()
        
        
# Get notifications for a user
@app.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    if 'user_id' not in session or session['user_id'] != user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT n.*, p.name as property_name 
            FROM notifications n
            LEFT JOIN properties p ON n.property_id = p.id
            WHERE n.recipient_id = %s 
            ORDER BY n.created_at DESC 
            LIMIT 50
        """, (user_id,))
        
        notifications = cursor.fetchall()
        
        for notification in notifications:
            notification['created_at'] = notification['created_at'].isoformat() if notification['created_at'] else None
        
        return jsonify(notifications)
    finally:
        cursor.close()
        conn.close()

# Mark a notification as read
@app.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = %s AND recipient_id = %s
        """, (notification_id, session['user_id']))
        
        conn.commit()
        return jsonify({"message": "Notification marked as read"})
    finally:
        cursor.close()
        conn.close()

# Mark all notifications as read for a user
@app.route('/notifications/<int:user_id>/mark-all-read', methods=['POST'])
def mark_all_notifications_read(user_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE recipient_id = %s
        """, (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "All notifications marked as read"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

@app.route('/admin/pending-properties', methods=['GET'])
def get_pending_properties():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM pending_properties WHERE status = 'pending'")
    pending_properties = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(pending_properties)

@app.route('/admin/property/<int:id>/approve', methods=['POST'])
@admin_required
def approve_property(id):
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Get pending property first
        cursor.execute("SELECT * FROM pending_properties WHERE id = %s", (id,))
        property_data = cursor.fetchone()
        
        if not property_data:
            return jsonify({"error": "Property not found"}), 404
            
        current_time = datetime.now()
        
        # Insert into properties
        insert_query = """
            INSERT INTO properties 
            (name, type, bedrooms, bathrooms, size, price, latitude, longitude, 
             area, form_of_interest, financing_options, description,
             furnishing_status, facing_direction, year_built, facilities,
             submitted_by, approved_by, status, submitted_at, approved_at, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        insert_values = (
            property_data['name'], property_data['type'], property_data['bedrooms'],
            property_data['bathrooms'], property_data['size'], property_data['price'],
            property_data['latitude'], property_data['longitude'], property_data['area'],
            property_data['form_of_interest'], property_data['financing_options'],
            property_data['description'], property_data['furnishing_status'],
            property_data['facing_direction'], property_data['year_built'],
            property_data['facilities'], property_data.get('submitted_by'),
            session.get('user_id'), 'approved', current_time, current_time, current_time
        )
        
        cursor.execute(insert_query, insert_values)
        new_property_id = cursor.lastrowid
        
        # Handle images
        cursor.execute("""
            UPDATE property_images 
            SET pending_property_id = NULL, 
                property_id = %s 
            WHERE pending_property_id = %s
        """, (new_property_id, id))
        
        # Delete from pending_properties
        cursor.execute("DELETE FROM pending_properties WHERE id = %s", (id,))
        rows_deleted = cursor.rowcount
        
        # Create REN notification directly in the database
        if property_data.get('submitted_by'):
            cursor.execute("""
                INSERT INTO notifications 
                (recipient_id, message, type, property_id, is_read, created_at)
                VALUES (%s, %s, %s, %s, FALSE, NOW())
            """, (
                property_data['submitted_by'],
                f"Your property {property_data['name']} has been approved",
                NotificationType.PROPERTY.value,
                new_property_id
            ))
        
        # Create notifications for matching users
        cursor.execute("""
            INSERT INTO notifications (recipient_id, message, type, property_id, is_read, created_at)
            SELECT 
                u.id,
                %s,
                %s,
                %s,
                FALSE,
                NOW()
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'user'
            AND u.status = 'active'
            AND (
                (p.preferred_area LIKE %s OR p.preferred_area IS NULL)
                AND (p.preferred_property_type = %s OR p.preferred_property_type IS NULL)
                AND (
                    (p.price_range_min IS NULL OR p.price_range_min <= %s)
                    AND (p.price_range_max IS NULL OR p.price_range_max >= %s)
                )
            )
        """, (
            f"New property matching your preferences: {property_data['name']} in {property_data['area']} - RM{float(property_data['price']):,.2f}",
            NotificationType.NEW_LAUNCH.value,
            new_property_id,
            f"%{property_data['area']}%",
            property_data['type'],
            property_data['price'],
            property_data['price']
        ))
        
        # Commit all changes
        conn.commit()
        
        return jsonify({
            "message": "Property approved successfully",
            "property_id": new_property_id,
            "original_id": id,
            "rows_deleted": rows_deleted
        })
        
    except Exception as e:
        conn.rollback()
        print(f"Error in approve_property: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/admin/property/<int:id>/reject', methods=['POST'])
@admin_required
def reject_property(id):
    data = request.json
    reason = data.get('reason', 'No reason provided')
    
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # First check if property exists
        cursor.execute("SELECT * FROM pending_properties WHERE id = %s", (id,))
        property_data = cursor.fetchone()
        
        if not property_data:
            return jsonify({"error": "Property not found"}), 404
        
        # Update property status
        cursor.execute("""
            UPDATE pending_properties 
            SET status = 'rejected',
                rejection_reason = %s,
                rejected_at = %s
            WHERE id = %s
        """, (reason, datetime.now(), id))
        
        # Notify REN about property rejection
        notify_property_rejection(property_data, reason)
        
        conn.commit()
        return jsonify({"message": "Property rejected successfully"})
    except Exception as e:
        conn.rollback()
        print(f"Error in reject_property: {str(e)}")  # Add logging
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/admin/users', methods=['GET'])
@admin_required
def get_users():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)

# CRUD Operations for Properties
# Create a New Property
@app.route('/admin/create-property', methods=['POST'])
@admin_required
def create_property():
    try:
        current_time = datetime.now()
        
        # Extract form data
        form_data = {
            'name': request.form.get('name'),
            'type': request.form.get('type'),
            'bedrooms': request.form.get('bedrooms'),
            'bathrooms': request.form.get('bathrooms'),
            'size': request.form.get('size'),
            'price': request.form.get('price'),
            'latitude': request.form.get('latitude'),
            'longitude': request.form.get('longitude'),
            'area': request.form.get('area'),
            'form_of_interest': request.form.get('form_of_interest'),
            'financing_options': request.form.get('financing_options'),
            'description': request.form.get('description'),
            'furnishing_status': request.form.get('furnishing_status'),
            'facing_direction': request.form.get('facing_direction'),
            'facilities': request.form.get('facilities'),
            'submitted_by': session.get('user_id'),
            'approved_by': session.get('user_id'),
            'status': 'approved',
            'submitted_at': current_time,
            'approved_at': current_time,
            'created_at': current_time,
            'updated_at': current_time
        }

        # Special handling for year_built
        year_built = request.form.get('year_built')
        if year_built and year_built.strip():
            try:
                form_data['year_built'] = int(year_built)
            except ValueError:
                form_data['year_built'] = None
        else:
            form_data['year_built'] = None
        
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Update insert query to include missing fields
        insert_query = """
            INSERT INTO properties 
            (name, type, bedrooms, bathrooms, size, price, latitude, longitude, 
             area, form_of_interest, financing_options, description, furnishing_status,
             facing_direction, year_built, facilities, submitted_by, approved_by,
             status, submitted_at, approved_at, created_at, updated_at)
            VALUES (%(name)s, %(type)s, %(bedrooms)s, %(bathrooms)s, %(size)s, 
                    %(price)s, %(latitude)s, %(longitude)s, %(area)s, 
                    %(form_of_interest)s, %(financing_options)s, %(description)s,
                    %(furnishing_status)s, %(facing_direction)s, %(year_built)s,
                    %(facilities)s, %(submitted_by)s, %(approved_by)s, %(status)s,
                    %(submitted_at)s, %(approved_at)s, %(created_at)s, %(updated_at)s)
        """
        cursor.execute(insert_query, form_data)
        property_id = cursor.lastrowid
        
        # Handle image uploads
        if 'images' in request.files:
            images = request.files.getlist('images')
            for image in images:
                if image and allowed_file(image.filename):
                    filename = secure_filename(image.filename)
                    # Add timestamp to filename to ensure uniqueness
                    timestamp = current_time.strftime('%Y%m%d_%H%M%S')
                    unique_filename = f"{timestamp}_{filename}"
                    
                    # Ensure upload directory exists
                    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                    
                    # Save the file
                    image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    image.save(image_path)
                    
                    # Save image record in database
                    cursor.execute("""
                        INSERT INTO property_images 
                        (property_id, pending_property_id, image_path, created_at)
                        VALUES (%s, NULL, %s, %s)
                    """, (property_id, unique_filename, current_time))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "message": "Property created successfully.",
            "property_id": property_id
        })
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error in create_property: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/admin/property/<int:id>/edit', methods=['GET'])
@admin_required
def get_property(id):
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT * FROM properties WHERE id = %s", (id,))
        property_data = cursor.fetchone()
        
        if not property_data:
            return jsonify({"error": "Property not found"}), 404
            
        # Get property images
        property_data['images'] = fetch_property_images(id)  # Use the renamed helper function here
        
        return jsonify(property_data)
    except Exception as e:
        print(f"Error fetching property: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Update an Existing Property
@app.route('/admin/property/<int:id>/edit', methods=['POST'])
@admin_required
def edit_property(id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Get form data with optional field handling
        name = request.form.get('name', '')
        property_type = request.form.get('type', '')
        bedrooms = request.form.get('bedrooms', None)
        bathrooms = request.form.get('bathrooms', None)
        size = request.form.get('size', None)
        price = request.form.get('price', None)
        latitude = request.form.get('latitude', None)
        longitude = request.form.get('longitude', None)
        area = request.form.get('area', '')
        form_of_interest = request.form.get('form_of_interest', '')
        financing_options = request.form.get('financing_options', '')
        description = request.form.get('description', '')
        furnishing_status = request.form.get('furnishing_status', '')
        facing_direction = request.form.get('facing_direction', '')
        
        # Special handling for year_built
        year_built = request.form.get('year_built', '')
        if year_built in ['', '-', None]:
            year_built = 'NULL'
        else:
            try:
                # Try to convert to integer if it's a valid year
                year_built = int(year_built)
                year_built = str(year_built)
            except ValueError:
                year_built = 'NULL'

        facilities = request.form.get('facilities', '')

        # Update query using direct string formatting
        update_query = f"""
            UPDATE properties 
            SET name = '{name}',
                type = '{property_type}',
                bedrooms = {bedrooms if bedrooms else 'NULL'},
                bathrooms = {bathrooms if bathrooms else 'NULL'},
                size = {size if size else 'NULL'},
                price = {price if price else 'NULL'},
                latitude = {latitude if latitude else 'NULL'},
                longitude = {longitude if longitude else 'NULL'},
                area = '{area}',
                form_of_interest = '{form_of_interest}',
                financing_options = '{financing_options}',
                description = '{description}',
                furnishing_status = '{furnishing_status}',
                facing_direction = '{facing_direction}',
                year_built = {year_built},
                facilities = '{facilities}',
                updated_at = NOW()
            WHERE id = {id}
        """
        
        # Execute the update
        cursor.execute(update_query)

        # Handle existing images
        existing_image_ids = request.form.getlist('existing_images[]')
        if existing_image_ids:
            # Get images to be deleted
            cursor.execute(f"""
                SELECT image_path 
                FROM property_images 
                WHERE property_id = {id} 
                AND id NOT IN ({','.join(existing_image_ids)})
            """)
            images_to_delete = cursor.fetchall()

            # Delete physical files
            for image in images_to_delete:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], image['image_path'])
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")

            # Delete database records
            delete_query = f"""
                DELETE FROM property_images 
                WHERE property_id = {id} 
                AND id NOT IN ({','.join(existing_image_ids)})
            """
            cursor.execute(delete_query)

        # Handle new image uploads if any
        if 'images' in request.files:
            files = request.files.getlist('images')
            for file in files:
                if file and allowed_file(file.filename):
                    # Create unique filename with timestamp
                    original_filename = secure_filename(file.filename)
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    filename = f"{timestamp}_{original_filename}"
                    
                    # Ensure upload directory exists
                    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                    
                    # Save the file
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    
                    # Insert new image record
                    image_query = f"""
                        INSERT INTO property_images 
                        (property_id, image_path, created_at) 
                        VALUES ({id}, '{filename}', NOW())
                    """
                    cursor.execute(image_query)

        conn.commit()
        return jsonify({'message': 'Property updated successfully'}), 200

    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error updating property: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.route('/admin/property/<int:property_id>/image/<int:image_id>/delete', methods=['DELETE'])
@admin_required
def delete_property_image(property_id, image_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # First get the image path
        cursor.execute("""
            SELECT image_path 
            FROM property_images 
            WHERE property_id = %s AND id = %s
        """, (property_id, image_id))
        
        image_record = cursor.fetchone()
        
        if not image_record:
            return jsonify({"error": "Image not found"}), 404
            
        # Delete the physical file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_record['image_path'])
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
        
        # Delete the database record
        cursor.execute("""
            DELETE FROM property_images 
            WHERE property_id = %s AND id = %s
        """, (property_id, image_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Image deleted successfully"})
        
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Error in delete_property_image: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
# Delete a Property
@app.route('/admin/property/<int:id>/delete', methods=['DELETE'])
@admin_required
def delete_property(id):
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("DELETE FROM properties WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Property deleted successfully."})

# Helper function to get property images
def fetch_property_images(property_id):  # Renamed the function here
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT id, image_path, created_at 
            FROM property_images 
            WHERE property_id = %s 
            ORDER BY created_at DESC
        """, (property_id,))
        images = [
            {
                **row,
                'image_url': f"/static/images/property_images/{row['image_path']}"
            }
            for row in cursor.fetchall()
        ]
        return images or []
    except Exception as e:
        print(f"Error getting property images: {str(e)}")
        return []
    finally:
        cursor.close()
        conn.close()
    
@app.route('/admin/property/<int:id>/images', methods=['GET'])
@admin_required
def get_property_images(id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        images = fetch_property_images(id)  # Use the renamed helper function here
        cursor.close()
        conn.close()
        return jsonify(images)
    except Exception as e:
        print(f"Error in get_property_images: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
# Fetch Approved/Rejected Properties
@app.route('/admin/approved-properties', methods=['GET'])
def fetch_approved_properties():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
            SELECT p.*, 
                   STRING_AGG(DISTINCT pi.id::text, \',\') as image_ids,
                   STRING_AGG(DISTINCT pi.image_path::text, \',\') as image_paths,
                   COUNT(DISTINCT pi.id) as image_count
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            GROUP BY p.id
        """
        
        cursor.execute(query)
        properties = cursor.fetchall()
        
        for property in properties:
            if property['image_ids'] and property['image_paths']:
                image_ids = property['image_ids'].split(',')
                image_paths = property['image_paths'].split(',')
                property['images'] = [
                    {
                        'id': int(id.strip()), 
                        'image_path': path.strip()
                    }
                    for id, path in zip(image_ids, image_paths)
                    if id.strip() and path.strip()
                ]
            else:
                property['images'] = [{'id': 0, 'image_path': 'default-property.jpg'}]
            
            # Clean up temporary fields
            del property['image_ids']
            del property['image_paths']
        
        return jsonify(properties)
    except Exception as e:
        print("Error fetching approved properties:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/admin/rejected-properties', methods=['GET'])
def fetch_rejected_properties():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM pending_properties WHERE status='rejected'")
    properties = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(properties)

# Manage User & REN Accounts
# Fetch REN Accounts
@app.route('/admin/rens', methods=['GET'])
@admin_required
def get_rens():
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute("""
            SELECT 
                u.id,
                u.username,
                u.email,
                u.phone,
                u.status,
                u.created_at,
                p.REN_id,
                p.company_name,
                p.verified_status
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.role = 'REN'
            ORDER BY u.created_at DESC
        """)
        
        rens = cursor.fetchall()
        return jsonify(rens)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Add this new endpoint for REN verification
@app.route('/admin/ren/<int:ren_id>/verify', methods=['POST', 'OPTIONS'])
def verify_ren_status(ren_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # First check if user exists and is a REN
        cursor.execute("""
            SELECT u.id, p.verified_status, p.user_id 
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = %s AND u.role = 'REN'
        """, (ren_id,))
        
        ren = cursor.fetchone()
        print("REN data:", ren)  # Debug print
        
        if not ren:
            return jsonify({"error": "REN not found"}), 404
        
        if ren.get('verified_status') == 1:
            return jsonify({"error": "REN already verified"}), 400
            
        # Ensure profile exists
        if ren.get('user_id') is None:
            cursor.execute("""
                INSERT INTO profiles (user_id, verified_status)
                VALUES (%s, 0)
            """, (ren_id,))
            conn.commit()
        
        # Update verification status
        cursor.execute("""
            UPDATE profiles 
            SET verified_status = 1 
            WHERE user_id = %s
        """, (ren_id,))
        
        conn.commit()
        
        return jsonify({"message": "REN successfully verified"})
        
    except Exception as e:
        print("Error in verify_ren_status:", str(e))  # Debug print
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

# Ban User
@app.route('/admin/user/<int:id>/ban', methods=['POST'])
@admin_required
def ban_user(id):
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("UPDATE users SET status='banned' WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "User banned successfully."})

# Create a New REN or User
@app.route('/admin/create-user', methods=['POST'])
@admin_required
def create_user():
    data = request.json
    
    # Required fields
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # 'user' or 'REN'
    phone = data.get('phone', '')
    profile_data = data.get('profile', {})
    
    if not all([username, email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Insert user
        cursor.execute("""
            INSERT INTO users 
            (username, email, password, phone, role, status, created_at) 
            VALUES (%s, %s, %s, %s, %s, 'active', %s)
        """, (username, email, hashed_password, phone, role, datetime.now()))
        
        user_id = cursor.lastrowid
        
        # Insert profile based on role
        if role == 'user':
            cursor.execute("""
                INSERT INTO profiles 
                (user_id, occupation, preferred_area, preferred_property_type, 
                 price_range_min, price_range_max) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user_id, 
                profile_data.get('occupation', ''),
                profile_data.get('preferred_area', ''),
                profile_data.get('preferred_property_type', ''),
                profile_data.get('price_range_min', 0),
                profile_data.get('price_range_max', 0)
            ))
                  
        elif role == 'REN':
            cursor.execute("""
                INSERT INTO profiles 
                (user_id, REN_id, company_name, verified_status) 
                VALUES (%s, %s, %s, %s)
            """, (
                user_id, 
                profile_data.get('REN_id', ''),
                profile_data.get('company_name', ''),
                profile_data.get('verified_status', False)
            ))
        
        conn.commit()
        return jsonify({
            "message": f"{role} created successfully",
            "user_id": user_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# Notification System
# Send Notifications to Admins About New Pending Property
def notify_admins_new_pending_property(property_data):
    """Send notifications to all admin users when a new property is submitted for approval"""
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get all admin users
        cursor.execute("""
            SELECT id 
            FROM users 
            WHERE role = 'admin' 
            AND status = 'active'
        """)
        admin_users = cursor.fetchall()
        
        notification_message = (
            f"New property submission requires approval: {property_data['name']} "
            f"in {property_data['area']}"
        )
        
        # Insert notifications for all admins
        for admin in admin_users:
            create_notification(
                None,  # Will create its own connection
                admin['id'],
                notification_message,
                NotificationType.PROPERTY.value,
                None  # No property_id yet as it's pending
            )
        
        return True
        
    except Exception as e:
        print(f"Error notifying admins: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

# Notify REN About Property Rejection
def notify_property_rejection(property_data, reason):
    """Notify REN about property rejection"""
    try:
        conn = connect_db()
        
        notification_message = (
            f"Your property {property_data['name']} was rejected. "
            f"Reason: {reason}"
        )
        
        create_notification(
            None,  # Will create its own connection
            property_data['submitted_by'],
            notification_message,
            NotificationType.PROPERTY.value
        )
        
        return True
        
    except Exception as e:
        print(f"Error in rejection notification: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

# User Information Endpoints
@app.route('/user-info', methods=['GET'])
def get_user_info():
    """Get user information including their profile data"""
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                u.id,
                u.username,
                u.email,
                u.phone,
                u.role,
                u.status,
                u.created_at,
                p.occupation,
                p.preferred_area,
                p.preferred_property_type,
                p.price_range_min,
                p.price_range_max,
                p.REN_id,
                p.company_name,
                p.verified_status
            FROM users u 
            LEFT JOIN profiles p ON u.id = p.user_id 
            WHERE u.id = %s
        """, (session['user_id'],))
        
        user_info = cursor.fetchone()
        if user_info:
            return jsonify(user_info)
        return jsonify({"error": "User not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

# REN Property Management Endpoints
@app.route('/ren/properties/<int:ren_id>', methods=['GET'])
def get_ren_properties(ren_id):
    """Get all properties (approved, pending, and rejected) for a REN"""
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get approved properties
        cursor.execute("""
            SELECT 
                id,
                name,
                type,
                bedrooms,
                bathrooms,
                size,
                price,
                latitude,
                longitude,
                area,
                form_of_interest,
                financing_options,
                status,
                submitted_at,
                approved_at
            FROM properties 
            WHERE submitted_by = %s 
            AND status = 'approved'
        """, (ren_id,))
        approved_properties = cursor.fetchall()
        
        # Get pending and rejected properties
        cursor.execute("""
            SELECT 
                id,
                name,
                type,
                bedrooms,
                bathrooms,
                size,
                price,
                latitude,
                longitude,
                area,
                form_of_interest,
                financing_options,
                status,
                submitted_by,
                rejection_reason,  
                rejected_at       
            FROM pending_properties 
            WHERE submitted_by = %s 
            AND status IN ('pending', 'rejected')
        """, (ren_id,))
        pending_rejected_properties = cursor.fetchall()
        
        return jsonify({
            "approved_properties": approved_properties,
            "pending_rejected_properties": pending_rejected_properties
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

# Additional helper functions if needed
def verify_ren(ren_id):
    """Verify if a user is a REN and is active"""
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id 
            FROM users 
            WHERE id = %s 
            AND role = 'REN' 
            AND status = 'active'
        """, (ren_id,))
        
        return cursor.fetchone() is not None
        
    except Exception as e:
        print(f"Error verifying REN: {e}")
        return False
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
    
# favorites operations
@app.route('/favorites', methods=['GET'])
@require_login
def get_favorites():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify([]), 401  # Return empty list if not logged in
        
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Modified query to include agent information
        cursor.execute("""
            SELECT p.*,
                   STRING_AGG(DISTINCT pi.image_path::text, \',\') as images,
                   COUNT(DISTINCT pi.id) as image_count,
                   u.username as agent_name,
                   u.phone as agent_phone
            FROM user_favorites uf
            JOIN properties p ON uf.property_id = p.id
            LEFT JOIN property_images pi ON p.id = pi.property_id
            LEFT JOIN users u ON p.submitted_by = u.id
            WHERE uf.user_id = %s
            GROUP BY p.id, u.username, u.phone
        """, (user_id,))
        
        favorites = cursor.fetchall()
        
        # Process each property
        for property in favorites:
            # Process images (keeping your existing image handling)
            if property['images']:
                image_paths = property['images'].split(',')
                property['images'] = [path.strip() for path in image_paths if path.strip()]
            else:
                property['images'] = []
                
            if not property['images']:
                property['images'] = ['default-property.jpg']

            # Add agent information
            property['agent'] = {
                'name': property.pop('agent_name'),
                'phone': property.pop('agent_phone')
            }
        
        return jsonify(favorites)
    except Exception as e:
        print("Error fetching favorites:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/favorites', methods=['POST'])
@require_login
def add_favorite():
    property_id = request.json.get('property_id')
    if not property_id:
        return jsonify({"error": "Property ID is required"}), 400

    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if the favorite already exists
        cursor.execute("""
            SELECT * FROM user_favorites
            WHERE user_id = %s AND property_id = %s
        """, (session['user_id'], property_id))
        existing_favorite = cursor.fetchone()
        
        if existing_favorite:
            return jsonify({"message": "Property is already in favorites"}), 200
        
        # Add new favorite
        cursor.execute("""
            INSERT INTO user_favorites (user_id, property_id)
            VALUES (%s, %s)
        """, (session['user_id'], property_id))
        conn.commit()
        return jsonify({"message": "Property added to favorites"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/favorites/<int:property_id>', methods=['DELETE'])
@require_login
def remove_favorite(property_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Check if the favorite exists before attempting to delete
        cursor.execute("""
            SELECT * FROM user_favorites
            WHERE user_id = %s AND property_id = %s
        """, (session['user_id'], property_id))
        favorite = cursor.fetchone()

        if not favorite:
            return jsonify({"message": "Property is not in favorites"}), 404

        # Remove favorite
        cursor.execute("""
            DELETE FROM user_favorites
            WHERE user_id = %s AND property_id = %s
        """, (session['user_id'], property_id))
        conn.commit()
        return jsonify({"message": "Property removed from favorites"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        
@app.route('/api/properties/<int:property_id>', methods=['GET'])
def get_detail_property(property_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Modified query to include user (agent) information
        query = """
            SELECT p.*, 
                   STRING_AGG(DISTINCT pi.id::text, \',\') as image_ids,
                   STRING_AGG(DISTINCT pi.image_path::text, \',\') as image_paths,
                   COUNT(DISTINCT pi.id) as image_count,
                   u.phone as agent_phone,
                   u.username as agent_name,
                   prof.REN_id as agent_ren_code
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            LEFT JOIN users u ON p.submitted_by = u.id
            LEFT JOIN profiles prof ON u.id = prof.user_id
            WHERE p.id = %s
            GROUP BY p.id, u.username, u.phone, prof.REN_id
        """
        
        cursor.execute(query, (property_id,))
        property = cursor.fetchone()
        
        if property:
            # Process images
            if property['image_ids'] and property['image_paths']:
                # Split the concatenated strings
                image_ids = property['image_ids'].split(',')
                image_paths = property['image_paths'].split(',')
                
                # Create image objects with both ID and path
                property['images'] = [
                    {
                        'id': int(id.strip()),
                        'image_path': path.strip()
                    }
                    for id, path in zip(image_ids, image_paths)
                    if id.strip() and path.strip()
                ]
            else:
                property['images'] = [{'id': 0, 'image_path': 'default-property.jpg'}]
            
            # Add agent contact info
            property['agent'] = {
                'name': property.pop('agent_name'),
                'ren_code': property.pop('agent_ren_code'),
                'phone': property.pop('agent_phone')
            }
            
            # Clean up temporary fields
            del property['image_ids']
            del property['image_paths']
            del property['image_count']
            
            return jsonify(property)
        else:
            return jsonify({"error": "Property not found"}), 404
            
    except Exception as e:
        print("Error fetching property:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/recommended-properties', methods=['GET'])
@require_login
def get_recommended_properties():
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # First get user preferences
        cursor.execute("""
            SELECT preferred_area, preferred_property_type, 
                   price_range_min, price_range_max
            FROM profiles
            WHERE user_id = %s
        """, (session['user_id'],))
        
        user_preferences = cursor.fetchone()
        
        if not user_preferences:
            return jsonify({"error": "User preferences not found"}), 404

        # Query properties matching user preferences
        query = """
            SELECT p.*, 
                   STRING_AGG(DISTINCT pi.image_path::text, \',\') as images,
                   COUNT(DISTINCT pi.id) as image_count,
                   u.username as agent_name,
                   u.phone as agent_phone
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            LEFT JOIN users u ON p.submitted_by = u.id
            WHERE 1=1
        """
        params = []

        # Add preference filters
        if user_preferences['preferred_area']:
            query += " AND p.area LIKE %s"
            params.append(f"%{user_preferences['preferred_area']}%")

        if user_preferences['preferred_property_type']:
            query += " AND p.type = %s"
            params.append(user_preferences['preferred_property_type'])

        if user_preferences['price_range_min']:
            query += " AND p.price >= %s"
            params.append(user_preferences['price_range_min'])

        if user_preferences['price_range_max']:
            query += " AND p.price <= %s"
            params.append(user_preferences['price_range_max'])

        # Add grouping and status condition
        query += " AND p.status = 'approved' GROUP BY p.id, u.username, u.phone"

        cursor.execute(query, params)
        properties = cursor.fetchall()

        # Process the results
        for property in properties:
            # Process images
            if property['images']:
                image_paths = property['images'].split(',')
                property['images'] = [path.strip() for path in image_paths if path.strip()]
            else:
                property['images'] = ['default-property.jpg']

            # Add agent information
            property['agent'] = {
                'name': property.pop('agent_name'),
                'phone': property.pop('agent_phone')
            }

            # Remove count field
            if 'image_count' in property:
                del property['image_count']

        return jsonify({
            "preferences": user_preferences,
            "recommended_properties": properties
        })

    except Exception as e:
        print("Error getting recommended properties:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        
        
# Add these routes to your app.py

@app.route('/user-profile/<int:user_id>', methods=['GET'])
@require_login
def get_user_profile(user_id):
    # Verify the requesting user is accessing their own profile
    if session.get('user_id') != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Different queries based on user role
        base_query = """
            SELECT u.id, u.username as name, u.email, u.phone, u.role, u.status
            FROM users u
            WHERE u.id = %s
        """
        
        cursor.execute(base_query, (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({"error": "User not found"}), 404
            
        # Get additional profile data based on role
        if user_data['role'] == 'user':
            cursor.execute("""
                SELECT occupation, preferred_area as preferredArea,
                       preferred_property_type as propertyType,
                       price_range_min as minPriceRange,
                       price_range_max as maxPriceRange
                FROM profiles
                WHERE user_id = %s
            """, (user_id,))
            profile_data = cursor.fetchone()
            if profile_data:
                user_data.update(profile_data)
                
        elif user_data['role'] == 'REN':
            cursor.execute("""
                SELECT REN_id as renCode, company_name as companyName,
                       verified_status as verifiedStatus
                FROM profiles
                WHERE user_id = %s
            """, (user_id,))
            profile_data = cursor.fetchone()
            if profile_data:
                user_data.update(profile_data)
        
        return jsonify(user_data)
        
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/update-profile/<int:user_id>', methods=['PUT'])
@require_login
def update_user_profile(user_id):
    # Verify the requesting user is updating their own profile
    if session.get('user_id') != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    try:
        data = request.json
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Update basic user information
        cursor.execute("""
            UPDATE users 
            SET username = %s,
                email = %s,
                phone = %s
            WHERE id = %s
        """, (data.get('name'), data.get('email'), data.get('phone'), user_id))
        
        # Get user role
        cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        user_role = cursor.fetchone()[0]
        
        # Update role-specific profile information
        if user_role == 'user':
            cursor.execute("""
                UPDATE profiles 
                SET occupation = %s,
                    preferred_area = %s,
                    preferred_property_type = %s,
                    price_range_min = %s,
                    price_range_max = %s
                WHERE user_id = %s
            """, (
                data.get('occupation'),
                data.get('preferredArea'),
                data.get('propertyType'),
                data.get('minPriceRange'),
                data.get('maxPriceRange'),
                user_id
            ))
            
        elif user_role == 'REN':
            cursor.execute("""
                UPDATE profiles 
                SET company_name = %s,
                    REN_id = %s
                WHERE user_id = %s
            """, (
                data.get('companyName'),
                data.get('renCode'),
                user_id
            ))
        
        conn.commit()
        return jsonify({"message": "Profile updated successfully"})
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating user profile: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()
        
        
# Configure OpenAI
openai.api_key = Config.OPENAI_API_KEY

# Initialize the AsyncOpenAI client
client = AsyncOpenAI(api_key=Config.OPENAI_API_KEY)

class PropertyAIAssistant:
    def __init__(self):
        self.model = Config.OPENAI_MODEL
        self.system_prompt = """
        You are a property assistant that helps users with property information and loan calculations.
        For loan calculations, you must use the exact 'DSR method' and 'Household Income-Based Loan Calculator' from the system.
        When users ask about the number of properties, use the provided property count from the database.
        When users ask about specific properties or prices, provide detailed information from the database.
        
        Important Guidelines:
        1. If user mentions previous information that isn't in the current message, refer to chat history first.
        2. For loan calculations, clearly state what information you need if anything is missing.
        3. Always be explicit about what information you're using for calculations.
        4. If you're unsure about context, ask for clarification.
        
        Important: Provide responses in plain text only. Do not include HTML tags or styling.
        For lists, use simple dashes (-) or numbers (1., 2., etc.).
        """
    
    async def generate_response(self, user_input, user_context=None, chat_history=None):
        try:
            conn = connect_db()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            property_context = ""

            # Add new comparison functionality - add this before your existing area search code
            if "compare" in user_input.lower():
                property_names = []
                if "'" in user_input or '"' in user_input:
                    property_names = re.findall(r'[\'\"](.*?)[\'\"]', user_input)
                else:
                    # Split by 'and' and clean up the names
                    parts = user_input.lower().replace('compare', '').replace('the', '').split(' and ')
                    property_names = [part.strip() for part in parts if part.strip()]

                if property_names:
                    properties_data = []
                    for name in property_names:
                        # Make the search more flexible by using wildcards and removing 'the'
                        search_name = name.lower().replace('the', '').strip()
                        cursor.execute("""
                            SELECT p.*, 
                                   u.username as agent_name,
                                   u.phone as agent_contact
                            FROM properties p
                            LEFT JOIN users u ON p.submitted_by = u.id
                            WHERE p.status = 'approved'
                            AND (
                                LOWER(p.name) LIKE %s 
                                OR LOWER(p.name) LIKE %s
                                OR LOWER(p.name) LIKE %s
                            )
                        """, (
                            f"%{search_name}%",
                            f"{search_name}%",
                            f"%{search_name}"
                        ))
                        prop = cursor.fetchone()
                        if prop:
                            properties_data.append(prop)
                        else:
                            # If no exact match found, get similar names for suggestion
                            cursor.execute("""
                                SELECT DISTINCT name 
                                FROM properties 
                                WHERE status = 'approved'
                                AND LOWER(name) LIKE %s
                                LIMIT 5
                            """, (f"%{search_name}%",))
                            similar_names = [row['name'] for row in cursor.fetchall()]
                            if similar_names:
                                property_context = f"""
                                I couldn't find an exact match for '{name}'. 
                                Did you mean one of these properties?
                                - {chr(10).join(similar_names)}
                                
                                Please try comparing again with the exact property names.
                                """
                                break

            # Add property detail search - add this before your existing area search code
            elif any(word in user_input.lower() for word in ['show', 'detail', 'about']):
                property_name = user_input.lower()
                for word in ['show', 'detail', 'about', 'property', 'me', 'the']:
                    property_name = property_name.replace(word, '')
                property_name = property_name.strip()

                if property_name:
                    cursor.execute("""
                        SELECT p.*, 
                               u.username as agent_name,
                               u.phone as agent_contact
                        FROM properties p
                        LEFT JOIN users u ON p.submitted_by = u.id
                        WHERE p.status = 'approved'
                        AND LOWER(p.name) LIKE %s
                    """, (f"%{property_name}%",))
                    
                    property_data = cursor.fetchone()
                    if property_data:
                        property_context = f"""
                        Details for {property_data['name']}:
                        - Type: {property_data['type']}
                        - Price: RM{float(property_data['price']):,.2f}
                        - Area: {property_data['area']}
                        - Size: {property_data['size']} sq ft
                        - Bedrooms: {property_data['bedrooms']}
                        - Bathrooms: {property_data['bathrooms']}
                        - Furnishing: {property_data['furnishing_status']}
                        - Form of Interest: {property_data['form_of_interest']}
                        - Facilities: {property_data['facilities']}
                        - Year Built: {property_data['year_built']}
                        - Description: {property_data['description']}
                        - Agent: {property_data['agent_name']} ({property_data['agent_contact']})
                        """

            # Add loan calculation handling
            elif "loan calculation" in user_input.lower() or "calculate loan" in user_input.lower():
                numbers = re.findall(r'[\d,.]+', user_input)
                
                # Check if it's specifically Household Income-Based calculation
                if "household" in user_input.lower() and len(numbers) >= 1:
                    try:
                        monthly_income = float(numbers[0].replace(',', ''))
                        
                        # Household Income-Based Calculation with default values
                        annual_income = monthly_income * 12
                        thirty_percent_annual = annual_income * 0.3
                        
                        # Default to 35 years
                        loan_term = 35
                        multiplier = 17.4610
                        
                        max_loan_household = thirty_percent_annual * multiplier
                        
                        property_context = f"""
                        Household Income-Based Loan Calculator Results:
                        
                        Input:
                        - Monthly Income: RM{monthly_income:,.2f}
                        - Annual Income: RM{annual_income:,.2f}
                        - 30% of Annual Income: RM{thirty_percent_annual:,.2f}
                        
                        Calculation:
                        - Loan Term: {loan_term} years (default)
                        - Multiplier: {multiplier}
                        
                        Result:
                        Maximum Loan Amount: RM{round(max_loan_household):,.2f}
                        
                        Note: This calculation uses the default 35-year loan tenure for maximum eligibility.
                        Actual loan amounts may vary based on other factors and bank policies.
                        """
                    except Exception as e:
                        print(f"Error in household loan calculation: {str(e)}")
                        property_context = """
                        Please provide your monthly income in this format:
                        Calculate loan with monthly income RM[amount] with the Household Income-Based Loan Calculator
                        """
                
                # Original DSR calculation remains unchanged
                elif len(numbers) >= 4:
                    try:
                        # DSR Method
                        monthly_income = float(numbers[0].replace(',', ''))
                        monthly_debts = float(numbers[1].replace(',', ''))
                        interest_rate = float(numbers[2].replace(',', ''))
                        loan_term = float(numbers[3].replace(',', ''))
                        
                        # DSR Calculation
                        monthly_rate = interest_rate / 100 / 12
                        number_of_payments = loan_term * 12
                        max_dsr = 0.60
                        total_allowable = monthly_income * max_dsr
                        available_for_loan = total_allowable - monthly_debts
                        max_loan_dsr = available_for_loan * (
                            (pow(1 + monthly_rate, number_of_payments) - 1) /
                            (monthly_rate * pow(1 + monthly_rate, number_of_payments))
                        )
                        current_dsr = (monthly_debts / monthly_income) * 100
                        
                        # Household Income-Based Calculation
                        annual_income = monthly_income * 12
                        thirty_percent_annual = annual_income * 0.3
                        
                        # Set multiplier based on loan term
                        multiplier = {
                            25: 14.8282,
                            30: 16.2889,
                            35: 17.4610
                        }.get(int(loan_term), 14.8282)
                        
                        max_loan_household = thirty_percent_annual * multiplier
                        
                        property_context = f"""
                        Loan Calculation Results:
                        
                        1. DSR Method Results:
                        - Maximum Loan Amount: RM{round(max_loan_dsr):,.2f}
                        - Current DSR: {round(current_dsr)}%
                        - Eligibility Status: {'Eligible' if current_dsr <= 60 else 'Not Eligible'}
                        
                        2. Household Income-Based Method Results (Separate Calculation):
                        - Maximum Loan Amount: RM{round(max_loan_household):,.2f}
                        - Based on {loan_term}-year loan term
                        - Using {multiplier:.4f} multiplier
                        
                        Recommendation:
                        The two methods provide different perspectives on loan eligibility:
                        - DSR Method shows your maximum theoretical loan amount based on monthly debt servicing ability
                        - Household Income-Based Method provides a more conservative estimate focused on long-term sustainability
                        
                        For financial prudence, consider using the lower amount of the two calculations:
                        RM{round(min(max_loan_dsr, max_loan_household)):,.2f}
                        """
                    except Exception as e:
                        print(f"Error in loan calculation: {str(e)}")
                        property_context = """
                        Please provide the required information in this format:
                        Calculate loan with:
                        - Monthly Income: RM[amount]
                        - Monthly Debts: RM[amount]
                        - Interest Rate: [rate]%
                        - Loan Term: [years]
                        """
                else:
                    property_context = """
                    For DSR Method calculation, please provide:
                    - Monthly Income
                    - Monthly Debts
                    - Interest Rate
                    - Loan Term (in years)
                    
                    OR
                    
                    For Household Income-Based calculation, simply provide:
                    - Monthly Income
                    
                    Example 1 (DSR): "Calculate loan with monthly income RM5000, monthly debts RM1000, interest rate 4.5%, loan term 30 years"
                    Example 2 (Household): "Calculate loan with monthly income RM5000 with the Household Income-Based Loan Calculator"
                    """

            # Add area search section
            area_search_terms = ["in", "at", "near", "around", "area"]
            area_mentioned = any(term in user_input.lower() for term in area_search_terms)
            
            if area_mentioned:
                search_text = user_input.lower()
                for word in ["find", "house", "property", "in", "at", "near", "around", "area", "suggest", "me", "any"]:
                    search_text = search_text.replace(word, "")
                
                search_area = search_text.strip()
                
                if search_area:
                    cursor.execute("""
                        SELECT p.*, 
                               u.username as agent_name,
                               u.phone as agent_contact
                        FROM properties p
                        LEFT JOIN users u ON p.submitted_by = u.id
                        WHERE p.status = 'approved'
                        AND LOWER(p.area) LIKE %s
                    """, (f"%{search_area}%",))
                    
                    area_properties = cursor.fetchall()
                    
                    if area_properties:
                        property_context = f"I found {len(area_properties)} properties in {search_area.title()}:\n\n"
                        for prop in area_properties:
                            property_context += f"""
                            Property: {prop['name']}
                            - Type: {prop['type']}
                            - Price: RM{float(prop['price']):,.2f}
                            - Bedrooms: {prop['bedrooms']}
                            - Bathrooms: {prop['bathrooms']}
                            - Size: {prop['size']} sq ft
                            - Form of Interest: {prop['form_of_interest']}
                            - Furnishing Status: {prop['furnishing_status']}
                            - Agent: {prop['agent_name']} ({prop['agent_contact']})
                            
                            """
                    else:
                        cursor.execute("""
                            SELECT DISTINCT area 
                            FROM properties 
                            WHERE status = 'approved'
                            ORDER BY area
                        """)
                        available_areas = [row['area'] for row in cursor.fetchall()]
                        
                        property_context = f"""
                        I couldn't find any properties in {search_area.title()}. 
                        
                        Here are the areas where we currently have properties available:
                        {', '.join(available_areas)}
                        
                        Would you like to see properties in any of these areas instead?
                        """

            # Continue with property stats
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_properties,
                    COUNT(DISTINCT area) as total_areas,
                    COUNT(DISTINCT type) as property_types,
                    MIN(price) as min_price,
                    MAX(price) as max_price,
                    AVG(price) as avg_price
                FROM properties 
                WHERE status = 'approved'
            """)
            property_stats = cursor.fetchone()

            # Get specific property details if price is mentioned
            if "RM" in user_input or "price" in user_input.lower():
                try:
                    # Extract price from user input (assuming format like "RM100,000.00")
                    price_str = user_input.split("RM")[1].split()[0].replace(",", "")
                    price = float(price_str)
                    
                    cursor.execute("""
                        SELECT p.*, 
                               u.username as agent_name,
                               u.phone as agent_contact
                        FROM properties p
                        LEFT JOIN users u ON p.submitted_by = u.id
                        WHERE p.status = 'approved'
                        AND p.price = %s
                    """, (price,))
                    
                    specific_properties = cursor.fetchall()
                    
                    if specific_properties:
                        property_details = []
                        for prop in specific_properties:
                            details = f"""
                            Property: {prop['name']}
                            - Type: {prop['type']}
                            - Area: {prop['area']}
                            - Price: RM{prop['price']:,.2f}
                            - Bedrooms: {prop['bedrooms']}
                            - Bathrooms: {prop['bathrooms']}
                            - Size: {prop['size']} sq ft
                            - Form of Interest: {prop['form_of_interest']}
                            - Furnishing Status: {prop['furnishing_status']}
                            - Agent: {prop['agent_name']} ({prop['agent_contact']})
                            """
                            property_details.append(details)
                        
                        property_context = "\n".join(property_details)
                    else:
                        property_context = f"No properties found at exactly RM{price:,.2f}. Would you like to see properties in a similar price range?"
                except:
                    property_context = "Please specify the price in the format 'RM100,000.00'"
                    
            # Get type-specific information if type is mentioned
            elif "type" in user_input.lower():
                cursor.execute("""
                    SELECT 
                        type,
                        COUNT(*) as count,
                        MIN(price) as min_price,
                        MAX(price) as max_price,
                        STRING_AGG(DISTINCT area::text, \',\') as areas
                    FROM properties
                    WHERE status = 'approved'
                    GROUP BY type
                """)
                type_data = cursor.fetchall()
                
                property_context = "Here are the available property types:\n\n"
                for t in type_data:
                    # Format property count text
                    count_text = "property" if t['count'] == 1 else "properties"
                    
                    # Format price range
                    if t['min_price'] == t['max_price']:
                        price_text = f"RM{t['min_price']:,.2f}"
                    else:
                        price_text = f"RM{t['min_price']:,.2f} to RM{t['max_price']:,.2f}"
                    
                    # Build the property type entry with better spacing
                    property_context += f"""- {t['type']}:
                    • {t['count']} {count_text}
                    • Price Range: {price_text}
                    • Available in: {t['areas']}

                    """

            # Create messages array with chat history and context
            messages = [
                {"role": "system", "content": self.system_prompt},
            ]
            
            # Add chat history if available (before the database context)
            if chat_history:
                for msg in chat_history[-5:]:  # Only use last 5 messages for context
                    messages.append({
                        "role": "user" if msg["isUser"] else "assistant",  # Changed from type to isUser
                        "content": msg["message"]  # Changed from content to message
                    })

            # Add database context
            messages.append({
                "role": "system", 
                "content": f"""
                    Database Information:
                    - Total Properties: {property_stats['total_properties']}
                    - Price Range: RM{property_stats['min_price']:,.2f} to RM{property_stats['max_price']:,.2f}
                    - Average Price: RM{property_stats['avg_price']:,.2f}

                    {property_context}
                """
            })
            
            # Add user context if available
            if user_context:
                context_str = ", ".join(f"{k}: {v}" for k, v in user_context.items())
                messages.append({
                    "role": "system", 
                    "content": f"Additional Context: {context_str}"
                })
            
            # Add current user input
            messages.append({"role": "user", "content": user_input})
            
            response = await client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                "status": "success",
                "response": response.choices[0].message.content
            }
            
        except Exception as e:
            print(f"Error in generate_response: {str(e)}")
            return {
                "status": "error",
                "message": "An error occurred while processing your request"
            }
        finally:
            cursor.close()
            conn.close()

# 1. Add the async route wrapper
from flask import current_app

def async_route(route_function):
    def wrapper(*args, **kwargs):
        return asyncio.run(route_function(*args, **kwargs))
    wrapper.__name__ = route_function.__name__
    return wrapper

# 2. Update your async routes with the wrapper
@app.route('/api/chat', methods=['POST', 'OPTIONS'])
@async_route
async def chat():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        user_input = data.get('message')
        chat_history = data.get('history', [])  # Get history from frontend
        user_context = data.get('context', {})
        
        if not user_input:
            return jsonify({
                "status": "error",
                "message": "Message is required"
            }), 400
        
        assistant = PropertyAIAssistant()
        # Pass chat history to generate_response
        result = await assistant.generate_response(user_input, user_context, chat_history)
        
        return jsonify({
            "status": "success",
            "response": result["response"]
        })
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred processing your request"
        }), 500

@app.route('/api/compare-properties', methods=['POST'])
@async_route
async def compare_properties():
    try:
        data = request.json
        property_ids = data.get('propertyIds', [])
        
        if not property_ids:
            return jsonify({"error": "No properties provided"}), 400
            
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Initialize user_preferences
        user_preferences = None
        
        # Get user preferences if logged in
        if 'user_id' in session:
            cursor.execute("""
                SELECT preferred_area, preferred_property_type, 
                       price_range_min, price_range_max
                FROM profiles
                WHERE user_id = %s
            """, (session['user_id'],))
            user_preferences = cursor.fetchone()
        
        # Get properties details
        placeholders = ', '.join(['%s'] * len(property_ids))
        cursor.execute(f"""
            SELECT *
            FROM properties
            WHERE id IN ({placeholders})
        """, property_ids)
        
        properties = cursor.fetchall()
        
        # Calculate analysis results based on login status
        analysis_results = []
        if user_preferences:
            # Analysis for logged-in users with preferences
            for property in properties:
                matches = []
                total_criteria = 0
                matched_criteria = 0
                
                # Area match
                if user_preferences['preferred_area']:
                    total_criteria += 1
                    if property['area'].lower() == user_preferences['preferred_area'].lower():
                        matched_criteria += 1
                        matches.append({
                            'feature': 'area',
                            'matches': True,
                            'explanation': f"Area matches your preference: {property['area']}"
                        })
                    else:
                        matches.append({
                            'feature': 'area',
                            'matches': False,
                            'explanation': f"Area differs from your preference: {property['area']}"
                        })
                
                # Property type match
                if user_preferences['preferred_property_type']:
                    total_criteria += 1
                    if property['type'].lower() == user_preferences['preferred_property_type'].lower():
                        matched_criteria += 1
                        matches.append({
                            'feature': 'type',
                            'matches': True,
                            'explanation': f"Property type matches your preference: {property['type']}"
                        })
                    else:
                        matches.append({
                            'feature': 'type',
                            'matches': False,
                            'explanation': f"Property type differs from your preference: {property['type']}"
                        })
                
                # Price range match
                if user_preferences['price_range_min'] is not None and user_preferences['price_range_max'] is not None:
                    total_criteria += 1
                    if (property['price'] >= user_preferences['price_range_min'] and 
                        property['price'] <= user_preferences['price_range_max']):
                        matched_criteria += 1
                        matches.append({
                            'feature': 'price',
                            'matches': True,
                            'explanation': f"Price (RM{property['price']:,.2f}) is within your preferred range"
                        })
                    else:
                        matches.append({
                            'feature': 'price',
                            'matches': False,
                            'explanation': f"Price (RM{property['price']:,.2f}) is outside your preferred range"
                        })
                
                match_percentage = (matched_criteria / total_criteria * 100) if total_criteria > 0 else 0
                
                analysis_results.append({
                    'property_id': property['id'],
                    'match_percentage': round(match_percentage, 2),
                    'matches': matches
                })
        else:
            # Analysis for visitors (without preferences)
            for property in properties:
                # Convert Decimal to float before division
                price = float(property['price'])
                size = float(property['size']) if property['size'] else None
                
                # Calculate price per square foot
                price_per_sqft = round(price / size, 2) if size else None
                
                # Analyze features
                features_analysis = {
                    'price_per_sqft': {
                        'value': price_per_sqft,
                        'explanation': f"RM{price_per_sqft:,.2f} per sq ft" if price_per_sqft else "Not available"
                    },
                    'facilities': {
                        'value': property['facilities'],
                        'explanation': "Available amenities: " + (property['facilities'] or "None listed")
                    },
                    'location': {
                        'value': property['area'],
                        'explanation': f"Located in {property['area']}"
                    },
                    'property_details': {
                        'value': f"{property['bedrooms']} bed, {property['bathrooms']} bath",
                        'explanation': f"{property['size']} sq ft, {property['furnishing_status']} furnished"
                    }
                }
                
                analysis_results.append({
                    'property_id': property['id'],
                    'features_analysis': features_analysis,
                    'general_comparison': True
                })
        
        # Modify AI prompt based on login status
        ai_prompt = (
            "Compare these properties " +
            ("based on the user's preferences" if user_preferences else "objectively") +
            ". Analyze the following aspects:\n" +
            "1. Price per square foot and overall value\n" +
            "2. Location benefits and accessibility\n" +
            "3. Property features and amenities\n" +
            "4. Investment potential\n" +
            "Conclude with which property offers the best value for money."
        )
        
        # Add debug logging
        print("Login status:", 'user_id' in session)
        print("Has preferences:", user_preferences is not None)
        print("Using prompt:", ai_prompt)
        
        assistant = PropertyAIAssistant()
        properties_context = {
            'properties': properties,
            'user_preferences': user_preferences,
            'analysis_results': analysis_results,
            'is_logged_in': 'user_id' in session
        }
        
        ai_analysis = await assistant.generate_response(ai_prompt, properties_context)
        
        return jsonify({
            'analysis_results': analysis_results,
            'ai_insights': ai_analysis['response'] if ai_analysis['status'] == 'success' else None,
            'has_preferences': user_preferences is not None
        })
        
    except Exception as e:
        print(f"Error in compare_properties: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    config = HypercornConfig()
    config.bind = ["0.0.0.0:5000"]
    config.use_reloader = True  # This enables debug-like reloading
    asyncio.run(serve(WsgiToAsgi(app), config))
