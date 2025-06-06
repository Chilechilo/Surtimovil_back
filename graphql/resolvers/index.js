const db = require('../../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET || 'surtimovil-secret';

const resolvers = {
  Query: {
    getAllProducts: async () => {
      const result = await db.raw("CALL sp_products()");
      return result[0][0].map(p => ({
        Id_product: p.Id,
        name: p.Name,
        brand: p.Brand,
        description: p.Description,
        price: p.Price,
        stock: p.Stock
      }));
    },

    getOrderStatusByUser: async (_, { id_user }) => {
      const result = await db.raw("CALL sp_orderstatus(?)", [id_user]);
      return result[0][0];
    },

    getTotalCost: async (_, { id_user }) => {
      const [result] = await db.raw("SELECT fn_totalcost(?) AS mensaje", [id_user]);
      return result[0].mensaje;
    },

    calculateProductCost: async (_, { product_name, amount }) => {
      const [result] = await db.raw("SELECT fn_calculateprice(?, ?) AS mensaje", [product_name, amount]);
      return result[0].mensaje;
    }
  },

  Mutation: {
    login: async (_, { email, password }, context) => {
      const user = await db('users').where({ email }).first();
      if (!user) throw new Error('Usuario no encontrado');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Contraseña incorrecta');

      const token = jwt.sign(
        { id: user.Id_user, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '1h' }
      );


      await db.raw("SET @usuario_app = ?", [context.user || user.name || 'anonimo']);
      await db('tokenrev').insert({
        token,
        Id_user: user.Id_user,
        revoke_at: new Date()
      });

      return {
        token,
        message: `Bienvenido ${user.name}`
      };
    },

    createUser: async (_, args, context) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      const [id] = await db('users').insert({
        ...args,
        password: hashedPassword
      });
      return { Id_user: id, ...args, password: undefined };
    },

    updateUser: async (_, { Id_user, password, ...data }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      const updatedData = password
        ? { ...data, password: await bcrypt.hash(password, 10) }
        : data;
      await db('users').where({ Id_user }).update(updatedData);
      return await db('users').where({ Id_user }).first();
    },

    deleteUser: async (_, { Id_user }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      await db('users').where({ Id_user }).del();
      return "Usuario eliminado";
    },

    createOrder: async (_, { Id_user }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      const [id] = await db('orders').insert({ Id_user });
      return await db('orders').where({ Id_order: id }).first();
    },

    updateOrderStatus: async (_, { Id_order, status }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      await db('orders').where({ Id_order }).update({ status });
      return await db('orders').where({ Id_order }).first();
    },

    createProduct: async (_, args, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      const [id] = await db('products').insert(args);
      return { Id_product: id, ...args };
    },

    updateProduct: async (_, { Id_product, ...data }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      await db('products').where({ Id_product }).update(data);
      return await db('products').where({ Id_product }).first();
    },

    deleteProduct: async (_, { Id_product }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      await db('products').where({ Id_product }).del();
      return "Producto eliminado";
    },

    createOrderProduct: async (_, { Id_order, Id_product, quantity, unit_price }, context) => {
      await db.raw("SET @usuario_app = ?", [context.user || 'anonimo']);
      const [id] = await db('orders_products').insert({
        Id_order, Id_product, quantity, unit_price
      });
      return await db('orders_products').where({ Id_op: id }).first();
    },

    revokeToken: async (_, { token, Id_user }) => {
      await db('tokenrev').where({ token, Id_user }).del(); // borra el token
      return {
        token,
        Id_user,
        revoke_at: new Date()
      };
    }
  }
};

module.exports = resolvers;
