from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename
from datetime import datetime

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

CORS(app)
db = SQLAlchemy(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    product = db.relationship('Product', backref=db.backref('orders', lazy=True))
    user_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    remark = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'image': f'/api/uploads/{p.image}'
    } for p in products])

@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/products', methods=['POST'])
def add_product():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    filename = secure_filename(image.filename)
    image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    product = Product(
        name=request.form['name'],
        description=request.form['description'],
        price=float(request.form['price']),
        image=filename
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Product added successfully'}), 201

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    
    product.name = request.form['name']
    product.description = request.form['description']
    product.price = float(request.form['price'])
    
    if 'image' in request.files and request.files['image'].filename != '':
        # Delete old image
        if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], product.image)):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], product.image))
        
        # Save new image
        image = request.files['image']
        filename = secure_filename(image.filename)
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        product.image = filename
    
    db.session.commit()
    return jsonify({'message': 'Product updated successfully'})

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    
    # Delete image file
    if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], product.image)):
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], product.image))
    
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    
    order = Order(
        product_id=data['product_id'],
        user_name=data['user_name'],
        phone=data['phone'],
        address=data['address'],
        quantity=data.get('quantity', 1),
        total_price=data['total_price'],
        remark=data.get('remark', '')
    )
    
    db.session.add(order)
    db.session.commit()
    
    return jsonify({'message': 'Order created successfully', 'order_id': order.id}), 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([{
        'id': o.id,
        'product_name': o.product.name,
        'user_name': o.user_name,
        'phone': o.phone,
        'address': o.address,
        'quantity': o.quantity,
        'total_price': o.total_price,
        'remark': o.remark,
        'created_at': o.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for o in orders])

if __name__ == '__main__':
    app.run(debug=True)
