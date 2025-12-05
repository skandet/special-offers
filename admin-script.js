// 全局变量
let currentEditingProduct = null;

// DOM元素
const adminProductsTab = document.getElementById('products-tab');
const adminOrdersTab = document.getElementById('orders-tab');
const adminNavBtns = document.querySelectorAll('.nav-btn');
const adminAddProductBtn = document.getElementById('add-product-btn');
const adminProductFormModal = document.getElementById('product-form-modal');
const adminProductForm = document.getElementById('product-form');
const adminModalTitle = document.getElementById('modal-title');
const adminProductsContainer = document.getElementById('admin-products');
const adminOrdersList = document.getElementById('orders-list');
const adminCloseButtons = document.querySelectorAll('.close');
const adminCancelProductBtn = document.getElementById('cancel-product');

// 标签页切换
function switchTab(tabName) {
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有导航按钮的激活状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
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
        if (!response.ok) {
            throw new Error('获取商品失败');
        }
        const products = await response.json();
        renderAdminProducts(products);
    } catch (error) {
        console.error('获取商品失败:', error);
        const adminProductsEl = document.getElementById('admin-products');
        if (adminProductsEl) {
            adminProductsEl.innerHTML = '<p style="text-align: center; color: #e74c3c;">获取商品失败，请稍后重试</p>';
        }
    }
}

