from flask import Flask, jsonify, request, session, redirect, url_for, render_template
from flask_bcrypt import Bcrypt  # For hashing passwords
from flask_cors import CORS
from functools import wraps
from flask import abort
from datetime import datetime
from enum import Enum
import mysql.connector

app = Flask(__name__)
app.secret_key = "WW15257Z!"  # Use a secret key for session management
bcrypt = Bcrypt(app)
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)  # Enable CORS for all routes

class NotificationType(Enum):
    NEW_LAUNCH = 'new_launch'
    INQUIRY_RESPONSE = 'inquiry_response'
    PROPERTY = 'property'
    SYSTEM = 'system'
    
# Database connection setup
def connect_db():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",  # Replace with your MySQL username
        password="WW15257Z",  # Replace with your MySQL password
        database="property_db"  # Make sure this is the correct database name
    )
    return conn

@app.route('/')
def home():
    return "Welcome to the Property Buying Decision System API"

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'admin':
            abort(403)  # Send a 403 Forbidden response
        return f(*args, **kwargs)
    return decorated_function

# Utility function to create notifications
def create_notification(conn, recipient_id, message, notification_type, property_id=None):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO notifications 
            (recipient_id, message, type, property_id, is_read, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (recipient_id, message, notification_type, property_id, False, datetime.now()))
        
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error creating notification: {e}")
        conn.rollback()
        return None
    finally:
        cursor.close()
        
# Get notifications for a user
@app.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT n.*, p.name as property_name 
            FROM notifications n
            LEFT JOIN properties p ON n.property_id = p.id
            WHERE n.recipient_id = %s 
            ORDER BY n.created_at DESC 
            LIMIT 50
        """, (user_id,))
        
        notifications = cursor.fetchall()
        
        # Handle empty notifications gracefully
        if not notifications:
            return jsonify([])
        
        # Convert datetime objects to string for JSON serialization
        for notification in notifications:
            notification['created_at'] = notification['created_at'].isoformat() if notification['created_at'] else None
        
        return jsonify(notifications)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Mark a notification as read
@app.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = %s
        """, (notification_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Notification marked as read"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Mark all notifications as read for a user
@app.route('/notifications/<int:user_id>/mark-all-read', methods=['POST'])
def mark_all_notifications_read(user_id):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
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
    
# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # user or REN
    ren_code = data.get('renCode') if role == 'REN' else None

    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Connect to DB and insert user data
    conn = connect_db()
    cursor = conn.cursor()

    try:
        # Insert user details
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
            (name, email, hashed_password, role)
        )
        user_id = cursor.lastrowid

        # Insert profile details based on role
        if role == 'user':
            occupation = data.get('occupation', '')
            preferred_area = data.get('preferredArea', '')
            property_type = data.get('propertyType', '')
            price_range = data.get('priceRange', '').split('-')
            price_min = float(price_range[0]) if len(price_range) > 0 else 0
            price_max = float(price_range[1]) if len(price_range) > 1 else 0

            cursor.execute(
                "INSERT INTO profiles (user_id, occupation, preferred_area, preferred_property_type, price_range_min, price_range_max) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, occupation, preferred_area, property_type, price_min, price_max)
            )
        elif role == 'REN':
            cursor.execute(
                "INSERT INTO profiles (user_id, REN_id) VALUES (%s, %s)",
                (user_id, ren_code)
            )

        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": str(err)}), 400
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
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user['password'], password):
            # Store user info in session
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            return jsonify({"message": "Login successful", "role": user['role']}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"message": "An error occurred during login"}), 500
    finally:
        cursor.close()
        conn.close()
    
