import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { categoryRouter } from './category.routes';
import { productRouter } from './product.routes';
import { cartRouter } from './cart.routes';
import { orderRouter } from './order.routes';
import { paymentRouter } from './payment.routes';
import { reviewRouter } from './review.routes';
import { sellerRouter } from './seller.routes';
import { adminRouter } from './admin.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/payment', paymentRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/seller', sellerRouter);
apiRouter.use('/admin', adminRouter);
