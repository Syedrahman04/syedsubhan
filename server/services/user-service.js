const UserModel = require('../models/user-model');

class UserService {
    async findUser(email) {
        return await UserModel.findOne(email); 
    }
    async createUser(email) {
        return await UserModel.create(email);
    }
}

module.exports = new UserService();
