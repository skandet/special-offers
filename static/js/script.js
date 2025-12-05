// 全局变量
let currentProduct = null;
let products = [];
let orders = [];

// DOM元素
const productsContainer = document.getElementById('products-container');
const productModal = document.getElementById('product-modal');
const orderModal = document.getElementById('order-modal');
const successModal = document.getElementById('success-modal');
const closeButtons = document.querySelectorAll('.close');
const orderBtn = document.getElementById('order-btn');
const cancelOrderBtn = document.getElementById('cancel-order');
const orderForm = document.getElementById('order-form');
const closeSuccessBtn = document.getElementById('close-success');

// 商品数据获取和渲染
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('获取商品失败');
        }
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('获取商品失败:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '<p style="text-align: center; color: #e74c3c;">获取商品失败，请稍后重试</p>';
        }
    }
}

// 添加订单
async function addOrder(orderData) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('添加订单失败');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('添加订单失败:', error);
        throw error;
    }
}

function renderProducts(products) {
    // 检查productsContainer是否存在
    if (!productsContainer) return;
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<p style="text-align: center; color: #95a5a6;">暂无商品</p>';
        return;
    }
    
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">¥${product.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
    
    // 添加商品点击事件
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = parseInt(card.dataset.id);
            showProductDetail(products.find(p => p.id === productId));
        });
    });
}

// 显示商品详情
function showProductDetail(product) {
    currentProduct = product;
    
    document.getElementById('modal-image').src = product.image;
    document.getElementById('modal-name').textContent = product.name;
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('modal-price').textContent = `¥${product.price.toFixed(2)}`;
    
    productModal.style.display = 'block';
}

// 计算总价
function calculateTotalPrice() {
    const price = parseFloat(document.getElementById('order-product-price').value) || 0;
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    const total = price * quantity;
    document.getElementById('total-price').textContent = `¥${total.toFixed(2)}`;
}

// 显示下单表单
function showOrderForm() {
    if (currentProduct) {
        // 设置商品基本信息
        document.getElementById('order-product-id').value = currentProduct.id;
        document.getElementById('order-product-price').value = currentProduct.price;
        
        // 显示商品信息
        document.getElementById('order-product-name').textContent = currentProduct.name;
        document.getElementById('order-product-price-display').textContent = `单价：¥${currentProduct.price.toFixed(2)}`;
        
        // 初始化数量为1
        document.getElementById('order-quantity').value = 1;
        
        // 计算初始总价
        calculateTotalPrice();
        
        // 显示模态框
        orderModal.style.display = 'block';
        productModal.style.display = 'none';
    }
}

// 关闭所有模态框的通用函数
function closeModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 处理订单提交
async function handleOrderSubmit(event) {
    event.preventDefault();
    
    const orderData = {
        product_id: parseInt(document.getElementById('order-product-id').value),
        user_name: document.getElementById('user-name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        remark: document.getElementById('remark').value,
        quantity: parseInt(document.getElementById('order-quantity').value) || 1,
        total_price: parseFloat(document.getElementById('order-product-price').value) * (parseInt(document.getElementById('order-quantity').value) || 1)
    };
    
    // 简单验证
    if (!orderData.user_name || !orderData.phone || !orderData.address) {
        alert('请填写完整的订单信息');
        return;
    }
    
    try {
        await addOrder(orderData);
        orderModal.style.display = 'none';
        orderForm.reset();
        successModal.style.display = 'block';
    } catch (error) {
        console.error('下单失败:', error);
        alert('下单失败，请稍后重试');
    }
}

// 页面加载时获取商品，并绑定事件监听器（仅在元素存在时）
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // 只在元素存在时才添加事件监听器
    if (orderBtn) {
        orderBtn.addEventListener('click', showOrderForm);
    }
    
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', () => {
            orderModal.style.display = 'none';
        });
    }
    
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    }
    
    // 关闭按钮事件
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // 点击模态框外部关闭模态框
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // 添加数量增减事件监听器
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('order-quantity');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value) || 1;
            if (quantity > 1) {
                quantityInput.value = quantity - 1;
                calculateTotalPrice();
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value) || 1;
            quantityInput.value = quantity + 1;
            calculateTotalPrice();
        });
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('input', calculateTotalPrice);
    }
});

// 暴露数据管理类到全局，方便在管理页面使用
window.DataManager = DataManager;
