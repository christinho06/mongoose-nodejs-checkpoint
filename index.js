const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Virtual property
userSchema.virtual('info').get(function() {
  return `${this.name} (${this.email})`;
});

// Middleware
userSchema.pre('save', function(next) {
  console.log('About to save user:', this.name);
  next();
});

// Model
const User = mongoose.model('User', userSchema);

async function run() {
  // Create
  const u1 = await User.create({ name: 'Alice', email: 'alice@example.com', age: 25 });
  const u2 = await User.create({ name: 'Bob', email: 'bob@example.com', age: 30 });
  console.log('Created:', u1.info, u2.info);

  // Read
  const all = await User.find({});
  console.log('All users:', all.map(u => u.name));

  // Query helpers
  const adults = await User.find().where('age').gte(18).exec();
  console.log('Adults:', adults.map(u => u.name));

  // Update
  await User.updateOne({ name: 'Alice' }, { age: 26 });

  // Aggregation
  const stats = await User.aggregate([{ $group: { _id: null, avgAge: { $avg: '$age' } } }]);
  console.log('Avg age:', stats);

  // Delete
  await User.deleteOne({ name: 'Bob' });

  mongoose.connection.close();
}

run().catch(console.error);
