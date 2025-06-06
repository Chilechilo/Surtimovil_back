const { gql } = require('apollo-server');

module.exports = gql`
  type User {
    Id_user: Int
    name: String
    email: String
    role: String
    created_at: String
  }

  type Product {
    Id_product: Int
    name: String
    brand: String
    description: String
    price: Float
    stock: Int
  }

  type Order {
    Id_order: Int
    status: String
    created_at: String
    Id_user: Int
  }

  type OrderProduct {
    Id_op: Int
    quantity: Int
    unit_price: Float
    Id_order: Int
    Id_product: Int
  }

  type TokenRev {
    Id_token: Int
    token: String
    revoke_at: String
    Id_user: Int
  }

  type Token {
    token: String!
    message: String
  }

  type OrderStatus {
    user: String
    id_order: Int
    product: String
    quantity: Int
    cost: Float
    status: String
  }

  type Query {
    getAllProducts: [Product]
    getOrderStatusByUser(id_user: Int!): [OrderStatus]
    getTotalCost(id_user: Int!): String
    calculateProductCost(product_name: String!, amount: Int!): String
  }

  type Mutation {
    login(email: String!, password: String!): Token

    createUser(
      name: String!, 
      email: String!, 
      password: String!, 
      role: String
    ): User

    updateUser(
      Id_user: Int!, 
      name: String, 
      email: String, 
      password: String, 
      role: String
    ): User

    deleteUser(Id_user: Int!): String

    createOrder(Id_user: Int!): Order
    updateOrderStatus(Id_order: Int!, status: String!): Order

    createProduct(
      name: String!, 
      brand: String!, 
      description: String!, 
      price: Float!, 
      stock: Int!
    ): Product

    updateProduct(
      Id_product: Int!, 
      name: String, 
      brand: String, 
      description: String, 
      price: Float, 
      stock: Int
    ): Product

    deleteProduct(Id_product: Int!): String

    createOrderProduct(
      Id_order: Int!, 
      Id_product: Int!, 
      quantity: Int!, 
      unit_price: Float!
    ): OrderProduct

    revokeToken(
      token: String!, 
      Id_user: Int!
    ): TokenRev
  }
`;
