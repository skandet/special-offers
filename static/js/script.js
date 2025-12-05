// 全局变量
let currentProduct = null;

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
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('获取商品失败:', error);
        productsContainer.innerHTML = '<p style="text-align: center; color: #e74c3c;">获取商品失败，请稍后重试</p>';
    }
}

function renderProducts(products) {
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

// 显示下单表单
function showOrderForm() {
    if (currentProduct) {
        document.getElementById('order-product-id').value = currentProduct.id;
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
    
    const formData = new FormData(orderForm);
    const orderData = {
        product_id: parseInt(document.getElementById('order-product-id').value),
        user_name: document.getElementById('user-name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    // 简单验证
    if (!orderData.user_name || !orderData.phone || !orderData.address) {
        alert('请填写完整的订单信息');
        return;
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            orderModal.style.display = 'none';
            orderForm.reset();
            successModal.style.display = 'block';
        } else {
            throw new Error('下单失败');
        }
    } catch (error) {
        console.error('下单失败:', error);
        alert('下单失败，请稍后重试');
    }
}

// 点击模态框外部关闭模态框
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// 事件监听器
orderBtn.addEventListener('click', showOrderForm);
cancelOrderBtn.addEventListener('click', () => {
    orderModal.style.display = 'none';
});
orderForm.addEventListener('submit', handleOrderSubmit);
closeSuccessBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
});

// 关闭按钮事件
closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// 页面加载时获取商品
window.addEventListener('DOMContentLoaded', fetchProducts);
