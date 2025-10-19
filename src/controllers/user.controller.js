import User from '../services/User.service.js'
import Controller from "./bases/BaseController.controller.js";

const service = new User();

export const profile = async (req, res) => {
    const { id: userId } = res.locals.data;

    const serviceResult = await service.profile(userId);
    Controller.response(res, serviceResult);
}