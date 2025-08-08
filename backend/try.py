from flask_bcrypt import Bcrypt  # For hashing passwords

bcrypt = Bcrypt()

hashed_password = bcrypt.generate_password_hash('admin').decode('utf-8')
print("Start :"+hashed_password)