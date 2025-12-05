// 全局变量
let currentEditingProduct = null;

// DOM元素
const productsTab = document.getElementById('products-tab');
const ordersTab = document.getElementById('orders-tab');
const navBtns = document.querySelectorAll('.nav-btn');
const addProductBtn = document.getElementById('add-product-btn');
const productFormModal = document.getElementById('product-form-modal');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');
const adminProducts = document.getElementById('admin-products');
const ordersList = document.getElementById('orders-list');
const closeButtons = document.querySelectorAll('.close');
const cancelProductBtn = document.getElementById('cancel-product');

// 标签页切换
function switchTab(tabName) {
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有导航按钮的激活状态
    navBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示对应标签页内容
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 设置对应导航按钮为激活状态
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 根据标签页获取对应数据
    if (tabName === 'products') {
        fetchAdminProducts();
    } else if (tabName === 'orders') {
        fetchOrders();
    }
}

// 商品管理相关功能
async function fetchAdminProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        renderAdminProducts(products);
    } catch (error) {
        console.error('获取商品失败:', error);
        adminProducts.innerHTML = '<p style="text-align: center; color: #e74c3c;">获取商品失败，请稍后重试</p>';
    }
}

function renderAdminProducts(products) {
    if (products.length === 0) {
        adminProducts.innerHTML = '<p style="text-align: center; color: #95a5a6;">暂无商品</p>';
        return;
    }
    
    adminProducts.innerHTML = products.map(product => `
        <div class="product-card">
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">¥${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn btn-edit" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 添加商品
function showAddProductForm() {
    currentEditingProduct = null;
    modalTitle.textContent = '添加商品';
    productForm.reset();
    document.getElementById('product-id').value = '';
    productFormModal.style.display = 'block';
}

// 编辑商品
async function editProduct(id) {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        const product = products.find(p => p.id === id);
        
        if (product) {
            currentEditingProduct = product;
            modalTitle.textContent = '编辑商品';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            productFormModal.style.display = 'block';
        }
    } catch (error) {
        console.error('获取商品失败:', error);
        alert('获取商品失败，请稍后重试');
    }
}

// 删除商品
async function deleteProduct(id) {
    if (confirm('确定要删除这个商品吗？')) {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchAdminProducts();
            } else {
                throw new Error('删除商品失败');
            }
        } catch (error) {
            console.error('删除商品失败:', error);
            alert('删除商品失败，请稍后重试');
        }
    }
}

// 处理商品表单提交
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(productForm);
    const productId = document.getElementById('product-id').value;
    
    try {
        let response;
        if (productId) {
            // 编辑商品
            response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            // 添加商品
            response = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });
        }
        
        if (response.ok) {
            productFormModal.style.display = 'none';
            fetchAdminProducts();
        } else {
            throw new Error(productId ? '更新商品失败' : '添加商品失败');
        }
    } catch (error) {
        console.error('处理商品失败:', error);
        alert(error.message + '，请稍后重试');
    }
}

// 订单管理相关功能
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('获取订单失败:', error);
        ordersList.innerHTML = '<p style="text-align: center; color: #e74c3c;">获取订单失败，请稍后重试</p>';
    }
}

function renderOrders(orders) {
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: #95a5a6;">暂无订单</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span>订单 #${order.id}</span>
                <span class="order-product">${order.product_name}</span>
            </div>
            <div class="order-info">
                <p><strong>姓名:</strong> ${order.user_name}</p>
                <p><strong>电话:</strong> ${order.phone}</p>
                <p><strong>地址:</strong> ${order.address}</p>
            </div>
            <div class="order-date">${order.created_at}</div>
        </div>
    `).join('');
}

// 关闭模态框
function closeModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 事件监听器
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

addProductBtn.addEventListener('click', showAddProductForm);
productForm.addEventListener('submit', handleProductSubmit);
cancelProductBtn.addEventListener('click', () => {
    productFormModal.style.display = 'none';
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// 点击模态框外部关闭模态框
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// 页面加载时获取商品和订单数据
window.addEventListener('DOMContentLoaded', () => {
    fetchAdminProducts();
    fetchOrders();
});

// 暴露函数到全局作用域，以便在HTML中直接调用
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
