import BaseService from "./bases/BaseService.service.js";
import UserModel from "./../models/user.model.js ";

export default class User extends BaseService {

    async profile(userId) {
        try {
            const user = await UserModel.findById(userId)
            if (user) return this.responseData(200, false, "User has been retrieved successfully", user);
            return this.responseData(404, true, "User was not found");
        } catch (error) {

        }
    }
}