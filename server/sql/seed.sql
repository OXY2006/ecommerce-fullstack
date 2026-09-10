-- Insert Categories
INSERT INTO categories (id, name) VALUES
(1, 'Electronics'),
(2, 'Accessories'),
(3, 'Home'),
(4, 'Clothing');

-- Reset category sequence
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Insert Products
INSERT INTO products (id, name, description, price, category_id, image, stock) VALUES
(1, 'Wireless Noise-Canceling Headphones', 'High-fidelity audio with active noise cancellation and up to 30 hours of battery life.', 199.99, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 15),
(2, 'Minimalist Mechanical Watch', 'Classic analog watch featuring a stainless steel case and genuine leather strap.', 149.50, 2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', 8),
(3, 'Ergonomic Office Chair', 'Breathable mesh back design with adjustable lumbar support and headrest.', 249.00, 3, 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=600&auto=format&fit=crop&q=80', 5),
(4, 'Premium Cotton Hoodie', 'Ultra-soft heavyweight fleece hoodie designed for everyday comfort and warmth.', 65.00, 4, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80', 22),
(5, 'Smart Fitness Watch', 'Track your workouts, heart rate, sleep quality, and daily activity with GPS support.', 129.99, 1, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80', 12),
(6, 'Leather Messenger Bag', 'Handcrafted full-grain leather crossbody bag with dedicated 15-inch laptop sleeve.', 110.00, 2, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 7),
(7, 'Ceramic Coffee Mug Set', 'Set of 4 handcrafted matte-finished ceramic mugs perfect for specialty coffee.', 34.99, 3, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 30),
(8, 'Classic Denim Jacket', 'Timeless vintage wash denim jacket made from 100% durable cotton denim.', 89.95, 4, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', 10),
(9, 'Portable Bluetooth Speaker', 'Waterproof compact outdoor speaker delivering crisp sound and deep bass response.', 59.99, 1, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80', 18),
(10, 'Polarized Sunglasses', 'UV400 protection polarized lenses with lightweight durable alloy frames.', 45.00, 2, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', 25);

-- Reset product sequence
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
