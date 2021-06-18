//@ts-nocheck
import express from 'express'
import { validationResult } from 'express-validator'
import { UserModel } from '../models/UserModel'
import { generateMD5 } from './../utils/generateHash';
import { sendEmail } from '../utils/sendEmail';
// import mailer from 'mailer'



class UserController {


	async index(_: any, res: express.Response): Promise<void> {
		try {
			const users = await UserModel.find({}).exec();

			res.json({
				status: 'success',
				data: users,
			});
		} catch (error) {
			res.status(500).json({
				status: 'error',
				message: error,
			});
		}
	}


	async create(req: express.Request, res: express.Response): Promise<void> {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				res.status(400).json({ status: 'error', errors: errors.array() })
				return
			}

      const randomStr = Math.random().toString();

			const data = {
				email: req.body.email,
        username: req.body.username,
        fullname: req.body.fullname,
        password: generateMD5(req.body.password + process.env.SECRET_KEY),
        confirmHash: generateMD5(process.env.SECRET_KEY + randomStr || randomStr),
			}

			const user = await UserModel.create(data)

			sendEmail(
        {
          emailFrom: 'admin@twitter.com',
          emailTo: data.email,
          subject: 'Подтверждение почты Twitter Clone Tutorial',
          html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:${process.env.PORT || 8888}/signup/verify?hash/${data.confirmHash}">по этой ссылке</a>`,
        },
        (err: Error | null) => {
          if (err) {
            res.status(500).json({
              status: 'error',
              message: err,
            });
          } else {
            res.status(201).json({
              status: 'success',
              data: user,
            });
          }
        },
      )
		} catch (error) {
			res.json({
				status: 'error',
				data: JSON.stringify(error)
			})
		}
	}

	async verify(req: any, res: express.Response): Promise<void> {
    try {
      const hash = req.query.hash;

      if (!hash) {
        res.status(400).send();
        return;
      }

      const user = await UserModel.findOne({ confirmHash: hash }).exec();

      if (user) {
        user.confirmed = true;
        await user.save();

        res.json({
          status: 'success',
          data: {
            ...user.toJSON(),
            token: jwt.sign({ data: user.toJSON() }, process.env.SECRET_KEY || '123', {
              expiresIn: '30 days',
            }),
          },
        });
      } else {
        res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error,
      });
    }
  }




}


export const UserCtrl = new UserController()