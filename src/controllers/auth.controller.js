import Authentication from '../services/Authentication.service.js'
import Controller from "./bases/BaseController.controller.js";

const service = new Authentication();

export const signUp = async (req, res) => {
  const body = req.body;
  const serviceResult = await service.signUp(body);
  Controller.response(res, serviceResult);
}

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const serviceResult = await service.login(email, password);
  Controller.response(res, serviceResult);
}

export const verifyEmail = async (req, res, next) => {

  const serviceResult = await service.verifyEmail(req.params.userId, req.params.token);
  if (serviceResult.json.error) {
    res.status(serviceResult.statusCode).send(serviceResult.json.message);
    return;
  } else {
    res.redirect(serviceResult.json.message)
  }
}
