// Shared sample data for the docs examples
export const desserts = [
  { name: 'Frozen Yogurt', category: 'Ice cream', calories: 159, fat: 6.0, carbs: 24, protein: 4.0, sodium: 87, calcium: '14%', iron: '1%', price: 3.5, in_stock: true, created_at: '12/01/2024' },
  { name: 'Ice cream sandwich', category: 'Ice cream', calories: 237, fat: 9.0, carbs: 37, protein: 4.3, sodium: 129, calcium: '8%', iron: '1%', price: 4.25, in_stock: true, created_at: '03/02/2024' },
  { name: 'Eclair', category: 'Pastry', calories: 262, fat: 16.0, carbs: 23, protein: 6.0, sodium: 337, calcium: '6%', iron: '7%', price: 2.75, in_stock: false, created_at: '18/02/2024' },
  { name: 'Cupcake', category: 'Pastry', calories: 305, fat: 3.7, carbs: 67, protein: 4.3, sodium: 413, calcium: '3%', iron: '8%', price: 3.0, in_stock: true, created_at: '07/03/2024' },
  { name: 'Gingerbread', category: 'Cookie', calories: 356, fat: 16.0, carbs: 49, protein: 3.9, sodium: 327, calcium: '7%', iron: '16%', price: 1.95, in_stock: true, created_at: '21/03/2024' },
  { name: 'Jelly bean', category: 'Candy', calories: 375, fat: 0.0, carbs: 94, protein: 0.0, sodium: 50, calcium: '0%', iron: '0%', price: 0.99, in_stock: false, created_at: '02/04/2024' },
  { name: 'Lollipop', category: 'Candy', calories: 392, fat: 0.2, carbs: 98, protein: 0, sodium: 38, calcium: '0%', iron: '2%', price: 0.75, in_stock: true, created_at: '15/04/2024' },
  { name: 'Honeycomb', category: 'Candy', calories: 408, fat: 3.2, carbs: 87, protein: 6.5, sodium: 562, calcium: '0%', iron: '45%', price: 2.5, in_stock: true, created_at: '28/04/2024' },
  { name: 'Donut', category: 'Pastry', calories: 452, fat: 25.0, carbs: 51, protein: 4.9, sodium: 326, calcium: '2%', iron: '22%', price: 1.5, in_stock: true, created_at: '09/05/2024' },
  { name: 'KitKat', category: 'Candy', calories: 518, fat: 26.0, carbs: 65, protein: 7, sodium: 54, calcium: '12%', iron: '6%', price: 1.25, in_stock: false, created_at: '30/05/2024' }
]

export const dessertColumns = [
  { name: 'name', required: true, label: 'Dessert (100g serving)', align: 'left', field: 'name', sortable: true },
  { name: 'category', label: 'Category', align: 'left', field: 'category', sortable: true, filter_type: 'select', grouping: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, filter_type: 'number_range' },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
  { name: 'carbs', label: 'Carbs (g)', field: 'carbs', sortable: true },
  { name: 'protein', label: 'Protein (g)', field: 'protein', sortable: true },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => '$' + v.toFixed(2) }
]

// deterministic pseudo-random generator so the big table is the same on every visit
function rng (seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

export function makeOrders (count) {
  const rand = rng(42)
  const regions = ['North', 'South', 'East', 'West', 'Central']
  const products = ['Keyboard', 'Monitor', 'Mouse', 'Laptop', 'Headset', 'Webcam', 'Dock', 'Chair']
  const statuses = ['Paid', 'Pending', 'Refunded', 'Shipped']
  const rows = new Array(count)
  for (let i = 0; i < count; i++) {
    const qty = 1 + Math.floor(rand() * 9)
    const unit = Math.round((15 + rand() * 900) * 100) / 100
    const day = 1 + Math.floor(rand() * 28)
    const month = 1 + Math.floor(rand() * 12)
    rows[i] = {
      id: i + 1,
      order: 'ORD-' + String(100000 + i),
      customer: 'Customer ' + (1 + Math.floor(rand() * 2500)),
      product: products[Math.floor(rand() * products.length)],
      region: regions[Math.floor(rand() * regions.length)],
      status: statuses[Math.floor(rand() * statuses.length)],
      qty,
      total: Math.round(qty * unit * 100) / 100,
      date: String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') + '/2025'
    }
  }
  return rows
}