function renderAdminProducts(products) {
    const adminProductsEl = document.getElementById('admin-products');
    if (!adminProductsEl) return;
    
    if (products.length === 0) {
        adminProductsEl.innerHTML = '<p style="text-align: center; color: #95a5a6;">暂无商品</p>';
        return;
    }
    
    adminProductsEl.innerHTML = products.map(product => `
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
    const modalTitleEl = document.getElementById('modal-title');
    const productFormEl = document.getElementById('product-form');
    const productFormModalEl = document.getElementById('product-form-modal');
    
    if (modalTitleEl) modalTitleEl.textContent = '添加商品';
    if (productFormEl) productFormEl.reset();
    const productIdEl = document.getElementById('product-id');
    if (productIdEl) productIdEl.value = '';
    
    // 移除图片预览元素（如果存在）
    const imagePreviewEl = document.getElementById('image-preview');
    if (imagePreviewEl) {
        imagePreviewEl.remove();
    }
    
    if (productFormModalEl) productFormModalEl.style.display = 'block';
}

// 编辑商品
async function editProduct(id) {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('获取商品失败');
        }
        const products = await response.json();
        const product = products.find(p => p.id === id);
        
        if (product) {
            currentEditingProduct = product;
            const modalTitleEl = document.getElementById('modal-title');
            const productFormModalEl = document.getElementById('product-form-modal');
            
            if (modalTitleEl) modalTitleEl.textContent = '编辑商品';
            
            const productIdEl = document.getElementById('product-id');
            const productNameEl = document.getElementById('product-name');
            const productDescEl = document.getElementById('product-description');
            const productPriceEl = document.getElementById('product-price');
            const productImageEl = document.getElementById('product-image');
            
            if (productIdEl) productIdEl.value = product.id;
            if (productNameEl) productNameEl.value = product.name;
            if (productDescEl) productDescEl.value = product.description;
            if (productPriceEl) productPriceEl.value = product.price;
            
            // 清空文件输入
            if (productImageEl) {
                productImageEl.value = '';
            }
            
            // 添加图片预览
            let imagePreviewEl = document.getElementById('image-preview');
            if (!imagePreviewEl) {
                // 创建图片预览元素
                imagePreviewEl = document.createElement('div');
                imagePreviewEl.id = 'image-preview';
                imagePreviewEl.style.marginTop = '10px';
                imagePreviewEl.style.textAlign = 'center';
                productImageEl.parentElement.appendChild(imagePreviewEl);
            }
            
            // 显示当前图片
            imagePreviewEl.innerHTML = `
                <p>当前图片：</p>
                <img src="${product.image}" alt="当前商品图片" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; padding: 5px; border-radius: 4px;">
                <p style="font-size: 0.8rem; color: #95a5a6; margin-top: 5px;">选择新图片将替换当前图片</p>
            `;
            
            if (productFormModalEl) productFormModalEl.style.display = 'block';
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
            
            if (!response.ok) {
                throw new Error('删除商品失败');
            }
            
            fetchAdminProducts();
        } catch (error) {
            console.error('删除商品失败:', error);
            alert('删除商品失败，请稍后重试');
        }
    }
}

// 处理商品表单提交
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const productIdEl = document.getElementById('product-id');
    if (!productIdEl) return;
    
    const productId = parseInt(productIdEl.value);
    
    const productNameEl = document.getElementById('product-name');
    const productDescEl = document.getElementById('product-description');
    const productPriceEl = document.getElementById('product-price');
    const productImageEl = document.getElementById('product-image');
    
    if (!productNameEl || !productDescEl || !productPriceEl || !productImageEl) return;
    
    try {
        const formData = new FormData();
        formData.append('name', productNameEl.value);
        formData.append('description', productDescEl.value);
        formData.append('price', productPriceEl.value);
        
        if (productImageEl.files && productImageEl.files[0]) {
            formData.append('image', productImageEl.files[0]);
        }
        
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
        
        if (!response.ok) {
            throw new Error(productId ? '更新商品失败' : '添加商品失败');
        }
        
        const productFormModalEl = document.getElementById('product-form-modal');
        if (productFormModalEl) productFormModalEl.style.display = 'none';
        
        fetchAdminProducts();
    } catch (error) {
        console.error('处理商品失败:', error);
        alert((productId ? '更新商品失败' : '添加商品失败') + '，请稍后重试');
    }
}

// 订单管理相关功能
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error('获取订单失败');
        }
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('获取订单失败:', error);
        const ordersListEl = document.getElementById('orders-list');
        if (ordersListEl) {
            ordersListEl.innerHTML = '<p style="text-align: center; color: #e74c3c;">获取订单失败，请稍后重试</p>';
        }
    }
}

function renderOrders(orders) {
    const ordersListEl = document.getElementById('orders-list');
    if (!ordersListEl) return;
    
    if (orders.length === 0) {
        ordersListEl.innerHTML = '<p style="text-align: center; color: #95a5a6;">暂无订单</p>';
        return;
    }
    
    ordersListEl.innerHTML = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // 按时间倒序
        .map(order => `
        <div class="order-item">
            <div class="order-header">
                <span>订单 #${order.id}</span>
                <span class="order-product">${order.product_name || '未知商品'}</span>
            </div>
            <div class="order-info">
                <p><strong>姓名:</strong> ${order.user_name}</p>
                <p><strong>电话:</strong> ${order.phone}</p>
                <p><strong>地址:</strong> ${order.address}</p>
                <p><strong>数量:</strong> ${order.quantity || 1} 件</p>
                <p><strong>总价:</strong> ¥${(order.total_price || 0).toFixed(2)}</p>
                ${order.remark ? `<p><strong>备注:</strong> ${order.remark}</p>` : ''}
            </div>
            <div class="order-date">${new Date(order.created_at).toLocaleString('zh-CN')}</div>
        </div>
    `).join('');
}

// 关闭模态框
function adminCloseModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 页面加载时获取商品和订单数据，并绑定事件监听器
window.addEventListener('DOMContentLoaded', () => {
    // 重新获取DOM元素，确保DOM已加载完成
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const cancelProductBtn = document.getElementById('cancel-product');
    const closeButtons = document.querySelectorAll('.close');
    const navBtns = document.querySelectorAll('.nav-btn');
    const productFormModal = document.getElementById('product-form-modal');
    
    // 绑定标签页切换事件
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // 绑定添加商品按钮点击事件
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductForm);
    }
    
    // 绑定商品表单提交事件
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // 绑定取消按钮点击事件
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', () => {
            if (productFormModal) {
                productFormModal.style.display = 'none';
            }
        });
    }
    
    // 绑定关闭按钮点击事件
    closeButtons.forEach(btn => {
        btn.addEventListener('click', adminCloseModal);
    });
    
    // 获取商品和订单数据
    fetchAdminProducts();
    fetchOrders();
});

// 暴露函数到全局作用域，以便在HTML中直接调用
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
