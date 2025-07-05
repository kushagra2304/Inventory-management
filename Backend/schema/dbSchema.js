const inventory = {
  id: 'integer',
  comp_code: 'string',
  description: 'string',
  quantity: 'integer',
  created_at: 'timestamp',
  barcode: 'string',
  category: 'string',
  unit_type: 'string',
  weight: 'string',
  price: 'decimal(10,2)',
  pack_size: 'integer'
};

const transaction = {
  id: 'integer',
  item_code: 'string',
  quantity: 'integer',
  transaction_type: 'enum(issued, received)',
  price: 'decimal(10,2)',
  transaction_date: 'timestamp'
};

const users = {
  id: 'integer',
  name: 'string',
  email: 'string',
  password: 'string',
  role: 'enum(admin, user)'
};

const bills = {
  id: 'integer',
  bill_id: 'string',
  mobile: 'string',
  timestamp: 'datetime'
};

module.exports = {
  inventory,
  transaction,
  users,
  bills
};