@app.route('/search', methods=['GET'])
def search_properties():
    # Get filter parameters from the query string
    area = request.args.get('area', '')
    min_price = request.args.get('minPrice', 0)
    max_price = request.args.get('maxPrice', 9999999999)
    property_type = request.args.get('propertyType', '')
    rooms = request.args.get('rooms', '')
    financing_option = request.args.get('financingOption', '')
    form_of_interest = request.args.get('formOfInterest', '')

    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    # Base query
    query = "SELECT * FROM properties WHERE price BETWEEN %s AND %s"
    params = [min_price, max_price]

    # Apply area filter if provided
    if area:
        query += " AND area LIKE %s"
        params.append(f"%{area}%")

    # Apply property type filter if provided
    if property_type:
        query += " AND type = %s"
        params.append(property_type)

    # Apply rooms filter if provided
    if rooms:
        query += " AND rooms = %s"
        params.append(rooms)

    # Apply financing option filter if provided
    if financing_option:
        query += " AND financing_options LIKE %s"
        params.append(f"%{financing_option}%")
    
    if form_of_interest:
        query += " AND form_of_interest = %s"
        params.append(form_of_interest)

    cursor.execute(query, params)
    properties = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(properties)

@app.route('/submit-new-property', methods=['POST'])
def submit_new_property():
    data = request.json
    name = data.get('name')
    property_type = data.get('type')
    bedrooms = data.get('bedrooms')
    bathrooms = data.get('bathrooms')
    size = data.get('size')
    price = data.get('price')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    area = data.get('area')
    form_of_interest = data.get('form_of_interest')
    financing_options = data.get('financing_options')
    submitted_by = session.get('user_id')  # Assume REN is logged in and this session info is set

    conn = connect_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO pending_properties 
            (name, type, bedrooms, bathrooms, size, price, latitude, longitude, area, form_of_interest, financing_options, submitted_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (name, property_type, bedrooms, bathrooms, size, price, latitude, longitude, area, form_of_interest, financing_options, submitted_by))
        conn.commit()
        return jsonify({"message": "Property submitted successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/admin/pending-properties', methods=['GET'])
def get_pending_properties():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM pending_properties WHERE status = 'pending'")
    pending_properties = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(pending_properties)

@app.route('/admin/property/<int:id>/approve', methods=['POST'])
@admin_required
def approve_property(id):
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        # Get property data
        cursor.execute("SELECT * FROM pending_properties WHERE id = %s", (id,))
        property_data = cursor.fetchone()
        
        if not property_data:
            return jsonify({"error": "Property not found"}), 404
            
        # Insert into properties table
        cursor.execute("""
            INSERT INTO properties 
            (name, type, bedrooms, bathrooms, size, price, latitude, longitude, area, 
             form_of_interest, financing_options)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            property_data['name'], property_data['type'], property_data['bedrooms'],
            property_data['bathrooms'], property_data['size'], property_data['price'],
            property_data['latitude'], property_data['longitude'], property_data['area'],
            property_data['form_of_interest'], property_data['financing_options']
        ))
        
        new_property_id = cursor.lastrowid
        property_data['id'] = new_property_id  # Add ID for notification
        
        # Delete from pending_properties
        cursor.execute("DELETE FROM pending_properties WHERE id = %s", (id,))
        
        # Send notifications
        notify_users_and_rens_new_launch(property_data)
        
        conn.commit()
        return jsonify({"message": "Property approved and notifications sent"}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/admin/property/<int:id>/reject', methods=['POST'])
@admin_required
def reject_property(id):
    data = request.json
    reason = data.get('reason')
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE pending_properties SET status = 'rejected', reason = %s WHERE id = %s", (reason, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Property rejected successfully."})

@app.route('/admin/users', methods=['GET'])
@admin_required
def get_users():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
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
    data = request.json
    name = data.get('name')
    type = data.get('type')
    bedrooms = data.get('bedrooms')
    bathrooms = data.get('bathrooms')
    size = data.get('size')
    price = data.get('price')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    area = data.get('area')
    form_of_interest = data.get('form_of_interest')
    financing_options = data.get('financing_options')
    
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO properties (name, type, bedrooms, bathrooms, size, price, latitude, longitude, area, form_of_interest, financing_options)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (name, type, bedrooms, bathrooms, size, price, latitude, longitude, area, form_of_interest, financing_options))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Property created successfully."})

# Update an Existing Property
@app.route('/admin/property/<int:id>/edit', methods=['POST'])
@admin_required
def edit_property(id):
    data = request.json
    name = data.get('name')
    # Similar to above, collect other fields
    
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE properties SET name=%s, ... WHERE id=%s
    """, (name, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Property updated successfully."})

# Delete a Property
@app.route('/admin/property/<int:id>/delete', methods=['DELETE'])
@admin_required
def delete_property(id):
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM properties WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Property deleted successfully."})

# Fetch Approved/Rejected Properties
@app.route('/admin/approved-properties', methods=['GET'])
def fetch_approved_properties():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM properties")
    properties = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(properties)

@app.route('/admin/rejected-properties', methods=['GET'])
def fetch_rejected_properties():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
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
    cursor = conn.cursor(dictionary=True)
    
    query = """
        SELECT u.*, p.REN_id, p.company_name, p.verified_status
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.role = 'REN'
    """
    
    cursor.execute(query)
    rens = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rens)

# Ban User
@app.route('/admin/user/<int:id>/ban', methods=['POST'])
@admin_required
def ban_user(id):
    conn = connect_db()
    cursor = conn.cursor()
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
    username = data.get('username')
    password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    role = data.get('role')  # 'user' or 'REN'
    
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (username, password, role, status) VALUES (%s, %s, %s, 'active')
    """, (username, password, role))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "User/REN created successfully."})

# Notification System
# Send Notifications After Property Approval
def notify_users_and_rens_new_launch(property_data):
    """
    Enhanced notification function for new property launches
    """
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        # Get all RENs
        cursor.execute("""
            SELECT id FROM users 
            WHERE role = 'REN' AND status = 'active'
        """)
        ren_users = cursor.fetchall()
        
        # Get users with matching preferred area
        cursor.execute("""
            SELECT u.id 
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE p.preferred_area LIKE %s
            AND u.status = 'active'
        """, (f"%{property_data['area']}%",))
        matching_users = cursor.fetchall()
        
        notification_message = (
            f"New property alert! {property_data['name']} "
            f"in {property_data['area']} is now available. "
            f"Price: RM{float(property_data['price']):,.2f}"
        )
        
        # Insert notifications for RENs and matching users
        all_recipients = ren_users + matching_users
        for recipient in all_recipients:
            cursor.execute("""
                INSERT INTO notifications 
                (recipient_id, message, type, property_id, is_read, created_at) 
                VALUES (%s, %s, %s, %s, FALSE, NOW())
            """, (recipient['id'], notification_message, NotificationType.NEW_LAUNCH.value, property_data['id']))
        
        conn.commit()
        return True
        
    except mysql.connector.Error as err:
        print(f"Error in notification system: {err}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


# Endpoints for REN-specific Properties

@app.route('/user-info', methods=['GET'])
def get_user_info():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT u.*, p.REN_id, p.company_name 
            FROM users u 
            LEFT JOIN profiles p ON u.id = p.user_id 
            WHERE u.id = %s
        """, (session['user_id'],))
        
        user_info = cursor.fetchone()
        if user_info:
            # Remove sensitive information
            user_info.pop('password', None)
            return jsonify(user_info)
        return jsonify({"error": "User not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/ren/approved-properties/<int:ren_id>', methods=['GET'])
def get_ren_approved_properties(ren_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * 
            FROM properties
            WHERE submitted_by = %s 
            AND status = 'approved'
        """, (ren_id,))
        
        properties = cursor.fetchall()
        return jsonify(properties)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/ren/pending-properties/<int:ren_id>', methods=['GET'])
def get_ren_pending_properties(ren_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM pending_properties 
            WHERE submitted_by = %s AND status = 'pending'
        """, (ren_id,))
        
        properties = cursor.fetchall()
        return jsonify(properties)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/ren/rejected-properties/<int:ren_id>', methods=['GET'])
def get_ren_rejected_properties(ren_id):
    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM pending_properties 
            WHERE submitted_by = %s AND status = 'rejected'
        """, (ren_id,))
        
        properties = cursor.fetchall()
        return jsonify(properties)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        
# API Route to get all properties
@app.route('/properties', methods=['GET'])
def get_properties():
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM properties"
    cursor.execute(query)
    properties = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(properties)

if __name__ == '__main__':
    app.run(debug=True)
